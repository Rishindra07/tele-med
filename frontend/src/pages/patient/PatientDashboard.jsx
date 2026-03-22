import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, TextField, CircularProgress, Chip, Snackbar, Alert, Stack, Card, CardContent, Divider, Avatar, InputAdornment } from '@mui/material';
import { EventNote as EventIcon, FolderShared as MedicalIcon, Search as SearchIcon, Star as StarIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import { bookAppointment, getDoctorSlots, getAllDoctors, getDoctorsBySpecialization } from '../../api/appointmentApi';

function PatientDashboard() {
  const navigate = useNavigate();
  const [specialization, setSpecialization] = useState('');
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const resetSelection = () => { setSelectedDoctor(null); setSelectedDate(''); setSlots([]); setSelectedSlot(''); };

  useEffect(() => {
    const fetchAllDoctors = async () => {
      setDoctorsLoading(true);
      try {
        const res = await getAllDoctors();
        setAllDoctors(res.doctors || []);
        setDoctors(res.doctors || []);
      } catch (error) {
        setAllDoctors([]); setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };
    fetchAllDoctors();
  }, []);

  const handleApplyFilter = async () => {
    const trimmed = specialization.trim().toLowerCase();
    if (!trimmed) {
      setDoctors(allDoctors); resetSelection(); return;
    }
    setDoctorsLoading(true); resetSelection();
    try {
      const res = await getDoctorsBySpecialization(trimmed);
      setDoctors(res.doctors || []);
    } catch (error) { setDoctors([]); } finally { setDoctorsLoading(false); }
  };

  const handleSelectDoctor = (doctor) => {
    if (selectedDoctor?._id === doctor._id) { resetSelection(); return; }
    setSelectedDoctor(doctor); setSelectedDate(''); setSlots([]); setSelectedSlot('');
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !selectedDate) return;
      const doctorId = selectedDoctor.user?._id || selectedDoctor.user;
      if (!doctorId) return;
      setSlotsLoading(true); setSelectedSlot('');
      try {
        const res = await getDoctorSlots(doctorId, selectedDate);
        setSlots(res.slots || []);
      } catch (error) {
        setSlots([]); setSnackbar({ open: true, severity: 'error', message: error.message || 'Failed to load slots.' });
      } finally { setSlotsLoading(false); }
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setSnackbar({ open: true, severity: 'error', message: 'Please select doctor, date, and time slot.' }); return;
    }
    const doctorId = selectedDoctor.user?._id || selectedDoctor.user;
    setBookingLoading(true);
    try {
      await bookAppointment({ doctorId, specialization: selectedDoctor.specialization || specialization, date: selectedDate, slot: selectedSlot });
      setSnackbar({ open: true, severity: 'success', message: 'Appointment booked successfully.' });
      setSlots((prev) => prev.filter((s) => s !== selectedSlot)); setSelectedSlot('');
      resetSelection();
    } catch (error) {
      setSnackbar({ open: true, severity: 'error', message: error.message || 'Booking failed.' });
    } finally { setBookingLoading(false); }
  };

  return (
    <PatientLayout title="Patient Dashboard">
      {/* Quick Stats Actions */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, height: '100%', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(37,99,235,0.02)' } }} onClick={() => navigate('/patient/appointments')}>
            <Avatar sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: 'primary.main', width: 56, height: 56 }}>
              <EventIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography color="text.secondary" variant="subtitle2" fontWeight={600} textTransform="uppercase">My Appointments</Typography>
              <Typography variant="h5" fontWeight="bold">View Schedule</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, height: '100%', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(34,197,94,0.02)' } }} onClick={() => navigate('/symptom-checker')}>
            <Avatar sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: 'secondary.main', width: 56, height: 56 }}>
              <MedicalIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography color="text.secondary" variant="subtitle2" fontWeight={600} textTransform="uppercase">AI Checker</Typography>
              <Typography variant="h5" fontWeight="bold">Analyze Symptoms</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Appointment Booking Engine */}
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>Find & Book a Doctor</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Search by specialization to find the right medical professional for you.</Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search specialization (e.g. Cardiologist)"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" size="large" onClick={handleApplyFilter} disabled={doctorsLoading} sx={{ height: '100%' }}>
              {doctorsLoading ? <CircularProgress size={24} color="inherit" /> : 'Search Doctors'}
            </Button>
          </Grid>
        </Grid>

        {doctorsLoading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3}>
            {doctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                <Card variant="outlined" sx={{ 
                  borderColor: selectedDoctor?._id === doctor._id ? 'primary.main' : 'divider',
                  borderWidth: selectedDoctor?._id === doctor._id ? 2 : 1,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 48, height: 48, fontSize: '1.2rem' }}>
                        {doctor.user?.name ? doctor.user.name.charAt(0) : 'D'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{doctor.user?.name || 'Doctor'}</Typography>
                        <Typography variant="body2" color="primary" fontWeight={500}>{doctor.specialization}</Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="text.secondary" display="flex" alignItems="center">
                        <StarIcon sx={{ color: '#F59E0B', fontSize: 18, mr: 0.5 }} />
                        {doctor.rating ? Number(doctor.rating).toFixed(1) : 'New'}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="text.primary">
                        ₹{doctor.consultationFee || '500'}
                      </Typography>
                    </Stack>

                    <Button 
                      fullWidth 
                      variant={selectedDoctor?._id === doctor._id ? "contained" : "outlined"}
                      onClick={() => handleSelectDoctor(doctor)}
                    >
                      {selectedDoctor?._id === doctor._id ? "Selected" : "Book Consult"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {doctors.length === 0 && !doctorsLoading && (
              <Grid item xs={12}>
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">No doctors found matching your criteria.</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* Selected Doctor Booking Area */}
        {selectedDoctor && (
          <Box sx={{ mt: 5, p: 3, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Schedule Appointment</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              with Dr. {selectedDoctor.user?.name}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><CalendarIcon /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>Available Time Slots</Typography>
                  {slotsLoading ? (
                    <CircularProgress size={24} />
                  ) : slots.length === 0 ? (
                    <Typography variant="body2" color="error">
                      {selectedDate ? 'No slots available for this date.' : 'Pick a date to view available slots.'}
                    </Typography>
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {slots.map((slot) => (
                        <Chip
                          key={slot}
                          label={slot}
                          onClick={() => setSelectedSlot(slot)}
                          color={selectedSlot === slot ? 'primary' : 'default'}
                          variant={selectedSlot === slot ? 'filled' : 'outlined'}
                          sx={{ mb: 1, px: 1, fontWeight: selectedSlot === slot ? 'bold' : 'normal' }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              </Grid>
            </Grid>

            {selectedDate && selectedSlot && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" fontWeight="bold">Total: ₹{selectedDoctor.consultationFee || '500'}</Typography>
                <Button variant="contained" size="large" onClick={handleBookAppointment} disabled={bookingLoading} color="secondary" sx={{ color: 'white' }}>
                  {bookingLoading ? 'Processing...' : 'Confirm Appointment'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </PatientLayout>
  );
}

export default PatientDashboard;
