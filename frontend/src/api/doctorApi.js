import API from "./axios";

export const fetchDoctorDashboard = () => API.get("/doctor/dashboard");
export const fetchDoctorProfile = () => API.get("/doctor/profile");
export const updateDoctorProfile = (data) => API.put("/doctor/profile", data);
export const fetchDoctorPatients = () => API.get("/doctor/patients");
export const updateAppointmentStatus = (id, status) =>
  API.patch(`/doctor/appointments/${id}/status`, { status });
export const generatePrescription = (data) =>
  API.post("/doctor/prescriptions/generate", data);
export const fetchPatientHistory = (id) =>
  API.get(`/doctor/patients/${id}/history`);
export const rescheduleAppointment = (id, newDate, newTime) =>
  API.patch(`/doctor/appointments/${id}/reschedule`, { newDate, newTime });
