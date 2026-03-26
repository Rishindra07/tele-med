const mongoose = require("mongoose");
const Consultation = require("../models/Consultation.js");
const HealthRecord = require("../models/HealthRecord.js");
const {
  createNotification,
  sendEmail,
  sendSms
} = require("../services/notificationService.js");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.scheduleFollowUp = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { followUpDate, consultationNotes } = req.body;

    if (!isValidObjectId(consultationId)) {
      return res.status(400).json({ message: "Valid consultationId is required" });
    }

    const parsedFollowUpDate = followUpDate ? new Date(followUpDate) : null;
    if (!parsedFollowUpDate || Number.isNaN(parsedFollowUpDate.getTime())) {
      return res.status(400).json({ message: "Valid followUpDate is required" });
    }

    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctor: req.user._id
    })
      .populate("patient", "full_name email phone")
      .populate("doctor", "full_name email");

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found for this doctor" });
    }

    consultation.followUpDate = parsedFollowUpDate;
    consultation.status = "FollowUp";

    if (consultationNotes) {
      consultation.consultationNotes = consultationNotes;
    }

    consultation.reminders = {
      ...(consultation.reminders?.toObject?.() || consultation.reminders || {}),
      followUp3dSentAt: null
    };

    await consultation.save();

    const followUpLabel = parsedFollowUpDate.toLocaleDateString("en-IN", {
      dateStyle: "medium"
    });
    const doctorName = consultation.doctor?.full_name || req.user.full_name || "Doctor";
    const message = `Dr. ${doctorName} recommended a follow-up on ${followUpLabel}. You will receive a reminder 3 days before the date.`;

    await Promise.allSettled([
      createNotification({
        userId: consultation.patient?._id,
        title: "Follow-up scheduled",
        message,
        type: "follow_up",
        data: {
          consultationId: consultation._id,
          doctorId: consultation.doctor?._id || req.user._id,
          followUpDate: parsedFollowUpDate.toISOString(),
          rebookDoctorId: consultation.doctor?._id || req.user._id,
          specialization: consultation.specialization
        }
      }),
      sendEmail({
        to: consultation.patient?.email,
        subject: "Follow-up scheduled",
        text: message
      }),
      sendSms({
        to: consultation.patient?.phone,
        message
      })
    ]);

    return res.json({
      success: true,
      message: "Follow-up scheduled successfully",
      consultation
    });
  } catch (error) {
    console.error("[FOLLOW_UP] schedule failed", error);
    return res.status(500).json({ message: "Failed to schedule follow-up" });
  }
};

exports.getPatientProgress = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ message: "Valid patientId is required" });
    }

    const [consultations, records] = await Promise.all([
      Consultation.find({
        doctor: req.user._id,
        patient: patientId
      })
        .sort({ appointmentDate: -1 })
        .limit(10),
      HealthRecord.find({
        patient: patientId
      })
        .populate("consultation")
        .populate("prescription")
        .sort({ date: -1 })
        .limit(20)
    ]);

    return res.json({
      success: true,
      consultations,
      healthRecords: records
    });
  } catch (error) {
    console.error("[FOLLOW_UP] progress failed", error);
    return res.status(500).json({ message: "Failed to load patient progress" });
  }
};
