import API from "./axios";

export const fetchAdminAnalytics = async () => {
  return API.get("admin/analytics");
};

export const fetchPendingApprovals = async () => {
  return API.get("admin/approvals/pending");
};

export const fetchDoctorsDirectory = async () => {
  return API.get("admin/doctors");
};

export const fetchPatientsRegistry = async () => {
  return API.get("admin/patients");
};

export const fetchConsultationMonitor = async () => {
  return API.get("admin/consultations");
};

export const fetchRecordsOverview = async () => {
  return API.get("admin/records");
};

export const fetchFinancialOverview = async () => {
  return API.get("admin/financials");
};

export const fetchPharmaciesDirectory = async () => {
  return API.get("admin/pharmacies");
};

export const approvePendingUser = async (id) => {
  return API.patch(`admin/approvals/${id}/approve`);
};

export const fetchComplaints = async () => {
  return API.get("admin/complaints");
};

export const createComplaint = async (payload) => {
  return API.post("admin/complaints", payload);
};

export const resolveComplaint = async (id, resolutionNotes) => {
  return API.patch(`admin/complaints/${id}/resolve`, { resolutionNotes });
};

export const fetchSystemLogs = async (params = {}) => {
  return API.get("admin/logs", { params });
};

export const exportAdminReport = async (type = "overview") => {
  return API.get("admin/reports/export", { params: { type } });
};

export const fetchAdminSettings = () => API.get("admin/settings");

export const updateAdminSettings = (settings) => API.put("admin/settings", { settings });
export const changePassword = (data) => API.post("users/change-password", data);
