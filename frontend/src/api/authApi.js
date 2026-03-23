import API from "./axios";

const persistAuth = (res) => {
  if (!res?.accessToken) return res;

  localStorage.setItem("token", res.accessToken);
  localStorage.setItem("refreshToken", res.refreshToken || "");
  localStorage.setItem("role", res.user?.role || "");
  localStorage.setItem("user", JSON.stringify(res.user || null));

  return res;
};

export const registerUser = async (payload) => {
  return await API.post("/users/register", payload);
};

export const sendOtp = async (email) => {
  return await API.post("/users/send-otp", { email });
};

export const verifyOtp = async ({ email, otp }) => {
  const res = await API.post("/users/verify-otp", { email, otp });
  return persistAuth(res);
};

export const loginUser = async ({ email, password }) => {
  const res = await API.post("/users/login", { email, password });
  return persistAuth(res);
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  localStorage.removeItem("pendingVerification");
};
