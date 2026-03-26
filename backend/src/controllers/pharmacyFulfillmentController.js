const mongoose = require("mongoose");
const Pharmacy = require("../models/Pharmacy.js");
const PharmacyStock = require("../models/PharmacyStock.js");
const Prescription = require("../models/Prescription.js");
const {
  createNotification,
  sendEmail,
  sendSms
} = require("../services/notificationService.js");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeMedicineKey = (value) => String(value || "").trim().toLowerCase();

const getPharmacyForUser = async (userId) => {
  return Pharmacy.findOne({ user: userId });
};

const buildPrescriptionQuery = (pharmacyId, status) => {
  const query = {
    isActive: true,
    fulfillmentStatus: status ? status : { $in: ["Pending", "Ready", "Partially Available"] }
  };

  if (pharmacyId) {
    query.$or = [
      { assignedPharmacy: pharmacyId },
      { assignedPharmacy: null }
    ];
  }

  return query;
};

const formatAvailabilityFromStocks = (prescription, stocks) => {
  const stockMap = new Map(
    stocks.map((stock) => [normalizeMedicineKey(stock.medicineName), stock])
  );

  const availability = prescription.medications.map((medication) => {
    const matchingStock = stockMap.get(normalizeMedicineKey(medication.name));
    const availableQuantity = matchingStock?.quantity || 0;
    let stockStatus = "unavailable";

    if (availableQuantity > 0) {
      stockStatus = "ready";
    }

    return {
      name: medication.name,
      requestedQuantity: 1,
      availableQuantity,
      stockStatus,
      pharmacyStock: matchingStock?._id || null,
      stockStatusLabel: matchingStock?.stockStatus || "out_of_stock"
    };
  });

  const allAvailable = availability.every((item) => item.stockStatus === "ready");
  const anyAvailable = availability.some((item) => item.stockStatus === "ready");

  return {
    availability,
    overallStatus: allAvailable ? "Ready" : anyAvailable ? "Partially Available" : "Pending"
  };
};

const findAlternativePharmacies = async (missingMedicineNames, currentPharmacyId) => {
  if (missingMedicineNames.length === 0) return [];

  const stocks = await PharmacyStock.find({
    medicineName: { $in: missingMedicineNames },
    quantity: { $gt: 0 }
  }).populate("pharmacy");

  const grouped = new Map();

  stocks.forEach((stock) => {
    const pharmacy = stock.pharmacy;
    if (!pharmacy || String(pharmacy._id) === String(currentPharmacyId)) {
      return;
    }

    const key = String(pharmacy._id);
    if (!grouped.has(key)) {
      grouped.set(key, {
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.pharmacyName,
        phone: pharmacy.phone || null,
        isJanAushadhi: pharmacy.isJanAushadhi,
        availableMedicines: []
      });
    }

    grouped.get(key).availableMedicines.push({
      medicineName: stock.medicineName,
      quantity: stock.quantity
    });
  });

  return Array.from(grouped.values());
};

const notifyPatientAboutFulfillment = async ({
  patient,
  pharmacy,
  prescription,
  status,
  availableMedicines = [],
  unavailableMedicines = [],
  alternativePharmacies = []
}) => {
  if (!patient) return;

  let message = "";
  if (status === "Ready") {
    message = `Your medicines are ready at ${pharmacy.pharmacyName}.`;
  } else if (status === "Partially Available") {
    const availableText = availableMedicines.length
      ? `Available: ${availableMedicines.join(", ")}. `
      : "";
    const unavailableText = unavailableMedicines.length
      ? `Unavailable: ${unavailableMedicines.join(", ")}. `
      : "";
    const alternativesText = alternativePharmacies.length
      ? `Alternative pharmacies: ${alternativePharmacies.map((entry) => entry.pharmacyName).join(", ")}.`
      : "";
    message = `${availableText}${unavailableText}${alternativesText}`.trim();
  } else if (status === "Completed") {
    message = `Your prescription ${prescription.prescriptionId} has been marked completed at ${pharmacy.pharmacyName}.`;
  }

  if (!message) return;

  await Promise.allSettled([
    createNotification({
      userId: patient._id,
      title: `Prescription ${status}`,
      message,
      type: "pharmacy",
      data: {
        prescriptionId: prescription._id,
        pharmacyId: pharmacy._id,
        status
      }
    }),
    sendSms({
      to: patient.phone,
      message
    }),
    sendEmail({
      to: patient.email,
      subject: `Prescription ${status}`,
      text: message
    })
  ]);
};

exports.getFulfillmentQueue = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy profile not found" });
    }

    const prescriptions = await Prescription.find(buildPrescriptionQuery(pharmacy._id, req.query.status))
      .populate("patient", "full_name email phone")
      .populate("doctor", "full_name email phone")
      .sort({ issuedAt: -1 });

    return res.json({
      success: true,
      pharmacy,
      prescriptions
    });
  } catch (error) {
    console.error("[PHARMACY] queue failed", error);
    return res.status(500).json({ message: "Failed to fetch pharmacy prescriptions" });
  }
};

exports.checkPrescriptionAvailability = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy profile not found" });
    }

    const prescription = await Prescription.findById(req.params.id)
      .populate("patient", "full_name email phone")
      .populate("doctor", "full_name email phone");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    const medicineNames = prescription.medications.map((item) => item.name);
    const stocks = await PharmacyStock.find({
      pharmacy: pharmacy._id,
      medicineName: { $in: medicineNames }
    });

    const summary = formatAvailabilityFromStocks(prescription, stocks);

    return res.json({
      success: true,
      prescription,
      pharmacy,
      ...summary
    });
  } catch (error) {
    console.error("[PHARMACY] availability failed", error);
    return res.status(500).json({ message: "Failed to check stock availability" });
  }
};

exports.fulfillPrescription = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy profile not found" });
    }

    const { items, status, notes } = req.body;

    if (!["Ready", "Partially Available"].includes(status)) {
      return res.status(400).json({ message: "Status must be Ready or Partially Available" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Fulfillment items are required" });
    }

    await session.withTransaction(async () => {
      const prescription = await Prescription.findById(req.params.id)
        .populate("patient", "full_name email phone")
        .session(session);

      if (!prescription) {
        throw new Error("Prescription not found");
      }

      const updatedItems = [];

      for (const item of items) {
        if (!item.name) {
          throw new Error("Each fulfillment item must include a medicine name");
        }

        const stock = await PharmacyStock.findOne({
          pharmacy: pharmacy._id,
          medicineName: item.name
        }).session(session);

        const requestedQuantity = Math.max(Number(item.requestedQuantity || 1), 0);
        const availableQuantity = Math.max(Number(item.availableQuantity ?? stock?.quantity ?? 0), 0);
        const stockStatus = item.stockStatus || (availableQuantity > 0 ? "ready" : "unavailable");

        if (stockStatus === "ready" && stock && stock.quantity < requestedQuantity) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }

        updatedItems.push({
          name: item.name,
          requestedQuantity,
          availableQuantity,
          stockStatus,
          pharmacyStock: stock?._id || null
        });
      }

      const unavailableMedicines = updatedItems
        .filter((item) => item.stockStatus !== "ready")
        .map((item) => item.name);

      const alternativePharmacies = await findAlternativePharmacies(unavailableMedicines, pharmacy._id);

      prescription.assignedPharmacy = pharmacy._id;
      prescription.fulfillmentStatus = status;
      prescription.fulfillmentItems = updatedItems;
      prescription.pharmacyNotes = notes || null;
      prescription.fulfillmentHistory.push({
        status,
        pharmacy: pharmacy._id,
        note: notes || null,
        updatedAt: new Date()
      });

      await prescription.save({ session });

      await notifyPatientAboutFulfillment({
        patient: prescription.patient,
        pharmacy,
        prescription,
        status,
        availableMedicines: updatedItems.filter((item) => item.stockStatus === "ready").map((item) => item.name),
        unavailableMedicines,
        alternativePharmacies
      });

      res.status(200).json({
        success: true,
        message: `Prescription marked as ${status}`,
        prescription,
        alternativePharmacies
      });
    });
  } catch (error) {
    console.error("[PHARMACY] fulfill failed", error);
    const message = error.message === "Prescription not found"
      ? error.message
      : error.message.startsWith("Insufficient stock")
        ? error.message
        : "Failed to update prescription fulfillment";
    return res.status(message === "Prescription not found" ? 404 : 500).json({ message });
  } finally {
    await session.endSession();
  }
};

exports.completePrescriptionPickup = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy profile not found" });
    }

    await session.withTransaction(async () => {
      const prescription = await Prescription.findById(req.params.id)
        .populate("patient", "full_name email phone")
        .session(session);

      if (!prescription) {
        throw new Error("Prescription not found");
      }

      if (!prescription.assignedPharmacy || String(prescription.assignedPharmacy) !== String(pharmacy._id)) {
        throw new Error("Prescription is not assigned to this pharmacy");
      }

      const fulfillableItems = prescription.fulfillmentItems.filter((item) => item.stockStatus === "ready");
      if (fulfillableItems.length === 0) {
        throw new Error("No ready items available to complete");
      }

      for (const item of fulfillableItems) {
        const stock = await PharmacyStock.findOne({
          pharmacy: pharmacy._id,
          medicineName: item.name
        }).session(session);

        if (!stock || stock.quantity < item.requestedQuantity) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }

        stock.quantity -= item.requestedQuantity;
        await stock.save({ session });
      }

      prescription.fulfillmentStatus = "Completed";
      prescription.fulfillmentHistory.push({
        status: "Completed",
        pharmacy: pharmacy._id,
        note: req.body.notes || "Pickup completed",
        updatedAt: new Date()
      });

      await prescription.save({ session });

      await notifyPatientAboutFulfillment({
        patient: prescription.patient,
        pharmacy,
        prescription,
        status: "Completed"
      });

      res.json({
        success: true,
        message: "Prescription marked as completed",
        prescription
      });
    });
  } catch (error) {
    console.error("[PHARMACY] complete failed", error);
    const knownMessages = [
      "Prescription not found",
      "Prescription is not assigned to this pharmacy",
      "No ready items available to complete"
    ];
    const statusCode = knownMessages.includes(error.message) ? 400 : error.message.startsWith("Insufficient stock") ? 409 : 500;
    return res.status(statusCode).json({ message: knownMessages.includes(error.message) || error.message.startsWith("Insufficient stock") ? error.message : "Failed to complete pickup" });
  } finally {
    await session.endSession();
  }
};

exports.getAlternativePharmacies = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Valid prescription id is required" });
    }

    const pharmacy = await getPharmacyForUser(req.user._id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy profile not found" });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    const medicineNames = prescription.medications.map((item) => item.name);
    const currentStocks = await PharmacyStock.find({
      pharmacy: pharmacy._id,
      medicineName: { $in: medicineNames }
    });

    const missingMedicineNames = formatAvailabilityFromStocks(prescription, currentStocks).availability
      .filter((item) => item.stockStatus !== "ready")
      .map((item) => item.name);

    const alternativePharmacies = await findAlternativePharmacies(missingMedicineNames, pharmacy._id);

    return res.json({
      success: true,
      alternativePharmacies
    });
  } catch (error) {
    console.error("[PHARMACY] alternatives failed", error);
    return res.status(500).json({ message: "Failed to fetch alternative pharmacies" });
  }
};
