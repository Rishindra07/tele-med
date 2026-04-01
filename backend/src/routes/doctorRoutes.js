const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware.js");
const { allowRoles } = require("../middleware/roleMiddleware.js");
const {
  generatePrescription,
  verifyPrescription,
  getPrescriptionByConsultation,
  getAllPrescriptions
} = require("../controllers/prescriptionController.js");
const {
  getDoctorDashboard,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorPatients
} = require("../controllers/doctorDashboardController.js");
const {
  getPatientProgress,
  scheduleFollowUp
} = require("../controllers/followUpController.js");
const {
  updateAppointmentStatus,
  doctorRescheduleAppointment
} = require("../controllers/appointmentController.js");
const {
  getPatientHistory
} = require("../controllers/medicalRecordController.js");

router.get("/prescriptions/verify/:prescriptionId", verifyPrescription);
router.get("/dashboard", protect, allowRoles("doctor"), getDoctorDashboard);
router.get("/profile", protect, allowRoles("doctor"), getDoctorProfile);
router.put("/profile", protect, allowRoles("doctor"), updateDoctorProfile);
router.get("/patients", protect, allowRoles("doctor"), getDoctorPatients);

router.post(
  "/prescriptions/generate",
  protect,
  allowRoles("doctor"),
  generatePrescription
);
router.get(
  "/prescriptions/consultation/:consultationId",
  protect,
  allowRoles("doctor"),
  getPrescriptionByConsultation
);

router.get(
  "/prescriptions/all",
  protect,
  allowRoles("doctor"),
  getAllPrescriptions
);
router.patch(
  "/consultations/:consultationId/follow-up",
  protect,
  allowRoles("doctor"),
  scheduleFollowUp
);
router.get(
  "/patients/:id/history",
  protect,
  allowRoles("doctor"),
  getPatientHistory
);
router.get(
  "/patients/:patientId/progress",
  protect,
  allowRoles("doctor"),
  getPatientProgress
);
router.patch(
  "/appointments/:id/status",
  protect,
  allowRoles("doctor"),
  updateAppointmentStatus
);

router.patch(
  "/appointments/:id/reschedule",
  protect,
  allowRoles("doctor"),
  doctorRescheduleAppointment
);

module.exports = router;

