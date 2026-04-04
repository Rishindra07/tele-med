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

const colors = {
  paper: '#fffdf8',
  line: '#d8d0c4',
  text: '#2c2b28',
  muted: '#8b857d',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  red: '#d9635b',
  redSoft: '#fdeaea',
  bg: '#f5f1e8',
  white: '#ffffff',
  shadow: '0 4px 20px rgba(0,0,0,0.05)'
};

const premiumTextFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#fff',
    borderRadius: 3,
    transition: '0.2s',
    '& fieldset': { borderColor: colors.line },
    '&:hover fieldset': { borderColor: colors.muted },
    '&.Mui-focused fieldset': { borderColor: colors.green },
    '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(38, 163, 124, 0.08)' }
  },
  '& .MuiInputLabel-root': { color: colors.muted, fontSize: 13.5 },
  '& .MuiInputLabel-root.Mui-focused': { color: colors.green },
  '& .MuiOutlinedInput-input::placeholder': { color: colors.muted, opacity: 0.6 },
  '& .MuiSelect-icon': { color: colors.muted },
  '& .MuiAutocomplete-popupIndicator': { color: colors.muted },
  '& .MuiAutocomplete-clearIndicator': { color: colors.muted },
};

const TRANSLATIONS = {
  en: {
    writePrescription: "Write Prescription",
    diagnosis: "Diagnosis / Symptoms",
    medications: "Medications",
    labTests: "Lab Tests",
    followUp: "Follow Up",
    notes: "Notes",
    submit: "Send to Patient",
    preview: "Preview",
    allergies: "Allergies",
    addMedicine: "+ Add Medicine",
    voice: "Voice Typing"
  },
  hi: {
    writePrescription: "नुस्खा लिखें",
    diagnosis: "रोग का निदान",
    medications: "दवाएं",
    labTests: "लैब टेस्ट",
    followUp: "अगली मुलाकात",
    notes: "टिप्पणियाँ",
    submit: "रोगी को भेजें",
    preview: "पूर्वावलोकन",
    allergies: "एलर्जी",
    addMedicine: "+ दवा जोड़ें",
    voice: "बोलकर लिखें"
  },
  ta: {
    writePrescription: "மருந்துச் சீட்டு எழுதவும்",
    diagnosis: "நோய் கண்டறிதல்",
    medications: "மருந்துகள்",
    labTests: "ஆய்வக சோதனைகள்",
    followUp: "தொடர் சிகிச்சை",
    notes: "குறிப்புகள்",
    submit: "நோயாளிக்கு அனுப்பவும்",
    preview: "மருந்துச் சீட்டு முன்னோட்டம்",
    allergies: "ஒவ்வாமை",
    addMedicine: "+ மருந்து சேர்க்கவும்",
    voice: "குரல் தட்டச்சு"
  },
  te: {
    writePrescription: "మందుల చీటి వ్రాయండి",
    diagnosis: "వ్యాధి నిర్ధారణ",
    medications: "మందులు",
    labTests: "ల్యాబ్ పరీక్షలు",
    followUp: "తదుపరి చికిత్స",
    notes: "గమనికలు",
    submit: "రోగికి పంపండి",
    preview: "ప్రిస్క్రిప్షన్ ప్రివ్యూ",
    allergies: "అలెర్జీలు",
    addMedicine: "+ మందును జోడించండి",
    voice: "వాయిస్ టైపింగ్"
  },
  bn: {
    writePrescription: "প্রেসক্রিপশন লিখুন",
    diagnosis: "নিদান",
    medications: "ওষুধ",
    labTests: "ল্যাব পরীক্ষা",
    followUp: "ফলো আপ",
    notes: "নোট",
    submit: "রোগীকে পাঠান",
    preview: "প্রেসক্রিপশন প্রিভিউ",
    allergies: "অ্যালার্জি",
    addMedicine: "+ ওষুধ যোগ করুন",
    voice: "ভয়েস টাইপিং"
  }
};

export default function PrescriptionForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = location.state?.appointment;
  const { language } = useLanguage();

  // Language state
  const [lang, setLang] = useState(language || 'en');
  const t = TRANSLATIONS[lang];

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
    setLang(language);
  }, [language]);

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
    utterance.lang = lang === 'en' ? 'en-US' : 'hi-IN';
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

    let phone = patientInfo.phone.trim().replace(/\D/g, ''); // Get just digits
    if (phone.length === 10) phone = `91${phone}`; // Add Indian code if missing

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
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        
        {/* Header Actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Button 
              startIcon={<BackIcon />} 
              onClick={() => navigate(-1)} 
              sx={{ color: colors.muted, textTransform: 'none', fontWeight: '500', fontSize: 16 }}
            >
              Back
            </Button>
            <Typography sx={{ fontSize: 42, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              {t.writePrescription}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ px: 2, py: 1, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 15, fontWeight: 500 }}>
               {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<TranslateIcon sx={{ fontSize: 20 }} />} 
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              sx={{ 
                borderRadius: 99, 
                bgcolor: '#fff', 
                color: colors.text, 
                borderColor: colors.line,
                textTransform: 'none',
                fontWeight: '600',
                px: 2,
                '&:hover': { bgcolor: colors.bg, borderColor: colors.line }
              }}
            >
              {lang === 'en' ? 'HI' : 'EN'}
            </Button>
          </Stack>
        </Stack>

        {/* Patient Info Section */}
        <Box sx={{ p: 3, mb: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 72, 
                    height: 72, 
                    bgcolor: colors.greenSoft, 
                    color: colors.green, 
                    fontSize: 24, 
                    fontWeight: 700,
                    border: `1px solid ${colors.green}20` 
                  }}
                >
                  {patientInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
                    {patientInfo.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.muted, mb: 1.5, fontSize: 15 }}>
                    ID: {patientInfo.id} • {patientInfo.age} Yrs • {patientInfo.gender}
                  </Typography>
                  
                  <TextField 
                    placeholder="Patient Phone (for WhatsApp)"
                    value={patientInfo.phone}
                    onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
                    size="small"
                    sx={{ ...premiumTextFieldSx, maxWidth: 280 }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.8, color: colors.red, fontSize: 12 }}>
                    Phone required for digital prescription sharing
                  </Typography>
                </Box>
              </Stack>
              <TextField 
                fullWidth 
                placeholder="Initial Diagnosis / Observed Symptoms..."
                multiline
                rows={2}
                value={patientInfo.diagnosis}
                onChange={(e) => setPatientInfo({...patientInfo, diagnosis: e.target.value})}
                sx={premiumTextFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ 
                p: 3, 
                bgcolor: colors.redSoft, 
                borderRadius: 3, 
                height: '100%', 
                border: `1px solid ${colors.red}20`,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ color: colors.red, display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <span style={{ fontSize: '1.2rem' }}>⚠️</span> {t.allergies.toUpperCase()}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.red, opacity: 0.9, mb: 2, fontSize: 15 }}>
                  {patientInfo.allergies || "None reported"}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                   <TextField 
                    fullWidth 
                    size="small"
                    placeholder="Add documented allergy..."
                    sx={premiumTextFieldSx}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Medicine Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="700" color="text.primary">
            {t.medicines}
          </Typography>
          <Chip label={`${medicines.length} Item${medicines.length > 1 ? 's' : ''}`} sx={{ bgcolor: colors.green, color: colors.white, fontWeight: 'bold', px: 1, height: 24 }} />
        </Box>

        {medicines.map((med, index) => (
          <Box key={med.id} 
            sx={{ 
              p: 3, 
              mb: 2, 
              borderRadius: 3.5, 
              bgcolor: colors.paper, 
              border: `1px solid ${colors.line}`,
              position: 'relative',
              transition: '0.2s',
              '&:hover': { boxShadow: colors.shadow }
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Typography variant="caption" sx={{ color: colors.muted, mb: 0.8, display: 'block', fontWeight: 600 }}>Medicine Name</Typography>
                <Autocomplete
                  freeSolo
                  options={MEDICINE_OPTIONS}
                  value={med.name}
                  onInputChange={(e, val) => updateMedicine(med.id, 'name', val)}
                  renderInput={(params) => <TextField {...params} placeholder="e.g. Paracetamol" fullWidth sx={premiumTextFieldSx} />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="caption" sx={{ color: colors.muted, mb: 0.8, display: 'block', fontWeight: 600 }}>Dosage</Typography>
                <TextField 
                  fullWidth 
                  placeholder="e.g. 500mg"
                  value={med.dosage}
                  onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                  sx={premiumTextFieldSx}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: colors.muted, mb: 0.8, display: 'block', fontWeight: 600 }}>Form</Typography>
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
                      sx={{ mb: 0.5, color: colors.muted, '&:hover': { color: colors.red, bgcolor: colors.redSoft } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="caption" sx={{ color: colors.muted, mb: 0.8, display: 'block', fontWeight: 600 }}>Timing</Typography>
                <Stack direction="row" spacing={1.5}>
                  {[
                    { key: 'morning', icon: '🌅', color: '#fbbf24', bg: '#fffbeb' },
                    { key: 'afternoon', icon: '🌞', color: '#fb923c', bg: '#fff7ed' },
                    { key: 'night', icon: '🌙', color: '#818cf8', bg: '#eef2ff' }
                  ].map((t) => (
                    <Button 
                      key={t.key}
                      onClick={() => updateTiming(med.id, t.key)}
                      sx={{ 
                        minWidth: 0, 
                        flex: 1,
                        py: 1.5,
                        border: '2px solid',
                        borderColor: med.timing[t.key] ? t.color : colors.line,
                        bgcolor: med.timing[t.key] ? t.bg : '#fff',
                        borderRadius: 3, 
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
              
              <Grid item xs={12} md={2}>
                <Typography variant="caption" sx={{ color: colors.muted, mb: 0.8, display: 'block', fontWeight: 600 }}>Duration (Days)</Typography>
                <TextField 
                  fullWidth 
                  value={med.duration}
                  onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                  sx={premiumTextFieldSx}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Typography variant="caption" sx={{ color: colors.muted, mb: 0.8, display: 'block', fontWeight: 600 }}>Frequency</Typography>
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
              
              <Grid item xs={12} md={3}>
                <Typography variant="caption" sx={{ color: colors.muted, mb: 0.8, display: 'block', fontWeight: 600 }}>Food</Typography>
                <FormControl fullWidth sx={premiumTextFieldSx}>
                  <Select
                    value={med.food}
                    onChange={(e) => updateMedicine(med.id, 'food', e.target.value)}
                  >
                    <MenuItem value="Before Food">Before Food</MenuItem>
                    <MenuItem value="After Food">After Food</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        ))}

        <Button 
          variant="text" 
          fullWidth 
          startIcon={<AddIcon />} 
          onClick={handleAddMedicine}
          sx={{ 
            py: 2, 
            borderRadius: 3.5, 
            bgcolor: colors.paper, 
            color: colors.muted,
            border: `1px dashed ${colors.line}`,
            textTransform: 'none',
            fontSize: 16,
            fontWeight: 600,
            '&:hover': { bgcolor: '#f1eee7', borderColor: colors.muted }
          }}
        >
          {t.addMedicine}
        </Button>

        {/* Labs and Follow Up */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: colors.text }}>
                <span style={{ fontSize: '1.2rem' }}>📋</span> {t.labTests}
              </Typography>
              <Autocomplete
                multiple
                options={LAB_TEST_OPTIONS}
                value={labTests}
                onChange={(e, val) => setLabTests(val)}
                renderInput={(params) => <TextField {...params} placeholder="Search recommended tests..." sx={premiumTextFieldSx} />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip key={index} label={option} {...getTagProps({ index })} sx={{ bgcolor: colors.green, color: colors.white, borderRadius: 2, fontWeight: '600' }} />
                  ))
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: colors.text }}>
                <span style={{ fontSize: '1.2rem' }}>🗓️</span> {t.followUp}
              </Typography>
              <TextField 
                type="date" 
                fullWidth 
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                sx={{ ...premiumTextFieldSx, mb: 2.5 }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                      borderRadius: 2, 
                      px: 0.5,
                      color: colors.text, 
                      borderColor: colors.line,
                      fontWeight: 600,
                      '&:hover': { bgcolor: colors.bg, borderColor: colors.muted }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Notes */}
        <Box sx={{ p: 3, mt: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.text }}>
              <span style={{ fontSize: '1.2rem' }}>📝</span> {t.notes}
            </Typography>
            <IconButton 
              onClick={handleSpeak} 
              sx={{ 
                bgcolor: colors.blueSoft, 
                color: colors.blue, 
                '&:hover': { bgcolor: '#dbeafe' },
                borderRadius: 2.5
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
            placeholder="Additional advice (e.g. Diet restrictions, physical rest, hydration)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={premiumTextFieldSx}
          />
        </Box>

        <Box sx={{ 
          position: 'fixed', 
          bottom: 32, 
          left: { lg: 'calc(50% + 160px)', xs: '50%' },
          transform: 'translateX(-50%)', 
          width: { xs: '90%', md: '80%', lg: '800px' },
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: 4,
          p: 1.5,
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(216, 208, 196, 0.4)',
        }}>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="text" 
              startIcon={<PreviewIcon />} 
              onClick={() => setShowPreview(true)} 
              sx={{ color: colors.text, textTransform: 'none', fontWeight: '600', px: 2, borderRadius: 2.5, '&:hover': { bgcolor: colors.bg } }}
            >
              Preview
            </Button>
            <Button 
              variant="text" 
              startIcon={<SaveIcon />} 
              sx={{ color: colors.text, textTransform: 'none', fontWeight: '600', px: 2, borderRadius: 2.5, '&:hover': { bgcolor: colors.bg } }}
            >
              Save Draft
            </Button>
          </Stack>
          
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="Send via SMS">
              <IconButton sx={{ color: colors.blue, bgcolor: colors.blueSoft, borderRadius: 2.5, '&:hover': { bgcolor: '#dbeafe' } }}>
                <SmsIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={loading}
              startIcon={!loading && <SendIcon />}
              sx={{ 
                borderRadius: 2.5, 
                px: 4, 
                py: 1.25,
                bgcolor: colors.green,
                color: '#fff',
                textTransform: 'none',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(38, 163, 124, 0.25)',
                '&:hover': { bgcolor: '#1f8c6a', boxShadow: '0 6px 16px rgba(38, 163, 124, 0.35)' },
                '&.Mui-disabled': { bgcolor: colors.line }
              }}
            >
              {loading ? 'Processing...' : t.submit}
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
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden', bgcolor: '#fff' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.5, px: 4, borderBottom: `1px solid ${colors.line}` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Georgia, serif' }}>{t.preview}</Typography>
          <IconButton onClick={() => setShowPreview(false)} size="small" sx={{ bgcolor: colors.bg }}>
            <BackIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: colors.bg }}>
          <Box sx={{ p: 4, bgcolor: '#fff', m: { xs: 1, md: 3 }, borderRadius: 3, border: `1px solid ${colors.line}`, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
             {/* Prescription Header */}
             <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
                <Box>
                  <Typography variant="h4" fontWeight="800" color={colors.green} sx={{ fontFamily: 'Georgia, serif', letterSpacing: -0.5 }}>Seva TeleHealth</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: 0.5 }}>Healing through connection</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" fontWeight="700">Dr. Sharma</Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: colors.muted }}>Reg No: 123456 • MBBS, MD</Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: colors.muted }}>Seva City Hospital, Bengaluru</Typography>
                </Box>
             </Stack>
             
             <Divider sx={{ mb: 4, borderColor: colors.line }} />
             
             {/* Patient Overview */}
             <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={8}>
                   <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 0.5 }}>{patientInfo.name}</Typography>
                   <Typography variant="body2" color="text.secondary">AGE: {patientInfo.age}Y • {patientInfo.gender} • ID: {patientInfo.id}</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                   <Typography variant="body2"><strong>Date:</strong> {new Date().toLocaleDateString()}</Typography>
                </Grid>
             </Grid>

             <Box sx={{ mb: 3, p: 2, bgcolor: colors.redSoft, borderRadius: 2, border: `1px solid ${colors.redBorder}` }}>
                <Typography variant="caption" fontWeight="700" sx={{ color: colors.redText, display: 'block', mb: 0.5 }}>⚠️ ALLERGIES</Typography>
                <Typography variant="body2" sx={{ color: colors.redText }}>{patientInfo.allergies || 'NONE REPORTED'}</Typography>
             </Box>

             <Box sx={{ mb: 3 }}>
                <Typography variant="caption" fontWeight="700" color={colors.muted} sx={{ display: 'block', mb: 1 }}>DIAGNOSIS / SYMPTOMS</Typography>
                <Typography variant="body2" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>{patientInfo.diagnosis || '--'}</Typography>
             </Box>

             <Box sx={{ mb: 3 }}>
                <Typography variant="caption" fontWeight="700" color={colors.muted} sx={{ display: 'block', mb: 1 }}>MEDICATIONS (Rx)</Typography>
                {medicines.map((m, i) => (
                  <Box key={i} sx={{ mb: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                       <Box>
                         <Typography variant="body2" fontWeight="700">{i+1}. {m.name}</Typography>
                         <Typography variant="caption" color="text.secondary">
                            {m.form} • {m.frequency} • {m.food}
                         </Typography>
                       </Box>
                       <Typography variant="caption" fontWeight="700">{m.dosage} • {m.duration} Days</Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.muted }}>
                       Timing: {Object.keys(m.timing).filter(k => m.timing[k]).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')}
                    </Typography>
                  </Box>
                ))}
             </Box>

             <Grid container spacing={2}>
                <Grid item xs={6}>
                   <Typography variant="caption" fontWeight="700" color={colors.muted} sx={{ display: 'block', mb: 1 }}>LAB TESTS</Typography>
                   <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {labTests.map((t, index) => <Chip key={index} label={t} size="small" variant="outlined" sx={{ borderRadius: 1 }} />)}
                      {labTests.length === 0 && <Typography variant="caption">None prescribed</Typography>}
                   </Stack>
                </Grid>
                <Grid item xs={6}>
                   <Typography variant="caption" fontWeight="700" color={colors.muted} sx={{ display: 'block', mb: 1 }}>FOLLOW UP</Typography>
                   <Typography variant="body2" fontWeight="600">{followUp ? new Date(followUp).toLocaleDateString() : 'Not scheduled'}</Typography>
                </Grid>
             </Grid>

             <Box sx={{ mt: 3 }}>
                <Typography variant="caption" fontWeight="700" color={colors.muted} sx={{ display: 'block', mb: 1 }}>NOTES / ADVICE</Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>{notes || 'No additional instructions.'}</Typography>
             </Box>
             
             <Box sx={{ mt: 6, textAlign: 'right' }}>
                <Box sx={{ display: 'inline-block', textAlign: 'center' }}>
                  <Divider sx={{ mb: 1, width: '150px' }} />
                  <Typography variant="caption" color="text.secondary">Digital Signature</Typography>
                  <Typography variant="subtitle2" fontWeight="700">Dr. Sharma</Typography>
                </Box>
             </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setShowPreview(false)} sx={{ fontWeight: 'bold' }}>Close</Button>
          <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ borderRadius: 4, px: 4, fontWeight: 'bold' }}>
            Download/Print PDF
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 3, fontWeight: '600' }}>{snackbar.message}</Alert>
      </Snackbar>
    </DoctorLayout>
  );
}

