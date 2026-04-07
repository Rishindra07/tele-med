const express = require("express");
const router = express.Router();

const {
  getDoctorsBySpecialization,
  getAllDoctors,
  getDoctorSlots,
  setDoctorSlots,
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  rescheduleAppointment
} = require("../controllers/appointmentController.js");

const { finishConsultation } = require("../controllers/consultationControllers.js");

const  protect  = require("../middleware/authMiddleware.js");
const { allowRoles } = require("../middleware/roleMiddleware.js");

router.get("/doctors", protect, allowRoles("patient"), getAllDoctors);

router.get("/doctors/:specialization", protect, allowRoles("patient"), getDoctorsBySpecialization);

router.get("/slots", protect, allowRoles("patient", "doctor"), getDoctorSlots);

router.post("/slots", protect, allowRoles("doctor"), setDoctorSlots);

router.post("/book", protect, allowRoles("patient"), bookAppointment);

router.get("/my", protect, allowRoles("patient"), getMyAppointments);

router.get("/doctor", protect, allowRoles("doctor"), getDoctorAppointments);

router.put("/cancel/:id", protect, allowRoles("patient"), cancelAppointment);
router.put("/:id/reschedule", protect, allowRoles("patient"), rescheduleAppointment);
router.put("/:id/end", protect, allowRoles("patient", "doctor"), finishConsultation);

module.exports = router;
