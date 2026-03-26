import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  CalendarTodayRounded as CalendarIcon,
  NotificationsNoneRounded as NotificationIcon,
  PlaceOutlined as PlaceIcon,
  ScienceRounded as ReportIcon,
  StickyNote2Outlined as NotesIcon,
  VaccinesOutlined as PrescriptionIcon,
  EventAvailableRounded as EventAvailableIcon,
  ChatBubbleOutlineRounded as ChatIcon,
  FileUploadOutlined as UploadIcon,
  StarOutlineRounded as StarIcon,
  HistoryRounded as HistoryIcon,
  VisibilityOutlined as ViewIcon,
  VideocamRounded as VideoIcon,
  PlayCircleFilledRounded as OngoingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PatientShell from '../../components/patient/PatientShell';
import {
  bookAppointment,
  getAllDoctors,
  getDoctorSlots,
  getDoctorsBySpecialization
} from '../../api/appointmentApi';
import { 
  fetchMyAppointments, 
  fetchMyRecords, 
  fetchPharmacies 
} from '../../api/patientApi';
import { getConsultationStatus } from '../../utils/consultationUtils';

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

const fmtDate = (value) => {
  if (!value) return '';
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'DR';

function PatientDashboard() {
  const navigate = useNavigate();
  const bookingRef = useRef(null);
  const patientName = (() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const resolvedName = storedUser?.full_name || storedUser?.name || 'User';
      return String(resolvedName).replace(/\s*\(registered\)\s*$/i, '').trim() || 'User';
    } catch {
      return 'User';
    }
  })();
  const greetingName = patientName.split(' ')[0] || 'User';

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
  const [doctorsError, setDoctorsError] = useState('');

  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const resetSelection = () => { setSelectedDoctor(null); setSelectedDate(''); setSlots([]); setSelectedSlot(''); };

  useEffect(() => {
    const fetchDoctors = async () => {
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
    fetchDoctors();

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const [apptsRes, recsRes, pharRes] = await Promise.all([
          fetchMyAppointments(),
          fetchMyRecords(),
          fetchPharmacies()
        ]);
        if (apptsRes.success) setAppointments(apptsRes.appointments || []);
        if (recsRes.success) setRecords(recsRes.records || []);
        if (pharRes.success) setPharmacies(pharRes.pharmacies || []);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

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
        setSnackbar({ open: true, severity: 'error', message: error.message || 'Failed to load slots.' });
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleApplyFilter = async () => {
    const trimmed = specialization.trim().toLowerCase();
    if (!trimmed) {
      setDoctors(allDoctors); resetSelection(); return;
    }
    setDoctorsLoading(true);
    setDoctorsError('');
    resetSelection();
    try {
      const res = await getDoctorsBySpecialization(trimmed);
      const filtered = res.doctors || [];
      setDoctors(filtered);
      setDoctorsError(filtered.length ? '' : 'No doctors match that specialization.');
    } catch (error) {
      setDoctors([]);
      setDoctorsError(error.message || 'Failed to load doctors.');
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setSnackbar({ open: true, severity: 'error', message: 'Please select doctor, date, and time slot.' });
      return;
    }
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timePattern.test(selectedSlot)) {
      setSnackbar({ open: true, severity: 'error', message: 'Invalid time slot format.' });
      return;
    }
    const today = new Date();
    const picked = new Date(selectedDate);
    if (Number.isNaN(picked.getTime())) {
      setSnackbar({ open: true, severity: 'error', message: 'Invalid date.' });
      return;
    }
    if (picked.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
      setSnackbar({ open: true, severity: 'error', message: 'Please choose a future date.' });
      return;
    }
    const doctorId = selectedDoctor.user?._id || selectedDoctor.user;
    if (!doctorId) {
      setSnackbar({ open: true, severity: 'error', message: 'Selected doctor is missing an ID.' });
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
      setSnackbar({ open: true, severity: 'success', message: 'Appointment booked successfully.' });
      setSlots((prev) => prev.map((s) => s.time === selectedSlot ? { ...s, isBooked: true } : s));
      setSelectedSlot('');
    } catch (error) {
      setSnackbar({ open: true, severity: 'error', message: error.message || 'Booking failed.' });
    } finally {
      setBookingLoading(false);
    }
  };

  const doctorName = selectedDoctor?.user?.full_name || selectedDoctor?.user?.name || '';
  
  const upcomingAppts = appointments.filter(a => a.status !== 'Cancelled' && new Date(a.appointmentDate) >= new Date().setHours(0,0,0,0));
  const nextAppt = upcomingAppts[0];

  const statCards = [
    ['Total Consultations', appointments.length.toString(), 'All-time consultations', `+${appointments.filter(a => new Date(a.createdAt).getMonth() === new Date().getMonth()).length} this month`, c.primary],
    ['Health Records', records.length.toString(), 'Stored medical files', `${records.filter(r => r.type === 'prescription').length} prescriptions`, c.success],
    ['Next Appointment', nextAppt ? fmtDate(nextAppt.appointmentDate.split('T')[0]) : '--', nextAppt ? `${nextAppt.timeSlot} • ${getConsultationStatus(nextAppt).label}` : 'No upcoming dates', nextAppt ? 'Upcoming' : 'N/A', c.warning]
  ];

  return (
    <PatientShell activeItem="dashboard">
      <Box sx={{ minWidth: 0, px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: c.bg, minHeight: '100vh' }}>
        
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between', gap: 3, flexDirection: { xs: 'column', lg: 'row' }, mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: c.text, fontFamily: 'Inter, sans-serif' }}>
              Welcome back, {greetingName}
            </Typography>
            <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 16 }}>
              Here is your central health overview for today.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, color: c.muted, fontSize: 15, fontWeight: 500 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button sx={{ minWidth: 44, width: 44, height: 44, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, color: c.text, position: 'relative' }}>
              <NotificationIcon fontSize="small" />
            </Button>
            <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} sx={{ px: 3, py: 1.25, borderRadius: 2, bgcolor: c.primary, color: '#fff', fontSize: 15, fontWeight: 600, textTransform: 'none', boxShadow: '0 2px 4px rgba(26,115,232,0.2)', '&:hover': { bgcolor: c.primaryDark, boxShadow: '0 4px 6px rgba(26,115,232,0.3)' } }}>
              + Book Appointment
            </Button>
          </Stack>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map(([title, value, subtitle]) => (
            <Grid key={title} size={{ xs: 12, md: 4 }}>
              <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                 <Typography sx={{ fontSize: 14, fontWeight: 600, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</Typography>
                 <Typography sx={{ mt: 1, fontSize: 32, fontWeight: 600, color: c.text }}>{value}</Typography>
                 <Typography sx={{ mt: 1, color: c.muted, fontSize: 14 }}>{subtitle}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Appointments Column */}
          <Grid size={{ xs: 12, xl: 8 }}>
            <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text }}>Upcoming Appointments</Typography>
                <Button onClick={() => navigate('/patient/appointments')} sx={{ color: c.primary, textTransform: 'none', fontSize: 14, fontWeight: 600 }}>View All</Button>
              </Stack>
              
              {appointments.length > 0 ? (
                <Stack spacing={2}>
                   {appointments.slice(0, 5).map((appt) => {
                      const { status: dashStatus, isJoinNear } = getConsultationStatus(appt);
  
                      return (
                          <Box key={appt._id} sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${c.line}`, bgcolor: '#fff' }}>
                             <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                  <Avatar sx={{ bgcolor: c.primarySoft, color: c.primaryDark }}>{initials(appt.doctor?.full_name || appt.doctor?.name || 'DR')}</Avatar>
                                  <Box sx={{ flex: 1 }}>
                                     <Stack direction="row" justifyContent="space-between">
                                        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>Dr. {appt.doctor?.full_name || appt.doctor?.name || 'Doctor'}</Typography>
                                        <Chip label={dashStatus.toUpperCase()} size="small" sx={{ 
                                          height: 20, 
                                          fontSize: 10, 
                                          fontWeight: 700,
                                          bgcolor: dashStatus === 'ongoing' ? c.successSoft : dashStatus === 'missed' ? c.dangerSoft : dashStatus === 'completed' ? c.soft : c.primarySoft,
                                          color: dashStatus === 'ongoing' ? c.success : dashStatus === 'missed' ? c.danger : dashStatus === 'completed' ? c.muted : c.primaryDark 
                                        }} />
                                     </Stack>
                                     <Typography sx={{ fontSize: 13, color: c.muted }}>{appt.specialization} • {fmtDate(appt.appointmentDate.split('T')[0])} at {appt.timeSlot}</Typography>
                                  </Box>
                                </Stack>
                             </Stack>
                             <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {dashStatus === 'upcoming' && (
                                  <>
                                    {isJoinNear ? (
                                      <Button onClick={() => navigate('/patient/consultation')} size="small" variant="contained" startIcon={<VideoIcon />} sx={{ bgcolor: c.primary, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>Join Consultation</Button>
                                    ) : (
                                      <Box sx={{ px: 1.5, py: 0.8, borderRadius: 1.5, bgcolor: c.primarySoft, border: `1px solid ${c.primary}30` }}>
                                         <Typography sx={{ color: c.primaryDark, fontSize: 11, fontWeight: 700 }}>{getConsultationStatus(appt).label}</Typography>
                                      </Box>
                                    )}
                                    <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} size="small" variant="outlined" sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>Reschedule</Button>
                                    <Button onClick={() => setSnackbar({ open: true, severity: 'info', message: 'Cancellation request sent to doctor.' })} size="small" variant="text" sx={{ color: c.danger, fontSize: 11, textTransform: 'none' }}>Cancel Appointment</Button>
                                  </>
                                )}
                                {dashStatus === 'ongoing' && (
                                  <>
                                    <Button onClick={() => navigate('/patient/consultation')} size="small" variant="contained" startIcon={<OngoingIcon />} sx={{ bgcolor: c.success, borderRadius: 1.5, fontSize: 11, textTransform: 'none', '&:hover': { bgcolor: c.success } }}>Join Now</Button>
                                    <Button onClick={() => navigate('/patient/consultation', { state: { openChat: true } })} size="small" variant="outlined" startIcon={<ChatIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>Chat with Doctor</Button>
                                    <Button onClick={() => navigate('/patient/records?tab=upload')} size="small" variant="outlined" startIcon={<UploadIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>Upload Reports</Button>
                                  </>
                                )}
                                {dashStatus === 'completed' && (
                                  <>
                                    <Button onClick={() => navigate('/patient/records')} size="small" variant="outlined" startIcon={<PrescriptionIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>View Prescription</Button>
                                    <Button onClick={() => navigate('/patient/records')} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>View Medical Record</Button>
                                    <Button onClick={() => setSnackbar({ open: true, severity: 'success', message: 'Feedback form will open shortly.' })} size="small" variant="outlined" startIcon={<StarIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>Give Feedback</Button>
                                  </>
                                )}
                                {dashStatus === 'cancelled' && (
                                  <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} size="small" variant="outlined" startIcon={<HistoryIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>Rebook Appointment</Button>
                                )}
                                {dashStatus === 'missed' && (
                                  <>
                                    <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} size="small" variant="outlined" sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>Reschedule</Button>
                                    <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} size="small" variant="contained" sx={{ bgcolor: c.primary, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>Book Again</Button>
                                  </>
                                )}
                             </Box>
                          </Box>
                      );
                   })}
                </Stack>
              ) : (
                <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${c.line}`, borderRadius: 2, bgcolor: c.soft }}>
                  <EventAvailableIcon sx={{ fontSize: 40, color: c.muted, mb: 2 }} />
                  <Typography sx={{ fontSize: 15, color: c.muted, mb: 2 }}>You don't have any upcoming appointments.</Typography>
                  <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} sx={{ color: c.primary, textTransform: 'none', fontSize: 14, fontWeight: 600, border: `1px solid ${c.primary}`, borderRadius: 1.5, px: 3, py: 1 }}>Book Now</Button>
                </Box>
              )}
            </Box>
          </Grid>

          {/* AI Checker Column */}
          <Grid size={{ xs: 12, xl: 4 }}>
            <Box sx={{ p: 4, borderRadius: 2, bgcolor: c.text, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden', height: '100%' }}>
              <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1.5, fontFamily: 'Inter, sans-serif' }}>AI Symptom Checker</Typography>
              <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', mb: 3, lineHeight: 1.5 }}>
                Not sure which specialist to see? Describe your symptoms and get instant guidance.
              </Typography>
              <Button onClick={() => navigate('/symptom-checker')} sx={{ width: '100%', py: 1.25, borderRadius: 1.5, bgcolor: '#ffffff', color: c.text, textTransform: 'none', fontSize: 15, fontWeight: 600, '&:hover': { bgcolor: '#f0f0f0' } }}>
                Start Check
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Health Records & Pharmacies Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Health Records */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text }}>Recent Health Records</Typography>
                <Stack direction="row" spacing={1}>
                  <Button onClick={() => navigate('/patient/records?action=add')} sx={{ color: c.primary, textTransform: 'none', fontSize: 14 }}>Upload</Button>
                  <Button onClick={() => navigate('/patient/records')} sx={{ color: c.primary, textTransform: 'none', fontSize: 14 }}>View All</Button>
                </Stack>
              </Stack>
              <Divider sx={{ mb: 2, borderColor: c.soft }} />
              {records.length > 0 ? (
                 <Stack spacing={1.5}>
                    {records.slice(0,3).map(r => (
                      <Box key={r._id} sx={{ p: 1.5, borderRadius: 1, border: `1px solid ${c.line}`, bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Box>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{r.title}</Typography>
                            <Typography sx={{ fontSize: 12, color: c.muted }}>{r.type.replace('_', ' ')} • {new Date(r.date || r.createdAt).toLocaleDateString()}</Typography>
                         </Box>
                         <ReportIcon sx={{ color: c.primary, fontSize: 20 }} />
                      </Box>
                    ))}
                 </Stack>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <NotesIcon sx={{ fontSize: 40, color: '#d0d0d0', mb: 1.5 }} />
                  <Typography sx={{ color: c.muted, fontSize: 15 }}>No health records found.</Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Nearby Pharmacies */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text }}>Nearby Pharmacies</Typography>
                <Button onClick={() => navigate('/patient/pharmacies')} sx={{ color: c.primary, textTransform: 'none', fontSize: 14 }}>Explore Map</Button>
              </Stack>
              <Divider sx={{ mb: 2, borderColor: c.soft }} />
              {pharmacies.length > 0 ? (
                 <Stack spacing={1.5}>
                    {pharmacies.slice(0,3).map(p => (
                      <Box key={p._id} sx={{ p: 1.5, borderRadius: 1, border: `1px solid ${c.line}`, bgcolor: '#fff' }}>
                         <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{p.pharmacyName || p.user?.full_name || p.user?.name || 'Pharmacy'}</Typography>
                         <Typography sx={{ fontSize: 12, color: c.muted }}>{p.location?.address || p.address || 'Address not listed'}</Typography>
                      </Box>
                    ))}
                 </Stack>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <PlaceIcon sx={{ fontSize: 40, color: '#d0d0d0', mb: 1.5 }} />
                  <Typography sx={{ color: c.muted, fontSize: 15 }}>No nearby pharmacies available in your area.</Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Booking Section */}
        <Box ref={bookingRef} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: c.text }}>Book a Consultation</Typography>
            <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 15 }}>Find the right doctor, choose a date, and select an available time.</Typography>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
            <TextField label="Search Specialization" placeholder="e.g., Cardiologist, Dermatologist" value={specialization} onChange={(e) => setSpecialization(e.target.value)} fullWidth size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
            <Button variant="contained" onClick={handleApplyFilter} disabled={doctorsLoading} sx={{ minWidth: 160, borderRadius: 1.5, bgcolor: c.primary, textTransform: 'none', fontSize: 15, fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: c.primaryDark, boxShadow: 'none' } }}>{doctorsLoading ? 'Searching...' : 'Search'}</Button>
          </Stack>

          {doctorsError && <Typography sx={{ mb: 3, color: c.danger, fontSize: 15 }}>{doctorsError}</Typography>}

          <Grid container spacing={4}>
            {/* Doctors List */}
            <Grid size={{ xs: 12, lg: 7, xl: 8 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 2.5, color: c.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step 1: Select a Doctor</Typography>
              {doctorsLoading ? (
                <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress size={28} sx={{ color: c.primary }} /></Box>
              ) : doctors.length === 0 ? (
                <Box sx={{ py: 4, px: 3, borderRadius: 1.5, bgcolor: c.soft, border: `1px dashed ${c.line}`, textAlign: 'center' }}>
                  <Typography sx={{ color: c.muted, fontSize: 15 }}>No doctors match your search. Try another specialization.</Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {doctors.map((doctor) => {
                    const name = doctor.user?.full_name || doctor.user?.name || 'Doctor';
                    const rating = doctor.rating && Number(doctor.rating) > 0 ? Number(doctor.rating).toFixed(1) : 'Not rated';
                    const availability = doctor.availability?.length ? doctor.availability.slice(0, 2).map((entry) => `${entry?.day || 'Day'}: ${Array.isArray(entry?.slots) && entry.slots.length ? entry.slots.join(', ') : 'No slots'}`).join(' | ') : 'Check slots when selecting date';
                    const selected = selectedDoctor?._id === doctor._id;
                    return (
                      <Box key={doctor._id} sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${selected ? c.primary : c.line}`, bgcolor: selected ? c.primarySoft : '#fff', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { borderColor: c.primary, bgcolor: selected ? c.primarySoft : '#fafafa' } }} onClick={() => {
                        if (selected) { resetSelection(); return; }
                        setSelectedDoctor(doctor); setSelectedDate(''); setSlots([]); setSelectedSlot('');
                      }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 50, height: 50, bgcolor: selected ? c.primary : c.soft, color: selected ? '#fff' : c.muted, fontWeight: 600 }}>{initials(name)}</Avatar>
                            <Box>
                              <Typography sx={{ fontSize: 16, fontWeight: 600, color: c.text }}>{name}</Typography>
                              <Typography sx={{ color: c.muted, fontSize: 14 }}>{doctor.specialization || 'Specialist'}</Typography>
                              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                <Typography sx={{ color: c.muted, fontSize: 13 }}>⭐ {rating}</Typography>
                                <Typography sx={{ color: c.muted, fontSize: 13 }}>🕒 {availability}</Typography>
                              </Stack>
                            </Box>
                          </Stack>
                          <Button 
                            variant={selected ? "contained" : "outlined"}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selected) { resetSelection(); return; }
                              setSelectedDoctor(doctor); setSelectedDate(''); setSlots([]); setSelectedSlot('');
                            }} 
                            sx={{ minWidth: 100, borderRadius: 1.5, py: 0.75, textTransform: 'none', fontSize: 14, fontWeight: 600, borderColor: selected ? 'transparent' : c.line, color: selected ? '#fff' : c.text, bgcolor: selected ? c.primary : 'transparent', boxShadow: 'none', '&:hover': { boxShadow: 'none', bgcolor: selected ? c.primaryDark : c.soft, borderColor: selected ? 'transparent' : c.line } }}
                           >
                            {selected ? 'Selected' : 'Select'}
                          </Button>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Grid>

            {/* Date and Slot Selection */}
            <Grid size={{ xs: 12, lg: 5, xl: 4 }}>
               <Box sx={{ p: 3, borderRadius: 1.5, border: `1px solid ${c.line}`, bgcolor: c.bg, alignSelf: 'start' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 2.5, color: c.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step 2: Choose Slot</Typography>
                  
                  {selectedDoctor ? (
                    <>
                      <Box sx={{ mb: 3, p: 2, bgcolor: '#fff', borderRadius: 1.5, border: `1px solid ${c.soft}` }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 600, color: c.text }}>{doctorName}</Typography>
                        <Typography sx={{ color: c.muted, fontSize: 14 }}>{selectedDoctor.specialization || 'Specialist'}</Typography>
                        {selectedDoctor.consultationFee && <Typography sx={{ mt: 1, color: c.text, fontSize: 14, fontWeight: 500 }}>Fee: Rs. {selectedDoctor.consultationFee}</Typography>}
                      </Box>
  
                      <TextField label="Select Date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} fullWidth size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#fff' } }} />
                      
                      <Box sx={{ mt: 3 }}>
                        <Typography sx={{ mb: 1.5, fontSize: 14, fontWeight: 600, color: c.muted }}>Available Times</Typography>
                        {slotsLoading ? (
                          <CircularProgress size={24} sx={{ color: c.primary }} />
                        ) : slots.length === 0 ? (
                          <Typography sx={{ color: c.danger, fontSize: 14, bgcolor: c.dangerSoft, p: 1.5, borderRadius: 1.5 }}>
                            {selectedDate ? 'No slots available for this date.' : 'Pick a date to view available time slots.'}
                          </Typography>
                        ) : (
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {slots.map((slot) => ( <Chip key={slot.time} label={slot.time} disabled={slot.isBooked} 
                                clickable 
                                onClick={() => setSelectedSlot(slot.time)} 
                                sx={{ 
                                  bgcolor: selectedSlot === slot.time ? c.primary : '#fff', 
                                  color: selectedSlot === slot.time ? '#fff' : c.text, 
                                  border: `1px solid ${selectedSlot === slot.time ? c.primary : c.line}`, 
                                  borderRadius: 1.5,
                                  fontSize: 14,
                                  fontWeight: 500,
                                  py: 2,
                                  px: 0.5,
                                  '&:hover': { bgcolor: selectedSlot === slot.time ? c.primaryDark : c.soft, color: selectedSlot === slot.time ? '#fff' : c.text }
                                }} 
                              />
                            ))}
                          </Stack>
                        )}
                      </Box>
                      
                      <Button variant="contained" onClick={handleBookAppointment} disabled={bookingLoading || !selectedDate || !selectedSlot} sx={{ mt: 4, width: '100%', py: 1.5, borderRadius: 1.5, bgcolor: c.primary, textTransform: 'none', fontSize: 15, fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: c.primaryDark, boxShadow: 'none' } }}>
                        {bookingLoading ? 'Confirming...' : 'Confirm Appointment'}
                      </Button>
                    </>
                  ) : (
                    <Box sx={{ py: 4, px: 3, borderRadius: 1.5, bgcolor: c.soft, border: `1px dashed ${c.line}`, textAlign: 'center' }}>
                       <Typography sx={{ color: c.muted, fontSize: 14, lineHeight: 1.6 }}>Please select a doctor from the list first to view available dates and times.</Typography>
                    </Box>
                  )}
               </Box>
            </Grid>
          </Grid>
        </Box>
        
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PatientShell>
  );
}

export default PatientDashboard;
