import API from './axios';

// Patient Profile & Settings
export const fetchPatientProfile = async () => {
  return await API.get('/patient/profile');
};

export const updatePatientProfile = async (data) => {
  return await API.put('/patient/profile', data);
};

export const updatePatientSettings = async (settings) => {
  return await API.put('/patient/settings', { settings });
};

// Appointments
export const fetchMyAppointments = async () => {
  return await API.get('/appointments/my');
};

export const bookAppointment = async (bookingData) => {
  return await API.post('/appointments/book', bookingData);
};

export const cancelAppointment = async (id) => {
  return await API.put(`/appointments/cancel/${id}`);
};

export const fetchDoctors = async () => {
  return await API.get('/appointments/doctors');
};

// Health Records
export const fetchMyRecords = async () => {
  return await API.get('/patient/records');
};

export const addMedicalRecord = async (recordData) => {
  return await API.post('/patient/records', recordData);
};

export const deleteMedicalRecord = async (id) => {
  return await API.delete(`/patient/records/${id}`);
};

// Symptom Checker
export const checkSymptomsAI = async (symptoms) => {
  return await API.post('/symptoms/check', { symptoms });
};

export const fetchSymptomLogs = async () => {
  return await API.get('/symptoms/logs');
};

// Pharmacies
export const fetchPharmacies = async () => {
  return await API.get('/patient/pharmacies');
};
