import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import DoctorLayout from '../../components/DoctorLayout';
import { setDoctorAvailability } from '../../api/doctorAvailabilityApi';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_AVAILABILITY_TRANSLATIONS } from '../../utils/translations/doctor';

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

function DoctorAvailability() {
  const { language } = useLanguage();
  const t = DOCTOR_AVAILABILITY_TRANSLATIONS[language] || DOCTOR_AVAILABILITY_TRANSLATIONS['en'];

  const [slotDate, setSlotDate] = useState('');
  const [slotInput, setSlotInput] = useState('');
  const [slotList, setSlotList] = useState([]);
  const [savingSlots, setSavingSlots] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const handleAddSlot = () => {
    const trimmed = slotInput.trim();
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!trimmed) return;
    if (!timePattern.test(trimmed)) {
      setSnackbar({ open: true, severity: 'error', message: 'Use HH:mm format (e.g. 10:30)' });
      return;
    }
    if (slotList.includes(trimmed)) return setSlotInput('');
    setSlotList((prev) => [...prev, trimmed].sort());
    setSlotInput('');
  };

  const handleRemoveSlot = (slot) => setSlotList((prev) => prev.filter((item) => item !== slot));

  const handleSaveSlots = async () => {
    if (!slotDate || slotList.length === 0) {
      setSnackbar({ open: true, severity: 'error', message: 'Choose date and add slots.' });
      return;
    }
    setSavingSlots(true);
    try {
      await setDoctorAvailability(slotDate, slotList);
      setSnackbar({ open: true, severity: 'success', message: 'Availability saved!' });
    } catch (error) {
      setSnackbar({ open: true, severity: 'error', message: error.message || 'Error saving.' });
    } finally {
      setSavingSlots(false);
    }
  };

  return (
    <DoctorLayout title={t.manage}>
      <Box sx={{ p: { xs: 2, md: 4, xl: 6 }, bgcolor: c.bg, minHeight: 'calc(100vh - 64px)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: c.text, fontFamily: 'Inter, sans-serif' }}>{t.scheduling}</Typography>
            <Typography sx={{ color: c.muted, mt: 0.5, fontSize: 16 }}>{t.subtitle}</Typography>
          </Box>
          <Button 
            variant="contained" 
            onClick={handleSaveSlots} 
            disabled={savingSlots} 
            sx={{ bgcolor: c.primary, borderRadius: 2, px: 4, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: 16, boxShadow: `0 8px 16px ${c.primary}30`, '&:hover': { bgcolor: c.primaryDark } }}
          >
            {savingSlots ? t.saving : t.save_all}
          </Button>
        </Stack>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text, mb: 3 }}>{t.add_new}</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <TextField label={t.choose_date} type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField label={t.add_time} placeholder={t.time_placeholder} value={slotInput} onChange={(e) => setSlotInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSlot())} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth variant="outlined" onClick={handleAddSlot} sx={{ height: '56px', borderRadius: 2, border: `1px solid ${c.line}`, color: c.text, fontWeight: 600, textTransform: 'none', fontSize: 16 }}>{t.add}</Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 5 }}>
                <Typography sx={{ color: c.muted, mb: 2, fontWeight: 600, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.preview_slots}</Typography>
                {slotList.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center', border: `2px dashed ${c.line}`, borderRadius: 2, bgcolor: c.bg }}>
                    <Typography sx={{ color: c.muted }}>{t.empty_preview}</Typography>
                  </Box>
                ) : (
                  <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
                    {slotList.map((slot) => (
                      <Chip 
                        key={slot} 
                        label={slot} 
                        onDelete={() => handleRemoveSlot(slot)} 
                        sx={{ 
                          borderRadius: 2, py: 2.5, px: 1, 
                          bgcolor: c.primarySoft, color: c.primaryDark, 
                          fontWeight: 700, border: `1px solid ${c.primary}30`,
                          '& .MuiChip-deleteIcon': { color: c.primaryDark } 
                        }} 
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, bgcolor: c.text, color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5, fontFamily: 'Inter, sans-serif' }}>{t.notes_title}</Typography>
              <Stack spacing={3}>
                <Box>
                   <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>{t.format}</Typography>
                   <Typography sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>{t.format_desc}</Typography>
                </Box>
                <Box>
                   <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>{t.availability}</Typography>
                   <Typography sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>{t.availability_desc}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </DoctorLayout>
  );
}

export default DoctorAvailability;
