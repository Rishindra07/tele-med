const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware.js");
const { allowRoles } = require("../middleware/roleMiddleware.js");
const {
  getPharmacyDashboard,
  getPharmacyProfile,
} = require("../controllers/pharmacyDashboardController.js");
const {
  updateDeliverySettings,
  getIncomingOrders,
  updateOrderStatus
} = require("../controllers/pharmacyController.js");
const {
  checkPrescriptionAvailability,
  completePrescriptionPickup,
  fulfillPrescription,
  getAlternativePharmacies,
  getFulfillmentQueue
} = require("../controllers/pharmacyFulfillmentController.js");
const {
  getSalesDashboard,
  createBill,
  searchPatients
} = require("../controllers/pharmacySalesController.js");
const {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getExpiryAlerts,
  updatePharmacyProfile
} = require("../controllers/pharmacyInventoryController.js");
const {
  getSuppliers,
  addSupplier,
  getSupplyOrders,
  createSupplyOrder,
  updateSupplyOrder,
  getReorderSuggestions
} = require("../controllers/pharmacySupplierController.js");

const ph = protect, role = allowRoles("pharmacist");

// Sales & Dashboard
router.get("/dashboard", ph, role, getPharmacyDashboard);
router.get("/sales-dashboard", ph, role, getSalesDashboard); // Changed to use ph, role for consistency
router.get("/profile", ph, role, getPharmacyProfile);
router.put("/profile", ph, role, updatePharmacyProfile);

// Billing
router.post("/bills", ph, role, createBill);
router.get("/search-patients", ph, role, searchPatients);

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
router.get("/suppliers", ph, role, getSuppliers);
router.post("/suppliers", ph, role, addSupplier);
router.get("/supply-orders", ph, role, getSupplyOrders);
router.get("/suppliers/suggestions", ph, role, getReorderSuggestions);
router.post("/supply-orders", ph, role, createSupplyOrder);
router.put("/supply-orders/:id", ph, role, updateSupplyOrder);

// Delivery & Orders
router.put("/delivery-settings", ph, role, updateDeliverySettings);
router.get("/orders", ph, role, getIncomingOrders);
router.put("/orders/status", ph, role, updateOrderStatus);

module.exports = router;

