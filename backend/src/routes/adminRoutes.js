const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware.js");
const { allowRoles } = require("../middleware/roleMiddleware.js");
const {
  approveUser,
  createComplaint,
  exportReport,
  getConsultationMonitor,
  getComplaints,
  getDashboardAnalytics,
  getDoctorsDirectory,
  getFinancialOverview,
  getPendingApprovals,
  getPatientsRegistry,
  getPharmaciesDirectory,
  getRecordsOverview,
  getSystemLogs,
  resolveComplaint
} = require("../controllers/adminController.js");

router.get("/analytics", protect, allowRoles("admin"), getDashboardAnalytics);
router.get("/consultations", protect, allowRoles("admin"), getConsultationMonitor);
router.get("/financials", protect, allowRoles("admin"), getFinancialOverview);
router.get("/patients", protect, allowRoles("admin"), getPatientsRegistry);
router.get("/records", protect, allowRoles("admin"), getRecordsOverview);
router.get("/doctors", protect, allowRoles("admin"), getDoctorsDirectory);
router.get("/pharmacies", protect, allowRoles("admin"), getPharmaciesDirectory);
router.get("/approvals/pending", protect, allowRoles("admin"), getPendingApprovals);
router.patch("/approvals/:id/approve", protect, allowRoles("admin"), approveUser);
router.get("/complaints", protect, allowRoles("admin"), getComplaints);
router.post("/complaints", protect, allowRoles("patient", "doctor", "pharmacist", "admin"), createComplaint);
router.patch("/complaints/:id/resolve", protect, allowRoles("admin"), resolveComplaint);
router.get("/logs", protect, allowRoles("admin"), getSystemLogs);
router.get("/reports/export", protect, allowRoles("admin"), exportReport);

module.exports = router;
