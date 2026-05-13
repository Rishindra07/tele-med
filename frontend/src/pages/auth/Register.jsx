import { useState, useEffect, useRef } from "react";
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
  Stack,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  alpha,
  Fade,
  Avatar
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  CloudUpload, 
  CheckCircle,
  LocalHospital,
  LocalPharmacy as PharmacyIcon,
  Person,
  LocationOn,
  Security,
  AssignmentInd,
  AppRegistration,
  ArrowForward,
  HealthAndSafety
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { registerUser } from "../../api/authApi.js";
import { updateDoctorProfile } from "../../api/doctorApi.js";
import { updatePharmacyProfile } from "../../api/pharmacyApi.js";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";
import API from "../../api/axios";

// Modern Blue/Slate Palette
const PRIMARY_BLUE = "#2563EB";
const ACCENT_TEAL = "#10B981";

const routeForRole = (role) => {
  if (role === "doctor") return "/doctor";
  if (role === "pharmacist") return "/pharmacy";
  if (role === "admin") return "/admin";
  return "/patient";
};

const steps = ["Account Setup", "Email OTP", "Verification"];

export default function Register() {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      role: 'patient'
    }
  });

  const navigate = useNavigate();
  const locationState = useLocation().state;
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  
  const [uploads, setUploads] = useState({});
  const [uploading, setUploading] = useState({});
  const [location, setLocation] = useState(null);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          type: 'Point',
          coordinates: [position.coords.longitude, position.coords.latitude]
        });
        setLocationCaptured(true);
      });
    }
  };

  const otpSentRef = useRef(false);
  useEffect(() => {
    if (locationState?.email && !otpSentRef.current) {
      otpSentRef.current = true;
      setValue("email", locationState.email);
      setValue("role", locationState.role || 'patient');
      setActiveStep(1);
      
      // Auto-send OTP when jumping from login
      API.post("/auth/send-otp", { email: locationState.email }).catch(err => console.error("Auto-send OTP failed", err));
    }
  }, [locationState, setValue]);

  const role = watch("role");
  const passwordValue = watch("password") || "";

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading({ ...uploading, [field]: true });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res?.success) {
        setUploads({ ...uploads, [field]: res.fileUrl });
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading({ ...uploading, [field]: false });
    }
  };

  const onSubmit = async (data) => {
    if (activeStep === 0) {
      await handleStepOne(data);
    } else if (activeStep === 1) {
      await handleOtpVerification(data);
    } else {
      await handleStepTwo(data);
    }
  };

  const handleStepOne = async (data) => {
    try {
      setLoading(true);
      clearErrors();

      const payload = {
        full_name: data.name?.trim() || "",
        email: data.email?.trim() || "",
        phone: data.phone?.trim() || "",
        password: data.password,
        role: data.role || 'patient',
        specialization: data.specialization || "",
        medicalLicense: data.medicalLicense || "",
        pharmacyName: data.pharmacyName || "",
        ownerName: data.ownerName || data.name || "",
        licenseNumber: data.licenseNumber || ""
      };

      const response = await registerUser(payload);
      setRegisteredUser(response.user);

      if (response.needsVerification) {
        setActiveStep(1);
      } else if (["doctor", "pharmacist"].includes(data.role) && !response.user?.is_approved) {
        setActiveStep(2);
      } else {
        navigate(routeForRole(response.user.role));
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Registration failed";
      setError("root.serverError", { type: "server", message });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (data) => {
    try {
      setLoading(true);
      setOtpError("");
      
      console.log("[OTP_FRONTEND] Verifying:", data.email, "with OTP:", otpValue);

      const response = await API.post("/auth/verify-otp", {
        email: data.email?.trim() || getValues("email")?.trim(),
        otp: otpValue
      });

      if (response && response.success) {
        if (["doctor", "pharmacist"].includes(data.role)) {
          setActiveStep(2);
        } else {
          navigate(routeForRole(data.role));
        }
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStepTwo = async (data) => {
    try {
      setLoading(true);
      if (role === 'doctor') {
        const payload = {
          degreeCertificate: uploads.degreeCertificate,
          registrationCertificate: uploads.registrationCertificate,
          idProof: uploads.idProof,
          profileImage: uploads.profileImage,
          hospitalName: data.hospitalName,
          experience: data.experience,
        };
        await updateDoctorProfile(payload);
      } else if (role === 'pharmacist') {
        const payload = {
          licenseCertificate: uploads.licenseCertificate,
          pharmacistRegNumber: data.pharmacistRegNumber,
          pharmacistCertificate: uploads.pharmacistCertificate,
          gstin: data.gstin,
          address: data.address,
          location: location,
          shopPhoto: uploads.shopPhoto
        };
        await updatePharmacyProfile(payload);
      }
      navigate("/pending-approval");
    } catch (err) {
      setError("root.serverError", { type: "server", message: "Failed to save verification details" });
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <Stack spacing={3.5} sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ 
        p: 2.5, 
        bgcolor: alpha(PRIMARY_BLUE, 0.04), 
        borderRadius: 2, 
        border: `1px solid ${alpha(PRIMARY_BLUE, 0.08)}`,
        boxShadow: `0 4px 12px ${alpha(PRIMARY_BLUE, 0.03)}`
      }}>
        <Typography variant="subtitle2" fontWeight={800} color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: 0.5 }}>
          <AppRegistration fontSize="small" /> CATEGORY SELECTION
        </Typography>
        <TextField
          select
          fullWidth
          label="Identify yourself as"
          value={role || 'patient'}
          {...register("role", { required: "Role is required" })}
          error={!!errors.role}
          helperText={errors.role?.message}
          sx={{ 
              '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' }
          }}
        >
          <MenuItem value="patient">Patient</MenuItem>
          <MenuItem value="doctor">Medical Specialist</MenuItem>
          <MenuItem value="pharmacist">Authorized Pharmacy</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ 
        p: 2.5, 
        bgcolor: alpha(PRIMARY_BLUE, 0.04), 
        borderRadius: 2, 
        border: `1px solid ${alpha(PRIMARY_BLUE, 0.08)}`,
        boxShadow: `0 4px 12px ${alpha(PRIMARY_BLUE, 0.03)}`
      }}>
        <Typography variant="subtitle2" fontWeight={800} color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: 0.5 }}>
          <Person fontSize="small" /> PERSONAL IDENTITY
        </Typography>
        <Stack spacing={2.5}>
          <TextField
            required
            fullWidth
            label="Full Legal Name"
            placeholder="John Doe"
            {...register("name", { required: "Full Name is required" })}
            error={!!errors.name}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
          />
          <TextField
            required
            fullWidth
            label="Phone Contact"
            placeholder="+91..."
            {...register("phone", { 
                required: "Phone is required",
                pattern: { value: /^\+91[6-9]\d{9}$/, message: "Valid mobile number required" }
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
          />
          <TextField
            required
            fullWidth
            label="Email Address"
            placeholder="name@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" }
            })}
            error={!!errors.email}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
          />
        </Stack>
      </Box>

      {(role === 'doctor' || role === 'pharmacist') && (
        <Fade in={true}>
          <Box 
              sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: role === 'doctor' ? alpha(ACCENT_TEAL, 0.05) : alpha('#F59E0B', 0.05),
                  border: '1px solid',
                  borderColor: role === 'doctor' ? alpha(ACCENT_TEAL, 0.2) : alpha('#F59E0B', 0.2),
              }}
          >
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, color: role === 'doctor' ? ACCENT_TEAL : '#D97706' }}>
                 {role === 'doctor' ? <AssignmentInd /> : <PharmacyIcon />} CORE PROFESSIONAL DETAILS
              </Typography>
                    <Stack spacing={2}>
                        {role === 'doctor' ? (
                            <>
                                <TextField
                                    required
                                    fullWidth
                                    label="NMC Reg. License"
                                    {...register("medicalLicense", { required: true })}
                                    error={!!errors.medicalLicense}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Primary Speciality"
                                    {...register("specialization", { required: true })}
                                    error={!!errors.specialization}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
                                />
                            </>
                        ) : (
                            <>
                                <TextField
                                    required
                                    fullWidth
                                    label="Official Pharmacy Name"
                                    {...register("pharmacyName", { required: true })}
                                    error={!!errors.pharmacyName}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Drug License Number"
                                    {...register("licenseNumber", { required: true })}
                                    error={!!errors.licenseNumber}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
                                />
                            </>
                        )}
                    </Stack>
          </Box>
        </Fade>
      )}

      <Box sx={{ 
        p: 2.5, 
        bgcolor: alpha(PRIMARY_BLUE, 0.04), 
        borderRadius: 2, 
        border: `1px solid ${alpha(PRIMARY_BLUE, 0.08)}`,
        boxShadow: `0 4px 12px ${alpha(PRIMARY_BLUE, 0.03)}`
      }}>
        <Typography variant="subtitle2" fontWeight={800} color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: 0.5 }}>
          <Security fontSize="small" /> SECURITY ACCESS
        </Typography>
        <Stack spacing={2.5}>
          <Box>
            <TextField
              required
              fullWidth
              label="Secure Password"
              type={showPassword ? "text" : "password"}
              {...register("password", { 
                required: "Password is required", 
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/,
                  message: "Password must be min 6 chars, 1 cap letter, 1 number, 1 special char"
                }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
            />
            <Box sx={{ px: 1, mt: 1.5 }}>
              {(() => {
                const reqs = [
                  { label: "Min 6 chars", met: passwordValue.length >= 6 },
                  { label: "1 Capital letter", met: /[A-Z]/.test(passwordValue) },
                  { label: "1 Number", met: /\d/.test(passwordValue) },
                  { label: "1 Special char", met: /[^a-zA-Z0-9]/.test(passwordValue) }
                ];
                const score = reqs.filter(r => r.met).length;
                const strengthColor = score === 0 ? '#e2e8f0' : score === 1 ? '#ef4444' : score === 2 ? '#f59e0b' : score === 3 ? '#3b82f6' : '#10b981';
                const strengthLabel = score === 0 ? '' : score === 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';

                return (
                  <Stack spacing={1.5}>
                    {passwordValue.length > 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75, alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                            Password Strength
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: strengthColor, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                            {strengthLabel}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, height: 4 }}>
                          {[1, 2, 3, 4].map((level) => (
                            <Box 
                              key={level} 
                              sx={{ 
                                flex: 1, 
                                bgcolor: level <= score ? strengthColor : alpha('#cbd5e1', 0.3), 
                                borderRadius: 4,
                                transition: 'all 0.3s ease-in-out'
                              }} 
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    <Grid container spacing={1}>
                      {reqs.map((req, idx) => (
                        <Grid item xs={6} key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {req.met ? (
                            <CheckCircle color="success" sx={{ fontSize: 16 }} />
                          ) : (
                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #cbd5e1', boxSizing: 'border-box' }} />
                          )}
                          <Typography variant="caption" color={req.met ? "success.main" : "text.secondary"} sx={{ fontWeight: req.met ? 700 : 500, fontSize: '0.7rem' }}>
                            {req.label}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                );
              })()}
            </Box>
          </Box>
          <TextField
            required
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword", {
              validate: (v) => v === getValues("password") || "Passwords do not match"
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
          />
        </Stack>
      </Box>
    </Stack>
  );

  const renderStepTwo = () => (
    <Stack spacing={4} sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ p: 2, bgcolor: alpha(PRIMARY_BLUE, 0.05), borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Security color="primary" />
        <Typography variant="body2" fontWeight={600} color="primary.dark">
          Verification Required: Documents must be clear and legible for manual review.
        </Typography>
      </Box>

      {role === 'doctor' && (
        <Grid container spacing={3}>
           <Grid item xs={12}>
             <Typography variant="h6" fontWeight="800" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
               Expert Credentials
             </Typography>
             <Divider sx={{ mb: 2 }} />
           </Grid>
           <Grid item xs={12}>
              <UploadButton 
                label="Medical Degree" 
                field="degreeCertificate" 
                onUpload={handleFileUpload} 
                url={uploads.degreeCertificate} 
                uploading={uploading.degreeCertificate}
              />
           </Grid>
           <Grid item xs={12}>
              <UploadButton 
                label="Registration Certificate" 
                field="registrationCertificate" 
                onUpload={handleFileUpload} 
                url={uploads.registrationCertificate} 
                uploading={uploading.registrationCertificate}
              />
           </Grid>
           <Grid item xs={12}>
              <UploadButton 
                label="Govt ID Proof (Passport/Aadhar)" 
                field="idProof" 
                onUpload={handleFileUpload} 
                url={uploads.idProof} 
                uploading={uploading.idProof}
              />
           </Grid>
           <Grid item xs={12}>
              <TextField 
                required fullWidth label="Current Affiliation (Hospital/Clinic)" 
                {...register("hospitalName", { required: true })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
           </Grid>
           <Grid item xs={12}>
              <TextField 
                required fullWidth label="Total Experience (Years)" type="number"
                {...register("experience", { required: true })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
           </Grid>
           <Grid item xs={12}>
              <UploadButton 
                label="Professional Profile Image" 
                field="profileImage" 
                onUpload={handleFileUpload} 
                url={uploads.profileImage} 
                uploading={uploading.profileImage}
              />
           </Grid>
        </Grid>
      )}

      {role === 'pharmacist' && (
        <Grid container spacing={3}>
           <Grid item xs={12}>
             <Typography variant="h6" fontWeight="800" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
               Establishment Verification
             </Typography>
             <Divider sx={{ mb: 2 }} />
           </Grid>
           <Grid item xs={12}>
              <UploadButton 
                label="Drug License Certificate (Form 20/21)" 
                field="licenseCertificate" 
                onUpload={handleFileUpload} 
                url={uploads.licenseCertificate} 
                uploading={uploading.licenseCertificate}
              />
           </Grid>
           <Grid item xs={12}>
              <TextField 
                required fullWidth label="Registered Pharmacist No." 
                {...register("pharmacistRegNumber", { required: true })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
           </Grid>
           <Grid item xs={12}>
              <UploadButton 
                label="Pharmacist Certificate" 
                field="pharmacistCertificate" 
                onUpload={handleFileUpload} 
                url={uploads.pharmacistCertificate} 
                uploading={uploading.pharmacistCertificate}
              />
           </Grid>
           <Grid item xs={12}>
              <TextField fullWidth label="GST Registration Number" {...register("gstin")} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
           </Grid>
           <Grid item xs={12}>
              <TextField multiline rows={3} fullWidth label="Shop Physical Address" {...register("address")} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
           </Grid>
           <Grid item xs={12}>
              <Button 
                fullWidth
                variant="outlined" 
                startIcon={<LocationOn />} 
                onClick={captureLocation}
                sx={{ py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 600, borderStyle: 'dashed' }}
                color={locationCaptured ? "success" : "primary"}
              >
                {locationCaptured ? "GPS Coordinates Locked ✓" : "Capture Store Geo-Location"}
              </Button>
           </Grid>
           <Grid item xs={12}>
              <UploadButton 
                label="Shop Storefront Photo" 
                field="shopPhoto" 
                onUpload={handleFileUpload} 
                url={uploads.shopPhoto} 
                uploading={uploading.shopPhoto}
              />
           </Grid>
        </Grid>
      )}

      <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px solid #e2e8f0' }}>
         <Typography variant="caption" color="text.secondary" fontWeight={600}>
           FINAL STEP: Your credentials will be verified by our compliance team within 24-48 hours.
         </Typography>
      </Box>
    </Stack>
  );

  const renderOtpStep = () => (
    <Stack spacing={4} sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ p: 3, bgcolor: alpha(PRIMARY_BLUE, 0.05), borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={800} gutterBottom color="primary">
          Verify Your Email
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We've sent a 6-digit code to <b>{getValues("email")}</b>.
          Please enter it below to continue.
        </Typography>
        
        <TextField
          fullWidth
          label="6-Digit Code"
          variant="outlined"
          value={otpValue}
          onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          error={!!otpError}
          helperText={otpError}
          InputProps={{
            sx: { 
              borderRadius: 3, 
              bgcolor: '#fff',
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.5rem',
              '& input': { textAlign: 'center' }
            }
          }}
        />
        
        <Button 
          sx={{ mt: 2, fontWeight: 700 }}
          variant="text"
          onClick={async () => {
            try {
              await API.post("/auth/send-otp", { email: getValues("email") });
              alert("A new code has been sent to your email.");
            } catch (err) {
              alert("Failed to resend code.");
            }
          }}
        >
          Resend Code
        </Button>
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      bgcolor: "#F1F5F9",
      background: 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, rgba(241, 245, 249, 1) 100%)',
      p: { xs: 2, sm: 4 }
    }}>
      <Container maxWidth={activeStep === 0 ? "sm" : "md"}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: PRIMARY_BLUE, width: 64, height: 64, mb: 1.5, mx: 'auto', boxShadow: `0 8px 16px ${alpha(PRIMARY_BLUE, 0.25)}` }}>
              <HealthAndSafety fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ fontFamily: '"Outfit", sans-serif', letterSpacing: -0.5 }}>
              Seva<span style={{ color: PRIMARY_BLUE }}>TeleHealth</span>
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ 
            p: { xs: 4, sm: 6 }, 
            width: "100%", 
            borderRadius: 2, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${PRIMARY_BLUE}, ${ACCENT_TEAL})` }} />

            <Typography variant="h5" align="center" gutterBottom color="#1E293B" fontWeight={800} sx={{ mb: 3 }}>
              {activeStep === 0 ? "Create Professional Account" : activeStep === 1 ? "Email Verification" : "Identity Verification"}
            </Typography>
            
            {(role === 'doctor' || role === 'pharmacist' || activeStep === 1) && (
              <Stepper activeStep={activeStep} sx={{ mb: 6, gap: 1 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.85rem' } }}>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {activeStep === 0 ? renderStepOne() : activeStep === 1 ? renderOtpStep() : renderStepTwo()}

              <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  color="primary"
                  endIcon={!loading && activeStep === 0 && <ArrowForward />}
                  sx={{ 
                    mt: 5, 
                    mb: 3, 
                    py: 2, 
                    borderRadius: 4, 
                    fontWeight: 800, 
                    fontSize: '1rem', 
                    textTransform: 'none',
                    boxShadow: `0 10px 15px -3px ${alpha(PRIMARY_BLUE, 0.3)}`,
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 12px 20px -3px ${alpha(PRIMARY_BLUE, 0.4)}` }
                  }} 
                  disabled={loading}
              >
                {loading ? <CircularProgress size={26} color="inherit" /> : 
                 activeStep === 0 ? (["doctor", "pharmacist"].includes(role) ? "Next" : "Register Now") : 
                 activeStep === 1 ? "Verify & Continue" :
                 "Complete"}
              </Button>

              {errors.root?.serverError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontWeight: 600 }}>
                  {errors.root.serverError.message}
                </Alert>
              )}

                <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center" sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Already have an account?
                  </Typography>
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 800, 
                      color: PRIMARY_BLUE, 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Login here →
                  </Link>
                </Box>
            </Box>
          </Paper>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
             <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: 2, fontWeight: 700 }}>
                SECURED PORTAL v2.1 • ENCRYPTED DATA
             </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function UploadButton({ label, field, onUpload, url, uploading }) {
  return (
    <Box sx={{ width: '100%' }}>
      <input
        accept="image/*,.pdf"
        id={`upload-${field}`}
        type="file"
        hidden
        onChange={(e) => onUpload(e, field)}
      />
      <label htmlFor={`upload-${field}`}>
        <Button
          fullWidth
          variant="outlined"
          component="span"
          startIcon={uploading ? <CircularProgress size={20} /> : (url ? <CheckCircle /> : <CloudUpload />)}
          sx={{ 
            py: 2, 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            borderStyle: url ? 'solid' : 'dashed',
            bgcolor: url ? alpha('#10B981', 0.04) : 'transparent',
            borderColor: url ? ACCENT_TEAL : '#cbd5e1',
            color: url ? ACCENT_TEAL : '#64748b',
            '&:hover': { borderColor: PRIMARY_BLUE, bgcolor: alpha(PRIMARY_BLUE, 0.04) }
          }}
        >
          {uploading ? "Analyzing File..." : (url ? "Credential Secured" : label)}
        </Button>
      </label>
      {url && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, ml: 1 }}>
              <Typography variant="caption" color="success.main" fontWeight={700}>
                 ✓ Verified Upload
              </Typography>
          </Box>
      )}
    </Box>
  );
}
