import API from "./axios";

export const fetchPharmacyDashboard = async () => API.get("/pharmacy/dashboard");
export const fetchPharmacyProfile = async () => API.get("/pharmacy/profile");
export const updatePharmacyProfile = async (data) => API.put("/pharmacy/profile", data);

export const fetchPharmacyPrescriptions = async (status) =>
  API.get("/pharmacy/prescriptions", { params: status ? { status } : {} });

export const checkPrescriptionAvailability = async (id) =>
  API.get(`/pharmacy/prescriptions/${id}/availability`);

export const fetchAlternativePharmacies = async (id) =>
  API.get(`/pharmacy/prescriptions/${id}/alternatives`);

export const fulfillPrescription = async (id, payload) =>
  API.patch(`/pharmacy/prescriptions/${id}/fulfill`, payload);

export const completePrescriptionPickup = async (id, payload = {}) =>
  API.patch(`/pharmacy/prescriptions/${id}/complete`, payload);

// Inventory
export const fetchInventory = async (search) =>
  API.get("/pharmacy/inventory", { params: search ? { search } : {} });

export const addInventoryItem = async (data) => API.post("/pharmacy/inventory", data);
export const updateInventoryItem = async (id, data) => API.put(`/pharmacy/inventory/${id}`, data);
export const deleteInventoryItem = async (id) => API.delete(`/pharmacy/inventory/${id}`);

// Expiry
export const fetchExpiryAlerts = async () => API.get("/pharmacy/expiry");

