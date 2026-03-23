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
  Alert,
  MenuItem
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { loginUser } from "../../api/authApi.js";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";

const toIndianE164 = (phone) => {
  const digitsOnly = String(phone || "").replace(/\D/g, "");
  if (digitsOnly.length === 10) return `+91${digitsOnly}`;
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) return `+${digitsOnly}`;
  if (String(phone).startsWith("+91") && digitsOnly.length === 12) return `+${digitsOnly}`;
  return phone;
};

export default function Login() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      loginMethod: "phone"
    }
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const loginMethod = watch("loginMethod", "phone");

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const res = await loginUser({
        phone: loginMethod === "phone" ? toIndianE164(data.phone) : undefined,
        email: loginMethod === "email" ? data.email?.trim() : undefined,
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
          alert(err.message || "Please verify your email first");
          return;
        }
        localStorage.setItem(
          "pendingVerification",
          JSON.stringify({
            type: "email-otp",
            email: pendingEmail
          })
        );
        alert(err.message || "Please verify your email first");
        navigate("/verify");
        return;
      }
      alert(err.message || "Login failed");
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
            <TextField select margin="normal" fullWidth label="Login with" {...register("loginMethod")}>
              <MenuItem value="phone">Phone</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </TextField>

            {loginMethod === "phone" ? (
              <TextField
                margin="normal"
                required
                fullWidth
                id="phone"
                label="Phone Number"
                autoComplete="tel"
                autoFocus
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^(\+91)?[6-9]\d{9}$/,
                    message: "Enter a valid Indian mobile number"
                  }
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            ) : (
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
            )}

            {loginMethod === "email" && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Email is the verification method for every role. Doctors and pharmacists can log in here and will see a pending approval screen until approved.
              </Alert>
            )}

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
                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5, fontSize: "1rem" }} disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>

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
