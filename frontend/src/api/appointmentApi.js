import API from "./axios";

export const getDoctorsBySpecialization = (specialization) =>
  API.get(`/appointments/doctors/${encodeURIComponent(specialization)}`);

export const getAllDoctors = () =>
  API.get("/appointments/doctors");

export const getDoctorSlots = (doctorId, date) =>
  API.get("/appointments/slots", { params: { doctorId, date } });

export const bookAppointment = (payload) =>
  API.post("/appointments/book", payload);

export const getMyAppointments = () =>
  API.get("/appointments/my");

export const getDoctorAppointments = () =>
  API.get("/appointments/doctor");
