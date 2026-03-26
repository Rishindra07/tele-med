const crypto = require("crypto");
const mongoose = require("mongoose");
const Consultation = require("../models/Consultation.js");
const Doctor = require("../models/Doctor.js");
const HealthRecord = require("../models/HealthRecord.js");
const Prescription = require("../models/Prescription.js");
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
      labTests,
      validUntil
    } = req.body;

    const normalizedDiagnosis = cleanString(diagnosis);
    const normalizedNotes = cleanString(additionalInstructions);
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

      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found for this doctor" });
      }
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
    const { prescriptionId, pharmacyId } = req.body;
    
    // Find prescription
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Security: Only the patient who owns the prescription can assign it
    if (prescription.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: You do not own this prescription" });
    }

    // Update assignment
    prescription.assignedPharmacy = pharmacyId;
    prescription.fulfillmentStatus = "Pending";
    
    await prescription.save();

    res.json({
      success: true,
      message: "Prescription successfully sent to pharmacy"
    });
  } catch (error) {
    console.error("[PRESCRIPTION] assign failed", error);
    res.status(500).json({ message: "Failed to send prescription to pharmacy" });
  }
};