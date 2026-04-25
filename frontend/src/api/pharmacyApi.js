import API from "./axios";

export const fetchPharmacyDashboard = async () => API.get("pharmacy/dashboard");
export const fetchSalesDashboard = (period) => API.get('pharmacy/sales-dashboard', { params: { period } });
export const searchPatients = async (query) => API.get('pharmacy/search-patients', { params: { query } });
export const createBill = async (billData) => API.post('pharmacy/bills', billData);
export const fetchPharmacyProfile = async () => API.get("pharmacy/profile");
export const updatePharmacyProfile = async (data) => API.put("pharmacy/profile", data);

export const fetchPharmacyPrescriptions = async (status) =>
  API.get("pharmacy/prescriptions", { params: status ? { status } : {} });

export const checkPrescriptionAvailability = async (id) =>
  API.get(`pharmacy/prescriptions/${id}/availability`);

export const fetchAlternativePharmacies = async (id) =>
  API.get(`pharmacy/prescriptions/${id}/alternatives`);

export const fulfillPrescription = async (id, payload) =>
  API.patch(`pharmacy/prescriptions/${id}/fulfill`, payload);

export const completePrescriptionPickup = async (id, payload = {}) =>
  API.patch(`pharmacy/prescriptions/${id}/complete`, payload);

// Inventory
export const fetchInventory = async (search) =>
  API.get("pharmacy/inventory", { params: search ? { search } : {} });

export const addInventoryItem = async (data) => API.post("pharmacy/inventory", data);
export const updateInventoryItem = async (id, data) => API.put(`pharmacy/inventory/${id}`, data);
export const deleteInventoryItem = async (id) => API.delete(`pharmacy/inventory/${id}`);

// Expiry
export const fetchExpiryAlerts = async () => API.get("pharmacy/expiry");
export const fetchSuppliers = async () => API.get("pharmacy/suppliers");
export const addSupplier = async (data) => API.post("pharmacy/suppliers", data);
export const fetchSupplyOrders = async () => API.get("pharmacy/supply-orders");
export const createSupplyOrder = async (data) => API.post("pharmacy/supply-orders", data);
export const updateSupplyOrder = async (id, data) => API.put(`pharmacy/supply-orders/${id}`, data);
export const fetchReorderSuggestions = async () => API.get("pharmacy/suppliers/suggestions");

export const updateDeliverySettings = async (data) => API.put("pharmacy/delivery-settings", data);
export const fetchIncomingOrders = async () => API.get("pharmacy/orders");
export const updateOrderStatus = async (data) => API.put("pharmacy/orders/status", data);
export const updatePharmacySettings = (settings) => API.put("users/settings", { settings });
export const changePassword = (data) => API.put("users/change-password", data);
