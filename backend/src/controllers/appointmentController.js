const Consultation = require("../models/Consultation.js");
const User = require("../models/User.js");
const DoctorAvailability = require("../models/DoctorAvailability.js");
const Doctor = require("../models/Doctor");
const mongoose = require("mongoose");
const {
  createNotification,
  sendEmail
} = require("../services/notificationService.js");

const normalizeDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(Date.UTC(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate()
  ));
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const timeSlotPattern = /^([01]\d|2[0-3]):[0-5]\d$/;
/* ---------------- GET ALL DOCTORS ---------------- */

exports.getAllDoctors = async (req, res) => {

  try {

    const doctors = await Doctor.find({})
      .populate("user", "full_name email phone");

    res.json({
      success: true,
      doctors
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- GET DOCTORS BY SPECIALIZATION ---------------- */

exports.getDoctorsBySpecialization = async (req, res) => {

  try {

    const { specialization } = req.params;

    const doctors = await Doctor.find({
      specialization: new RegExp(specialization, "i")
    })
    .populate("user", "full_name email phone");

    res.json({
      success: true,
      doctors
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }

};

/* ---------------- GET DOCTOR SLOTS ---------------- */

exports.getDoctorSlots = async (req, res) => {

  try {

    const { doctorId, date } = req.query;
    const normalizedDate = normalizeDate(date);
    if (!doctorId || !normalizedDate || !isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "doctorId and valid date are required" });
    }

    const availability = await DoctorAvailability.findOne({
      doctor: doctorId,
      date: normalizedDate
    });

    if (!availability) {
      return res.json({ success: true, slots: [] });
    }

    const consultations = await Consultation.find({
      doctor: doctorId,
      appointmentDate: normalizedDate,
      status: { $ne: 'Cancelled' }
    });

    const bookedSlots = consultations.map(c => c.timeSlot);
    const enrichedSlots = availability.slots.map(slot => ({
      time: slot,
      isBooked: bookedSlots.includes(slot)
    }));

    res.json({
      success: true,
      slots: enrichedSlots
    });

  } catch (error) {
    console.error('[GET_SLOTS] error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- SET DOCTOR SLOTS (DOCTOR ONLY) ---------------- */

exports.setDoctorSlots = async (req, res) => {

  try {

    const { date, slots } = req.body;
    const normalizedDate = normalizeDate(date);

    if (!normalizedDate) {
      return res.status(400).json({ message: "Valid date is required" });
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "Slots array is required" });
    }

    const cleanedSlots = Array.from(new Set(
      slots
        .map((slot) => String(slot).trim())
        .filter((slot) => timeSlotPattern.test(slot))
    ));

    if (cleanedSlots.length === 0) {
      return res.status(400).json({ message: "Slots must be in HH:mm format" });
    }

    const availability = await DoctorAvailability.findOneAndUpdate(
      { doctor: req.user._id, date: normalizedDate },
      { doctor: req.user._id, date: normalizedDate, slots: cleanedSlots },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      availability
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to save slots" });
  }
};

/* ---------------- BOOK APPOINTMENT ---------------- */

exports.bookAppointment = async (req, res) => {

  try {

    const { doctorId, specialization, date, slot } = req.body;

    if (!doctorId || !isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Valid doctorId is required" });
    }

    if (!specialization || typeof specialization !== "string") {
      return res.status(400).json({ message: "Specialization is required" });
    }

    if (!slot || !timeSlotPattern.test(String(slot).trim())) {
      return res.status(400).json({ message: "Valid time slot (HH:mm) is required" });
    }

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      return res.status(400).json({ message: "Valid appointment date is required" });
    }

    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const doctor = await Doctor.findOne({ user: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    if (doctor.specialization &&
        doctor.specialization.toLowerCase() !== specialization.toLowerCase()) {
      return res.status(400).json({ message: "Specialization does not match doctor profile" });
    }

    const availability = await DoctorAvailability.findOne({
      doctor: doctorId,
      date: normalizedDate
    });

    if (!availability || !availability.slots.includes(slot)) {
      return res.status(400).json({ message: "Selected slot is not available" });
    }

    const existing = await Consultation.findOne({
      doctor: doctorId,
      appointmentDate: normalizedDate,
      timeSlot: slot,
      status: { $ne: "Cancelled" }
    });

    if (existing) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    const appointment = await Consultation.create({
      patient: req.user._id,
      doctor: doctorId,
      specialization,
      appointmentDate: normalizedDate,
      timeSlot: slot,
      consultationFee: doctor.consultationFee || 0,
      paymentStatus: req.body.paymentStatus || 'Pending',
      paymentMethod: req.body.paymentMethod || 'Online'
    });

    const patientUser = await User.findById(req.user._id);

    const appointmentDateText = normalizedDate.toISOString().split("T")[0];
    const patientMessage = `Your appointment with Dr. ${doctorUser.full_name || "Doctor"} is scheduled on ${appointmentDateText} at ${slot}.`;
    const doctorMessage = `New appointment scheduled on ${appointmentDateText} at ${slot} with ${patientUser?.full_name || "a patient"}.`;

    const notificationResults = await Promise.allSettled([
      createNotification({
        userId: req.user._id,
        title: "Appointment Scheduled",
        message: patientMessage,
        data: { appointmentId: appointment._id }
      }),
      createNotification({
        userId: doctorId,
        title: "New Appointment",
        message: doctorMessage,
        data: { appointmentId: appointment._id }
      }),
      sendEmail({
        to: patientUser?.email,
        subject: "Appointment Scheduled",
        text: patientMessage
      }),
      sendEmail({
        to: doctorUser?.email,
        subject: "New Appointment",
        text: doctorMessage
      })
      // })
      // Placeholder channels intentionally disabled until real providers are added.
      // sendSms({
      //   to: patientUser?.phone,
      //   message: patientMessage
      // }),
      // sendPush({
      //   userId: doctorId,
      //   title: "New Appointment",
      //   message: doctorMessage,
      //   data: { appointmentId: appointment._id }
      // })
    ]);

    notificationResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`[BOOKING] notification task ${index} failed`, result.reason);
      } else if (result.value && result.value.ok === false) {
        console.error(`[BOOKING] notification task ${index} returned failure`, result.value);
      }
    });

    console.log("Appointment booked:", appointment._id);

    res.status(201).json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Booking failed" });
  }
};

/* ---------------- PATIENT APPOINTMENTS ---------------- */

exports.getMyAppointments = async (req, res) => {

  try {

    const appointments = await Consultation.find({ patient: req.user._id })
      .populate("doctor", "full_name email phone")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- DOCTOR APPOINTMENTS ---------------- */

exports.getDoctorAppointments = async (req, res) => {

  try {

    const appointments = await Consultation.find({ doctor: req.user._id })
      .populate("patient", "full_name email phone")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- CANCEL APPOINTMENT ---------------- */
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Consultation.findOne({
      _id: req.params.id,
      patient: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "Cancelled") {
      return res.status(400).json({ message: "Appointment already cancelled" });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    // Notify doctor
    await createNotification({
      userId: appointment.doctor,
      title: "Appointment Cancelled",
      message: `The appointment on ${appointment.appointmentDate.toISOString().split("T")[0]} at ${appointment.timeSlot} has been cancelled by the patient.`
    });

    res.json({
      success: true,
      message: "Appointment cancelled successfully"
    });

  } catch (error) {
     res.status(500).json({ message: "Failed to cancel appointment" });
  }
};

/* ---------------- UPDATE APPOINTMENT STATUS (DOCTOR) ---------------- */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Completed', 'Scheduled', 'Cancelled', 'FollowUp'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }
    const appointment = await Consultation.findOne({ _id: req.params.id, doctor: req.user._id });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    appointment.status = status;
    await appointment.save();
    await createNotification({
      userId: appointment.patient,
      title: 'Appointment Update',
      message: `Your appointment on ${appointment.appointmentDate.toISOString().split('T')[0]} at ${appointment.timeSlot} has been marked as ${status}.`
    });
    return res.json({ success: true, appointment, message: 'Status updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update appointment status' });
  }
};

// Reschedule appointment for patient
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, slot } = req.body;
    if (!date || !slot) {
      return res.status(400).json({ message: 'New date and slot are required' });
    }
    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    if (!timeSlotPattern.test(String(slot).trim())) {
      return res.status(400).json({ message: 'Invalid time slot format' });
    }
    const appointment = await Consultation.findOne({ _id: id, patient: req.user._id });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const conflict = await Consultation.findOne({
      doctor: appointment.doctor,
      appointmentDate: normalizedDate,
      timeSlot: slot,
      _id: { $ne: id },
      status: { $ne: 'Cancelled' }
    });
    if (conflict) {
      return res.status(409).json({ message: 'Selected slot is already booked' });
    }
    appointment.appointmentDate = normalizedDate;
    appointment.timeSlot = slot;
    await appointment.save();
    await createNotification({
      userId: req.user._id,
      title: 'Appointment Rescheduled',
      message: `Your appointment has been rescheduled to ${normalizedDate.toISOString().split('T')[0]} at ${slot}.`
    });
    await createNotification({
      userId: appointment.doctor,
      title: 'Appointment Rescheduled',
      message: `Patient has rescheduled appointment to ${normalizedDate.toISOString().split('T')[0]} at ${slot}.`
    });
    return res.json({ success: true, appointment, message: 'Appointment rescheduled' });
  } catch (error) {
    console.error('[RESCHEDULE] error:', error);
    return res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
};
// Reschedule appointment for doctor
exports.doctorRescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime } = req.body;
    if (!newDate || !newTime) {
      return res.status(400).json({ message: 'New date and time are required' });
    }
    const normalizedDate = normalizeDate(newDate);
    if (!normalizedDate) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    const appointment = await Consultation.findOne({ _id: id, doctor: req.user._id });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const conflict = await Consultation.findOne({
      doctor: req.user._id,
      appointmentDate: normalizedDate,
      timeSlot: newTime,
      _id: { $ne: id },
      status: { $ne: 'Cancelled' }
    });
    if (conflict) {
      return res.status(409).json({ message: 'You already have another appointment at this time' });
    }
    appointment.appointmentDate = normalizedDate;
    appointment.timeSlot = newTime;
    appointment.status = 'Scheduled'; // Ensure it's active
    appointment.rescheduledByDoctor = true;
    await appointment.save();

    // Notify patient via in-app notification
    await createNotification({
      userId: appointment.patient,
      title: 'Appointment Rescheduled',
      message: `Dr. ${req.user.full_name || 'Your doctor'} has rescheduled your appointment to ${newDate} at ${newTime}.`,
      data: { appointmentId: appointment._id }
    });

    // Notify patient via email
    const patientUser = await User.findById(appointment.patient);
    if (patientUser?.email) {
      await sendEmail({
        to: patientUser.email,
        subject: "Appointment Rescheduled - Seva Telehealth",
        text: `Hello ${patientUser.full_name || 'Patient'},\n\nDr. ${req.user.full_name || 'Your doctor'} has rescheduled your appointment to ${newDate} at ${newTime}.\n\nPlease check your dashboard for more details.\n\nBest regards,\nSeva Telehealth Team`
      });
    }

    return res.json({ success: true, appointment, message: 'Appointment rescheduled successfully' });
  } catch (error) {
    console.error('[DOCTOR_RESCHEDULE] error:', error);
    return res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
};
