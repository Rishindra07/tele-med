import API from "./axios";

export const getMyNotifications = (limit = 20) =>
  API.get("/notifications/my", { params: { limit } });

export const markNotificationRead = (id) =>
  API.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  API.patch("/notifications/read-all");
