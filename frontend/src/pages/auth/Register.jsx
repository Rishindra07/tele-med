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
import { useNavigate, Link as RouterLink } from "react-router-dom";
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

const steps = ["Account Setup", "Verification"];

export default function Register() {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      role: 'patient'
    }
  });

  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  
  const [uploads, setUploads] = useState({});
  const [uploading, setUploading] = useState({});
  const [location, setLocation] = useState(null);
  const [locationCaptured, setLocationCaptured] = useState(false);

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

  const role = watch("role");

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
      if (res.data?.success) {
        setUploads({ ...uploads, [field]: res.data.fileUrl });
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

      if (["doctor", "pharmacist"].includes(data.role)) {
        setActiveStep(1);
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
          <TextField
            required
            fullWidth
            label="Secure Password"
            type={showPassword ? "text" : "password"}
            {...register("password", { required: "Password is required", minLength: 6 })}
            error={!!errors.password}
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
          <TextField
            required
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword", {
              validate: (v) => v === getValues("password") || "Passwords do not match"
            })}
            error={!!errors.confirmPassword}
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
              {activeStep === 0 ? "Create Professional Account" : "Identity Verification"}
            </Typography>
            
            {(role === 'doctor' || role === 'pharmacist') && (
              <Stepper activeStep={activeStep} sx={{ mb: 6, gap: 1 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.85rem' } }}>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {activeStep === 0 ? renderStepOne() : renderStepTwo()}

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
