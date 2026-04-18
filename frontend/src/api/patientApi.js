import API from './axios';

// Patient Profile & Settings
export const fetchPatientProfile = async () => {
  return await API.get('patient/profile');
};

export const updatePatientProfile = async (data) => {
  return await API.put('patient/profile', data);
};

export const updatePatientSettings = async (settings) => {
  return await API.put('patient/settings', { settings });
};

export const deactivateAccount = async () => {
  return await API.post('users/deactivate');
};

export const deleteMedicalData = async () => {
  return await API.delete('users/medical-data');
};

export const permanentDeleteAccount = async () => {
  return await API.delete('users');
};

// Appointments
export const fetchMyAppointments = async () => {
  return await API.get('appointments/my');
};

export const bookAppointment = async (bookingData) => {
  return await API.post('appointments/book', bookingData);
};

export const cancelAppointment = async (id) => {
  return await API.put(`appointments/cancel/${id}`);
};

export const rescheduleAppointment = async (id, data) => {
  return await API.put(`appointments/${id}/reschedule`, data);
};

export const fetchDoctors = async () => {
  return await API.get('appointments/doctors');
};

export const fetchDoctorSlots = async (doctorId, date) => {
  return await API.get('appointments/slots', { params: { doctorId, date } });
};

// Health Records
export const fetchMyRecords = async () => {
  return await API.get('patient/records');
};

export const addMedicalRecord = async (recordData) => {
  return await API.post('patient/records', recordData);
};

export const deleteMedicalRecord = async (id) => {
  return await API.delete(`patient/records/${id}`);
};

// Symptom Checker
export const checkSymptomsAI = async (symptoms) => {
  return await API.post('symptoms/check', { symptoms });
};

export const fetchSymptomLogs = async () => {
  return await API.get('symptoms/logs');
};

export const fetchMyOrders = async () => {
  return await API.get('patient/prescriptions/orders');
};

export const cancelMyOrder = async (orderId) => {
  return await API.delete(`patient/prescriptions/orders/${orderId}`);
};

export const fetchPharmacies = async (params = {}) => {
  return await API.get('patient/pharmacies', { params });
};

export const fetchPharmacyStock = async (id) => {
  return await API.get(`patient/pharmacies/${id}/stock`);
};

export const assignPrescriptionToPharmacy = async (data) => {
  return await API.post('patient/prescriptions/assign-pharmacy', data);
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await API.post('upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const extractPrescriptionMedicines = async (file) => {
  const formData = new FormData();
  formData.append('prescription', file);
  return await API.post('patient/prescriptions/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const createAdvancedPrescriptionOrder = async (orderData) => {
  return await API.post('patient/prescriptions/order', orderData);
};

// Payment APIs
export const createRazorpayOrder = async (paymentData) => {
  return await API.post('payments/order', paymentData);
};

export const verifyRazorpayPayment = async (verificationData) => {
  return await API.post('payments/verify', verificationData);
};

export const fetchMyPayments = async () => {
  return await API.get('payments/my');
};

export const cancelPayment = async (paymentId) => {
  return await API.post(`payments/cancel/${paymentId}`);
};

export const checkPharmacyStock = async (stockData) => {
  return await API.post('pharmacy/check-stock', stockData);
};

// Notifications
export const fetchMyNotifications = async () => {
  return await API.get('notifications/my');
};

export const markNotificationRead = async (id) => {
  return await API.patch(`notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  return await API.patch('notifications/read-all');
};
