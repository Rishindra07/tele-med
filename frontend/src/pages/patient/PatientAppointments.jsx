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
  Avatar,
  Divider
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
  PlayCircleFilledRounded as OngoingIcon,
  AddRounded as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PatientShell from '../../components/patient/PatientShell';
import { fetchMyAppointments, cancelAppointment, rescheduleAppointment, fetchDoctorSlots } from '../../api/patientApi';
import { getConsultationStatus } from '../../utils/consultationUtils';
import { useLanguage } from '../../context/LanguageContext';
import { PATIENT_APPOINTMENTS_TRANSLATIONS } from '../../utils/translations/patient';

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

const getInitials = (name) => {
  if (!name) return 'DR';
  const clean = name.replace(/^(Dr\.|Dr)\s+/i, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDateRel = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(d);
  target.setHours(0,0,0,0);
  
  const diff = (target - today) / (24 * 60 * 60 * 1000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

function PatientAppointments() {
  const { language } = useLanguage();
  const t = PATIENT_APPOINTMENTS_TRANSLATIONS[language] || PATIENT_APPOINTMENTS_TRANSLATIONS['en'];
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
  const [tick, setTick] = useState(0);
  const [payingId, setPayingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000); // Tick every minute
    return () => clearInterval(timer);
  }, []);

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
    if (!window.confirm(t.messages.confirm_cancel)) return;
    try {
      const res = await cancelAppointment(id);
      if (res.success) {
        setSnackbar({ open: true, message: t.messages.cancel_success, severity: 'success' });
        fetchAppointments();
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t.messages.cancel_fail, severity: 'error' });
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
        setSnackbar({ open: true, message: t.messages.reschedule_success, severity: 'success' });
        fetchAppointments();
        handleRescheduleClose();
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t.messages.reschedule_fail, severity: 'error' });
    }
  };

  const handleStartPayment = async (appointment) => {
    setPayingId(appointment.id);
    try {
      const fee = appointment.consultationFee || 500;
      const { createRazorpayOrder, verifyRazorpayPayment } = await import('../../api/patientApi');
      
      const orderRes = await createRazorpayOrder({ 
        amount: fee,
        referenceId: appointment.id,
        referenceType: 'consultation'
      });

      if (!orderRes.success) throw new Error("Payment initialization failed");

      const options = {
        key: orderRes.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "Seva Telehealth",
        description: `Consultation with Dr. ${appointment.doctorName}`,
        order_id: orderRes.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              setSnackbar({ open: true, message: 'Payment successful!', severity: 'success' });
              fetchAppointments();
            } else {
              setSnackbar({ open: true, message: 'Payment verification failed', severity: 'error' });
            }
          } catch (err) {
            setSnackbar({ open: true, message: 'Error: ' + err.message, severity: 'error' });
          }
        },
        theme: { color: colors.primary }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setSnackbar({ open: true, message: 'Payment error: ' + err.message, severity: 'error' });
    } finally {
      setPayingId(null);
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
        raw: appointment,
        id: appointment._id || `appointment-${index}`,
        doctorId: appointment.doctor?._id || appointment.doctor,
        doctorName: (appointment.doctor?.full_name || appointment.doctor?.name || 'Doctor').replace(/^(Dr\.|Dr)\s+/i, ''),
        specialization: appointment.specialization || 'General Physician',
        dateLabel: formatDateRel(appointment.appointmentDate),
        timeLabel: appointment.timeSlot || 'Time pending',
        callStatus,
        callLabel,
        isJoinNear
      };
    });
  }, [appointments, tick]);

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
    live: filteredAppointments.filter((item) => item.callStatus === 'ongoing'),
    upcoming: filteredAppointments.filter((item) => item.callStatus === 'upcoming'),
    completed: filteredAppointments.filter((item) => item.callStatus === 'completed'),
    cancelled: filteredAppointments.filter((item) => item.callStatus === 'cancelled'),
    missed: filteredAppointments.filter((item) => item.callStatus === 'missed')
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return colors.success;
      case 'upcoming': return colors.primary;
      case 'completed': return colors.gray;
      case 'missed': return colors.danger;
      case 'cancelled': return colors.danger;
      default: return colors.primary;
    }
  };

  const getStatusSoft = (status) => {
    switch (status) {
      case 'ongoing': return colors.successSoft;
      case 'upcoming': return colors.primarySoft;
      case 'completed': return colors.soft;
      case 'missed': return colors.dangerSoft;
      case 'cancelled': return colors.dangerSoft;
      default: return colors.primarySoft;
    }
  };

  const renderAppointmentCard = (a) => {
    const { callStatus: dashStatus, isJoinNear, callLabel } = a;
    const sColor = getStatusColor(dashStatus);
    const sSoft = getStatusSoft(dashStatus);

    return (
      <Box
        key={a.id}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: '16px',
          border: `1px solid ${colors.line}`,
          bgcolor: '#fff',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: sColor,
            boxShadow: `0 8px 24px ${sColor}15`,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          inset: '0 auto 0 0', 
          width: 6, 
          bgcolor: sColor,
          opacity: dashStatus === 'ongoing' ? 1 : 0.4
        }} />
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
          <Avatar sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: '12px', 
            bgcolor: sSoft, 
            color: sColor, 
            fontSize: 20,
            fontWeight: 700,
            boxShadow: `inset 0 0 0 1px ${sColor}20`
          }}>
            {getInitials(a.doctorName)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {t.states.dr} {a.doctorName}
                  {dashStatus === 'ongoing' && (
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.success, animation: 'pulse 1.5s infinite' }} />
                  )}
                </Typography>
                <Typography sx={{ color: colors.muted, fontSize: 14.5, mt: 0.2 }}>
                  {a.specialization}
                </Typography>
              </Box>
              <Stack direction="column" spacing={0.5} alignItems="flex-end">
                <Chip
                  label={dashStatus === 'completed' ? t.chips.past : dashStatus === 'missed' ? t.chips.no_show : t.filters[dashStatus]?.toUpperCase() || dashStatus.toUpperCase()}
                  sx={{
                    height: 24,
                    bgcolor: sSoft,
                    color: sColor,
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: '8px',
                    letterSpacing: '0.5px'
                  }}
                />
                {a.rescheduledByDoctor && (
                  <Chip 
                    label="RESCHEDULED" 
                    size="small" 
                    sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: colors.warningSoft, color: colors.warning }} 
                  />
                )}
              </Stack>
            </Stack>

            <Divider sx={{ my: 2.5, opacity: 0.5, borderStyle: 'dashed' }} />

            <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarIcon sx={{ fontSize: 18, color: sColor }} />
                <Typography sx={{ color: colors.text, fontSize: 14.5, fontWeight: 600 }}>{a.dateLabel}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <TimeIcon sx={{ fontSize: 18, color: sColor }} />
                <Typography sx={{ color: colors.text, fontSize: 14.5, fontWeight: 600 }}>{a.timeLabel}</Typography>
              </Stack>
              {(dashStatus === 'upcoming' || dashStatus === 'ongoing') && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 'auto' }}>
                  <Typography sx={{ 
                    color: sColor, 
                    fontSize: 13, 
                    fontWeight: 700, 
                    bgcolor: sSoft, 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: '20px'
                  }}>
                    {callLabel}
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'flex-end' }}>
              {dashStatus === 'upcoming' && (
                <>
                  {a.paymentStatus === 'Pending' && (
                    <Button 
                      onClick={() => handleStartPayment(a)} 
                      variant="contained" 
                      disabled={payingId === a.id}
                      sx={{ bgcolor: colors.warning, color: '#fff', borderRadius: '12px', px: 2.5, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#e89b00' } }}
                    >
                      {payingId === a.id ? <CircularProgress size={20} color="inherit" /> : 'Pay Now'}
                    </Button>
                  )}
                  <Button 
                    onClick={() => navigate('/patient/video-call', { state: { appointment: a.raw || a } })} 
                    variant="contained" 
                    startIcon={<VideoIcon />} 
                    sx={{ bgcolor: colors.primary, borderRadius: '12px', px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}
                  >
                    {t.actions.join}
                  </Button>
                  <Button onClick={() => handleRescheduleOpen(a)} variant="outlined" sx={{ borderColor: colors.line, color: colors.text, borderRadius: '12px', px: 2.5, textTransform: 'none', fontWeight: 600 }}>{t.actions.reschedule}</Button>
                  <Button onClick={() => handleCancel(a.id)} variant="text" sx={{ color: colors.danger, textTransform: 'none', fontWeight: 600 }}>{t.actions.cancel}</Button>
                </>
              )}
              {dashStatus === 'ongoing' && (
                <>
                  <Button 
                    onClick={() => navigate('/patient/video-call', { state: { appointment: a.raw || a } })} 
                    variant="contained" 
                    startIcon={<OngoingIcon />} 
                    sx={{ bgcolor: colors.success, borderRadius: '12px', px: 3, py: 1, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: colors.success } }}
                  >
                    {t.actions.join_now}
                  </Button>
                  <Button 
                    onClick={() => navigate('/patient/video-call', { state: { appointment: a.raw || a, openChat: true } })} 
                    variant="outlined" 
                    startIcon={<ChatIcon />} 
                    sx={{ borderColor: colors.line, color: colors.text, borderRadius: '12px', px: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    {t.actions.chat}
                  </Button>
                </>
              )}
              {dashStatus === 'completed' && (
                <>
                  <Button onClick={() => navigate('/patient/records')} variant="outlined" startIcon={<PrescriptionIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: '12px', px: 2, textTransform: 'none', fontWeight: 600 }}>{t.actions.prescription}</Button>
                  <Button onClick={() => navigate('/patient/records')} variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: '12px', px: 2, textTransform: 'none', fontWeight: 600 }}>{t.actions.records}</Button>
                  <Button variant="text" sx={{ color: colors.primary, textTransform: 'none', fontWeight: 600 }} onClick={() => navigate(`/patient?doctor=${a.doctorId}`)}>{t.actions.book_again}</Button>
                </>
              )}
              {dashStatus === 'cancelled' && (
                <Button onClick={() => navigate(`/patient?doctor=${a.doctorId}`)} variant="outlined" startIcon={<HistoryIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: '12px', px: 2, textTransform: 'none', fontWeight: 600 }}>{t.actions.rebook_now}</Button>
              )}
              {dashStatus === 'missed' && (
                <>
                  <Button onClick={() => handleRescheduleOpen(a)} variant="outlined" sx={{ borderColor: colors.line, color: colors.text, borderRadius: 2, px: 2.5, textTransform: 'none', fontWeight: 600 }}>{t.actions.reschedule}</Button>
                  <Button onClick={() => navigate(`/patient?doctor=${a.doctorId}`)} variant="contained" sx={{ bgcolor: colors.primary, borderRadius: 2, px: 2.5, textTransform: 'none', fontWeight: 600 }}>{t.actions.book_again}</Button>
                </>
              )}
            </Box>
          </Box>
        </Stack>

        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.5; }
              50% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(0.95); opacity: 0.5; }
            }
          `}
        </style>
      </Box>
    );
  };

  return (
    <PatientShell activeItem="appointments">
      <Box sx={{ px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
              <Typography sx={{ fontSize: { xs: 32, md: 40 }, fontWeight: 800, color: colors.text, fontFamily: 'Georgia, serif' }}>
                {t.title}
              </Typography>
              <Box sx={{ mt: 0.5, color: colors.muted, fontSize: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                {t.subtitle} <Chip label={`${normalizedAppointments.length} ${t.total}`} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: colors.soft }} />
              </Box>
            </Box>
            <Button 
              onClick={() => navigate('/patient')} 
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ 
                px: 3.5, py: 1.5, borderRadius: '16px', bgcolor: colors.primary, color: '#fff', 
                textTransform: 'none', fontWeight: 700, fontSize: 16, 
                boxShadow: `0 8px 16px ${colors.primary}30`,
                '&:hover': { bgcolor: colors.primaryDark, transform: 'scale(1.02)' },
                transition: 'all 0.2s'
              }}
            >
              {t.book_new}
            </Button>
          </Stack>

        <Box sx={{ bgcolor: colors.paper, p: 3, borderRadius: '20px', border: `1px solid ${colors.line}`, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
             <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
               {[['all', t.filters.all], ['upcoming', t.filters.upcoming], ['ongoing', t.filters.ongoing], ['completed', t.filters.completed], ['missed', t.filters.missed], ['cancelled', t.filters.cancelled]].map(([value, label]) => (
                 <Box
                   key={value}
                   onClick={() => setActiveFilter(value)}
                   sx={{
                     px: 2.5, py: 0.8, borderRadius: '12px', cursor: 'pointer',
                     bgcolor: activeFilter === value ? colors.primary : 'transparent',
                     color: activeFilter === value ? '#fff' : colors.muted,
                     border: `1px solid ${activeFilter === value ? colors.primary : colors.line}`,
                     fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                     '&:hover': { bgcolor: activeFilter === value ? colors.primaryDark : colors.soft }
                   }}
                 >
                   {label}
                 </Box>
               ))}
             </Stack>
             <Stack direction="row" spacing={2} alignItems="center">
               <TextField
                 select
                 value={specializationFilter}
                 onChange={(e) => setSpecializationFilter(e.target.value)}
                 size="small"
                 sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
               >
                 <MenuItem value="all">{t.filters.all_specialties}</MenuItem>
                 {specializationOptions.filter(o => o !== 'all').map(opt => (
                   <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                 ))}
               </TextField>
               <TextField
                 placeholder={t.filters.search_placeholder}
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 size="small"
                 sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                 InputProps={{ 
                   startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: colors.muted }} /></InputAdornment> 
                 }}
               />
             </Stack>
          </Stack>

          {loading ? (
            <Box sx={{ py: 12, display: 'grid', placeItems: 'center' }}>
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={32} thickness={5} sx={{ color: colors.primary }} />
                <Typography sx={{ color: colors.muted, fontSize: 14, fontWeight: 500 }}>{t.states.fetching}</Typography>
              </Stack>
            </Box>
          ) : filteredAppointments.length === 0 ? (
            <Box sx={{ py: 12, textAlign: 'center', bgcolor: colors.bg, borderRadius: 3, border: `2px dashed ${colors.line}` }}>
               <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: colors.soft, display: 'grid', placeItems: 'center', mx: 'auto', mb: 3 }}>
                <CalendarIcon sx={{ fontSize: 40, color: colors.gray }} />
               </Box>
               <Typography sx={{ color: colors.text, fontSize: 18, fontWeight: 700 }}>{t.states.no_consultations}</Typography>
               <Typography sx={{ color: colors.muted, fontSize: 14.5, mt: 1, maxWidth: 300, mx: 'auto' }}>
                 {t.states.no_consultations_desc}
               </Typography>
               <Button onClick={() => navigate('/patient')} startIcon={<AddIcon />} sx={{ mt: 4, color: colors.primary, fontWeight: 700, textTransform: 'none' }}>{t.states.book_now}</Button>
            </Box>
          ) : (
            <Stack spacing={5}>
              {(grouped.live.length > 0 || grouped.upcoming.length > 0) && (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Typography sx={{ color: colors.text, fontSize: 18, fontWeight: 800, fontFamily: 'Georgia, serif' }}>{t.sections.upcoming}</Typography>
                    <Chip label={`${grouped.live.length + grouped.upcoming.length}`} size="small" sx={{ bgcolor: colors.primary, color: '#fff', fontWeight: 800 }} />
                  </Stack>
                  <Stack spacing={2.5}>{[...grouped.live, ...grouped.upcoming].map(renderAppointmentCard)}</Stack>
                </Box>
              )}
              {grouped.completed.length > 0 && (
                <Box>
                  <Typography sx={{ color: colors.text, fontSize: 18, fontWeight: 800, mb: 3, fontFamily: 'Georgia, serif' }}>{t.sections.history}</Typography>
                  <Stack spacing={2.5}>{grouped.completed.map(renderAppointmentCard)}</Stack>
                </Box>
              )}
              {(grouped.missed.length > 0 || grouped.cancelled.length > 0) && (
                <Box>
                  <Typography sx={{ color: colors.muted, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 3 }}>{t.sections.not_completed}</Typography>
                  <Stack spacing={2.5}>{[...grouped.missed, ...grouped.cancelled].map(renderAppointmentCard)}</Stack>
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
        <DialogTitle>{t.dialog.title}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label={t.dialog.new_date} type="date" InputLabelProps={{ shrink: true }} value={newDate} onChange={(e) => setNewDate(e.target.value)} fullWidth />
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
          <Button onClick={handleRescheduleClose}>{t.dialog.cancel}</Button>
          <Button onClick={handleRescheduleSubmit} variant="contained">{t.dialog.save}</Button>
        </DialogActions>
      </Dialog>
    </PatientShell>
  );
}

export default PatientAppointments;
