import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';

import {
  AccessTimeRounded as TimeIcon,
  CalendarMonthRounded as CalendarIcon,
  NotificationsNoneRounded as NotificationIcon,
  SearchRounded as SearchIcon,
  VideocamRounded as VideoIcon,
  ChatBubbleOutlineRounded as ChatIcon,
  FileUploadOutlined as UploadIcon,
  StarOutlineRounded as StarIcon,
  HistoryRounded as HistoryIcon,
  VisibilityOutlined as ViewIcon,
  ReceiptLongRounded as PrescriptionIcon,
  PlayCircleFilledRounded as OngoingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PatientShell from '../../components/patient/PatientShell';
import { fetchMyAppointments, cancelAppointment, rescheduleAppointment, fetchDoctorSlots } from '../../api/patientApi';
import { getConsultationStatus } from '../../utils/consultationUtils';

const colors = {
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
  dangerSoft: '#fce8e6',
  gray: '#9aa0a6'
};

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'DR';

const formatDateLabel = (value) => {
  if (!value) return 'Date pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [error, setError] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetchMyAppointments();
      if (res.success) setAppointments(res.appointments || []);
    } catch (err) {
      setError(true);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await cancelAppointment(id);
      if (res.success) {
        setSnackbar({ open: true, message: 'Appointment cancelled successfully', severity: 'success' });
        fetchAppointments();
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to cancel appointment', severity: 'error' });
    }
  };

  const handleRescheduleOpen = (appointment) => {
    setSelectedAppt(appointment);
    setNewDate('');
    setNewSlot('');
    setAvailableSlots([]);
    setRescheduleOpen(true);
  };

  const handleRescheduleClose = () => {
    setRescheduleOpen(false);
    setSelectedAppt(null);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedAppt) return;
    try {
      const res = await rescheduleAppointment(selectedAppt.id, { date: newDate, slot: newSlot });
      if (res.success) {
        setSnackbar({ open: true, message: 'Appointment rescheduled', severity: 'success' });
        fetchAppointments();
        handleRescheduleClose();
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to reschedule', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const getSlots = async () => {
      if (!newDate || !selectedAppt?.doctorId) return;
      setSlotsLoading(true);
      try {
        const res = await fetchDoctorSlots(selectedAppt.doctorId, newDate);
        if (res.success) {
          setAvailableSlots(res.slots || []);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    getSlots();
  }, [newDate, selectedAppt]);

  const normalizedAppointments = useMemo(() => {
    return appointments.map((appointment, index) => {
      const { status: callStatus, label: callLabel, isJoinNear } = getConsultationStatus(appointment);
      return {
        ...appointment,
        id: appointment._id || `appointment-${index}`,
        doctorId: appointment.doctor?._id || appointment.doctor,
        doctorName: appointment.doctor?.full_name || appointment.doctor?.name || 'Doctor',
        specialization: appointment.specialization || 'General Physician',
        dateLabel: formatDateLabel(appointment.appointmentDate),
        timeLabel: appointment.timeSlot || 'Time pending',
        callStatus,
        callLabel,
        isJoinNear
      };
    });
  }, [appointments]);

  const specializationOptions = useMemo(() => {
    const items = Array.from(new Set(normalizedAppointments.map((item) => item.specialization).filter(Boolean)));
    return ['all', ...items];
  }, [normalizedAppointments]);

  const filteredAppointments = useMemo(() => {
    return normalizedAppointments.filter((appointment) => {
      const filterMatch = activeFilter === 'all' || appointment.callStatus === activeFilter;
      const specializationMatch =
        specializationFilter === 'all' || appointment.specialization === specializationFilter;
      const queryMatch =
        !query.trim() ||
        appointment.doctorName.toLowerCase().includes(query.toLowerCase()) ||
        appointment.specialization.toLowerCase().includes(query.toLowerCase());

      return filterMatch && specializationMatch && queryMatch;
    });
  }, [activeFilter, normalizedAppointments, query, specializationFilter]);

  const grouped = {
    ongoing: filteredAppointments.filter((item) => item.callStatus === 'ongoing'),
    upcoming: filteredAppointments.filter((item) => item.callStatus === 'upcoming'),
    completed: filteredAppointments.filter((item) => item.callStatus === 'completed'),
    cancelled: filteredAppointments.filter((item) => item.callStatus === 'cancelled'),
    missed: filteredAppointments.filter((item) => item.callStatus === 'missed')
  };

  const renderAppointmentCard = (a) => {
    const { callStatus: dashStatus, isJoinNear } = a;

    return (
      <Box
        key={a.id}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: `1px solid ${colors.line}`,
          bgcolor: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <Box sx={{ position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: dashStatus === 'ongoing' ? colors.success : dashStatus === 'missed' ? colors.danger : colors.primary }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="flex-start">
          <Avatar sx={{ width: 52, height: 52, borderRadius: 1.5, bgcolor: colors.primarySoft, color: colors.primaryDark, fontWeight: 600 }}>{getInitials(a.doctorName)}</Avatar>

          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: colors.text }}>
                  Dr. {a.doctorName}
                </Typography>
                <Typography sx={{ color: colors.muted, fontSize: 14 }}>
                  {a.specialization}
                </Typography>
              </Box>
              <Chip
                label={dashStatus.toUpperCase()}
                sx={{
                  height: 24,
                  bgcolor: dashStatus === 'ongoing' ? colors.successSoft : dashStatus === 'missed' ? colors.dangerSoft : colors.primarySoft,
                  color: dashStatus === 'ongoing' ? colors.success : dashStatus === 'missed' ? colors.danger : colors.primaryDark,
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 1
                }}
              />
            </Stack>

            <Stack direction="row" spacing={3} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <CalendarIcon sx={{ fontSize: 16, color: colors.muted }} />
                <Typography sx={{ color: colors.muted, fontSize: 14, fontWeight: 500 }}>{a.dateLabel}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <TimeIcon sx={{ fontSize: 16, color: colors.muted }} />
                <Typography sx={{ color: colors.muted, fontSize: 14, fontWeight: 500 }}>{a.timeLabel}</Typography>
              </Stack>
            </Stack>

            <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {dashStatus === 'upcoming' && (
                <>
                  {isJoinNear ? (
                    <Button onClick={() => navigate('/patient/consultation')} size="small" variant="contained" startIcon={<VideoIcon />} sx={{ bgcolor: colors.primary, borderRadius: 1.5, px: 2, textTransform: 'none' }}>Join Consultation</Button>
                  ) : (
                    <Box sx={{ px: 2, py: 0.8, borderRadius: 1.5, bgcolor: colors.primarySoft, border: `1px solid ${colors.primary}30` }}>
                       <Typography sx={{ color: colors.primaryDark, fontSize: 13, fontWeight: 700 }}>{a.callLabel}</Typography>
                    </Box>
                  )}
                  <Button size="small" onClick={() => handleRescheduleOpen(a)} variant="outlined" sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, px: 2, textTransform: 'none' }}>Reschedule</Button>
                  <Button size="small" onClick={() => handleCancel(a.id)} variant="text" sx={{ color: colors.danger, textTransform: 'none' }}>Cancel Appointment</Button>
                </>
              )}
              {dashStatus === 'ongoing' && (
                <>
                  <Button onClick={() => navigate('/patient/consultation')} size="small" variant="contained" startIcon={<OngoingIcon />} sx={{ bgcolor: colors.success, borderRadius: 1.5, px: 2, textTransform: 'none', '&:hover': { bgcolor: colors.success } }}>Join Now</Button>
                  <Button onClick={() => navigate('/patient/consultation', { state: { openChat: true } })} size="small" variant="outlined" startIcon={<ChatIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, px: 2, textTransform: 'none' }}>Chat with Doctor</Button>
                  <Button onClick={() => navigate('/patient/records?tab=upload')} size="small" variant="outlined" startIcon={<UploadIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, px: 2, textTransform: 'none' }}>Upload Reports</Button>
                </>
              )}
              {dashStatus === 'completed' && (
                <>
                  <Button onClick={() => navigate('/patient/records')} size="small" variant="outlined" startIcon={<PrescriptionIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, px: 2, textTransform: 'none' }}>View Prescription</Button>
                  <Button onClick={() => navigate('/patient/records')} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, px: 2, textTransform: 'none' }}>View Records</Button>
                  <Button onClick={() => setSnackbar({ open: true, severity: 'success', message: 'Review form will be available soon.' })} size="small" variant="outlined" startIcon={<StarIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, px: 2, textTransform: 'none' }}>Give Feedback</Button>
                </>
              )}
              {dashStatus === 'cancelled' && (
                <Button onClick={() => navigate('/patient/appointments')} size="small" variant="outlined" startIcon={<HistoryIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, px: 2, textTransform: 'none' }}>Rebook Appointment</Button>
              )}
              {dashStatus === 'missed' && (
                <>
                  <Button onClick={() => handleRescheduleOpen(a)} size="small" variant="outlined" sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, px: 2, textTransform: 'none' }}>Reschedule</Button>
                  <Button onClick={() => navigate('/patient/appointments')} size="small" variant="contained" sx={{ bgcolor: colors.primary, borderRadius: 1.5, px: 2, textTransform: 'none' }}>Book Again</Button>
                </>
              )}
            </Box>
          </Box>
        </Stack>
      </Box>
    );
  };

  return (
    <PatientShell activeItem="appointments">
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: colors.text, fontFamily: 'Inter, sans-serif' }}>
              Appointments
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16 }}>
              Manage your upcoming schedule and past consultations.
            </Typography>
          </Box>
          <Button onClick={() => navigate('/patient')} sx={{ px: 3, py: 1.25, borderRadius: 2, bgcolor: colors.primary, color: '#fff', textTransform: 'none', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 4px rgba(26,115,232,0.2)', '&:hover': { bgcolor: colors.primaryDark } }}>
            + Book Appointment
          </Button>
        </Stack>

        <Box sx={{ bgcolor: colors.paper, p: 3, borderRadius: 2, border: `1px solid ${colors.line}`, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
             <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
               {[['all', 'All'], ['upcoming', 'Upcoming'], ['ongoing', 'Ongoing'], ['completed', 'Completed'], ['missed', 'Missed'], ['cancelled', 'Cancelled']].map(([value, label]) => (
                 <Chip
                   key={value}
                   label={label}
                   clickable
                   onClick={() => setActiveFilter(value)}
                   sx={{
                     px: 1, py: 2, borderRadius: 1.5,
                     border: `1px solid ${activeFilter === value ? colors.primary : colors.line}`,
                     bgcolor: activeFilter === value ? colors.primary : '#fff',
                     color: activeFilter === value ? '#fff' : colors.muted,
                     fontSize: 14, fontWeight: 500
                   }}
                 />
               ))}
             </Stack>

             <Stack direction="row" spacing={1.5}>
               <TextField
                 placeholder="Search doctor..."
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 size="small"
                 sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                 InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: colors.muted }} /></InputAdornment> }}
               />
             </Stack>
          </Stack>

          {loading ? (
            <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress size={30} sx={{ color: colors.primary }} /></Box>
          ) : filteredAppointments.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center', bgcolor: colors.soft, borderRadius: 2, border: `1px dashed ${colors.line}` }}>
               <CalendarIcon sx={{ fontSize: 48, color: colors.gray, mb: 2 }} />
               <Typography sx={{ color: colors.text, fontSize: 16 }}>No appointments found</Typography>
            </Box>
          ) : (
            <Stack spacing={4}>
              {(grouped.ongoing.length > 0 || grouped.upcoming.length > 0) && (
                <Box>
                  <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 600, mb: 2, borderBottom: `1px solid ${colors.line}`, pb: 1 }}>Live & Upcoming</Typography>
                  <Stack spacing={2}>{[...grouped.ongoing, ...grouped.upcoming].map(renderAppointmentCard)}</Stack>
                </Box>
              )}
              {grouped.completed.length > 0 && (
                <Box>
                  <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 600, mb: 2, borderBottom: `1px solid ${colors.line}`, pb: 1 }}>Completed</Typography>
                  <Stack spacing={2}>{grouped.completed.map(renderAppointmentCard)}</Stack>
                </Box>
              )}
              {grouped.missed.length > 0 && (
                <Box>
                  <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 600, mb: 2, borderBottom: `1px solid ${colors.line}`, pb: 1 }}>Missed</Typography>
                  <Stack spacing={2}>{grouped.missed.map(renderAppointmentCard)}</Stack>
                </Box>
              )}
              {grouped.cancelled.length > 0 && (
                <Box>
                  <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 600, mb: 2, borderBottom: `1px solid ${colors.line}`, pb: 1 }}>Cancelled</Typography>
                  <Stack spacing={2}>{grouped.cancelled.map(renderAppointmentCard)}</Stack>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={rescheduleOpen} onClose={handleRescheduleClose}>
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="New Date" type="date" InputLabelProps={{ shrink: true }} value={newDate} onChange={(e) => setNewDate(e.target.value)} fullWidth />
          {newDate && (
             <Box>
                {slotsLoading ? <CircularProgress size={24} /> : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {availableSlots.map(s => <Chip key={s.time} label={s.time} clickable disabled={s.isBooked} onClick={() => setNewSlot(s.time)} sx={{ bgcolor: newSlot === s.time ? colors.primary : '#fff', color: newSlot === s.time ? '#fff' : colors.text }} />)}
                  </Stack>
                )}
             </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRescheduleClose}>Cancel</Button>
          <Button onClick={handleRescheduleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </PatientShell>
  );
}

export default PatientAppointments;
