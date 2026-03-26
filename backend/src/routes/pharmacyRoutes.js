const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware.js");
const { allowRoles } = require("../middleware/roleMiddleware.js");
const {
  getPharmacyDashboard,
  getPharmacyProfile
} = require("../controllers/pharmacyDashboardController.js");
const {
  checkPrescriptionAvailability,
  completePrescriptionPickup,
  fulfillPrescription,
  getAlternativePharmacies,
  getFulfillmentQueue
} = require("../controllers/pharmacyFulfillmentController.js");
const {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getExpiryAlerts,
  updatePharmacyProfile
} = require("../controllers/pharmacyInventoryController.js");

const ph = protect, role = allowRoles("pharmacist");

router.get("/dashboard", ph, role, getPharmacyDashboard);
router.get("/profile", ph, role, getPharmacyProfile);
router.put("/profile", ph, role, updatePharmacyProfile);

router.get("/prescriptions", ph, role, getFulfillmentQueue);
router.get("/prescriptions/:id/availability", ph, role, checkPrescriptionAvailability);
router.get("/prescriptions/:id/alternatives", ph, role, getAlternativePharmacies);
router.patch("/prescriptions/:id/fulfill", ph, role, fulfillPrescription);
router.patch("/prescriptions/:id/complete", ph, role, completePrescriptionPickup);

router.get("/inventory", ph, role, getInventory);
router.post("/inventory", ph, role, addInventoryItem);
router.put("/inventory/:id", ph, role, updateInventoryItem);
router.delete("/inventory/:id", ph, role, deleteInventoryItem);

router.get("/expiry", ph, role, getExpiryAlerts);

module.exports = router;

