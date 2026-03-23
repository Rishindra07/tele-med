import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { sendOtp, verifyOtp } from "../../api/authApi.js";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

const readPendingVerification = () => {
  try {
    return JSON.parse(localStorage.getItem("pendingVerification") || "null");
  } catch {
    return null;
  }
};

const routeForRole = (role) => {
  if (role === "doctor") return "/doctor";
  if (role === "pharmacist") return "/pharmacy";
  if (role === "admin") return "/admin";
  return "/patient";
};

export default function VerifyOtp() {
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm({
    defaultValues: {
      otp: ""
    }
  });
  const pendingVerification = useMemo(() => readPendingVerification(), []);

  useEffect(() => {
    if (!pendingVerification) {
      navigate("/register");
    }
  }, [navigate, pendingVerification]);

  const handleResendEmailOtp = async () => {
    try {
      setSendingOtp(true);
      clearErrors("otp");
      await sendOtp(pendingVerification.email);
    } catch (err) {
      setError("otp", { type: "server", message: err.message || "Failed to resend OTP" });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerify = async (data) => {
    try {
      setVerifying(true);
      clearErrors();
      const response = await verifyOtp({
        email: pendingVerification.email,
        otp: data.otp
      });
      localStorage.removeItem("pendingVerification");
      if (["doctor", "pharmacist"].includes(response.user.role) && !response.user.is_approved) {
        navigate("/pending-approval");
        return;
      }
      navigate(routeForRole(response.user.role));
    } catch (err) {
      setError("otp", { type: "server", message: err.message || "Verification failed" });
    } finally {
      setVerifying(false);
    }
  };

  if (!pendingVerification) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Box mt={10}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" mb={1}>
            Verify Your Account
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Enter the email OTP sent to {pendingVerification.email}.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(handleVerify)}>
            <TextField
              fullWidth
              label="OTP"
              {...register("otp", {
                required: "OTP is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "OTP must be 6 digits"
                }
              })}
              error={!!errors.otp}
              helperText={errors.otp?.message}
              sx={{ mb: 2 }}
            />

            <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={handleResendEmailOtp} disabled={sendingOtp}>
              {sendingOtp ? "Sending OTP..." : "Resend Email OTP"}
            </Button>

            <Button type="submit" fullWidth variant="contained" disabled={verifying}>
              {verifying ? "Verifying..." : "Verify"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
