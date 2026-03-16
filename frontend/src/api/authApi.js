import API from "./axios";

/**
 * Register new user
 */
export const registerUser = async (payload) => {
  return await API.post("/users/register", payload);
};

/**
 * Send OTP to phone
 */
export const sendOtp = async (phone) => {
  return await API.post("/users/send-otp", { phone });
};

/**
 * Verify OTP
 */
export const verifyOtp = async ({ phone, otp }) => {
  return await API.post("/users/verify-otp", { phone, otp });
};

/**
 * Login user
 */
export const loginUser = async ({ phone, password }) => {
  const res = await API.post("/users/login", { phone, password });

  // store auth safely
  if (res?.token) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("role", res.user.role);
    localStorage.setItem("user", JSON.stringify(res.user));
  }

  return res;
};

/**
 * Logout
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
};
