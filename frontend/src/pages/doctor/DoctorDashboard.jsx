import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, TextField, Chip, Stack, CircularProgress, Snackbar, Alert, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Badge } from '@mui/material';
import { VideoCall as VideoCallIcon, EventAvailable as EventIcon, MedicalInformation as MedicalIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { setDoctorAvailability } from '../../api/doctorAvailabilityApi';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [slotDate, setSlotDate] = useState('');
  const [slotInput, setSlotInput] = useState('');
  const [slotList, setSlotList] = useState([]);
  const [savingSlots, setSavingSlots] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const patientQueue = [
    { id: 1, name: 'Rahul Verma', time: '10:30 AM', status: 'Waiting', type: 'Video' },
    { id: 2, name: 'Sneha Patil', time: '11:00 AM', status: 'Next', type: 'Audio' }
  ];

  const handleAddSlot = () => {
    const trimmed = slotInput.trim();
    if (!trimmed) return;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) {
      setSnackbar({ open: true, severity: 'error', message: 'Slot must be HH:mm (e.g., 10:30).' });
      return;
    }
    if (!slotList.includes(trimmed)) {
      setSlotList([...slotList, trimmed]);
    }
    setSlotInput('');
  };

  const handleSaveSlots = async () => {
    if (!slotDate || slotList.length === 0) {
      setSnackbar({ open: true, severity: 'error', message: 'Please pick a date and add at least one slot.' }); return;
    }
    setSavingSlots(true);
    try {
      await setDoctorAvailability(slotDate, slotList);
      setSnackbar({ open: true, severity: 'success', message: 'Availability saved.' });
    } catch (error) {
      setSnackbar({ open: true, severity: 'error', message: error.message || 'Failed to save availability.' });
    } finally { setSavingSlots(false); }
  };

  return (
    <DoctorLayout title="Daily Overview">
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', borderColor: 'secondary.main', borderTop: '4px solid', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight="bold">Today's Patients</Typography>
            <Typography variant="h3" fontWeight="bold" color="secondary.main" my={1}>12</Typography>
            <Typography variant="body2" color="text.secondary">4 Completed • 8 Remaining</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', borderColor: 'warning.main', borderTop: '4px solid', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight="bold">Pending Reports</Typography>
            <Typography variant="h3" fontWeight="bold" color="warning.main" my={1}>3</Typography>
            <Typography variant="body2" color="text.secondary">Requires your review</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'secondary.main', color: 'white', cursor: 'pointer', transition: '0.3s', '&:hover': { bgcolor: 'secondary.dark' } }} onClick={() => navigate('/doctor/prescription')}>
            <Stack alignItems="center" spacing={1}>
              <MedicalIcon sx={{ fontSize: 40 }} />
              <Typography variant="h6" fontWeight="bold">Write Prescription</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Patient Queue */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">Live Patient Queue</Typography>
              <Chip label="2 Waiting" color="warning" size="small" />
            </Box>
            <List sx={{ p: 0 }}>
              {patientQueue.map((patient, index) => (
                <Box key={patient.id}>
                  <ListItem sx={{ py: 2, px: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, width: '100%' }}>
                      <ListItemAvatar>
                        <Badge color="success" variant="dot" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} overlap="circular">
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 'bold' }}>{patient.name.charAt(0)}</Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography fontWeight="bold">{patient.name}</Typography>} 
                        secondary={`${patient.time} • ${patient.type} Consult`} 
                        sx={{ m: 0 }}
                      />
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: 'auto' }, display: 'flex', justifyContent: 'flex-end', shrink: 0 }}>
                      {index === 0 ? (
                        <Button variant="contained" color="secondary" startIcon={<VideoCallIcon />} sx={{ borderRadius: 8, px: 3 }}>
                          Start Consult
                        </Button>
                      ) : (
                        <Button variant="outlined" disabled sx={{ borderRadius: 8 }}>
                          Waiting
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                  {index < patientQueue.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Manage Availability */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">Manage Availability</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Add time slots to your calendar for patients to book consultations.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Date" type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} fullWidth size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Time Slot (HH:mm)" value={slotInput} onChange={(e) => setSlotInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSlot(); } }} fullWidth size="small" />
              </Grid>
            </Grid>
            
            <Box mt={2}>
              <Button variant="outlined" fullWidth onClick={handleAddSlot}>Add Time Slot to List</Button>
            </Box>

            <Box sx={{ mt: 3, minHeight: 60, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
              {slotList.length === 0 ? (
                <Typography color="text.secondary" variant="body2" textAlign="center">No slots staged yet.</Typography>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {slotList.map((slot) => (
                    <Chip key={slot} label={slot} onDelete={() => setSlotList(slotList.filter(s => s !== slot))} sx={{ mb: 1, bgcolor: 'white' }} />
                  ))}
                </Stack>
              )}
            </Box>

            <Button variant="contained" color="primary" fullWidth onClick={handleSaveSlots} disabled={savingSlots || slotList.length === 0} sx={{ mt: 3, py: 1.5 }}>
              {savingSlots ? <CircularProgress size={24} color="inherit" /> : 'Publish Schedule'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </DoctorLayout>
  );
}

export default DoctorDashboard;
