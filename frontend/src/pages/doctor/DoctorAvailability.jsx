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
import DashboardShell from '../../components/dashboard/DashboardShell';
import { setDoctorAvailability } from '../../api/doctorAvailabilityApi';
import { getDoctorNavItems } from './doctorNavigation.jsx';

function DoctorAvailability() {
  const [slotDate, setSlotDate] = useState('');
  const [slotInput, setSlotInput] = useState('');
  const [slotList, setSlotList] = useState([]);
  const [savingSlots, setSavingSlots] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'success',
    message: ''
  });

  const handleAddSlot = () => {
    const trimmed = slotInput.trim();
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!trimmed) return;
    if (!timePattern.test(trimmed)) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Slot must be in HH:mm format, for example 10:30.'
      });
      return;
    }
    if (slotList.includes(trimmed)) {
      setSlotInput('');
      return;
    }

    setSlotList((prev) => [...prev, trimmed].sort());
    setSlotInput('');
  };

  const handleRemoveSlot = (slot) => {
    setSlotList((prev) => prev.filter((item) => item !== slot));
  };

  const handleSaveSlots = async () => {
    if (!slotDate || slotList.length === 0) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Please choose a date and add at least one slot.'
      });
      return;
    }

    setSavingSlots(true);
    try {
      await setDoctorAvailability(slotDate, slotList);
      setSnackbar({
        open: true,
        severity: 'success',
        message: 'Availability saved successfully.'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: error.message || 'Failed to save availability.'
      });
    } finally {
      setSavingSlots(false);
    }
  };

  return (
    <DashboardShell
      title="Doctor Availability"
      subtitle="Maintain your bookable schedule in a dedicated page built for quick updates."
      brand="Doctor Console"
      navItems={getDoctorNavItems()}
      actions={(
        <Button variant="contained" onClick={handleSaveSlots} disabled={savingSlots}>
          {savingSlots ? 'Saving...' : 'Save Availability'}
        </Button>
      )}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Set Bookable Slots
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.75, mb: 3 }}>
              Add a date and time slots in 24-hour format. Patients will only see the saved slots.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <TextField
                  label="Date"
                  type="date"
                  value={slotDate}
                  onChange={(event) => setSlotDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  label="Add Slot"
                  placeholder="10:30"
                  value={slotInput}
                  onChange={(event) => setSlotInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddSlot();
                    }
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleAddSlot}
                  sx={{ height: '100%' }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              {slotList.length === 0 ? (
                <Typography color="text.secondary">No slots added yet.</Typography>
              ) : (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {slotList.map((slot) => (
                    <Chip
                      key={slot}
                      label={slot}
                      onDelete={() => handleRemoveSlot(slot)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(180deg, #082f49 0%, #0f172a 100%)',
              color: '#e2e8f0'
            }}
          >
            <Typography variant="overline" sx={{ color: '#7dd3fc' }}>
              Scheduling Notes
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
              Keep slot data tidy
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                Use consistent 24-hour slot formatting like `09:30` or `16:00`.
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                Save slots per date so booking availability remains accurate for patients.
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                Reminder emails rely on these scheduled appointments staying current.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardShell>
  );
}

export default DoctorAvailability;
