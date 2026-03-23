import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Link,
  InputAdornment,
  IconButton,
  Paper,
  Alert
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { loginUser } from "../../api/authApi.js";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function Login() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      clearErrors();

      const res = await loginUser({
        email: data.email?.trim(),
        password: data.password
      });

      if (["doctor", "pharmacist"].includes(res.user.role) && !res.user.is_approved) {
        navigate("/pending-approval");
        return;
      }

      if (res.user.role === "patient") navigate("/patient");
      if (res.user.role === "doctor") navigate("/doctor");
      if (res.user.role === "pharmacist") navigate("/pharmacy");
      if (res.user.role === "admin") navigate("/admin");
    } catch (err) {
      if (err.status === 403 && /verify your email/i.test(err.message || "")) {
        const pendingEmail = err.verification_email || data.email?.trim();
        if (!pendingEmail) {
          console.error("Email verification required", err);
          return;
        }
        localStorage.setItem(
          "pendingVerification",
          JSON.stringify({
            type: "email-otp",
            email: pendingEmail
          })
        );
        setError("email", { type: "server", message: err.message || "Please verify your email first" });
        navigate("/verify");
        return;
      }

      const message = err.message || "Login failed";
      if (/email/i.test(message)) {
        setError("email", { type: "server", message });
      } else if (/password|credentials/i.test(message)) {
        setError("password", { type: "server", message });
      } else {
        setError("root.serverError", { type: "server", message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Paper elevation={6} sx={{ p: 4, width: "100%", borderRadius: 2 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom color="primary" fontWeight="bold">
            Seva TeleHealth
          </Typography>
          <Typography component="h2" variant="h5" align="center" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <Alert severity="info" sx={{ mt: 1 }}>
              Register first, verify OTP, then complete your profile. Doctors and pharmacies will remain hidden until admin approval.
            </Alert>

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((value) => !value)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5, fontSize: "1rem" }} disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            {errors.root?.serverError && (
              <Typography color="error" variant="body2" sx={{ mt: -1, mb: 2 }}>
                {errors.root.serverError.message}
              </Typography>
            )}

            <Box display="flex" justifyContent="center">
              <Link component={RouterLink} to="/register" variant="body2">
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
