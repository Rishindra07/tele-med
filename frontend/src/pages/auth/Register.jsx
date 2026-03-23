import { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Container,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Paper,
  Stack
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { registerUser } from "../../api/authApi.js";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm();
  const role = watch("role", "patient");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      clearErrors();

      const payload = {
        full_name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: data.role
      };

      const response = await registerUser(payload);

      localStorage.setItem(
        "pendingVerification",
        JSON.stringify({
          type: "email-otp",
          email: payload.email,
          role,
          full_name: payload.full_name
        })
      );

      navigate("/verify");
    } catch (err) {
      const message = err.message || "Registration failed";

      if (/email already registered/i.test(message) || /email/i.test(message)) {
        setError("email", { type: "server", message });
      } else if (/full name/i.test(message)) {
        setError("name", { type: "server", message });
      } else if (/password/i.test(message)) {
        setError("password", { type: "server", message });
      } else if (/role/i.test(message)) {
        setError("role", { type: "server", message });
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
          marginTop: { xs: 4, sm: 8 },
          marginBottom: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Paper elevation={6} sx={{ p: { xs: 3, sm: 5 }, width: "100%", borderRadius: 2 }}>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            gutterBottom
            color="primary"
            fontWeight="bold"
          >
            Join Seva TeleHealth
          </Typography>
          <Typography component="h2" variant="h6" align="center" sx={{ mb: 3 }}>
            Create your account
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                label="Full Name"
                {...register("name", { required: "Full Name is required" })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              <TextField
                required
                fullWidth
                label="Email Address"
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

              <TextField
                select
                fullWidth
                label="I am a..."
                defaultValue="patient"
                {...register("role", { required: "Role is required" })}
                error={!!errors.role}
                helperText={errors.role?.message}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
                <MenuItem value="pharmacist">Pharmacist</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>

              <TextField
                required
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
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
                      <IconButton onClick={() => setShowPassword((value) => !value)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                required
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) => value === getValues("password") || "Passwords do not match"
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword((value) => !value)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Stack>

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 4, mb: 2, py: 1.5 }} disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
            </Button>

            {errors.root?.serverError && (
              <Typography color="error" variant="body2" sx={{ mt: -1, mb: 2 }}>
                {errors.root.serverError.message}
              </Typography>
            )}

            <Box display="flex" justifyContent="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
