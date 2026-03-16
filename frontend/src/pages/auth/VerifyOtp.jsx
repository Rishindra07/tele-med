import { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { verifyOtp } from "../../api/authApi.js";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const phone = localStorage.getItem("verifyPhone");

  const handleVerify = async () => {
    try {
      await verifyOtp({ phone, otp });
      alert("Verified Successfully");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={10} p={4} boxShadow={3} borderRadius={3} textAlign="center">
        <Typography variant="h6" mb={2}>
          Enter OTP sent to {phone}
        </Typography>

        <TextField
          fullWidth
          label="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleVerify}>
          Verify
        </Button>
      </Box>
    </Container>
  );
}
