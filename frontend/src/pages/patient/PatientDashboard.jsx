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
  PlayCircleFilledRounded as OngoingIcon,
  LocalShippingRounded as ShippingIcon,
  ShoppingBagRounded as OrderIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
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
  fetchPharmacies,
  fetchMyOrders,
  cancelMyOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  fetchMyNotifications
} from '../../api/patientApi';
import { getConsultationStatus } from '../../utils/consultationUtils';
import { useLanguage } from '../../context/LanguageContext';
import { PATIENT_DASHBOARD_TRANSLATIONS } from '../../utils/translations/patient';

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
  const { language } = useLanguage();
  const t = PATIENT_DASHBOARD_TRANSLATIONS[language] || PATIENT_DASHBOARD_TRANSLATIONS['en'];
  const navigate = useNavigate();
  const location = useLocation();
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
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
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
        const [apptsRes, recsRes, pharRes, ordsRes, notifRes] = await Promise.all([
          fetchMyAppointments(),
          fetchMyRecords(),
          fetchPharmacies(),
          fetchMyOrders(),
          fetchMyNotifications()
        ]);
        if (apptsRes.success) setAppointments(apptsRes.appointments || []);
        if (recsRes.success) setRecords(recsRes.records || []);
        if (pharRes.success) setPharmacies(pharRes.pharmacies || []);
        if (ordsRes.success) setOrders(ordsRes.orders || []);
        if (notifRes.success) setNotifications(notifRes.notifications || []);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Listen for specialization query param from Symptom Checker
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const specParam = params.get('specialization');
    if (specParam) {
      setSpecialization(specParam);
      // We need to wait for allDoctors to be populated if it hasn't yet
      if (allDoctors.length > 0) {
        handleAutoFilter(specParam);
      }
    }
  }, [location.search, allDoctors]);

  const handleAutoFilter = async (specValue) => {
    const trimmed = specValue.trim().toLowerCase();
    setDoctorsLoading(true);
    setDoctorsError('');
    resetSelection();
    try {
      const res = await getDoctorsBySpecialization(trimmed);
      const filtered = res.doctors || [];
      setDoctors(filtered);
      setDoctorsError(filtered.length ? '' : `No doctors found for ${specValue}. Showing all doctors instead.`);
      if (filtered.length === 0) setDoctors(allDoctors);
      
      // Scroll to booking section
      setTimeout(() => {
        bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
       setDoctors(allDoctors);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await cancelMyOrder(orderId);
      if (res.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Cancelled' } : o));
        setSnackbar({ open: true, severity: 'success', message: 'Order cancelled successfully.' });
      }
    } catch (err) {
        setSnackbar({ open: true, severity: 'error', message: 'Failed to cancel order.' });
    }
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

  const handleBookAppointment = async (paymentStatus = 'Pending', referenceDetails = null) => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setSnackbar({ open: true, severity: 'error', message: 'Please select doctor, date, and time slot.' });
      return null;
    }
    const doctorId = selectedDoctor.user?._id || selectedDoctor.user;
    if (!doctorId) {
      setSnackbar({ open: true, severity: 'error', message: 'Selected doctor is missing an ID.' });
      return null;
    }
    setBookingLoading(true);
    try {
      const res = await bookAppointment({
        doctorId,
        specialization: selectedDoctor.specialization || specialization,
        date: selectedDate,
        slot: selectedSlot,
        paymentStatus,
        paymentMethod: paymentStatus === 'Paid' ? 'Online' : 'Pending'
      });
      
      if (res.success) {
        if (paymentStatus === 'Paid') {
          setSnackbar({ open: true, severity: 'success', message: 'Appointment booked and paid successfully.' });
          setPaymentDone(true);
          setTimeout(() => navigate('/patient/appointments'), 2000);
        } else if (!referenceDetails) {
          // If just booking without immediate payment flow
          setSnackbar({ open: true, severity: 'success', message: 'Appointment request sent successfully.' });
          setTimeout(() => navigate('/patient/appointments'), 2000);
        }
        
        setSlots((prev) => prev.map((s) => s.time === selectedSlot ? { ...s, isBooked: true } : s));
        setSelectedSlot('');
        return res.appointment;
      }
    } catch (error) {
      setSnackbar({ open: true, severity: 'error', message: error.message || 'Booking failed.' });
      return null;
    } finally {
      setBookingLoading(false);
    }
  };

  const startPaymentFlow = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setSnackbar({ open: true, severity: 'error', message: 'Please complete all selections first.' });
      return;
    }
    
    setPaying(true);
    try {
      // 1. Create appointment first in Pending state
      const appointment = await handleBookAppointment('Pending', { isPaymentFlow: true });
      if (!appointment) return;

      const fee = selectedDoctor.consultationFee || 500;
      
      // 2. Create Razorpay Order
      const orderRes = await createRazorpayOrder({ 
        amount: fee,
        referenceId: appointment._id,
        referenceType: 'consultation'
      });

      if (!orderRes.success) throw new Error("Payment initialization failed");

      const options = {
        key: orderRes.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "Seva Telehealth",
        description: `Consultation with Dr. ${(selectedDoctor.user?.full_name || 'Expert').replace(/^(Dr\.|Dr)\s+/i, '')}`,
        order_id: orderRes.orderId,
        handler: async (response) => {
          setPaying(true);
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              setSnackbar({ open: true, severity: 'success', message: 'Payment successful! Appointment confirmed.' });
              setPaymentDone(true);
              setTimeout(() => navigate('/patient/appointments'), 2000);
            } else {
              setSnackbar({ open: true, severity: 'error', message: 'Payment verification failed' });
            }
          } catch (err) {
            setSnackbar({ open: true, severity: 'error', message: 'Verification error: ' + err.message });
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: patientName,
          email: JSON.parse(localStorage.getItem('user') || '{}').email || ''
        },
        theme: { color: c.primary }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, severity: 'error', message: 'Payment error: ' + err.message });
    } finally {
      setPaying(false);
    }
  };

  const doctorName = selectedDoctor?.user?.full_name || selectedDoctor?.user?.name || '';
  
  const upcomingAppts = appointments.filter(a => a.status !== 'Cancelled' && new Date(a.appointmentDate) >= new Date().setHours(0,0,0,0));
  const nextAppt = upcomingAppts[0];

  const statCards = [
    [t.stats.consultations, appointments.length.toString(), t.stats.all_time, `+${appointments.filter(a => new Date(a.createdAt).getMonth() === new Date().getMonth()).length} ${t.stats.this_month}`, c.primary],
    [t.stats.records, records.length.toString(), t.stats.stored_files, `${records.filter(r => r.type === 'prescription').length} ${t.stats.prescriptions}`, c.success],
    [t.stats.next_appt, nextAppt ? fmtDate(nextAppt.appointmentDate.split('T')[0]) : '--', nextAppt ? `${nextAppt.timeSlot} • ${getConsultationStatus(nextAppt).label}` : t.stats.no_upcoming_dates, nextAppt ? t.stats.upcoming : t.stats.na, c.warning]
  ];

  return (
    <PatientShell activeItem="dashboard">
      <Box sx={{ minWidth: 0, px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: c.bg, minHeight: '100vh' }}>
        
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between', gap: 3, flexDirection: { xs: 'column', lg: 'row' }, mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: c.text, fontFamily: 'Inter, sans-serif' }}>
              {t.welcome_back}, {greetingName}
            </Typography>
            <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 16 }}>
              {t.health_overview}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '16px', border: `1px solid ${c.line}`, bgcolor: c.paper, color: c.muted, fontSize: 15, fontWeight: 500 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '16px', border: `1px solid ${c.line}`, bgcolor: c.paper, color: c.text, position: 'relative' }}>
              <NotificationIcon fontSize="small" />
            </Button>
            <Button onClick={() => navigate('/patient/pharmacies')} sx={{ px: 3, py: 1.25, borderRadius: '16px', border: `1px solid ${c.primary}`, color: c.primary, fontSize: 15, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: c.primarySoft } }}>
              {t.order_medicines_btn}
            </Button>
            <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} sx={{ px: 3, py: 1.25, borderRadius: '16px', bgcolor: c.primary, color: '#fff', fontSize: 15, fontWeight: 600, textTransform: 'none', boxShadow: '0 2px 4px rgba(26,115,232,0.2)', '&:hover': { bgcolor: c.primaryDark, boxShadow: '0 4px 6px rgba(26,115,232,0.3)' } }}>
              {t.book_appointment_btn}
            </Button>
          </Stack>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map(([title, value, subtitle]) => (
            <Grid key={title} size={{ xs: 12, md: 4 }}>
              <Box sx={{ p: 3, borderRadius: '20px', border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                 <Typography sx={{ fontSize: 14, fontWeight: 600, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</Typography>
                 <Typography sx={{ mt: 1, fontSize: 32, fontWeight: 600, color: c.text }}>{value}</Typography>
                 <Typography sx={{ mt: 1, color: c.muted, fontSize: 14 }}>{subtitle}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Appointments Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ p: 4, borderRadius: '24px', border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text }}>{t.appts.upcoming}</Typography>
                <Button onClick={() => navigate('/patient/appointments')} sx={{ color: c.primary, textTransform: 'none', fontSize: 14, fontWeight: 600 }}>{t.appts.view_all}</Button>
              </Stack>
              
              {appointments.length > 0 ? (
                <Stack spacing={2} sx={{ flex: 1 }}>
                   {appointments.slice(0, 3).map((appt) => {
                      const { status: dashStatus, isJoinNear } = getConsultationStatus(appt);
  
                      return (
                          <Box key={appt._id} sx={{ p: 2, borderRadius: '16px', border: `1px solid ${c.line}`, bgcolor: '#fff' }}>
                             <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                  <Avatar sx={{ bgcolor: c.primarySoft, color: c.primaryDark }}>{initials(appt.doctor?.full_name || appt.doctor?.name || 'DR')}</Avatar>
                                  <Box sx={{ flex: 1 }}>
                                     <Stack direction="row" justifyContent="space-between">
                                        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>Dr. {(appt.doctor?.full_name || appt.doctor?.name || 'Doctor').replace(/^(Dr\.|Dr)\s+/i, '')}</Typography>
                                        <Stack direction="column" spacing={0.5} alignItems="flex-end">
                                           <Chip label={dashStatus.toUpperCase()} size="small" sx={{ 
                                             height: 20, 
                                             fontSize: 10, 
                                             fontWeight: 700,
                                             bgcolor: dashStatus === 'ongoing' ? c.successSoft : dashStatus === 'missed' ? c.dangerSoft : dashStatus === 'completed' ? c.soft : c.primarySoft,
                                             color: dashStatus === 'ongoing' ? c.success : dashStatus === 'missed' ? c.danger : dashStatus === 'completed' ? c.muted : c.primaryDark 
                                           }} />
                                           {appt.rescheduledByDoctor && (
                                             <Chip label="RESCHEDULED" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: c.warningSoft, color: c.warning }} />
                                           )}
                                        </Stack>
                                     </Stack>
                                     <Typography sx={{ fontSize: 13, color: c.muted }}>{appt.specialization} • {fmtDate(appt.appointmentDate.split('T')[0])} at {appt.timeSlot}</Typography>
                                  </Box>
                                </Stack>
                             </Stack>
                             <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {dashStatus === 'upcoming' && (
                                  <>
                                    <Button onClick={() => navigate('/patient/video-call', { state: { appointment: appt } })} size="small" variant="contained" startIcon={<VideoIcon />} sx={{ bgcolor: c.primary, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.appts.join_consultation}</Button>
                                    <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} size="small" variant="outlined" sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.appts.reschedule}</Button>
                                    <Button onClick={() => setSnackbar({ open: true, severity: 'info', message: 'Cancellation request sent to doctor.' })} size="small" variant="text" sx={{ color: c.danger, fontSize: 11, textTransform: 'none' }}>{t.appts.cancel}</Button>
                                  </>
                                )}
                                {dashStatus === 'ongoing' && (
                                  <>
                                    <Button onClick={() => navigate('/patient/video-call', { state: { appointment: appt } })} size="small" variant="contained" startIcon={<OngoingIcon />} sx={{ bgcolor: c.success, borderRadius: 1.5, fontSize: 11, textTransform: 'none', '&:hover': { bgcolor: c.success } }}>{t.appts.join_now}</Button>
                                    <Button onClick={() => navigate('/patient/video-call', { state: { appointment: appt, openChat: true } })} size="small" variant="outlined" startIcon={<ChatIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.appts.chat}</Button>
                                    <Button onClick={() => navigate('/patient/records?tab=upload')} size="small" variant="outlined" startIcon={<UploadIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.appts.upload}</Button>
                                  </>
                                )}
                                {dashStatus === 'completed' && (
                                  <>
                                    <Button onClick={() => navigate('/patient/records')} size="small" variant="outlined" startIcon={<PrescriptionIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.appts.view_prescription}</Button>
                                    <Button onClick={() => navigate('/patient/records')} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.appts.view_record}</Button>
                                    <Button onClick={() => setSnackbar({ open: true, severity: 'success', message: 'Feedback form will open shortly.' })} size="small" variant="outlined" startIcon={<StarIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.appts.feedback}</Button>
                                  </>
                                )}
                                {dashStatus === 'cancelled' && (
                                  <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} size="small" variant="outlined" startIcon={<HistoryIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.appts.rebook}</Button>
                                )}
                                {dashStatus === 'missed' && (
                                  <>
                                    <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} size="small" variant="outlined" sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.appts.reschedule}</Button>
                                    <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} size="small" variant="contained" sx={{ bgcolor: c.primary, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.appts.book_again}</Button>
                                  </>
                                )}
                             </Box>
                          </Box>
                      );
                   })}
                </Stack>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${c.line}`, borderRadius: '16px', bgcolor: c.soft, py: 4 }}>
                  <EventAvailableIcon sx={{ fontSize: 40, color: c.muted, mb: 2 }} />
                  <Typography sx={{ fontSize: 15, color: c.muted, mb: 2 }}>{t.appts.no_appts}</Typography>
                  <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} sx={{ color: c.primary, textTransform: 'none', fontSize: 14, fontWeight: 600, border: `1px solid ${c.primary}`, borderRadius: 1.5, px: 3, py: 1 }}>{t.appts.book_now}</Button>
                </Box>
              )}
            </Box>
          </Grid>

          {/* AI Checker Column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ p: 4, borderRadius: '24px', background: `linear-gradient(135deg, ${c.primaryDark} 0%, ${c.primary} 100%)`, color: '#fff', boxShadow: `0 8px 16px ${c.primary}30`, position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1.5, fontFamily: 'Inter, sans-serif' }}>{t.ai.title}</Typography>
              <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', mb: 2, lineHeight: 1.6 }}>
                {t.ai.desc}
              </Typography>
              <Button onClick={() => navigate('/symptom-checker')} sx={{ width: '100%', py: 1.5, mt: 'auto', borderRadius: '14px', bgcolor: '#ffffff', color: c.primary, textTransform: 'none', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#f8f9fa', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                {t.ai.start}
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Notifications Column */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <NotificationIcon sx={{ color: c.primary }} />
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text }}>{t.notifications || 'Notifications'}</Typography>
              </Stack>
              <Stack spacing={1.5}>
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notif) => (
                    <Box key={notif._id} sx={{ p: 1.6, borderRadius: 1.5, border: `1px solid ${c.line}`, bgcolor: notif.status === 'unread' ? c.primarySoft : '#fff' }}>
                       <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.text }}>{notif.title}</Typography>
                       <Typography sx={{ color: c.muted, fontSize: 13, mt: 0.5 }}>{notif.message}</Typography>
                       <Typography sx={{ color: c.muted, fontSize: 11, mt: 0.5, textAlign: 'right' }}>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${c.line}`, borderRadius: 2, bgcolor: c.soft }}>
                    <Typography sx={{ color: c.muted, fontSize: 14 }}>{t.no_notifications || 'No recent notifications'}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Grid>

          {/* Health Records */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text }}>{t.records.recent}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button onClick={() => navigate('/patient/records?action=add')} sx={{ color: c.primary, textTransform: 'none', fontSize: 14 }}>{t.records.upload}</Button>
                  <Button onClick={() => navigate('/patient/records')} sx={{ color: c.primary, textTransform: 'none', fontSize: 14 }}>{t.records.view_all}</Button>
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
                  <Typography sx={{ color: c.muted, fontSize: 15 }}>{t.records.no_records}</Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Nearby Pharmacies */}
          <Grid size={{ xs: 12, lg: 12 }}>
            <Box sx={{ p: 3, borderRadius: '20px', border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text }}>{t.pharmacies.nearby}</Typography>
                <Button onClick={() => navigate('/patient/pharmacies')} sx={{ color: c.primary, textTransform: 'none', fontSize: 14 }}>{t.pharmacies.explore}</Button>
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
                  <Typography sx={{ color: c.muted, fontSize: 15 }}>{t.pharmacies.no_pharmacies}</Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Prescription Orders Tracking */}
        <Box sx={{ mb: 4, p: 3, borderRadius: '32px', border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text }}>{t.orders.active}</Typography>
            <Button onClick={() => navigate('/patient/orders')} sx={{ color: c.primary, textTransform: 'none', fontSize: 14, fontWeight: 600 }}>{t.orders.track}</Button>
          </Stack>
          
          {orders.length > 0 ? (
            <Grid container spacing={2}>
              {orders.slice(0, 3).map((order) => (
                <Grid key={order._id} size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.bg, transition: 'all 0.2s', '&:hover': { borderColor: c.primary } }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: order.status === 'Delivered' ? c.successSoft : order.status === 'Accepted' ? c.primarySoft : c.warningSoft, color: order.status === 'Delivered' ? c.success : order.status === 'Accepted' ? c.primary : c.warning }}>
                        {order.deliveryType === 'HOME' ? <ShippingIcon fontSize="small" /> : <OrderIcon fontSize="small" />}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.pharmacy?.pharmacyName || 'Pharmacy'}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: c.muted, mb: 0.5 }}>#{order._id.slice(-6).toUpperCase()}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={order.status.toUpperCase()} 
                            size="small" 
                            sx={{ 
                              height: 18, fontSize: 9, fontWeight: 800,
                              bgcolor: order.status === 'Delivered' ? c.successSoft : order.status === 'Rejected' || order.status === 'Cancelled' ? c.dangerSoft : (order.status === 'Pending' || order.status === 'Order Placed') ? c.warningSoft : c.primarySoft,
                              color: order.status === 'Delivered' ? c.success : order.status === 'Rejected' || order.status === 'Cancelled' ? c.danger : (order.status === 'Pending' || order.status === 'Order Placed') ? c.warning : c.primary
                            }} 
                          />
                          <Typography sx={{ fontSize: 10, color: c.muted, mr: 1 }}>{order.deliveryType}</Typography>
                          {(order.status === 'Pending' || order.status === 'Order Placed') && (
                            <Button 
                              size="small" 
                              onClick={() => handleCancelOrder(order._id)}
                              sx={{ p: 0, minWidth: 0, color: c.danger, fontSize: 10, fontWeight: 700, textTransform: 'none' }}
                            >
                              {t.orders.cancel}
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: c.soft, borderRadius: 2, border: `1px dashed ${c.line}`, textAlign: 'center' }}>
               <OrderIcon sx={{ fontSize: 32, color: '#d0d0d0', mb: 1.5 }} />
               <Typography sx={{ fontSize: 14, color: c.muted, maxWidth: 300 }}>{t.orders.no_orders}</Typography>
            </Box>
          )}
        </Box>

        {/* Booking Section */}
        <Box ref={bookingRef} sx={{ p: { xs: 3, md: 4 }, borderRadius: '32px', border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: c.text }}>{t.booking.title}</Typography>
            <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 15 }}>{t.booking.desc}</Typography>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
            <TextField placeholder={t.booking.search_placeholder} value={specialization} onChange={(e) => setSpecialization(e.target.value)} fullWidth size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
            <Button variant="contained" onClick={handleApplyFilter} disabled={doctorsLoading} sx={{ minWidth: 160, borderRadius: 1.5, bgcolor: c.primary, textTransform: 'none', fontSize: 15, fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: c.primaryDark, boxShadow: 'none' } }}>{doctorsLoading ? t.booking.searching : t.booking.search}</Button>
          </Stack>

          {doctorsError && <Typography sx={{ mb: 3, color: c.danger, fontSize: 15 }}>{doctorsError}</Typography>}

          <Grid container spacing={4}>
            {/* Doctors List */}
            <Grid size={{ xs: 12, lg: 7, xl: 8 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 2.5, color: c.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.booking.step_1}</Typography>
              {doctorsLoading ? (
                <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress size={28} sx={{ color: c.primary }} /></Box>
              ) : doctors.length === 0 ? (
                <Box sx={{ py: 4, px: 3, borderRadius: 1.5, bgcolor: c.soft, border: `1px dashed ${c.line}`, textAlign: 'center' }}>
                  <Typography sx={{ color: c.muted, fontSize: 15 }}>{t.booking.no_match}</Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {doctors.map((doctor) => {
                    const name = doctor.user?.full_name || doctor.user?.name || 'Doctor';
                    const rating = doctor.rating && Number(doctor.rating) > 0 ? Number(doctor.rating).toFixed(1) : t.booking.not_rated;
                    const availability = doctor.availability?.length ? doctor.availability.slice(0, 2).map((entry) => `${entry?.day || 'Day'}: ${Array.isArray(entry?.slots) && entry.slots.length ? entry.slots.join(', ') : 'No slots'}`).join(' | ') : t.booking.check_slots;
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
                            {selected ? t.booking.selected : t.booking.select}
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
                  <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 2.5, color: c.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.booking.step_2}</Typography>
                  
                  {selectedDoctor ? (
                    <>
                      <Box sx={{ mb: 3, p: 2, bgcolor: '#fff', borderRadius: 1.5, border: `1px solid ${c.soft}` }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 600, color: c.text }}>{doctorName}</Typography>
                        <Typography sx={{ color: c.muted, fontSize: 14 }}>{selectedDoctor.specialization || 'Specialist'}</Typography>
                        {selectedDoctor.consultationFee && <Typography sx={{ mt: 1, color: c.text, fontSize: 14, fontWeight: 500 }}>{t.booking.fee} {selectedDoctor.consultationFee}</Typography>}
                      </Box>
  
                      <TextField label="Select Date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} fullWidth size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#fff' } }} />
                      
                      <Box sx={{ mt: 3 }}>
                        <Typography sx={{ mb: 1.5, fontSize: 14, fontWeight: 600, color: c.muted }}>{t.booking.available}</Typography>
                        {slotsLoading ? (
                          <CircularProgress size={24} sx={{ color: c.primary }} />
                        ) : slots.length === 0 ? (
                          <Typography sx={{ color: c.danger, fontSize: 14, bgcolor: c.dangerSoft, p: 1.5, borderRadius: 1.5 }}>
                            {selectedDate ? t.booking.no_slots : t.booking.pick_date}
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
                                  borderRadius: '24px',
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
                      
                      <Stack spacing={2} sx={{ mt: 4 }}>
                        <Button 
                          variant="contained" 
                          onClick={startPaymentFlow} 
                          disabled={bookingLoading || paying || !selectedDate || !selectedSlot} 
                          sx={{ 
                            width: '100%', py: 1.5, borderRadius: 1.5, bgcolor: c.primary, 
                            textTransform: 'none', fontSize: 16, fontWeight: 700,
                            boxShadow: `0 8px 20px ${c.primary}30`,
                            '&:hover': { bgcolor: c.primaryDark } 
                          }}
                        >
                          {paying ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 
                           paymentDone ? 'Confirmed' : 'Pay & Confirm Appointment'}
                        </Button>
                        
                        <Button 
                          variant="outlined" 
                          onClick={() => handleBookAppointment('Pending')} 
                          disabled={bookingLoading || paying || !selectedDate || !selectedSlot} 
                          sx={{ width: '100%', py: 1.2, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                        >
                          Book Now, Pay Later
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    <Box sx={{ py: 4, px: 3, borderRadius: 1.5, bgcolor: c.soft, border: `1px dashed ${c.line}`, textAlign: 'center' }}>
                       <Typography sx={{ color: c.muted, fontSize: 14, lineHeight: 1.6 }}>{t.booking.select_first}</Typography>
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
