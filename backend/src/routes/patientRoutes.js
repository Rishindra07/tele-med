const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware.js");
const { allowRoles } = require("../middleware/roleMiddleware.js");
const { getPatientProfile, updatePatientProfile, updatePatientSettings } = require("../controllers/userControllers.js");
const { getMyRecords, addRecord, deleteRecord } = require("../controllers/medicalRecordController");
const { getAllPharmacies, getPharmacyStock } = require("../controllers/pharmacyController");
const { assignToPharmacy } = require("../controllers/prescriptionController");

// Profile & Settings
router.get("/profile", protect, allowRoles("patient"), getPatientProfile);
router.put("/profile", protect, allowRoles("patient"), updatePatientProfile);
router.put("/settings", protect, allowRoles("patient"), updatePatientSettings);
// Reschedule appointment is now in appointmentRoutes


// Medical Records
router.get("/records", protect, allowRoles("patient"), getMyRecords);
router.post("/records", protect, allowRoles("patient"), addRecord);
router.delete("/records/:id", protect, allowRoles("patient"), deleteRecord);

// Pharmacies
router.get("/pharmacies", protect, allowRoles("patient"), getAllPharmacies);
router.get("/pharmacies/:id/stock", protect, allowRoles("patient"), getPharmacyStock);
router.post("/prescriptions/assign-pharmacy", protect, allowRoles("patient"), assignToPharmacy);

// Future patient specific routes (records, etc.) will go here

module.exports = router;
