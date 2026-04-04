const crypto = require("crypto");
const mongoose = require("mongoose");
const Consultation = require("../models/Consultation.js");
const Doctor = require("../models/Doctor.js");
const HealthRecord = require("../models/HealthRecord.js");
const Prescription = require("../models/Prescription.js");
const PrescriptionOrder = require("../models/PrescriptionOrder.js");
const Pharmacy = require("../models/Pharmacy.js");
const User = require("../models/User.js");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const cleanString = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const cleanStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => cleanString(entry))
    .filter(Boolean);
};

const normalizeMedications = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      name: cleanString(item?.name),
      dosage: cleanString(item?.dosage),
      frequency: cleanString(item?.frequency),
      duration: cleanString(item?.duration),
      instructions: cleanString(item?.instructions)
    }))
    .filter((item) => item.name);
};

const buildSignatureHash = ({
  doctorId,
  patientId,
  consultationId,
  issuedAt,
  diagnosis,
  medications,
  labTests,
  notes
}) => {
  const payload = JSON.stringify({
    doctorId: String(doctorId),
    patientId: String(patientId),
    consultationId: consultationId ? String(consultationId) : null,
    issuedAt: issuedAt.toISOString(),
    diagnosis,
    medications,
    labTests,
    notes
  });

  return crypto.createHash("sha256").update(payload).digest("hex");
};

exports.generatePrescription = async (req, res) => {
  try {
    const {
      patientId,
      consultationId,
      diagnosis,
      medications,
      additionalInstructions,
      notes,
      labTests,
      validUntil
    } = req.body;

    const normalizedDiagnosis = cleanString(diagnosis);
    const normalizedNotes = cleanString(notes || additionalInstructions);
    const normalizedMedications = normalizeMedications(medications);
    const normalizedLabTests = cleanStringArray(labTests);
    const normalizedValidUntil = validUntil ? new Date(validUntil) : null;

    if (!normalizedDiagnosis) {
      return res.status(400).json({ message: "Diagnosis details are required" });
    }

    if (normalizedMedications.length === 0) {
      return res.status(400).json({ message: "At least one prescribed medication is required" });
    }

    if (!patientId && !consultationId) {
      return res.status(400).json({ message: "patientId or consultationId is required" });
    }

    if (normalizedValidUntil && Number.isNaN(normalizedValidUntil.getTime())) {
      return res.status(400).json({ message: "validUntil must be a valid date" });
    }

    if (patientId && !isValidObjectId(patientId)) {
      return res.status(400).json({ message: "Valid patientId is required" });
    }

    if (consultationId && !isValidObjectId(consultationId)) {
      return res.status(400).json({ message: "Valid consultationId is required" });
    }

    let consultation = null;
    if (consultationId) {
      consultation = await Consultation.findOne({
        _id: consultationId,
        doctor: req.user._id
      });

      if (!consultation) { console.warn(`[PRESCRIPTION] Consultation ${consultationId} not found for doctor ${req.user._id}`); return res.status(404).json({ message: "Consultation not found for this doctor" }); } console.log(`[PRESCRIPTION] Consultation found: ${consultationId}`);
    }

    const resolvedPatientId = consultation?.patient?._id || consultation?.patient || patientId;
    const patient = await User.findById(resolvedPatientId);

    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (consultation && String(consultation.patient) !== String(patient._id)) {
      return res.status(400).json({ message: "Consultation does not belong to the selected patient" });
    }

    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    const issuedAt = new Date();
    const signatureHash = buildSignatureHash({
      doctorId: req.user._id,
      patientId: patient._id,
      consultationId: consultation?._id,
      issuedAt,
      diagnosis: normalizedDiagnosis,
      medications: normalizedMedications,
      labTests: normalizedLabTests,
      notes: normalizedNotes
    });

    const prescription = new Prescription({
      patient: patient._id,
      doctor: req.user._id,
      consultation: consultation?._id || null,
      diagnosis: normalizedDiagnosis,
      medications: normalizedMedications,
      labTests: normalizedLabTests,
      notes: normalizedNotes,
      followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : null,
      issuedAt,
      validUntil: normalizedValidUntil,
      digitalSignature: {
        signedBy: req.user._id,
        signerName: req.user.name || req.user.full_name,
        signerRole: req.user.role,
        doctorLicense: doctorProfile?.medicalLicense || null,
        signatureHash,
        signedAt: issuedAt
      }
    });

    prescription.verificationUrl = `/api/doctor/prescriptions/verify/${prescription.prescriptionId}`;
    prescription.qrCodeData = JSON.stringify({
      prescriptionId: prescription.prescriptionId,
      verificationUrl: prescription.verificationUrl,
      signedAt: issuedAt.toISOString(),
      signatureHash
    });

    if (consultation) {
      consultation.status = "Completed";
      await consultation.save();
    }

    await prescription.save();

    const healthRecord = await HealthRecord.create({
      patient: patient._id,
      doctor: req.user._id,
      consultation: consultation?._id || null,
      prescription: prescription._id,
      type: "prescription",
      title: `Prescription ${prescription.prescriptionId}`,
      description: normalizedNotes || `Prescription for ${normalizedDiagnosis}`,
      diagnosis: normalizedDiagnosis,
      prescriptionDetails: normalizedMedications,
      labTests: normalizedLabTests,
      doctorInfo: {
        userId: req.user._id,
        name: req.user.name || req.user.full_name,
        email: req.user.email || null,
        specialization: doctorProfile?.specialization || consultation?.specialization || null,
        medicalLicense: doctorProfile?.medicalLicense || null
      },
      source: "generated",
      date: issuedAt,
      lastSyncedAt: issuedAt
    });

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate("patient", "full_name email phone")
      .populate("doctor", "full_name email phone")
      .populate("consultation");

    return res.status(201).json({
      success: true,
      message: "Prescription generated successfully",
      prescription: populatedPrescription,
      healthRecordId: healthRecord._id
    });
  } catch (error) {
    console.error("[PRESCRIPTION] generate failed", error);
    return res.status(500).json({ message: "Failed to generate prescription" });
  }
};

exports.verifyPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      prescriptionId: req.params.prescriptionId
    })
      .populate("patient", "full_name email phone")
      .populate("doctor", "full_name email phone")
      .populate("consultation");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    return res.json({
      success: true,
      verified: true,
      prescription
    });
  } catch (error) {
    console.error("[PRESCRIPTION] verify failed", error);
    return res.status(500).json({ message: "Failed to verify prescription" });
  }
};

exports.assignToPharmacy = async (req, res) => {
  try {
    const { prescriptionId, pharmacyId, deliveryType, deliveryAddress } = req.body;
    
    // Find prescription
    const prescription = await Prescription.findById(prescriptionId).populate("patient");
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Security: Only the patient who owns the prescription can assign it
    if (prescription.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: You do not own this prescription" });
    }

    // Validate Pharmacy
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    // If HOME delivery is selected, check if pharmacy supports it
    if (deliveryType === "HOME" && !pharmacy.deliveryAvailable) {
      return res.status(400).json({ message: "This pharmacy does not offer home delivery" });
    }

    // Update prescription
    prescription.assignedPharmacy = pharmacyId;
    prescription.fulfillmentStatus = "Pending";
    await prescription.save();

    // Create a new PrescriptionOrder
    const order = await PrescriptionOrder.create({
      patient: req.user._id,
      pharmacy: pharmacyId,
      prescription: prescriptionId,
      deliveryType: deliveryType || "PICKUP",
      deliveryAddress: deliveryType === "HOME" ? deliveryAddress : null,
      status: "Pending"
    });

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id
    });
  } catch (error) {
    console.error("[PRESCRIPTION] assign failed", error);
    res.status(500).json({ message: "Failed to place order with pharmacy" });
  }
};

exports.getPrescriptionByConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    console.log(`[PRESCRIPTION] Searching: ${consultationId} by Dr: ${req.user._id}`);

    if (!mongoose.Types.ObjectId.isValid(consultationId)) {
        return res.status(400).json({ message: "Invalid consultation ID" });
    }

    const oid = new mongoose.Types.ObjectId(consultationId);

    // 1. Direct search
    let prescription = await Prescription.findOne({ consultation: oid })
      .populate("patient", "full_name email phone")
      .populate("doctor", "full_name email phone")
      .populate("consultation");

    // 2. Fallback to HealthRecord
    if (!prescription) {
      console.warn(`[PRESCRIPTION] No direct link. Trying HealthRecord...`);
      const HealthRecord = require("../models/HealthRecord.js");
      const record = await HealthRecord.findOne({ consultation: oid, type: "prescription" })
          .populate("patient", "full_name email phone")
          .populate("doctor", "full_name email phone")
          .populate("consultation");
          
      if (record) {
          return res.json({
            success: true,
            prescription: {
                diagnosis: record.diagnosis,
                medications: record.prescriptionDetails,
                notes: record.description,
                issuedAt: record.date,
                patient: record.patient,
                doctor: record.doctor,
                digitalSignature: { signerName: record.doctorInfo?.name || "Doctor", doctorLicense: record.doctorInfo?.medicalLicense }
            }
          });
      }
    }

    // 3. Fuzzy search: Find by patient and doctor if we have the consultation
    if (!prescription) {
        const consultation = await Consultation.findById(oid);
        if (consultation) {
            console.warn(`[PRESCRIPTION] Trying fuzzy search by patient: ${consultation.patient}`);
            prescription = await Prescription.findOne({ 
                patient: consultation.patient, 
                doctor: req.user._id 
            })
            .sort({ issuedAt: -1 }) // Get the latest one
            .populate("patient doctor consultation");
        }
    }

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found for this consultation"
      });
    }

    return res.json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error("[PRESCRIPTION] fetch by consultation failed", error);
    return res.status(500).json({ message: "Failed to fetch prescription" });
  }
};

exports.getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.user._id })
      .populate("patient", "full_name email phone")
      .sort({ issuedAt: -1 });
    return res.json({ success: true, prescriptions });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch prescriptions" });
  }
};
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await PrescriptionOrder.find({ patient: req.user._id })
      .populate("pharmacy", "pharmacyName location deliveryAvailable")
      .populate({
        path: "prescription",
        populate: { path: "doctor", select: "full_name email" }
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("[PRESCRIPTION] fetch my orders failed", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await PrescriptionOrder.findOne({ _id: orderId, patient: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: "Only pending orders can be cancelled." });
    }

    order.status = 'Cancelled';
    await order.save();

    return res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("[PRESCRIPTION] cancel order failed", error);
    return res.status(500).json({ message: "Failed to cancel order" });
  }
};
