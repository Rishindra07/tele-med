import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Autocomplete, Chip, 
  Divider, IconButton, Snackbar, Alert, Card, CardContent, 
  ToggleButtonGroup, ToggleButton, Stack, Tooltip, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem
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
  ChevronLeft as BackIcon
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import { useNavigate, useLocation } from 'react-router-dom';
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

const TRANSLATIONS = {
  en: {
    writePrescription: "Write Prescription",
    patientInfo: "Patient Information",
    diagnosis: "Diagnosis / Symptoms",
    allergies: "Known Allergies",
    medicines: "Prescribed Medicines",
    addMedicine: "Add Medicine",
    medicineName: "Medicine Name",
    dosage: "Dosage (e.g. 500mg)",
    form: "Form",
    frequency: "Frequency",
    timing: "Timing",
    timingMorning: "Morning",
    timingAfternoon: "Afternoon",
    timingNight: "Night",
    beforeFood: "Before Food",
    afterFood: "After Food",
    duration: "Duration (Days)",
    notes: "Notes / Advice",
    labTests: "Lab Test Recommendations",
    followUp: "Follow-Up Date",
    preview: "Preview",
    saveDraft: "Save Draft",
    submit: "Send to Patient",
    none: "None",
    quickOptions: "Quick Options",
    whatsapp: "Send via WhatsApp",
    sms: "Send via SMS",
    voice: "Voice Advice",
    after7days: "After 7 Days",
    after2weeks: "After 14 Days",
    history: "History",
    templates: "Templates",
    interactionWarning: "Drug Interaction Warning",
  },
  hi: {
    writePrescription: "नुस्खा लिखें",
    patientInfo: "मरीज की जानकारी",
    diagnosis: "निदान / लक्षण",
    allergies: "एलर्जी",
    medicines: "दवाएं",
    addMedicine: "दवा जोड़ें",
    medicineName: "दवा का नाम",
    dosage: "खुराक (जैसे 500mg)",
    form: "रूप",
    frequency: "आवृत्ति",
    timing: "समय",
    timingMorning: "सुबह",
    timingAfternoon: "दोपहर",
    timingNight: "रात",
    beforeFood: "खाने से पहले",
    afterFood: "खाने के बाद",
    duration: "अवधि (दिन)",
    notes: "डॉक्टर की सलाह",
    labTests: "लैब टेस्ट",
    followUp: "अगली मुलाकात",
    preview: "पूर्वावलोकन",
    saveDraft: "ड्राफ्ट सहेजें",
    submit: "मरीज को भेजें",
    none: "कोई नहीं",
    quickOptions: "त्वरित विकल्प",
    whatsapp: "WhatsApp पर भेजें",
    sms: "SMS पर भेजें",
    voice: "आवाज़ की सलाह",
    after7days: "7 दिन बाद",
    after2weeks: "14 दिन बाद",
    history: "इतिहास",
    templates: "टेम्पलेट्स",
    interactionWarning: "दवाओं का परस्पर प्रभाव",
  }
};

export default function PrescriptionForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = location.state?.appointment;

  // Language state
  const [lang, setLang] = useState('en');
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
    <DoctorLayout title={t.writePrescription}>
      <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 12 }}>
        
        {/* Header Actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} variant="text" color="inherit">
            Back
          </Button>
          <Stack direction="row" spacing={1}>
            <Tooltip title={t.history}>
              <IconButton color="primary"><HistoryIcon /></IconButton>
            </Tooltip>
            <Tooltip title={t.templates}>
              <IconButton color="primary"><AddIcon /></IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              startIcon={<TranslateIcon />} 
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              sx={{ borderRadius: 6, bgcolor: 'secondary.light', color: 'secondary.contrastText', '&:hover': { bgcolor: 'secondary.main' } }}
            >
              {lang === 'en' ? 'HI' : 'EN'}
            </Button>
          </Stack>
        </Stack>

        {/* Patient Info Section */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 6, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="800" letterSpacing="-0.5px" color="primary.dark">
                  {patientInfo.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8, mb: 2 }}>
                  ID: {patientInfo.id} • {patientInfo.age} Yrs • {patientInfo.gender}
                </Typography>
                
                <TextField 
                  label="Patient Phone (for WhatsApp/SMS)"
                  placeholder="+919999999999"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
                  size="small"
                  sx={{ 
                    maxWidth: 300, 
                    display: 'block',
                    '& .MuiOutlinedInput-root': { borderRadius: 3 } 
                  }}
                  helperText={!patientInfo.phone ? "Phone required for sending digital copy" : ""}
                  error={!patientInfo.phone}
                />
              </Box>
              <TextField 
                fullWidth 
                label={t.diagnosis}
                placeholder="e.g. Type 2 Diabetes, Hypertension"
                multiline
                rows={2}
                value={patientInfo.diagnosis}
                onChange={(e) => setPatientInfo({...patientInfo, diagnosis: e.target.value})}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#F1F5F9'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 3, bgcolor: '#FFF1F2', borderRadius: 4, height: '100%', border: '1px solid #FECDD3' }}>
                <Typography variant="subtitle1" fontWeight="bold" color="error.main" sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>⚠️</span> {t.allergies}
                </Typography>
                <Divider sx={{ mb: 1.5, borderColor: '#FDA4AF', opacity: 0.5 }} />
                <Typography variant="body1" fontWeight="500" color="error.dark">
                  {patientInfo.allergies}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Medicine Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="800" color="text.primary">
            {t.medicines}
          </Typography>
          <Chip label={`${medicines.length} Items`} color="secondary" size="small" sx={{ fontWeight: 'bold' }} />
        </Box>

        {medicines.map((med, index) => (
          <Card key={med.id} 
            elevation={0} 
            sx={{ 
              mb: 3, 
              borderRadius: 6, 
              border: '1px solid #E2E8F0', 
              overflow: 'visible', 
              position: 'relative', 
              transition: 'all 0.2s',
              '&:hover': { 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
                borderColor: 'secondary.main'
              } 
            }}
          >
            <Box sx={{ position: 'absolute', right: -12, top: -12, zIndex: 1 }}>
              <IconButton 
                size="large" 
                onClick={() => removeMedicine(med.id)}
                sx={{ 
                  bgcolor: '#FFFFFF', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #E2E8F0', 
                  color: 'error.main', 
                  '&:hover': { bgcolor: '#FEE2E2', transform: 'scale(1.1)' } 
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Autocomplete
                    freeSolo
                    options={MEDICINE_OPTIONS}
                    value={med.name}
                    onInputChange={(e, val) => updateMedicine(med.id, 'name', val)}
                    renderInput={(params) => <TextField {...params} label={`${t.medicineName} ${index + 1}`} fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField 
                    fullWidth 
                    label={t.dosage}
                    placeholder="e.g. 500mg"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                    <InputLabel>{t.form}</InputLabel>
                    <Select
                      value={med.form}
                      label={t.form}
                      onChange={(e) => updateMedicine(med.id, 'form', e.target.value)}
                    >
                      <MenuItem value="Tablet">Tablet (टेबलेट)</MenuItem>
                      <MenuItem value="Syrup">Syrup (सिरप)</MenuItem>
                      <MenuItem value="Capsule">Capsule (कैप्सूल)</MenuItem>
                      <MenuItem value="Injection">Injection (इंजेक्शन)</MenuItem>
                      <MenuItem value="Cream">Cream (क्रीम)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 4, border: '1px solid #F1F5F9' }}>
                    <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <SunIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} /> {t.timing}
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="space-around">
                      <Tooltip title={t.timingMorning}>
                        <IconButton 
                          onClick={() => updateTiming(med.id, 'morning')}
                          sx={{ 
                            p: 2,
                            bgcolor: med.timing.morning ? 'warning.light' : 'transparent',
                            color: med.timing.morning ? 'warning.dark' : 'text.disabled',
                            border: '1px solid', 
                            borderColor: med.timing.morning ? 'warning.main' : '#E2E8F0',
                            borderRadius: '30%'
                          }}
                        >
                          <SunIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t.timingAfternoon}>
                        <IconButton 
                          onClick={() => updateTiming(med.id, 'afternoon')}
                          sx={{ 
                            p: 2,
                            bgcolor: med.timing.afternoon ? 'orange' : 'transparent',
                            color: med.timing.afternoon ? 'white' : 'text.disabled',
                            border: '1px solid', 
                            borderColor: med.timing.afternoon ? 'orange' : '#E2E8F0',
                            borderRadius: '30%'
                          }}
                        >
                          <AfternoonIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t.timingNight}>
                        <IconButton 
                          onClick={() => updateTiming(med.id, 'night')}
                          sx={{ 
                            p: 2,
                            bgcolor: med.timing.night ? 'primary.main' : 'transparent',
                            color: med.timing.night ? 'white' : 'text.disabled',
                            border: '1px solid', 
                            borderColor: med.timing.night ? 'primary.dark' : '#E2E8F0',
                            borderRadius: '30%'
                          }}
                        >
                          <MoonIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <ToggleButtonGroup
                      value={med.food}
                      exclusive
                      onChange={(e, val) => val && updateMedicine(med.id, 'food', val)}
                      fullWidth
                      color="secondary"
                      sx={{ '& .MuiToggleButton-root': { borderRadius: 3, textTransform: 'none', py: 1.5, fontWeight: '700' } }}
                    >
                      <ToggleButton value="Before Food">{t.beforeFood}</ToggleButton>
                      <ToggleButton value="After Food">{t.afterFood}</ToggleButton>
                    </ToggleButtonGroup>

                    <Grid container spacing={2}>
                       <Grid item xs={6}>
                          <TextField 
                            fullWidth 
                            label={t.duration}
                            type="number"
                            value={med.duration}
                            onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                          />
                       </Grid>
                       <Grid item xs={6}>
                          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                            <InputLabel>{t.frequency}</InputLabel>
                            <Select
                              value={med.frequency}
                              label={t.frequency}
                              onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)}
                            >
                              <MenuItem value="Daily">Daily</MenuItem>
                              <MenuItem value="Twice Daily">Twice Daily</MenuItem>
                              <MenuItem value="Thrice Daily">Thrice Daily</MenuItem>
                              <MenuItem value="Weekly">Weekly</MenuItem>
                              <MenuItem value="SOS">SOS</MenuItem>
                            </Select>
                          </FormControl>
                       </Grid>
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        <Button 
          variant="outlined" 
          fullWidth 
          startIcon={<AddIcon />} 
          onClick={handleAddMedicine}
          sx={{ 
            py: 3, 
            borderRadius: 6, 
            border: '2px dashed #CBD5E1', 
            color: 'text.secondary',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            '&:hover': { border: '2px solid', borderColor: 'secondary.main', bgcolor: '#F1F5F9', color: 'secondary.main' }
          }}
        >
          {t.addMedicine}
        </Button>

        {/* Labs and Follow Up */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #E2E8F0', height: '100%', bgcolor: '#FFFFFF' }}>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 3 }}>🧪 {t.labTests}</Typography>
              <Autocomplete
                multiple
                options={LAB_TEST_OPTIONS}
                value={labTests}
                onChange={(e, val) => setLabTests(val)}
                renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Search tests..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip key={index} label={option} {...getTagProps({ index })} color="secondary" variant="filled" sx={{ borderRadius: 1.5, fontWeight: '600' }} />
                  ))
                }
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #E2E8F0', height: '100%', bgcolor: '#FFFFFF' }}>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 3 }}>🗓️ {t.followUp}</Typography>
              <TextField 
                type="date" 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={t.after7days} onClick={() => {
                  const d = new Date(); d.setDate(d.getDate() + 7);
                  setFollowUp(d.toISOString().split('T')[0]);
                }} 
                  sx={{ cursor: 'pointer', mb: 1 }}
                />
                <Chip label={t.after2weeks} onClick={() => {
                  const d = new Date(); d.setDate(d.getDate() + 14);
                  setFollowUp(d.toISOString().split('T')[0]);
                }} 
                  sx={{ cursor: 'pointer', mb: 1 }}
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Notes */}
        <Paper elevation={0} sx={{ p: 4, mt: 4, borderRadius: 6, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="800">📝 {t.notes}</Typography>
            <IconButton onClick={handleSpeak} sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText', '&:hover': { bgcolor: 'secondary.main' } }} size="small">
              <Tooltip title={t.voice}><VolumeIcon fontSize="small" /></Tooltip>
            </IconButton>
          </Stack>
          <TextField 
            fullWidth 
            multiline 
            rows={5} 
            placeholder="e.g. Drink plenty of water (8-10 glasses). Avoid fried and spicy food for 3 days. Take rest."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#FAFAFA' } }}
          />
        </Paper>

        {/* Floating Action Bar */}
        <Box sx={{ 
          position: 'fixed', 
          bottom: 24, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: { xs: '90%', md: '80%', lg: '1000px' },
          bgcolor: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: 8,
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          p: 2,
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.3s ease-in-out',
          '&:hover': { boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }
        }}>
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button 
              variant="text" 
              startIcon={<PreviewIcon />} 
              onClick={() => setShowPreview(true)} 
              sx={{ borderRadius: 4, px: 3, fontWeight: '700' }}
            >
              {t.preview}
            </Button>
            <Button 
              variant="text" 
              startIcon={<SaveIcon />} 
              sx={{ borderRadius: 4, px: 3, fontWeight: '700' }}
            >
              {t.saveDraft}
            </Button>
          </Stack>
          
          <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t.whatsapp}>
                <IconButton 
                  onClick={() => handleSubmit('whatsapp')}
                  sx={{ bgcolor: '#DCF8C6', color: '#075E54', '&:hover': { bgcolor: '#25D366', color: 'white' } }}
                >
                  <WhatsAppIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t.sms}>
                <IconButton 
                  onClick={() => handleSubmit('sms')}
                  sx={{ bgcolor: '#E0F2FE', color: '#0284C7', '&:hover': { bgcolor: '#0EA5E9', color: 'white' } }}
                >
                  <SmsIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              startIcon={loading ? null : <SendIcon />} 
              onClick={handleSubmit}
              disabled={loading}
              sx={{ 
                borderRadius: 4, 
                px: 6, 
                fontWeight: '900', 
                fontSize: '1rem',
                letterSpacing: '1px',
                boxShadow: '0 10px 15px -3px rgba(109, 40, 217, 0.3)',
                '&:hover': { boxShadow: '0 20px 25px -5px rgba(109, 40, 217, 0.4)', transform: 'translateY(-2px)' }
              }}
            >
              {loading ? 'WAITING...' : t.submit.toUpperCase()}
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
        PaperProps={{ sx: { borderRadius: 8, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.dark', color: 'white', py: 3 }}>
          <Typography variant="h5" fontWeight="900">{t.preview} RX</Typography>
          <IconButton onClick={() => setShowPreview(false)} sx={{ color: 'white' }}>
            <BackIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 5, bgcolor: '#FFFFFF', minHeight: '600px' }}>
             {/* Prescription Header */}
             <Stack direction="row" justifyContent="space-between" sx={{ mb: 6 }}>
                <Box>
                  <Typography variant="h4" fontWeight="900" color="primary.main">TeleMediRural</Typography>
                  <Typography variant="body2" color="text.secondary">Healthcare at your doorstep</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" fontWeight="bold">Dr. Sharma</Typography>
                  <Typography variant="body2" color="text.secondary">Reg No: 123456</Typography>
                  <Typography variant="body2" color="text.secondary">MBBS, MD</Typography>
                </Box>
             </Stack>
             
             <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />
             
             {/* Patient Overview */}
             <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={8}>
                   <Typography variant="h5" fontWeight="800">{patientInfo.name}</Typography>
                   <Typography variant="body1">{patientInfo.age}Y • {patientInfo.gender} • ID: {patientInfo.id}</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                   <Typography variant="body1"><strong>Date:</strong> {new Date().toLocaleDateString()}</Typography>
                </Grid>
             </Grid>

             <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'error.main', mb: 3 }}>
               ⚠️ ALLERGIES: {patientInfo.allergies || 'NONE'}
             </Typography>

             <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="800" color="primary.main" gutterBottom>DIAGNOSIS</Typography>
                <Typography variant="body1" sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>{patientInfo.diagnosis || '--'}</Typography>
             </Box>

             <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="800" color="primary.main" sx={{ mb: 2 }}>MEDICATIONS (℞)</Typography>
                {medicines.map((m, i) => (
                  <Box key={i} sx={{ mb: 2, p: 2, borderBottom: '1px solid #F1F5F9' }}>
                    <Stack direction="row" justifyContent="space-between">
                       <Typography variant="subtitle1" fontWeight="bold"># {i+1} {m.name}</Typography>
                       <Typography variant="subtitle2" fontWeight="bold">{m.dosage} • {m.duration} Days</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                       {m.form} • {m.frequency} • {m.food} • Timing: {Object.keys(m.timing).filter(k => m.timing[k]).map(k => k.toUpperCase()).join('-')}
                    </Typography>
                  </Box>
                ))}
             </Box>

             <Grid container spacing={4}>
                <Grid item xs={6}>
                   <Typography variant="h6" fontWeight="800" color="primary.main" gutterBottom>LAB TESTS</Typography>
                   <Stack direction="row" flexWrap="wrap" gap={1}>
                      {labTests.map((t, index) => <Chip key={index} label={t} size="small" variant="outlined" />)}
                      {labTests.length === 0 && <Typography variant="body2">None prescribed</Typography>}
                   </Stack>
                </Grid>
                <Grid item xs={6}>
                   <Typography variant="h6" fontWeight="800" color="primary.main" gutterBottom>FOLLOW UP</Typography>
                   <Typography variant="body1">{followUp || 'Not scheduled'}</Typography>
                </Grid>
             </Grid>

             <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="800" color="primary.main" gutterBottom>INSTRUCTIONS</Typography>
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>{notes || 'No additional instructions.'}</Typography>
             </Box>
             
             <Box sx={{ mt: 10, textAlign: 'right' }}>
                <Divider sx={{ mb: 1, width: '200px', ml: 'auto' }} />
                <Typography variant="subtitle2">Digital Signature</Typography>
                <Typography variant="h6" fontWeight="bold">Dr. Sharma</Typography>
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

