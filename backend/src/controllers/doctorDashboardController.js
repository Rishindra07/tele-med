const Consultation = require("../models/Consultation.js");
const Doctor = require("../models/Doctor.js");
const Notification = require("../models/Notification.js");
const Prescription = require("../models/Prescription.js");
const User = require("../models/User.js");
const GlobalSetting = require("../models/GlobalSetting.js");

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const serializeConsultation = (consultation) => ({
  _id: consultation._id,
  appointmentDate: consultation.appointmentDate,
  timeSlot: consultation.timeSlot,
  status: consultation.status,
  specialization: consultation.specialization,
  consultationMode: consultation.consultationMode,
  followUpDate: consultation.followUpDate,
  rescheduledByDoctor: consultation.rescheduledByDoctor,
  patient: consultation.patient
    ? {
        _id: consultation.patient._id,
        full_name: consultation.patient.full_name,
        email: consultation.patient.email,
        phone: consultation.patient.phone
      }
    : null
});

exports.getDoctorDashboard = async (req, res) => {
  try {
    const today = startOfToday();

    const [doctorProfile, appointments, notifications, prescriptionCount] = await Promise.all([
      Doctor.findOne({ user: req.user._id }).lean(),
      Consultation.find({ doctor: req.user._id })
        .populate("patient", "full_name email phone")
        .sort({ appointmentDate: 1, timeSlot: 1 })
        .lean(),
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Prescription.countDocuments({ doctor: req.user._id })
    ]);

    const uniquePatientIds = new Set(
      appointments
        .map((appointment) => appointment.patient?._id && String(appointment.patient._id))
        .filter(Boolean)
    );

    const todayAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate.getTime() === today.getTime() && appointment.status !== "Cancelled";
    });

    const upcomingAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate >= today && ["Scheduled", "FollowUp"].includes(appointment.status);
    });

    const recentPatients = [];
    const seenPatients = new Set();
    for (const appointment of [...appointments].sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))) {
      const patientId = appointment.patient?._id && String(appointment.patient._id);
      if (!patientId || seenPatients.has(patientId)) continue;
      seenPatients.add(patientId);
      recentPatients.push({
        _id: appointment.patient._id,
        full_name: appointment.patient.full_name,
        email: appointment.patient.email,
        phone: appointment.patient.phone,
        lastAppointmentDate: appointment.appointmentDate,
        specialization: appointment.specialization,
        status: appointment.status
      });
      if (recentPatients.length >= 5) break;
    }

    return res.json({
      success: true,
      profile: {
        user: {
          _id: req.user._id,
          full_name: req.user.full_name,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role
        },
        doctor: doctorProfile
      },
      summary: {
        totalPatients: uniquePatientIds.size,
        todayAppointments: todayAppointments.length,
        upcomingAppointments: upcomingAppointments.length,
        prescriptionsIssued: prescriptionCount
      },
      upcomingAppointments: upcomingAppointments.slice(0, 8).map(serializeConsultation),
      recentPatients,
      notifications
    });
  } catch (error) {
    console.error("[DOCTOR] dashboard failed", error);
    return res.status(500).json({ message: "Failed to load doctor dashboard" });
  }
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).lean();

    return res.json({
      success: true,
      user: {
        _id: req.user._id,
        full_name: req.user.full_name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        preferred_language: req.user.preferred_language
      },
      doctor
    });
  } catch (error) {
    console.error("[DOCTOR] profile failed", error);
    return res.status(500).json({ message: "Failed to load doctor profile" });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const {
      specialization, bio, hospitalName, consultationFee,
      qualification, experience, languages, consultation_modes,
      is_available_for_booking, full_name, phone, medicalLicense
    } = req.body;

    // Update User fields
    const userUpdates = {};
    if (full_name) userUpdates.full_name = String(full_name).trim();
    if (phone) userUpdates.phone = String(phone).trim();
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    // Update Doctor profile fields
    const doctorUpdates = {};
    if (specialization) doctorUpdates.specialization = String(specialization).trim();
    if (bio !== undefined) doctorUpdates.bio = String(bio).trim();
    if (hospitalName) doctorUpdates.hospitalName = String(hospitalName).trim();
    if (consultationFee !== undefined) {
      const minFeeSetting = await GlobalSetting.findOne({ key: 'minConsultationFee' });
      const minFee = minFeeSetting ? Number(minFeeSetting.value) : 100;
      
      const newFee = Number(consultationFee);
      if (newFee < minFee) {
        return res.status(400).json({ 
          message: `Consultation fee cannot be lower than the global minimum of ₹${minFee}` 
        });
      }
      doctorUpdates.consultationFee = newFee;
    }
    if (qualification) doctorUpdates.qualification = String(qualification).trim();
    if (experience !== undefined) doctorUpdates.experience = Number(experience);
    if (Array.isArray(languages)) doctorUpdates.languages = languages;
    if (Array.isArray(consultation_modes)) doctorUpdates.consultation_modes = consultation_modes;
    if (is_available_for_booking !== undefined) doctorUpdates.is_available_for_booking = Boolean(is_available_for_booking);
    if (medicalLicense) doctorUpdates.medicalLicense = String(medicalLicense).trim();
    
    // Step 2 Verification fields
    const { degreeCertificate, registrationCertificate, idProof, profileImage } = req.body;
    if (degreeCertificate) doctorUpdates.degreeCertificate = degreeCertificate;
    if (registrationCertificate) doctorUpdates.registrationCertificate = registrationCertificate;
    if (idProof) doctorUpdates.idProof = idProof;
    if (profileImage) doctorUpdates.profileImage = profileImage;

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { $set: doctorUpdates },
      { new: true }
    );

    return res.json({ success: true, doctor, message: "Profile updated successfully" });
  } catch (error) {
    console.error("[DOCTOR] profile update failed", error);
    return res.status(500).json({ message: "Failed to update doctor profile" });
  }
};

exports.getDoctorPatients = async (req, res) => {
  try {
    const consultations = await Consultation.find({ doctor: req.user._id })
      .populate("patient", "full_name email phone")
      .sort({ appointmentDate: -1 })
      .lean();

    // Deduplicate patients and aggregate stats
    const patientMap = new Map();
    for (const c of consultations) {
      if (!c.patient) continue;
      const pid = String(c.patient._id);
      if (!patientMap.has(pid)) {
        patientMap.set(pid, {
          _id: c.patient._id,
          full_name: c.patient.full_name,
          email: c.patient.email,
          phone: c.patient.phone,
          lastVisit: c.appointmentDate,
          lastDiagnosis: c.specialization || "General",
          lastStatus: c.status,
          totalVisits: 1
        });
      } else {
        patientMap.get(pid).totalVisits += 1;
      }
    }

    return res.json({
      success: true,
      patients: Array.from(patientMap.values())
    });
  } catch (error) {
    console.error("[DOCTOR] patients list failed", error);
    return res.status(500).json({ message: "Failed to load patients" });
  }
};
