
import React, { useEffect, useState } from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Grid,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EventNote as EventIcon,
  FolderShared as MedicalIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  bookAppointment,
  getDoctorSlots,
  getAllDoctors,
  getDoctorsBySpecialization
} from '../../api/appointmentApi';

const drawerWidth = 240;

function PatientDashboard() {
  const navigate = useNavigate();
  const [specialization, setSpecialization] = useState('');
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'success',
    message: ''
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const resetSelection = () => {
    setSelectedDoctor(null);
    setSelectedDate('');
    setSlots([]);
    setSelectedSlot('');
  };

  useEffect(() => {
    const fetchAllDoctors = async () => {
      setDoctorsLoading(true);
      setDoctorsError('');
      try {
        const res = await getAllDoctors();
        const loaded = res.doctors || [];
        setAllDoctors(loaded);
        setDoctors(loaded);
      } catch (error) {
        setDoctorsError(error.message || 'Failed to load doctors.');
        setAllDoctors([]);
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchAllDoctors();
  }, []);


  const handleApplyFilter = async () => {
    const trimmed = specialization.trim().toLowerCase();
    if (!trimmed) {
      setDoctors(allDoctors);
      setDoctorsError('');
      resetSelection();
      return;
    }

    setDoctorsLoading(true);
    setDoctorsError('');
    resetSelection();
    try {
      const res = await getDoctorsBySpecialization(trimmed);
      const filtered = res.doctors || [];
      setDoctors(filtered);
      setDoctorsError(filtered.length === 0 ? 'No doctors match that specialization.' : '');
    } catch (error) {
      setDoctors([]);
      setDoctorsError(error.message || 'Failed to load doctors.');
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleSelectDoctor = (doctor) => {
    if (selectedDoctor?._id === doctor._id) {
      resetSelection();
      return;
    }
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSlots([]);
    setSelectedSlot('');
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !selectedDate) return;

      const doctorId = selectedDoctor.user?._id || selectedDoctor.user;
      if (!doctorId) return;

      setSlotsLoading(true);
      setSelectedSlot('');
      try {
        const res = await getDoctorSlots(doctorId, selectedDate);
        setSlots(res.slots || []);
      } catch (error) {
        setSlots([]);
        setSnackbar({
          open: true,
          severity: 'error',
          message: error.message || 'Failed to load slots.'
        });
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Please select doctor, date, and time slot.'
      });
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timePattern.test(selectedSlot)) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Invalid time slot format.'
      });
      return;
    }

    const today = new Date();
    const picked = new Date(selectedDate);
    if (Number.isNaN(picked.getTime())) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Invalid date.'
      });
      return;
    }
    if (picked.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Please choose a future date.'
      });
      return;
    }

    const doctorId = selectedDoctor.user?._id || selectedDoctor.user;
    if (!doctorId) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Selected doctor is missing an ID.'
      });
      return;
    }

    setBookingLoading(true);
    try {
      await bookAppointment({
        doctorId,
        specialization: selectedDoctor.specialization || specialization,
        date: selectedDate,
        slot: selectedSlot
      });

      setSnackbar({
        open: true,
        severity: 'success',
        message: 'Appointment booked successfully.'
      });

      setSlots((prev) => prev.filter((s) => s !== selectedSlot));
      setSelectedSlot('');
    } catch (error) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: error.message || 'Booking failed.'
      });
    } finally {
      setBookingLoading(false);
    }
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Seva TeleHealth - Patient Dashboard
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {['Dashboard', 'My Appointments', 'Medical Records', 'Profile'].map((text, index) => (
              <ListItem
                button
                key={text}
                onClick={() => {
                  if (index === 0) navigate("/patient");
                  if (index === 1) navigate("/patient/appointments");
                }}
              >
                <ListItemIcon>
                  {index === 0 && <DashboardIcon />}
                  {index === 1 && <EventIcon />}
                  {index === 2 && <MedicalIcon />}
                  {index === 3 && <PersonIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Upcoming Appointments
                </Typography>
                <Typography component="p" variant="h4">
                  -
                </Typography>
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  View details in My Appointments
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Medical Records
                </Typography>
                <Typography component="p" variant="h4">
                  5
                </Typography>
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  Prescriptions & Reports
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Appointment Booking */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Book Appointment
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Specialization"
                      placeholder="e.g., Cardiologist"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md="auto">
                    <Button
                      variant="contained"
                      onClick={handleApplyFilter}
                      disabled={doctorsLoading}
                    >
                      {doctorsLoading ? 'Loading...' : 'Find Doctors'}
                    </Button>
                  </Grid>
                  {doctorsError && (
                    <Grid item xs={12}>
                      <Typography color="error">{doctorsError}</Typography>
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Available Doctors
                  </Typography>
                  {doctorsLoading ? (
                    <CircularProgress size={24} />
                  ) : doctors.length === 0 ? (
                    <Typography color="text.secondary">
                      No doctors found. Try another specialization.
                    </Typography>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          <th style={{ padding: '10px' }}>Doctor</th>
                          <th style={{ padding: '10px' }}>Specialization</th>
                          <th style={{ padding: '10px' }}>Rating</th>
                          <th style={{ padding: '10px' }}>Availability</th>
                          <th style={{ padding: '10px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors.map((doctor) => {
                          const doctorName = doctor.user?.name || 'Doctor';
                          const availabilityText = doctor.availability?.length
                            ? doctor.availability
                                .map((entry) => {
                                  const day = entry?.day || 'Day';
                                  const slotsText = Array.isArray(entry?.slots) && entry.slots.length
                                    ? entry.slots.join(', ')
                                    : 'No slots';
                                  return `${day}: ${slotsText}`;
                                })
                                .join(' | ')
                            : 'Check slots';
                          const ratingText = doctor.rating && Number(doctor.rating) > 0
                            ? Number(doctor.rating).toFixed(1)
                            : 'Not rated';

                          return (
                            <tr key={doctor._id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '10px' }}>{doctorName}</td>
                              <td style={{ padding: '10px' }}>{doctor.specialization}</td>
                              <td style={{ padding: '10px' }}>{ratingText}</td>
                              <td style={{ padding: '10px' }}>{availabilityText}</td>
                              <td style={{ padding: '10px' }}>
                                <Button
                                  variant={selectedDoctor?._id === doctor._id ? 'contained' : 'outlined'}
                                  color={selectedDoctor?._id === doctor._id ? 'success' : 'primary'}
                                  size="small"
                                  onClick={() => handleSelectDoctor(doctor)}
                                >
                                  {selectedDoctor?._id === doctor._id ? 'Selected' : 'Select'}
                                </Button>
                                <Button
                                  variant="contained"
                                  sx={{ ml: 1 }}
                                  onClick={() => navigate("/symptom-checker")}
                                >
                                  Check Symptoms
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </Box>

                {selectedDoctor && (
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Selected Doctor
                    </Typography>
                    <Typography>
                      {selectedDoctor.user?.name || 'Doctor'} — {selectedDoctor.specialization}
                    </Typography>
                    {selectedDoctor.hospitalName && (
                      <Typography color="text.secondary">
                        {selectedDoctor.hospitalName}
                      </Typography>
                    )}
                    {selectedDoctor.consultationFee && (
                      <Typography color="text.secondary">
                        Consultation Fee: ₹{selectedDoctor.consultationFee}
                      </Typography>
                    )}

                    <Grid container spacing={2} sx={{ mt: 1 }} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Select Date"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: new Date().toISOString().split('T')[0] }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={8}>
                        {slotsLoading ? (
                          <CircularProgress size={24} />
                        ) : slots.length === 0 ? (
                          <Typography color="text.secondary">
                            {selectedDate
                              ? 'No slots available for this date.'
                              : 'Pick a date to view available slots.'}
                          </Typography>
                        ) : (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {slots.map((slot) => (
                              <Chip
                                key={slot}
                                label={slot}
                                clickable
                                color={selectedSlot === slot ? 'primary' : 'default'}
                                onClick={() => setSelectedSlot(slot)}
                                sx={{ mb: 1 }}
                              />
                            ))}
                          </Stack>
                        )}
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleBookAppointment}
                        disabled={bookingLoading || !selectedDoctor || !selectedDate || !selectedSlot}
                      >
                        {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>


        </Container>
      </Box>

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
    </Box>
  );
}

export default PatientDashboard;
