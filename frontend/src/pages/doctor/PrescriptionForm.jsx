import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Autocomplete, Chip, 
  Divider, IconButton, Snackbar, Alert, Card, CardContent, 
  ToggleButtonGroup, ToggleButton, Stack, Tooltip, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  Avatar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Print as PrintIcon, 
  WbSunny as SunIcon, 
  NightsStay as MoonIcon,
  LightMode as AfternoonIcon,
  Translate as TranslateIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Visibility as PreviewIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  VolumeUp as VolumeIcon,
  History as HistoryIcon,
  ChevronLeft as BackIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_PRESCRIPTION_TRANSLATIONS } from '../../utils/translations/doctor';
import { generatePrescription } from '../../api/doctorApi';

const MEDICINE_OPTIONS = [
  'Paracetamol 500mg', 'Amoxicillin 250mg', 'Cetirizine 10mg', 'Ibuprofen 400mg', 
  'Azithromycin 500mg', 'Vitamin C', 'Metformin 500mg', 'Amlodipine 5mg', 
  'Omeprazole 20mg', 'Atorvastatin 10mg', 'Losartan 50mg', 'Metoprolol 25mg'
];

const LAB_TEST_OPTIONS = [
  'Complete Blood Count (CBC)', 'Blood Sugar (Fasting/PP)', 'Lipid Profile', 
  'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Thyroid Profile (T3, T4, TSH)',
  'Urine Routine & Microscopy', 'Chest X-Ray', 'ECG', 'Ultrasound Abdomen'
];

const c = {
  bg: '#f8f9fa',
  paper: '#ffffff',
  line: '#e0e0e0',
  soft: '#f0f0f0',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#1557b0',
  success: '#1e8e3e',
  successSoft: '#e6f4ea',
  warning: '#f9ab00',
  warningSoft: '#fef7e0',
  danger: '#d93025',
  dangerSoft: '#fce8e6'
};

const premiumTextFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#fff',
    borderRadius: 2,
    transition: '0.2s',
    '& fieldset': { borderColor: c.line },
    '&:hover fieldset': { borderColor: c.muted },
    '&.Mui-focused fieldset': { borderColor: c.primary },
    '&.Mui-focused': { boxShadow: `0 0 0 4px ${c.primary}15` }
  },
  '& .MuiInputLabel-root': { color: c.muted, fontSize: 13.5 },
  '& .MuiInputLabel-root.Mui-focused': { color: c.primary },
  '& .MuiOutlinedInput-input::placeholder': { color: c.muted, opacity: 0.6 },
  '& .MuiSelect-icon': { color: c.muted },
  '& .MuiAutocomplete-popupIndicator': { color: c.muted },
  '& .MuiAutocomplete-clearIndicator': { color: c.muted },
};

export default function PrescriptionForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = location.state?.appointment;
  const { language } = useLanguage();

  const t = DOCTOR_PRESCRIPTION_TRANSLATIONS[language] || DOCTOR_PRESCRIPTION_TRANSLATIONS['en'];

  // States
  const [patientInfo, setPatientInfo] = useState({
    name: appointment?.patientName || (appointment?.patient?.full_name) || 'Unknown Patient',
    age: appointment?.patient?.age || 'N/A',
    gender: appointment?.patient?.gender || 'N/A',
    id: appointment?.patient?.patientId || appointment?.patient?._id?.slice(-6) || 'P-XXXX',
    phone: appointment?.patient?.phone || '',
    diagnosis: '',
    allergies: appointment?.patient?.allergies || 'None reported',
  });

  const [medicines, setMedicines] = useState([
    {
      id: Date.now(),
      name: '',
      dosage: '',
      form: 'Tablet',
      frequency: 'Daily',
      timing: { morning: true, afternoon: false, night: true },
      food: 'After Food',
      duration: '5',
    }
  ]);

  const [notes, setNotes] = useState('');
  const [labTests, setLabTests] = useState([]);
  const [followUp, setFollowUp] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  useEffect(() => {
    if (!appointment) navigate('/doctor/appointments');
  }, [appointment, navigate]);

  const handleAddMedicine = () => {
    setMedicines([...medicines, {
      id: Date.now(),
      name: '',
      dosage: '',
      form: 'Tablet',
      frequency: 'Daily',
      timing: { morning: true, afternoon: false, night: true },
      food: 'After Food',
      duration: '5',
    }]);
  };

  const removeMedicine = (id) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(m => m.id !== id));
    }
  };

  const updateMedicine = (id, field, value) => {
    setMedicines(medicines.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const updateTiming = (id, time) => {
    setMedicines(medicines.map(m => 
      m.id === id ? { ...m, timing: { ...m.timing, [time]: !m.timing[time] } } : m
    ));
  };

  const handleSpeak = () => {
    const text = notes || "Please take your medications as prescribed. Follow the timing and instructions carefully.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'en' ? 'en-US' : 'hi-IN';
    window.speechSynthesis.speak(utterance);
  };

  const getShareLink = (rxId) => {
    const origin = window.location.origin;
    return `${origin}/view-prescription/${rxId}`;
  };

  const handleSendMessage = (type, forcedRxId = null) => {
    if (!patientInfo.phone) {
      setSnackbar({ open: true, severity: 'warning', message: 'Patient phone number required to share link.' });
      return;
    }

    let phone = patientInfo.phone.trim().replace(/\D/g, ''); 
    if (phone.length === 10) phone = `91${phone}`; 

    const rxId = forcedRxId || null;
    const shareLink = rxId ? getShareLink(rxId) : '';
    
    let msg = `Hello ${patientInfo.name}, Dr. Sharma has sent you a new prescription. `;
    if (rxId) {
      msg += `You can view and save it as PDF here: ${shareLink}`;
    } else {
      msg += `Please check the SevaTelehealth app. Diagnosis: ${patientInfo.diagnosis || 'General checkup'}`;
    }
    
    if (type === 'whatsapp') {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const handleSubmit = async (shareType = null) => {
    if (!patientInfo.diagnosis) {
      setSnackbar({ open: true, severity: 'error', message: 'Please provide a diagnosis.' });
      return;
    }

    if (medicines.some(m => !m.name)) {
      setSnackbar({ open: true, severity: 'error', message: 'All medicines must have a name.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patientId: appointment.patient?._id || appointment.patient,
        consultationId: appointment._id,
        diagnosis: patientInfo.diagnosis,
        medications: medicines.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: `${m.duration} days`,
          instructions: `${m.form}, ${m.food}, Timing: ${[
            m.timing.morning ? 'M' : '',
            m.timing.afternoon ? 'A' : '',
            m.timing.night ? 'N' : ''
          ].filter(Boolean).join('-')}`
        })),
        labTests,
        notes,
        followUpDate: followUp
      };

      const res = await generatePrescription(payload);
      if (res.success) {
        setSnackbar({ open: true, severity: 'success', message: 'Prescription sent successfully!' });
        
        if (shareType) {
          handleSendMessage(shareType, res.prescription.prescriptionId);
        }

        setTimeout(() => navigate('/doctor/appointments'), 1500);
      }
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err.message || 'Error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: c.bg, minHeight: 'calc(100vh - 64px)' }}>
        
        {/* Header Actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Button 
              startIcon={<BackIcon />} 
              onClick={() => navigate(-1)} 
              sx={{ color: c.muted, textTransform: 'none', fontWeight: 600, fontSize: 16, '&:hover': { bgcolor: c.soft } }}
            >
              {t.back}
            </Button>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, color: c.text, fontFamily: 'Inter, sans-serif' }}>
              {t.writePrescription}
            </Typography>
          </Stack>
          <Box sx={{ px: 2.5, py: 1.2, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, fontSize: 15, fontWeight: 700, color: c.primary }}>
             {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Box>
        </Stack>

        {/* Patient Info Section */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 72, 
                    height: 72, 
                    bgcolor: c.primarySoft, 
                    color: c.primary, 
                    fontSize: 24, 
                    fontWeight: 700,
                    border: `4px solid ${c.bg}` 
                  }}
                >
                  {patientInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 24, fontWeight: 700, color: c.text, mb: 0.5 }}>
                    {patientInfo.name}
                  </Typography>
                  <Typography sx={{ color: c.muted, mb: 2, fontSize: 15, fontWeight: 500 }}>
                    ID: {patientInfo.id} • {patientInfo.age} Yrs • {patientInfo.gender}
                  </Typography>
                  
                  <TextField 
                    placeholder={t.patient_phone_placeholder}
                    value={patientInfo.phone}
                    onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
                    size="small"
                    sx={{ ...premiumTextFieldSx, maxWidth: 280 }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: c.danger, fontSize: 12, fontWeight: 600 }}>
                    {t.phone_required_warning}
                  </Typography>
                </Box>
              </Stack>
              <TextField 
                fullWidth 
                placeholder={t.diagnosis_placeholder}
                multiline
                rows={2}
                value={patientInfo.diagnosis}
                onChange={(e) => setPatientInfo({...patientInfo, diagnosis: e.target.value})}
                sx={premiumTextFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ 
                p: 3, 
                bgcolor: c.dangerSoft, 
                borderRadius: 2, 
                height: '100%', 
                border: `1px solid ${c.danger}20`,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography sx={{ color: c.danger, display: 'flex', alignItems: 'center', mb: 2, gap: 1, fontWeight: 700, fontSize: 14, textTransform: 'uppercase' }}>
                  <span style={{ fontSize: '1.2rem' }}>⚠️</span> {t.allergies}
                </Typography>
                <Typography sx={{ color: c.danger, fontWeight: 600, mb: 2, fontSize: 15 }}>
                  {patientInfo.allergies || t.none_reported}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                   <TextField 
                    fullWidth 
                    size="small"
                    placeholder={t.add_allergy_placeholder}
                    sx={{
                        ...premiumTextFieldSx,
                        '& .MuiOutlinedInput-root': {
                            ...premiumTextFieldSx['& .MuiOutlinedInput-root'],
                            bgcolor: 'rgba(255,255,255,0.5)',
                            '&:hover fieldset': { borderColor: c.danger },
                            '&.Mui-focused fieldset': { borderColor: c.danger },
                        }
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Medicine Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: c.text }}>
            {t.medicines}
          </Typography>
          <Chip label={`${medicines.length} Item${medicines.length > 1 ? 's' : ''}`} sx={{ bgcolor: c.primary, color: '#fff', fontWeight: 700, height: 28 }} />
        </Box>

        {medicines.map((med, index) => (
          <Paper key={med.id} 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 3, 
              borderRadius: 2, 
              bgcolor: c.paper, 
              border: `1px solid ${c.line}`,
              position: 'relative',
              transition: '0.2s',
              '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderColor: c.primary }
            }}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography sx={{ color: c.muted, mb: 1, display: 'block', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{t.medicine_name}</Typography>
                <Autocomplete
                  freeSolo
                  options={MEDICINE_OPTIONS}
                  value={med.name}
                  onInputChange={(e, val) => updateMedicine(med.id, 'name', val)}
                  renderInput={(params) => <TextField {...params} placeholder="e.g. Paracetamol" fullWidth sx={premiumTextFieldSx} />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography sx={{ color: c.muted, mb: 1, display: 'block', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{t.dosage}</Typography>
                <TextField 
                  fullWidth 
                  placeholder="e.g. 500mg"
                  value={med.dosage}
                  onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                  sx={premiumTextFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-end">
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: c.muted, mb: 1, display: 'block', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{t.form}</Typography>
                    <FormControl fullWidth sx={premiumTextFieldSx}>
                      <Select
                        value={med.form}
                        onChange={(e) => updateMedicine(med.id, 'form', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="Tablet">Tablet (टेबलेट)</MenuItem>
                        <MenuItem value="Syrup">Syrup (सिरप)</MenuItem>
                        <MenuItem value="Capsule">Capsule (कैप्सूल)</MenuItem>
                        <MenuItem value="Injection">Injection (इंजेक्शन)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  {medicines.length > 1 && (
                    <IconButton 
                      onClick={() => removeMedicine(med.id)}
                      sx={{ mb: 0.5, color: c.muted, '&:hover': { color: c.danger, bgcolor: c.dangerSoft } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography sx={{ color: c.muted, mb: 1, display: 'block', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{t.timing}</Typography>
                <Stack direction="row" spacing={2}>
                  {[
                    { key: 'morning', icon: '🌅', color: c.warning, bg: c.warningSoft },
                    { key: 'afternoon', icon: '🌞', color: '#fb923c', bg: '#fff7ed' },
                    { key: 'night', icon: '🌙', color: c.primary, bg: c.primarySoft }
                  ].map((t) => (
                    <Button 
                      key={t.key}
                      onClick={() => updateTiming(med.id, t.key)}
                      sx={{ 
                        minWidth: 0, 
                        flex: 1,
                        py: 2,
                        border: '2px solid',
                        borderColor: med.timing[t.key] ? t.color : c.line,
                        bgcolor: med.timing[t.key] ? t.bg : '#fff',
                        borderRadius: 2, 
                        fontSize: '1.4rem',
                        transition: '0.2s',
                        '&:hover': { borderColor: t.color, bgcolor: t.bg }
                      }}
                    >
                      {t.icon}
                    </Button>
                  ))}
                </Stack>
              </Grid>
              
              <Grid size={{ xs: 12, md: 2 }}>
                <Typography sx={{ color: c.muted, mb: 1, display: 'block', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{t.duration}</Typography>
                <TextField 
                  fullWidth 
                  value={med.duration}
                  onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                  sx={premiumTextFieldSx}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography sx={{ color: c.muted, mb: 1, display: 'block', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{t.frequency}</Typography>
                <FormControl fullWidth sx={premiumTextFieldSx}>
                  <Select
                    value={med.frequency}
                    onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)}
                  >
                    <MenuItem value="Daily">Daily</MenuItem>
                    <MenuItem value="Twice Daily">Twice Daily</MenuItem>
                    <MenuItem value="Thrice Daily">Thrice Daily</MenuItem>
                    <MenuItem value="SOS">SOS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography sx={{ color: c.muted, mb: 1, display: 'block', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{t.food}</Typography>
                <FormControl fullWidth sx={premiumTextFieldSx}>
                  <Select
                    value={med.food}
                    onChange={(e) => updateMedicine(med.id, 'food', e.target.value)}
                  >
                    <MenuItem value="Before Food">Before Food (खाने से पहले)</MenuItem>
                    <MenuItem value="After Food">After Food (खाने के बाद)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Button 
          variant="text" 
          fullWidth 
          startIcon={<AddIcon />} 
          onClick={handleAddMedicine}
          sx={{ 
            py: 3, 
            borderRadius: 2, 
            bgcolor: c.paper, 
            color: c.primary,
            border: `2px dashed ${c.line}`,
            textTransform: 'none',
            fontSize: 16,
            fontWeight: 600,
            '&:hover': { bgcolor: c.primarySoft, borderColor: c.primary }
          }}
        >
          {t.addMedicine}
        </Button>

        {/* Labs and Follow Up */}
        <Grid container spacing={4} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: c.text }}>
                <span style={{ fontSize: '1.2rem' }}>📋</span> {t.labTests}
              </Typography>
              <Autocomplete
                multiple
                options={LAB_TEST_OPTIONS}
                value={labTests}
                onChange={(e, val) => setLabTests(val)}
                renderInput={(params) => <TextField {...params} placeholder={t.search_tests} sx={premiumTextFieldSx} />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip key={index} label={option} {...getTagProps({ index })} sx={{ bgcolor: c.primary, color: '#fff', borderRadius: 1.5, fontWeight: 600 }} />
                  ))
                }
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: c.text }}>
                <span style={{ fontSize: '1.2rem' }}>🗓️</span> {t.followUp}
              </Typography>
              <TextField 
                type="date" 
                fullWidth 
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                sx={{ ...premiumTextFieldSx, mb: 3 }}
              />
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                {[
                  { label: "7 Days", days: 7 },
                  { label: "14 Days", days: 14 },
                  { label: "1 Month", days: 30 }
                ].map((opt) => (
                  <Chip 
                    key={opt.label}
                    label={opt.label} 
                    onClick={() => {
                      const d = new Date(); d.setDate(d.getDate() + opt.days);
                      setFollowUp(d.toISOString().split('T')[0]);
                    }} 
                    variant="outlined"
                    sx={{ 
                      borderRadius: 1.5, 
                      px: 1,
                      color: c.text, 
                      borderColor: c.line,
                      fontWeight: 600,
                      '&:hover': { bgcolor: c.primarySoft, borderColor: c.primary, color: c.primaryDark }
                    }}
                  />
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Notes */}
        <Paper elevation={0} sx={{ p: 4, mt: 4, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, color: c.text }}>
              <span style={{ fontSize: '1.2rem' }}>📝</span> {t.notes}
            </Typography>
            <IconButton 
              onClick={handleSpeak} 
              sx={{ 
                bgcolor: c.primarySoft, 
                color: c.primary, 
                '&:hover': { bgcolor: c.primarySoft, opacity: 0.8 },
                borderRadius: 1.5
              }} 
              size="small"
            >
              <Tooltip title={t.voice}><VolumeIcon fontSize="small" /></Tooltip>
            </IconButton>
          </Stack>
          <TextField 
            fullWidth 
            multiline 
            rows={4} 
            placeholder={t.notes_placeholder}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={premiumTextFieldSx}
          />
        </Paper>

        <Box sx={{ 
          position: 'fixed', 
          bottom: 32, 
          left: { lg: 'calc(50% + 160px)', xs: '50%' },
          transform: 'translateX(-50%)', 
          width: { xs: '90%', md: '80%', lg: '800px' },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          p: 2,
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: `1px solid ${c.line}`,
        }}>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="text" 
              startIcon={<PreviewIcon />} 
              onClick={() => setShowPreview(true)} 
              sx={{ color: c.text, textTransform: 'none', fontWeight: 600, px: 2, borderRadius: 1.5, '&:hover': { bgcolor: c.soft } }}
            >
              {t.preview}
            </Button>
            <Button 
              variant="text" 
              startIcon={<SaveIcon />} 
              sx={{ color: c.text, textTransform: 'none', fontWeight: 600, px: 2, borderRadius: 1.5, '&:hover': { bgcolor: c.soft } }}
            >
              {t.save_draft}
            </Button>
          </Stack>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title={t.send_sms}>
              <IconButton sx={{ color: c.primary, bgcolor: c.primarySoft, borderRadius: 1.5, '&:hover': { bgcolor: c.primarySoft, opacity: 0.8 } }}>
                <SmsIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={loading}
              startIcon={!loading && <SendIcon />}
              sx={{ 
                borderRadius: 2, 
                px: 5, 
                py: 1.5,
                bgcolor: c.primary,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: `0 8px 16px ${c.primary}30`,
                '&:hover': { bgcolor: c.primaryDark, boxShadow: `0 8px 24px ${c.primary}40` },
                '&.Mui-disabled': { bgcolor: c.line }
              }}
            >
              {loading ? t.processing : t.submit}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Modern Preview Dialog */}
      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', bgcolor: '#fff' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 3, px: 4, borderBottom: `1px solid ${c.line}` }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: c.text }}>{t.preview}</Typography>
          <IconButton onClick={() => setShowPreview(false)} size="small" sx={{ bgcolor: c.bg }}>
            <BackIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, bgcolor: c.bg }}>
          <Paper elevation={0} sx={{ p: 5, bgcolor: '#fff', borderRadius: 2, border: `1px solid ${c.line}`, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
             {/* Prescription Header */}
             <Stack direction="row" justifyContent="space-between" sx={{ mb: 5 }}>
                <Box>
                  <Typography sx={{ fontSize: 28, fontWeight: 800, color: c.primary, letterSpacing: -0.5 }}>Seva TeleHealth</Typography>
                  <Typography sx={{ fontSize: 13, color: c.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Healing through connection</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: c.text }}>Dr. Sharma</Typography>
                  <Typography sx={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>Reg No: 123456 • MBBS, MD</Typography>
                  <Typography sx={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>Seva City Hospital, Bengaluru</Typography>
                </Box>
             </Stack>
             
             <Divider sx={{ mb: 4, borderColor: c.soft, borderStyle: 'dashed' }} />
             
             {/* Patient Overview */}
             <Grid container spacing={2} sx={{ mb: 5 }}>
                <Grid size={{ xs: 8 }}>
                   <Typography sx={{ fontSize: 18, fontWeight: 700, color: c.text, mb: 0.5 }}>{patientInfo.name}</Typography>
                   <Typography sx={{ fontSize: 14, color: c.muted, fontWeight: 500 }}>AGE: {patientInfo.age}Y • {patientInfo.gender} • ID: {patientInfo.id}</Typography>
                </Grid>
                <Grid size={{ xs: 4 }} sx={{ textAlign: 'right' }}>
                   <Typography sx={{ fontSize: 14, color: c.text, fontWeight: 600 }}>Date: {new Date().toLocaleDateString()}</Typography>
                </Grid>
             </Grid>

             <Box sx={{ mb: 4, p: 2, bgcolor: c.dangerSoft, borderRadius: 1.5, borderLeft: `4px solid ${c.danger}` }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: c.danger, textTransform: 'uppercase', mb: 0.5 }}>⚠️ {t.allergies}</Typography>
                <Typography sx={{ fontSize: 14, color: c.danger, fontWeight: 600 }}>{patientInfo.allergies || t.none_reported}</Typography>
             </Box>

             <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: c.muted, textTransform: 'uppercase', mb: 1 }}>{t.diagnosis}</Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: c.text, p: 2, bgcolor: c.bg, borderRadius: 1.5 }}>{patientInfo.diagnosis || '--'}</Typography>
             </Box>

             <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: c.muted, textTransform: 'uppercase', mb: 1.5 }}>{t.medications} (Rx)</Typography>
                {medicines.map((m, i) => (
                  <Box key={i} sx={{ mb: 2, p: 2.5, bgcolor: c.bg, borderRadius: 2, border: `1px solid ${c.line}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                       <Box>
                         <Typography sx={{ fontSize: 16, fontWeight: 700, color: c.text }}>{i+1}. {m.name}</Typography>
                         <Typography sx={{ fontSize: 13, color: c.muted, mt: 0.5, fontWeight: 500 }}>
                            {m.form} • {m.frequency} • {m.food}
                         </Typography>
                       </Box>
                       <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.primaryDark }}>{m.dosage} • {m.duration} Days</Typography>
                    </Stack>
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${c.line}`, borderStyle: 'dotted' }}>
                      <Typography sx={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>TIMING</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        {Object.keys(m.timing).filter(k => m.timing[k]).map(k => (
                          <Chip key={k} label={k.toUpperCase()} size="small" sx={{ height: 18, fontSize: 9, fontWeight: 800, bgcolor: c.primarySoft, color: c.primaryDark }} />
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                ))}
             </Box>

             <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                   <Typography sx={{ fontSize: 11, fontWeight: 800, color: c.muted, textTransform: 'uppercase', mb: 1 }}>{t.labTests}</Typography>
                   <Stack direction="row" flexWrap="wrap" gap={1}>
                      {labTests.map((t, index) => <Chip key={index} label={t} size="small" sx={{ borderRadius: 1, fontWeight: 600, fontSize: 12 }} variant="outlined" />)}
                      {labTests.length === 0 && <Typography sx={{ fontSize: 14, color: c.muted }}>--</Typography>}
                   </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                   <Typography sx={{ fontSize: 11, fontWeight: 800, color: c.muted, textTransform: 'uppercase', mb: 1 }}>{t.followUp}</Typography>
                   <Typography sx={{ fontSize: 16, fontWeight: 700, color: c.text }}>{followUp ? new Date(followUp).toLocaleDateString() : '--'}</Typography>
                </Grid>
             </Grid>

             <Box sx={{ mt: 4 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: c.muted, textTransform: 'uppercase', mb: 1 }}>{t.notes}</Typography>
                <Typography sx={{ fontSize: 14, fontStyle: 'italic', color: c.muted, p: 2, bgcolor: c.bg, borderRadius: 1.5, borderLeft: `3px solid ${c.soft}` }}>{notes || '--'}</Typography>
             </Box>
             
             <Box sx={{ mt: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 1.5, width: 180, height: 1, bgcolor: c.line }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: c.muted, textTransform: 'uppercase', mb: 0.5 }}>{t.digital_signature}</Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: c.text }}>Dr. Sharma</Typography>
                </Box>
             </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 4, bgcolor: c.paper, borderTop: `1px solid ${c.line}` }}>
          <Button onClick={() => setShowPreview(false)} sx={{ fontWeight: 600, textTransform: 'none', color: c.text }}>{t.close}</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ borderRadius: 2, px: 4, fontWeight: 600, textTransform: 'none', bgcolor: c.primary, boxShadow: `0 8px 16px ${c.primary}30` }}>
            {t.download_print}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{snackbar.message}</Alert>
      </Snackbar>
    </DoctorLayout>
  );
}

