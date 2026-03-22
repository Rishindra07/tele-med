import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography
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
import { getMyAppointments } from '../../api/appointmentApi';

const colors = {
  paper: '#fffdf8',
  line: '#d8d0c4',
  soft: '#e7dfd3',
  muted: '#8a857d',
  text: '#2c2b28',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  amber: '#d18a1f',
  amberSoft: '#fbefdc',
  gray: '#8b8b8b',
  graySoft: '#f1eee7',
  lime: '#7aa63d',
  red: '#d9635b'
};

const fallbackAppointments = [
  {
    id: 'upcoming-1',
    doctorName: 'Dr. Priya Sharma',
    specialization: 'General Physician',
    dateLabel: 'Mon, 23 Mar 2026',
    timeLabel: '10:00 AM',
    status: 'confirmed',
    notes: 'Session opens in 18 hrs',
    category: 'upcoming'
  },
  {
    id: 'followup-1',
    doctorName: 'Dr. Manish Rao',
    specialization: 'Cardiologist',
    dateLabel: 'Fri, 27 Mar 2026',
    timeLabel: '3:30 PM',
    status: 'follow-up',
    notes: 'Reason: Hypertension follow-up check · Ref: Consultation 2 Mar',
    category: 'follow-up'
  },
  {
    id: 'completed-1',
    doctorName: 'Dr. Priya Sharma',
    specialization: 'General Physician',
    dateLabel: 'Tue, 18 Mar 2026',
    timeLabel: '11:00 AM',
    status: 'completed',
    notes: 'Prescription issued',
    category: 'completed'
  },
  {
    id: 'completed-2',
    doctorName: 'Dr. Manish Rao',
    specialization: 'Cardiologist',
    dateLabel: 'Mon, 2 Mar 2026',
    timeLabel: '4:00 PM',
    status: 'completed',
    notes: 'Prescription issued',
    category: 'completed'
  }
];

const reminders = [
  ['SMS reminder - Dr. Priya Sharma consultation', 'Tomorrow', colors.green],
  ['Push alert - Join session link sent', 'Tomorrow', colors.blue],
  ['Follow-up reminder - Dr. Manish Rao', '24 Mar', colors.amber],
  ['Prescription expiry - Amoxicillin course ends', '25 Mar', colors.gray]
];

const quickBookOptions = [
  'General Physician',
  'Cardiologist',
  'Dentist',
  'Eye Specialist',
  'Neurologist',
  'Gynaecologist'
];

const monthDays = [
  ['', '', '', '', '', '', ''],
  ['23', '24', '25', '26', '27', '28', ''],
  ['2', '3', '4', '5', '6', '7', '8'],
  ['9', '10', '11', '12', '13', '14', '15'],
  ['16', '17', '18', '19', '20', '21', '22'],
  ['23', '24', '25', '26', '27', '28', '29'],
  ['30', '31', '', '', '', '', '']
];

const markedDays = new Set(['3', '18', '23', '27']);

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
  const value = status.toLowerCase();
  if (value.includes('complete')) return 'completed';
  if (value.includes('cancel')) return 'cancelled';
  if (value.includes('follow')) return 'follow-up';
  if (value.includes('confirm')) return 'confirmed';
  return 'upcoming';
};

const getStatusTone = (status) => {
  if (status === 'confirmed' || status === 'upcoming') return [colors.green, colors.greenSoft];
  if (status === 'completed') return [colors.gray, colors.graySoft];
  if (status === 'follow-up') return [colors.blue, colors.blueSoft];
  if (status === 'cancelled') return [colors.lime, '#eef6de'];
  return [colors.amber, colors.amberSoft];
};

function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');

  const fetchAppointments = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getMyAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      setError(true);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const normalizedAppointments = useMemo(() => {
    if (!appointments.length) return fallbackAppointments;

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
    ['Upcoming', counts.upcoming || 2, 'Scheduled this week', 'Next: tomorrow 10 AM', colors.green],
    ['Completed', counts.completed || 10, 'This year', 'Last: 18 Mar 2026', colors.blue],
    ['Follow-ups', counts.followUp || 1, 'Pending follow-up', 'Due: 27 Mar 2026', colors.amber],
    ['Cancelled', counts.cancelled || 0, 'This month', 'All attended', colors.lime]
  ];

  const renderAppointmentCard = (appointment) => {
    const [accent, badgeBg] = getStatusTone(appointment.status);
    const isCompleted = appointment.category === 'completed';
    const isFollowUp = appointment.category === 'follow-up';

    return (
      <Box
        key={appointment.id}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `1px solid ${colors.soft}`,
          bgcolor: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: accent }} />
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: badgeBg,
              color: accent,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 24,
              flexShrink: 0
            }}
          >
            {getInitials(appointment.doctorName)}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 500, lineHeight: 1.15 }}>
                  {appointment.doctorName}
                </Typography>
                <Typography sx={{ color: colors.muted, fontSize: 14.5, lineHeight: 1.15 }}>
                  {appointment.specialization}
                </Typography>
              </Box>
              <Chip
                label={
                  appointment.status === 'confirmed'
                    ? 'Confirmed'
                    : appointment.status === 'completed'
                      ? 'Completed'
                      : appointment.status === 'follow-up'
                        ? 'Follow-up'
                        : appointment.status === 'cancelled'
                          ? 'Cancelled'
                          : 'Upcoming'
                }
                sx={{
                  height: 28,
                  bgcolor: badgeBg,
                  color: accent,
                  fontSize: 13
                }}
              />
            </Stack>

            <Stack spacing={0.8} sx={{ mt: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarIcon sx={{ fontSize: 16, color: colors.muted }} />
                <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{appointment.dateLabel}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <TimeIcon sx={{ fontSize: 16, color: colors.muted }} />
                <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{appointment.timeLabel}</Typography>
              </Stack>
              {!isCompleted && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <VideoIcon sx={{ fontSize: 16, color: colors.muted }} />
                  <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>Video call</Typography>
                </Stack>
              )}
            </Stack>

            <Box
              sx={{
                mt: 1.5,
                px: 1.5,
                py: 0.85,
                borderRadius: 999,
                display: 'inline-block',
                bgcolor: isCompleted ? '#f5fbf7' : badgeBg,
                color: isCompleted ? colors.green : accent,
                fontSize: 14
              }}
            >
              {appointment.notes}
            </Box>

            <Stack spacing={1.1} sx={{ mt: 1.7, maxWidth: 170 }}>
              {isCompleted ? (
                <>
                  <Button
                    sx={{
                      py: 1,
                      borderRadius: 2.2,
                      border: `1px solid ${colors.line}`,
                      color: colors.text,
                      textTransform: 'none',
                      fontSize: 15
                    }}
                  >
                    View Prescription
                  </Button>
                  <Button
                    onClick={() => navigate('/patient')}
                    sx={{
                      py: 1,
                      borderRadius: 2.2,
                      border: `1px solid ${colors.line}`,
                      color: colors.text,
                      textTransform: 'none',
                      fontSize: 15
                    }}
                  >
                    Book Follow-up
                  </Button>
                </>
              ) : isFollowUp ? (
                <>
                  <Button
                    sx={{
                      py: 1,
                      borderRadius: 2.2,
                      border: `1px solid ${colors.line}`,
                      color: colors.text,
                      textTransform: 'none',
                      fontSize: 15
                    }}
                  >
                    Add to Calendar
                  </Button>
                  <Button
                    sx={{
                      py: 1,
                      borderRadius: 2.2,
                      border: `1px solid ${colors.line}`,
                      color: colors.text,
                      textTransform: 'none',
                      fontSize: 15
                    }}
                  >
                    View Past Notes
                  </Button>
                  <Button
                    sx={{
                      py: 0.9,
                      borderRadius: 2.2,
                      border: `1px solid ${colors.line}`,
                      color: colors.text,
                      textTransform: 'none',
                      fontSize: 15,
                      alignSelf: 'flex-start',
                      px: 3
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    sx={{
                      py: 1,
                      borderRadius: 2.2,
                      border: `1px solid ${colors.line}`,
                      color: colors.text,
                      textTransform: 'none',
                      fontSize: 15
                    }}
                  >
                    Join Consultation
                  </Button>
                  <Button
                    sx={{
                      py: 0.9,
                      borderRadius: 2.2,
                      border: `1px solid ${colors.line}`,
                      color: colors.text,
                      textTransform: 'none',
                      fontSize: 15
                    }}
                  >
                    Reschedule
                  </Button>
                  <Button
                    sx={{
                      py: 0.9,
                      borderRadius: 2.2,
                      border: `1px solid ${colors.line}`,
                      color: colors.text,
                      textTransform: 'none',
                      fontSize: 15,
                      alignSelf: 'flex-start',
                      px: 3
                    }}
                  >
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
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              Appointments
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 440, lineHeight: 1.2 }}>
              Manage your upcoming and past consultations
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Box
              sx={{
                px: 2.5,
                py: 1.25,
                borderRadius: 4,
                border: `1px solid ${colors.line}`,
                bgcolor: '#f7f3ea',
                fontSize: 17,
                lineHeight: 1.15
              }}
            >
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Box>
            <Button
              sx={{
                minWidth: 48,
                width: 48,
                height: 48,
                borderRadius: 3,
                border: `1px solid ${colors.line}`,
                bgcolor: '#fff',
                color: colors.text,
                position: 'relative'
              }}
            >
              <NotificationIcon />
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: colors.red
                }}
              />
            </Button>
            <Button
              onClick={() => navigate('/patient')}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: 3,
                border: `1px solid ${colors.line}`,
                bgcolor: '#fff',
                color: colors.text,
                textTransform: 'none',
                fontSize: 16
              }}
            >
              Book Appointment
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3
          }}
        >
          {summaryCards.map(([title, value, subtitle, helper, dot]) => (
            <Box
              key={title}
              sx={{
                minHeight: 156,
                p: 2.5,
                borderRadius: 3.5,
                border: `1px solid ${colors.line}`,
                bgcolor: colors.paper
              }}
            >
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dot }} />
                <Typography sx={{ fontSize: 16, color: colors.muted }}>{title}</Typography>
              </Stack>
              <Typography sx={{ mt: 1.2, fontSize: 30, lineHeight: 1 }}>{value}</Typography>
              <Typography sx={{ mt: 1, color: '#a29b92', fontSize: 15, lineHeight: 1.15 }}>{subtitle}</Typography>
              <Typography sx={{ mt: 1, color: dot, fontSize: 15, lineHeight: 1.15 }}>{helper}</Typography>
            </Box>
          ))}
        </Box>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap" sx={{ mb: 1.8 }}>
              {[
                ['all', 'All'],
                ['upcoming', 'Upcoming'],
                ['completed', 'Completed'],
                ['follow-up', 'Follow-up'],
                ['cancelled', 'Cancelled']
              ].map(([value, label]) => (
                <Button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  sx={{
                    px: 2.5,
                    py: 0.95,
                    borderRadius: 999,
                    border: `1px solid ${activeFilter === value ? colors.green : colors.line}`,
                    bgcolor: activeFilter === value ? colors.green : '#fff',
                    color: activeFilter === value ? '#fff' : '#67625b',
                    textTransform: 'none',
                    fontSize: 15
                  }}
                >
                  {label}
                </Button>
              ))}
            </Stack>

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ mb: 1.8 }}>
              <TextField
                placeholder="Search doctor, specialization"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#fff'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.muted }} />
                    </InputAdornment>
                  )
                }}
              />
            </Stack>

            <TextField
              select
              fullWidth
              value={specializationFilter}
              onChange={(event) => setSpecializationFilter(event.target.value)}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#fff'
                }
              }}
            >
              <MenuItem value="all">All specializations</MenuItem>
              {specializationOptions
                .filter((item) => item !== 'all')
                .map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
            </TextField>

            {loading ? (
              <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
                <CircularProgress size={30} sx={{ color: colors.green }} />
              </Box>
            ) : (
              <Stack spacing={2}>
                <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1 }}>UPCOMING</Typography>
                {groupedAppointments.upcoming.length ? (
                  groupedAppointments.upcoming.map(renderAppointmentCard)
                ) : (
                  <Box sx={{ p: 3, borderRadius: 3, border: `1px dashed ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ color: colors.muted, fontSize: 16 }}>
                      No upcoming appointments match your filters.
                    </Typography>
                  </Box>
                )}

                <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, pt: 1 }}>COMPLETED</Typography>
                {groupedAppointments.completed.length ? (
                  groupedAppointments.completed.map(renderAppointmentCard)
                ) : (
                  <Box sx={{ p: 3, borderRadius: 3, border: `1px dashed ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ color: colors.muted, fontSize: 16 }}>
                      No completed appointments match your filters.
                    </Typography>
                  </Box>
                )}

                {groupedAppointments.cancelled.length > 0 && (
                  <>
                    <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, pt: 1 }}>CANCELLED</Typography>
                    {groupedAppointments.cancelled.map(renderAppointmentCard)}
                  </>
                )}
              </Stack>
            )}
          </Box>

          <Stack spacing={3} sx={{ width: { xs: '100%', xl: 330 }, flexShrink: 0 }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: `1px solid ${colors.line}`,
                bgcolor: colors.paper
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.6 }}>
                <Button
                  sx={{
                    minWidth: 38,
                    width: 38,
                    height: 32,
                    borderRadius: 2,
                    border: `1px solid ${colors.line}`,
                    color: colors.text
                  }}
                >
                  {'<'}
                </Button>
                <Typography sx={{ fontSize: 16.5 }}>March 2026</Typography>
                <Box sx={{ width: 38 }} />
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 1,
                  textAlign: 'center'
                }}
              >
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <Typography key={day} sx={{ color: '#b1aaa1', fontSize: 13 }}>
                    {day}
                  </Typography>
                ))}

                {monthDays.flat().map((day, index) => (
                  <Box key={`${day}-${index}`} sx={{ minHeight: 34 }}>
                    {day && (
                      <Box sx={{ display: 'grid', justifyItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: 14.5, color: '#4c4842' }}>{day}</Typography>
                        {markedDays.has(day) && (
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: colors.green }} />
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: `1px solid ${colors.line}`,
                bgcolor: colors.paper
              }}
            >
              <Typography sx={{ fontSize: 18, mb: 2 }}>Quick book by specialization</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.2 }}>
                {quickBookOptions.map((item, index) => (
                  <Button
                    key={item}
                    sx={{
                      minHeight: 60,
                      borderRadius: 2.5,
                      border: `1px solid ${index === 0 ? colors.green : colors.line}`,
                      bgcolor: index === 0 ? '#eef9f4' : '#fff',
                      color: '#4e4a45',
                      textTransform: 'none',
                      fontSize: 14
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Box>
              <Button
                onClick={() => navigate('/patient')}
                sx={{
                  mt: 1.8,
                  width: '100%',
                  py: 1.2,
                  borderRadius: 2.5,
                  border: `1px solid ${colors.line}`,
                  color: colors.text,
                  textTransform: 'none',
                  fontSize: 16
                }}
              >
                Find Available Doctors
              </Button>
            </Box>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: `1px solid ${colors.line}`,
                bgcolor: colors.paper
              }}
            >
              <Typography sx={{ fontSize: 18, mb: 2 }}>Upcoming reminders</Typography>
              <Stack spacing={1.5}>
                {reminders.map(([label, time, dot]) => (
                  <Stack
                    key={label}
                    direction="row"
                    spacing={1.25}
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      pt: 0.5,
                      borderTop: `1px solid ${colors.soft}`,
                      '&:first-of-type': { borderTop: 'none', pt: 0 }
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="flex-start" sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dot, mt: 0.7, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 14.5, color: '#4a4641', lineHeight: 1.3 }}>{label}</Typography>
                    </Stack>
                    <Typography sx={{ color: '#b1aaa1', fontSize: 13.5, flexShrink: 0 }}>{time}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </PatientShell>
  );
}

export default PatientAppointments;
