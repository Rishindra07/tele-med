import API from "./axios";

export const setDoctorAvailability = (date, slots) =>
  API.post("/appointments/slots", { date, slots });
