import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
  alpha,
  Avatar,
  CircularProgress,
  Divider
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined, 
  HealthAndSafety,
  ArrowForward,
  EmailOutlined,
  VpnKeyOutlined
} from "@mui/icons-material";
import { loginUser } from "../../api/authApi.js";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import Link from "@mui/material/Link";

const PRIMARY_BLUE = "#2563EB";

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

      localStorage.setItem("token", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.user));

      if (["doctor", "pharmacist"].includes(res.user.role) && !res.user.is_approved) {
        navigate("/pending-approval");
        return;
      }

      if (res.user.role === "patient") navigate("/patient");
      if (res.user.role === "doctor") navigate("/doctor");
      if (res.user.role === "pharmacist") navigate("/pharmacy");
      if (res.user.role === "admin") navigate("/admin");
    } catch (err) {
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
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      bgcolor: "#F1F5F9",
      background: 'radial-gradient(circle at 90% 10%, rgba(37, 99, 235, 0.05) 0%, rgba(241, 245, 249, 1) 100%)',
      p: { xs: 2, sm: 4 },
      justifyContent: 'center'
    }}>
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: PRIMARY_BLUE, width: 56, height: 56, mb: 1.5, mx: 'auto', boxShadow: `0 8px 16px ${alpha(PRIMARY_BLUE, 0.25)}` }}>
              <HealthAndSafety fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ fontFamily: '"Outfit", sans-serif', letterSpacing: -0.5 }}>
              Seva<span style={{ color: PRIMARY_BLUE }}>TeleHealth</span>
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ 
            p: { xs: 5, sm: 7 }, 
            width: "100%", 
            borderRadius: 2, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: PRIMARY_BLUE }} />

            <Typography variant="h5" align="center" gutterBottom color="#1E293B" fontWeight={800} sx={{ mb: 1 }}>
              Secure Login
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
              Access your personalized medical dashboard
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box sx={{ 
                p: 2.5, 
                bgcolor: alpha(PRIMARY_BLUE, 0.04), 
                borderRadius: 2, 
                border: `1px solid ${alpha(PRIMARY_BLUE, 0.08)}`,
                mb: 4
              }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined fontSize="small" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                  {...register("email", {
                    required: "Required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyOutlined fontSize="small" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...register("password", { required: "Required" })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
                />

                <Box sx={{ mt: 1 }}>
                  <Link variant="caption" sx={{ fontWeight: 700, color: PRIMARY_BLUE, cursor: 'pointer' }}>
                     Forgot your password?
                  </Link>
                </Box>
              </Box>

              <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  color="primary"
                  endIcon={!loading && <ArrowForward />}
                  sx={{ 
                    mt: 3, 
                    mb: 4, 
                    py: 1.8, 
                    borderRadius: 3, 
                    fontWeight: 800, 
                    fontSize: '1rem', 
                    textTransform: 'none',
                    boxShadow: `0 10px 15px -3px ${alpha(PRIMARY_BLUE, 0.3)}`,
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 12px 20px -3px ${alpha(PRIMARY_BLUE, 0.4)}` }
                  }} 
                  disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
              </Button>

              {errors.root?.serverError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                  {errors.root.serverError.message}
                </Alert>
              )}

              <Divider sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, px: 2 }}>
                   NEW TO SEVA?
                </Typography>
              </Divider>

              <Box display="flex" justifyContent="center">
                <Button
                  component={RouterLink}
                  to="/register"
                  fullWidth
                  variant="outlined"
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 3, 
                    fontWeight: 700, 
                    textTransform: 'none',
                    borderColor: alpha(PRIMARY_BLUE, 0.3),
                    color: PRIMARY_BLUE
                  }}
                >
                  Create an account
                </Button>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
             <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: 2, fontWeight: 700 }}>
                SECURED NODE • HIPAA COMPLIANT
             </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
