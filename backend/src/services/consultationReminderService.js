const Consultation = require("../models/Consultation.js");
const { createNotification, sendEmail, sendSms } = require("./notificationService.js");

const REMINDER_INTERVAL_MS = Number(process.env.CONSULTATION_REMINDER_INTERVAL_MS || 60_000);

const getAppointmentDateTime = (appointmentDate, timeSlot) => {
  if (!appointmentDate || !timeSlot) return null;

  const [hours, minutes] = String(timeSlot).split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;

  const date = new Date(appointmentDate);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    hours,
    minutes,
    0,
    0
  );
};

const formatAppointmentText = (appointmentTime) =>
  appointmentTime.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

const processAppointmentReminder = async (appointment, now) => {
  const appointmentTime = getAppointmentDateTime(appointment.appointmentDate, appointment.timeSlot);
  if (!appointmentTime || appointmentTime <= now) return;
  if (!appointment.reminders) {
    appointment.reminders = {};
  }

  const msUntilAppointment = appointmentTime.getTime() - now.getTime();
  const patient = appointment.patient;
  const doctor = appointment.doctor;
  const appointmentLabel = formatAppointmentText(appointmentTime);
  const doctorName = doctor?.name || "Doctor";
  const patientName = patient?.name || "your patient";

  if (!appointment.reminders?.email24hSentAt && msUntilAppointment <= 24 * 60 * 60 * 1000) {
    const result = await sendEmail({
      to: patient?.email,
      subject: "Reminder: consultation in 24 hours",
      text: `Your consultation with Dr. ${doctorName} is scheduled for ${appointmentLabel}.`
    });

    if (result.ok) {
      appointment.reminders.email24hSentAt = now;
    }
  }

  if (!appointment.reminders?.email1hSentAt && msUntilAppointment <= 60 * 60 * 1000) {
    const patientReminder = await sendEmail({
      to: patient?.email,
      subject: "Reminder: consultation in 1 hour",
      text: `Your consultation with Dr. ${doctorName} starts at ${appointmentLabel}.`
    });

    const doctorReminder = await sendEmail({
      to: doctor?.email,
      subject: "Reminder: consultation in 1 hour",
      text: `Your consultation with ${patientName} starts at ${appointmentLabel}.`
    });

    if (patientReminder.ok && doctorReminder.ok) {
      appointment.reminders.email1hSentAt = now;
      await Promise.allSettled([
        createNotification({
          userId: patient?._id,
          title: "Consultation in 1 hour",
          message: `Your consultation with Dr. ${doctorName} starts at ${appointmentLabel}.`,
          data: { appointmentId: appointment._id, reminderType: "1h" }
        }),
        createNotification({
          userId: doctor?._id,
          title: "Upcoming consultation in 1 hour",
          message: `Your consultation with ${patientName} starts at ${appointmentLabel}.`,
          data: { appointmentId: appointment._id, reminderType: "1h" }
        })
      ]);
    }
  }

  if (appointment.isModified("reminders")) {
    await appointment.save();
  }
};

const processFollowUpReminder = async (appointment, now) => {
  if (!appointment.followUpDate) return;
  if (!appointment.reminders) {
    appointment.reminders = {};
  }

  const followUpDate = new Date(appointment.followUpDate);
  if (Number.isNaN(followUpDate.getTime()) || followUpDate <= now) return;

  const msUntilFollowUp = followUpDate.getTime() - now.getTime();
  if (appointment.reminders?.followUp3dSentAt || msUntilFollowUp > 3 * 24 * 60 * 60 * 1000) {
    return;
  }

  const patient = appointment.patient;
  const doctor = appointment.doctor;
  const doctorName = doctor?.name || "Doctor";
  const followUpLabel = followUpDate.toLocaleDateString("en-IN", {
    dateStyle: "medium"
  });
  const message = `Your follow-up with Dr. ${doctorName} is due on ${followUpLabel}. Rebook with the same doctor when ready.`;

  const emailResult = await sendEmail({
    to: patient?.email,
    subject: "Follow-up due in 3 days",
    text: message
  });

  const notificationResults = await Promise.allSettled([
    sendSms({
      to: patient?.phone,
      message
    }),
    createNotification({
      userId: patient?._id,
      title: "Follow-up due in 3 days",
      message,
      type: "follow_up",
      data: {
        consultationId: appointment._id,
        doctorId: doctor?._id,
        followUpDate: followUpDate.toISOString(),
        rebookDoctorId: doctor?._id,
        specialization: appointment.specialization
      }
    })
  ]);

  const hasDeliveredChannel = emailResult.ok || notificationResults.some((result) => result.status === "fulfilled");

  if (hasDeliveredChannel) {
    appointment.reminders.followUp3dSentAt = now;
    await appointment.save();
  }
};

const runReminderCycle = async () => {
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcomingAppointments = await Consultation.find({
    status: "Scheduled",
    appointmentDate: { $gte: startDate, $lte: endDate },
    $or: [
      { "reminders.email24hSentAt": null },
      { "reminders.email24hSentAt": { $exists: false } },
      { "reminders.email1hSentAt": null },
      { "reminders.email1hSentAt": { $exists: false } }
    ]
  })
    .populate("patient", "full_name email")
    .populate("doctor", "full_name email");

  for (const appointment of upcomingAppointments) {
    try {
      await processAppointmentReminder(appointment, now);
    } catch (error) {
      console.error("[REMINDER] failed", {
        appointmentId: appointment._id.toString(),
        error: error.message
      });
    }
  }

  const followUpAppointments = await Consultation.find({
    followUpDate: { $gte: now, $lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) },
    $or: [
      { "reminders.followUp3dSentAt": null },
      { "reminders.followUp3dSentAt": { $exists: false } }
    ]
  })
    .populate("patient", "full_name email phone")
    .populate("doctor", "full_name email");

  for (const appointment of followUpAppointments) {
    try {
      await processFollowUpReminder(appointment, now);
    } catch (error) {
      console.error("[FOLLOW_UP_REMINDER] failed", {
        appointmentId: appointment._id.toString(),
        error: error.message
      });
    }
  }
};

const startConsultationReminderService = () => {
  runReminderCycle().catch((error) => {
    console.error("[REMINDER] initial cycle failed", error.message);
  });

  return setInterval(() => {
    runReminderCycle().catch((error) => {
      console.error("[REMINDER] cycle failed", error.message);
    });
  }, REMINDER_INTERVAL_MS);
};

module.exports = {
  getAppointmentDateTime,
  startConsultationReminderService
};
