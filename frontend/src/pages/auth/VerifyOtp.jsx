import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { sendOtp, verifyOtp } from "../../api/authApi.js";
import { useNavigate } from "react-router-dom";

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
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const pendingVerification = useMemo(() => readPendingVerification(), []);

  useEffect(() => {
    if (!pendingVerification) {
      navigate("/register");
    }
  }, [navigate, pendingVerification]);

  const handleResendEmailOtp = async () => {
    try {
      setSendingOtp(true);
      await sendOtp(pendingVerification.email);
      alert(`OTP sent to ${pendingVerification.email}`);
    } catch (err) {
      alert(err.message || "Failed to resend OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      const response = await verifyOtp({
        email: pendingVerification.email,
        otp
      });
      localStorage.removeItem("pendingVerification");
      alert(response.message || "Verified successfully");
      if (["doctor", "pharmacist"].includes(response.user.role) && !response.user.is_approved) {
        navigate("/pending-approval");
        return;
      }
      navigate(routeForRole(response.user.role));
    } catch (err) {
      alert(err.message || "Verification failed");
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

          <TextField
            fullWidth
            label="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={handleResendEmailOtp} disabled={sendingOtp}>
            {sendingOtp ? "Sending OTP..." : "Resend Email OTP"}
          </Button>

          <Button fullWidth variant="contained" onClick={handleVerify} disabled={verifying}>
            {verifying ? "Verifying..." : "Verify"}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
