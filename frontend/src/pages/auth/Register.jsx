
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
import { registerUser, sendOtp } from "../../api/authApi.js";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const role = watch("role", "patient"); // Default to patient
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await registerUser(data);
      await sendOtp(data.phone);

      localStorage.setItem("verifyPhone", data.phone);
      navigate("/verify");
    } catch (err) {
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: { xs: 4, sm: 8 },
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={6} sx={{ p: { xs: 3, sm: 6 }, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom color="primary" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            Join Seva TeleHealth
          </Typography>
          <Typography component="h2" variant="h6" align="center" sx={{ mb: 3 }}>
            Create your account
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              {/* Common Fields */}
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
                label="Phone Number"
                {...register("phone", {
                  required: "Phone Number is required",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Must be exactly 10 digits"
                  }
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
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
              </TextField>

              {/* Patient Fields */}
              {role === "patient" && (
                <TextField
                  fullWidth
                  label="Location/City"
                  {...register("location", { required: "Location is required for patients" })}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                />
              )}

              {/* Doctor Fields */}
              {role === "doctor" && (
                <>
                  <TextField
                    fullWidth
                    label="Specialization"
                    {...register("specialization", { required: "Specialization is required" })}
                    error={!!errors.specialization}
                    helperText={errors.specialization?.message}
                  />
                  <TextField
                    fullWidth
                    label="Qualification"
                    {...register("qualification", { required: "Qualification is required" })}
                    error={!!errors.qualification}
                    helperText={errors.qualification?.message}
                  />
                  <TextField
                    fullWidth
                    label="Experience (years)"
                    type="number"
                    {...register("experience", {
                      required: "Experience is required",
                      min: {
                        value: 0,
                        message: "Experience cannot be negative"
                      }
                    })}
                    error={!!errors.experience}
                    helperText={errors.experience?.message}
                  />
                  <TextField
                    fullWidth
                    label="Medical License Number"
                    {...register("medicalLicense", { required: "License Number is required" })}
                    error={!!errors.medicalLicense}
                    helperText={errors.medicalLicense?.message}
                  />
                  <TextField
                    fullWidth
                    label="Hospital / Clinic Name"
                    {...register("hospitalName", { required: "Hospital or clinic name is required" })}
                    error={!!errors.hospitalName}
                    helperText={errors.hospitalName?.message}
                  />
                  <TextField
                    fullWidth
                    label="Consultation Fee"
                    type="number"
                    {...register("consultationFee", {
                      min: {
                        value: 0,
                        message: "Consultation fee cannot be negative"
                      }
                    })}
                    error={!!errors.consultationFee}
                    helperText={errors.consultationFee?.message}
                  />
                  <TextField
                    fullWidth
                    label="Professional Bio"
                    multiline
                    minRows={3}
                    {...register("bio")}
                    error={!!errors.bio}
                    helperText={errors.bio?.message}
                  />
                </>
              )}

              {/* Pharmacy Fields */}
              {role === "pharmacist" && (
                <>
                  <TextField
                    fullWidth
                    label="Pharmacy Name"
                    {...register("pharmacyName", { required: "Pharmacy Name is required" })}
                    error={!!errors.pharmacyName}
                    helperText={errors.pharmacyName?.message}
                  />
                  <TextField
                    fullWidth
                    label="License Number"
                    {...register("licenseNumber", { required: "License Number is required" })}
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber?.message}
                  />
                  <TextField
                    fullWidth
                    label="Location"
                    {...register("location", { required: "Location is required" })}
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
                </>
              )}

              <TextField
                required
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
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
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>

            <Box display="flex" justifyContent="center">
              <Link component={RouterLink} to="/login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
