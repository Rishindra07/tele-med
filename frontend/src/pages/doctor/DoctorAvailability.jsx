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

const colors = {
  paper: '#fffdf8', line: '#d8d0c4', soft: '#e7dfd3', muted: '#8a857d',
  text: '#2c2b28',
  green: '#26a37c', greenSoft: '#dff3eb',
  blue: '#3b82f6', blueSoft: '#eff6ff'
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
      <Box sx={{ p: 4, bgcolor: '#f7f3ea', minHeight: 'calc(100vh - 64px)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text }}>{t.scheduling}</Typography>
            <Typography variant="body1" sx={{ color: colors.muted, mt: 1 }}>{t.subtitle}</Typography>
          </Box>
          <Button variant="contained" onClick={handleSaveSlots} disabled={savingSlots} sx={{ bgcolor: colors.green, borderRadius: 3, px: 4, py: 1.5, textTransform: 'none', fontSize: 16, '&:hover': { bgcolor: colors.green } }}>
            {savingSlots ? t.saving : t.save_all}
          </Button>
        </Stack>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>{t.add_new}</Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField label={t.choose_date} type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField label={t.add_time} placeholder={t.time_placeholder} value={slotInput} onChange={(e) => setSlotInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSlot())} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Button fullWidth variant="outlined" onClick={handleAddSlot} sx={{ height: '56px', borderRadius: 3, borderColor: colors.line, color: colors.text, textTransform: 'none', fontSize: 16 }}>{t.add}</Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 5 }}>
                <Typography variant="subtitle2" sx={{ color: colors.muted, mb: 2, fontWeight: 600 }}>{t.preview_slots}</Typography>
                {slotList.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center', border: `2px dashed ${colors.line}`, borderRadius: 3, bgcolor: '#fafafa' }}>
                    <Typography sx={{ color: colors.muted }}>{t.empty_preview}</Typography>
                  </Box>
                ) : (
                  <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
                    {slotList.map((slot) => (
                      <Chip key={slot} label={slot} onDelete={() => handleRemoveSlot(slot)} sx={{ borderRadius: 2, py: 2.5, px: 1, bgcolor: colors.greenSoft, color: colors.green, fontWeight: 700, border: `1px solid ${colors.green}20`, '& .MuiChip-deleteIcon': { color: colors.green } }} />
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 5, bgcolor: colors.text, color: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t.notes_title}</Typography>
              <Stack spacing={2.5}>
                <Box>
                   <Typography variant="subtitle2" sx={{ color: '#aaa', fontWeight: 600 }}>{t.format}</Typography>
                   <Typography variant="body2" sx={{ color: '#eee' }}>{t.format_desc}</Typography>
                </Box>
                <Box>
                   <Typography variant="subtitle2" sx={{ color: '#aaa', fontWeight: 600 }}>{t.availability}</Typography>
                   <Typography variant="body2" sx={{ color: '#eee' }}>{t.availability_desc}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </DoctorLayout>
  );
}

export default DoctorAvailability;
