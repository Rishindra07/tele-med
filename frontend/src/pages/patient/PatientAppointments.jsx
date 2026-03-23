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
  Alert
} from '@mui/material';
import {
  AccessTimeRounded as TimeIcon,
  CalendarMonthRounded as CalendarIcon,
  NotificationsNoneRounded as NotificationIcon,
  SearchRounded as SearchIcon,
  VideocamOutlined as VideoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PatientShell from '../../components/patient/PatientShell';
import { fetchMyAppointments, cancelAppointment } from '../../api/patientApi';

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

const normalizeStatus = (status = '') => {
  const value = String(status).toLowerCase();
  if (value.includes('complete')) return 'completed';
  if (value.includes('cancel')) return 'cancelled';
  if (value.includes('follow')) return 'follow-up';
  if (value.includes('confirm')) return 'confirmed';
  if (value.includes('schedule')) return 'upcoming';
  return 'upcoming';
};

const getStatusTone = (status) => {
  status = normalizeStatus(status);
  if (status === 'confirmed' || status === 'upcoming') return [colors.primary, colors.primarySoft];
  if (status === 'completed') return [colors.gray, colors.soft];
  if (status === 'follow-up') return [colors.warning, colors.warningSoft];
  if (status === 'cancelled') return [colors.danger, colors.dangerSoft];
  return [colors.muted, colors.soft];
};

function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [error, setError] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const normalizedAppointments = useMemo(() => {
    return appointments.map((appointment, index) => {
      const status = normalizeStatus(appointment.status);
      const specialization = appointment.specialization || 'General Physician';
      return {
        id: appointment._id || `appointment-${index}`,
        doctorName: appointment.doctor?.name || 'Doctor',
        specialization,
        dateLabel: formatDateLabel(appointment.appointmentDate),
        timeLabel: appointment.timeSlot || 'Time pending',
        status,
        notes:
          status === 'completed'
            ? 'Prescription issued'
            : status === 'follow-up'
              ? 'Reason: Follow-up consultation'
              : status === 'cancelled'
                ? 'This appointment has been cancelled'
                : 'Video call',
        category:
          status === 'completed'
            ? 'completed'
            : status === 'cancelled'
              ? 'cancelled'
              : status === 'follow-up'
                ? 'follow-up'
                : 'upcoming'
      };
    });
  }, [appointments]);

  const specializationOptions = useMemo(() => {
    const items = Array.from(new Set(normalizedAppointments.map((item) => item.specialization).filter(Boolean)));
    return ['all', ...items];
  }, [normalizedAppointments]);

  const filteredAppointments = useMemo(() => {
    return normalizedAppointments.filter((appointment) => {
      const filterMatch = activeFilter === 'all' || appointment.category === activeFilter;
      const specializationMatch =
        specializationFilter === 'all' || appointment.specialization === specializationFilter;
      const queryMatch =
        !query.trim() ||
        appointment.doctorName.toLowerCase().includes(query.toLowerCase()) ||
        appointment.specialization.toLowerCase().includes(query.toLowerCase());

      return filterMatch && specializationMatch && queryMatch;
    });
  }, [activeFilter, normalizedAppointments, query, specializationFilter]);

  const groupedAppointments = {
    upcoming: filteredAppointments.filter((item) => item.category === 'upcoming' || item.category === 'follow-up'),
    completed: filteredAppointments.filter((item) => item.category === 'completed'),
    cancelled: filteredAppointments.filter((item) => item.category === 'cancelled')
  };

  const counts = useMemo(() => {
    const upcoming = normalizedAppointments.filter((item) => item.category === 'upcoming').length;
    const completed = normalizedAppointments.filter((item) => item.category === 'completed').length;
    const followUp = normalizedAppointments.filter((item) => item.category === 'follow-up').length;
    const cancelled = normalizedAppointments.filter((item) => item.category === 'cancelled').length;
    return { upcoming, completed, followUp, cancelled };
  }, [normalizedAppointments]);

  const summaryCards = [
    ['Upcoming', counts.upcoming || 0, 'Scheduled consultations'],
    ['Completed', counts.completed || 0, 'Total done'],
    ['Follow-ups', counts.followUp || 0, 'Pending follow-up'],
    ['Cancelled', counts.cancelled || 0, 'Missed or cancelled']
  ];

  const renderAppointmentCard = (appointment) => {
    const [accent, badgeBg] = getStatusTone(appointment.status);
    const isCompleted = appointment.category === 'completed';
    const isFollowUp = appointment.category === 'follow-up';
    const isCancelled = appointment.category === 'cancelled';

    return (
      <Box
        key={appointment.id}
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
        <Box sx={{ position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: accent }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="flex-start">
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 1.5,
              bgcolor: badgeBg,
              color: accent,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 600,
              fontSize: 20,
              flexShrink: 0
            }}
          >
            {getInitials(appointment.doctorName)}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: colors.text }}>
                  Dr. {appointment.doctorName}
                </Typography>
                <Typography sx={{ color: colors.muted, fontSize: 14 }}>
                  {appointment.specialization}
                </Typography>
              </Box>
              <Chip
                label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                sx={{
                  height: 26,
                  bgcolor: badgeBg,
                  color: accent,
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 1
                }}
              />
            </Stack>

            <Stack direction="row" spacing={3} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <CalendarIcon sx={{ fontSize: 16, color: colors.muted }} />
                <Typography sx={{ color: colors.muted, fontSize: 14, fontWeight: 500 }}>{appointment.dateLabel}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <TimeIcon sx={{ fontSize: 16, color: colors.muted }} />
                <Typography sx={{ color: colors.muted, fontSize: 14, fontWeight: 500 }}>{appointment.timeLabel}</Typography>
              </Stack>
              {!isCompleted && !isCancelled && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <VideoIcon sx={{ fontSize: 16, color: colors.muted }} />
                  <Typography sx={{ color: colors.muted, fontSize: 14, fontWeight: 500 }}>Video call</Typography>
                </Stack>
              )}
            </Stack>

            <Box
              sx={{
                mt: 2,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                display: 'inline-block',
                bgcolor: colors.soft,
                color: colors.muted,
                fontSize: 13,
                fontWeight: 500
              }}
            >
              Notes: {appointment.notes}
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
              {isCompleted ? (
                <>
                  <Button variant="outlined" sx={{ borderRadius: 1.5, borderColor: colors.line, color: colors.text, textTransform: 'none', py: 0.75 }}>
                    View Prescription
                  </Button>
                  <Button variant="contained" onClick={() => navigate('/patient')} sx={{ borderRadius: 1.5, bgcolor: colors.primary, boxShadow: 'none', textTransform: 'none', py: 0.75, '&:hover': { bgcolor: colors.primaryDark, boxShadow: 'none' } }}>
                    Book Follow-up
                  </Button>
                </>
              ) : isFollowUp ? (
                <>
                  <Button variant="outlined" sx={{ borderRadius: 1.5, borderColor: colors.line, color: colors.text, textTransform: 'none', py: 0.75 }}>
                    View Past Notes
                  </Button>
                  <Button variant="contained" sx={{ borderRadius: 1.5, bgcolor: colors.primary, boxShadow: 'none', textTransform: 'none', py: 0.75, '&:hover': { bgcolor: colors.primaryDark, boxShadow: 'none' } }}>
                    Join Consultation
                  </Button>
                </>
              ) : isCancelled ? (
                <Button variant="outlined" disabled sx={{ borderRadius: 1.5, textTransform: 'none', py: 0.75 }}>
                  Cancelled
                </Button>
              ) : (
                <>
                  <Button variant="contained" sx={{ borderRadius: 1.5, bgcolor: colors.primary, boxShadow: 'none', textTransform: 'none', py: 0.75, '&:hover': { bgcolor: colors.primaryDark, boxShadow: 'none' } }}>
                    Join Consultation
                  </Button>
                  <Button variant="outlined" sx={{ borderRadius: 1.5, borderColor: colors.line, color: colors.text, textTransform: 'none', py: 0.75 }}>
                    Reschedule
                  </Button>
                  <Button onClick={() => handleCancel(appointment.id)} sx={{ borderRadius: 1.5, color: colors.danger, textTransform: 'none', py: 0.75 }}>
                    Cancel
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>
    );
  };

  return (
    <PatientShell activeItem="appointments">
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: colors.text, fontFamily: 'Inter, sans-serif' }}>
              Appointments
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16 }}>
              Manage your upcoming schedule and past consultations.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Button
              onClick={() => navigate('/patient')}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: 2,
                bgcolor: colors.primary,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: '0 2px 4px rgba(26,115,232,0.2)',
                '&:hover': { bgcolor: colors.primaryDark, boxShadow: '0 4px 6px rgba(26,115,232,0.3)' }
              }}
            >
              + Book Appointment
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 4
          }}
        >
          {summaryCards.map(([title, value, subtitle]) => (
            <Box
              key={title}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${colors.line}`,
                bgcolor: colors.paper,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</Typography>
              <Typography sx={{ mt: 1, fontSize: 32, fontWeight: 600, color: colors.text }}>{value}</Typography>
              <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14 }}>{subtitle}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ bgcolor: colors.paper, p: 3, borderRadius: 2, border: `1px solid ${colors.line}`, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
             <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
               {[
                 ['all', 'All'],
                 ['upcoming', 'Upcoming'],
                 ['completed', 'Completed'],
                 ['follow-up', 'Follow-up'],
                 ['cancelled', 'Cancelled']
               ].map(([value, label]) => (
                 <Chip
                   key={value}
                   label={label}
                   clickable
                   onClick={() => setActiveFilter(value)}
                   sx={{
                     px: 1,
                     py: 2,
                     borderRadius: 1.5,
                     border: `1px solid ${activeFilter === value ? colors.primary : colors.line}`,
                     bgcolor: activeFilter === value ? colors.primary : '#fff',
                     color: activeFilter === value ? '#fff' : colors.muted,
                     fontSize: 14,
                     fontWeight: 500,
                     '&:hover': { bgcolor: activeFilter === value ? colors.primaryDark : colors.soft }
                   }}
                 />
               ))}
             </Stack>

             <Stack direction="row" spacing={1.5}>
               <TextField
                 placeholder="Search doctor..."
                 value={query}
                 onChange={(event) => setQuery(event.target.value)}
                 size="small"
                 sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                 InputProps={{
                   startAdornment: (
                     <InputAdornment position="start">
                       <SearchIcon fontSize="small" sx={{ color: colors.muted }} />
                     </InputAdornment>
                   )
                 }}
               />
               <TextField
                 select
                 value={specializationFilter}
                 onChange={(event) => setSpecializationFilter(event.target.value)}
                 size="small"
                 sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
               >
                 <MenuItem value="all">Every Specialization</MenuItem>
                 {specializationOptions
                   .filter((item) => item !== 'all')
                   .map((item) => (
                     <MenuItem key={item} value={item}>
                       {item}
                     </MenuItem>
                   ))}
               </TextField>
             </Stack>
          </Stack>

          {loading ? (
            <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
              <CircularProgress size={30} sx={{ color: colors.primary }} />
            </Box>
          ) : filteredAppointments.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center', bgcolor: colors.soft, borderRadius: 2, border: `1px dashed ${colors.line}` }}>
               <CalendarIcon sx={{ fontSize: 48, color: colors.gray, mb: 2 }} />
               <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 500 }}>No appointments found</Typography>
               <Typography sx={{ color: colors.muted, fontSize: 14, mt: 1 }}>{query || activeFilter !== 'all' ? 'Try adjusting your search or filters.' : 'You have not booked any appointments yet.'}</Typography>
               {!(query || activeFilter !== 'all') && (
                 <Button onClick={() => navigate('/patient')} variant="outlined" sx={{ mt: 3, borderRadius: 1.5, borderColor: colors.primary, color: colors.primary, textTransform: 'none', fontWeight: 600 }}>
                   Book an Appointment
                 </Button>
               )}
            </Box>
          ) : (
            <Stack spacing={4}>
              {groupedAppointments.upcoming.length > 0 && (
                <Box>
                  <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 600, mb: 2, borderBottom: `1px solid ${colors.line}`, pb: 1 }}>Upcoming & Follow-up</Typography>
                  <Stack spacing={2}>{groupedAppointments.upcoming.map(renderAppointmentCard)}</Stack>
                </Box>
              )}
              {groupedAppointments.completed.length > 0 && (
                <Box>
                  <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 600, mb: 2, borderBottom: `1px solid ${colors.line}`, pb: 1 }}>Completed</Typography>
                  <Stack spacing={2}>{groupedAppointments.completed.map(renderAppointmentCard)}</Stack>
                </Box>
              )}
              {groupedAppointments.cancelled.length > 0 && (
                <Box>
                  <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 600, mb: 2, borderBottom: `1px solid ${colors.line}`, pb: 1 }}>Cancelled</Typography>
                  <Stack spacing={2}>{groupedAppointments.cancelled.map(renderAppointmentCard)}</Stack>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PatientShell>
  );
}

export default PatientAppointments;
