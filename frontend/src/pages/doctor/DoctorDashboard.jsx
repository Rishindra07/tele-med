import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  CalendarMonthRounded as CalendarIcon,
  NotificationsNoneRounded as NotificationIcon,
  PeopleRounded as PeopleIcon,
  ReceiptLongRounded as PrescriptionIcon,
  ChatBubbleOutlineRounded as ChatIcon,
  FileUploadOutlined as UploadIcon,
  VisibilityOutlined as ViewIcon,
  StarOutlineRounded as StarIcon,
  HistoryRounded as HistoryIcon,
  CancelOutlined as CancelIcon,
  VideocamRounded as VideoIcon,
  PlayCircleFilledRounded as OngoingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { fetchDoctorDashboard, updateAppointmentStatus, rescheduleAppointment } from '../../api/doctorApi';
import { getDoctorSlots } from '../../api/appointmentApi';
import { getConsultationStatus } from '../../utils/consultationUtils';
import PatientHistoryDialog from '../../components/doctor/PatientHistoryDialog';
import PrescriptionViewDialog from '../../components/doctor/PrescriptionViewDialog';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_DASHBOARD_TRANSLATIONS } from '../../utils/translations/doctor';

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

const formatDate = (value, fallbackText = 'Date pending') => {
  if (!value) return fallbackText;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallbackText
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function DoctorDashboard() {
  const { language } = useLanguage();
  const t = DOCTOR_DASHBOARD_TRANSLATIONS[language] || DOCTOR_DASHBOARD_TRANSLATIONS['en'];

  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  const [rescheduleData, setRescheduleData] = useState({ open: false, appointment: null, date: '', slots: [], selectedSlot: '', loadingSlots: false });
  const [historyDialog, setHistoryDialog] = useState({ open: false, patient: null });
  const [prescriptionDialog, setPrescriptionDialog] = useState({ open: false, consultationId: null });

  const getGreetingName = (fullName) => {
    if (!fullName) return 'Doctor';
    const name = fullName.trim();
    return name.toLowerCase().startsWith('dr.') ? name : `Dr. ${name}`;
  };

  const dashboardName = data?.profile?.user?.full_name 
    ? getGreetingName(data.profile.user.full_name) 
    : (() => {
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          return getGreetingName(u.full_name || u.name || 'Doctor');
        } catch { return 'Dr. Doctor'; }
      })();

  const load = async () => {
    try {
      setLoading(true);
      const response = await fetchDoctorDashboard();
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpenReschedule = (appt) => {
    setRescheduleData(p => ({ ...p, open: true, appointment: appt, date: appt.appointmentDate?.split('T')[0] || '', slots: [], selectedSlot: '' }));
  };

  const handleDateChange = async (date) => {
    setRescheduleData(p => ({ ...p, date, loadingSlots: true, slots: [], selectedSlot: '' }));
    try {
      const docId = data?.doctor?._id || rescheduleData.appointment?.doctor?._id || rescheduleData.appointment?.doctor;
      if (!docId) throw new Error('Doctor ID not found');
      const res = await getDoctorSlots(docId, date);
      const available = res.slots?.filter(s => !s.isBooked).map(s => s.time) || [];
      setRescheduleData(p => ({ ...p, slots: available, loadingSlots: false }));
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Failed to fetch slots' });
      setRescheduleData(p => ({ ...p, loadingSlots: false }));
    }
  };

  const handleRescheduleSubmit = async () => {
    const { appointment, date, selectedSlot } = rescheduleData;
    if (!date || !selectedSlot) return;
    try {
      setRescheduleData(p => ({ ...p, loadingSlots: true }));
      await rescheduleAppointment(appointment._id, date, selectedSlot);
      setSnackbar({ open: true, severity: 'success', message: 'Appointment rescheduled!' });
      setRescheduleData(p => ({ ...p, open: false }));
      load();
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err.message || 'Error rescheduling' });
    } finally {
      setRescheduleData(p => ({ ...p, loadingSlots: false }));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setCancellingId(id);
      await updateAppointmentStatus(id, 'Cancelled');
      setSnackbar({ open: true, severity: 'success', message: 'Appointment cancelled successfully.' });
      load();
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err.message || 'Failed to cancel appointment.' });
    } finally {
      setCancellingId(null);
    }
  };

  const summaryCards = useMemo(() => {
    const summary = data?.summary || {};
    return [
      [t.cards.tot_pat, summary.totalPatients || 0, t.cards.pat_sub, c.success, '/doctor/patients'],
      [t.cards.tod_app, summary.todayAppointments || 0, t.cards.tod_sub, c.primary, '/doctor/appointments'],
      [t.cards.upc_app, summary.upcomingAppointments || 0, t.cards.upc_sub, c.warning, '/doctor/appointments'],
      [t.cards.presc, summary.prescriptionsIssued || 0, t.cards.presc_sub, c.danger, '/doctor/appointments']
    ];
  }, [data, t]);

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: c.bg, minHeight: '100vh' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={3} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: c.text, fontFamily: 'Inter, sans-serif' }}>
              {t.hello}, {dashboardName}
            </Typography>
            <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 16 }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, color: c.muted, fontSize: 15, fontWeight: 500 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button sx={{ minWidth: 44, width: 44, height: 44, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, color: c.text, position: 'relative' }}>
              <NotificationIcon fontSize="small" />
            </Button>
            <Button onClick={() => navigate('/doctor/availability')} sx={{ px: 3, py: 1.25, borderRadius: 2, bgcolor: c.primary, color: '#fff', fontSize: 15, fontWeight: 600, textTransform: 'none', boxShadow: '0 2px 4px rgba(26,115,232,0.2)', '&:hover': { bgcolor: c.primaryDark, boxShadow: '0 4px 6px rgba(26,115,232,0.3)' } }}>
              {t.manage_slots}
            </Button>
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: c.primary }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {summaryCards.map(([title, value, subtext, dotColor, path]) => (
                <Grid key={title} item xs={12} sm={6} md={3}>
                  <Box 
                    onClick={() => navigate(path)}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      border: `1px solid ${c.line}`, 
                      bgcolor: c.paper,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderColor: dotColor }
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</Typography>
                    <Typography sx={{ mt: 1, fontSize: 32, fontWeight: 600, color: c.text }}>{value}</Typography>
                    <Typography sx={{ mt: 1, color: dotColor, fontSize: 14, fontWeight: 500 }}>{subtext}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} xl={5.5}>
                <Box sx={{ h: '100%', p: 3, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <CalendarIcon sx={{ color: c.primary }} />
                    <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text }}>{t.appointments_feed}</Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {(data?.upcomingAppointments || []).length ? (
                      data.upcomingAppointments.slice(0, 5).map((appointment) => {
                         const { status: dashStatus } = getConsultationStatus(appointment);
                         return (
                          <Box key={appointment._id} sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${c.line}`, bgcolor: '#fff' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box>
                                <Typography sx={{ fontSize: 16, fontWeight: 600, color: c.text }}>
                                  {appointment.patient?.full_name || 'Patient'}
                                </Typography>
                                <Typography sx={{ color: c.muted, fontSize: 13.5 }}>
                                  {appointment.specialization || t.general_consult}
                                </Typography>
                                <Typography sx={{ color: c.muted, fontSize: 13, mt: 0.5 }}>
                                  {formatDate(appointment.appointmentDate, t.date_pending)} at {appointment.timeSlot}
                                </Typography>
                              </Box>
                              <Chip 
                                label={dashStatus.toUpperCase()} 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: 10, 
                                  fontWeight: 700,
                                  bgcolor: dashStatus === 'ongoing' ? c.successSoft : dashStatus === 'upcoming' ? c.primarySoft : dashStatus === 'missed' ? c.dangerSoft : c.soft,
                                  color: dashStatus === 'ongoing' ? c.success : dashStatus === 'upcoming' ? c.primaryDark : dashStatus === 'missed' ? c.danger : c.muted 
                                }} 
                              />
                            </Stack>
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {dashStatus === 'upcoming' && (
                                <>
                                  <Button 
                                    onClick={() => navigate('/doctor/video-call', { state: { appointment } })} 
                                    size="small" 
                                    variant="contained" 
                                    startIcon={<VideoIcon />} 
                                    sx={{ bgcolor: c.primary, borderRadius: 1.5, fontSize: 11, textTransform: 'none', '&:hover': { bgcolor: c.primaryDark } }}
                                  >
                                    {t.join_consult}
                                  </Button>
                                  <Button onClick={() => handleOpenReschedule(appointment)} size="small" variant="outlined" sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.reschedule}</Button>
                                  <Button onClick={() => handleCancel(appointment._id)} disabled={cancellingId === appointment._id} size="small" variant="text" sx={{ color: c.danger, fontSize: 11, textTransform: 'none' }}>{cancellingId === appointment._id ? t.cancelling : t.cancel}</Button>
                                </>
                              )}
                              {dashStatus === 'ongoing' && (
                                <>
                                  <Button onClick={() => navigate('/doctor/video-call', { state: { appointment } })} size="small" variant="contained" startIcon={<OngoingIcon />} sx={{ bgcolor: c.success, borderRadius: 1.5, fontSize: 11, textTransform: 'none', '&:hover': { bgcolor: c.success } }}>{t.join_now}</Button>
                                  <Button onClick={() => navigate('/doctor/video-call', { state: { appointment } })} size="small" variant="outlined" startIcon={<ChatIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.chat_patient}</Button>
                                  <Button onClick={() => navigate('/doctor/prescribe', { state: { appointment } })} size="small" variant="contained" startIcon={<PrescriptionIcon />} sx={{ ml: 'auto', bgcolor: c.primary, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.prescribe}</Button>
                                </>
                              )}
                              {dashStatus === 'completed' && (
                                <>
                                  <Button onClick={() => setPrescriptionDialog({ open: true, consultationId: appointment._id })} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.view_prescription}</Button>
                                  <Button onClick={() => setHistoryDialog({ open: true, patient: appointment.patient })} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.view_records}</Button>
                                  <Button size="small" variant="outlined" startIcon={<StarIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.feedback}</Button>
                                </>
                              )}
                              {dashStatus === 'cancelled' && (
                                <Button onClick={() => navigate('/doctor/appointments')} size="small" variant="outlined" startIcon={<HistoryIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.rebook}</Button>
                              )}
                              {dashStatus === 'missed' && (
                                <>
                                  <Button onClick={() => navigate('/doctor/appointments')} size="small" variant="outlined" sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.reschedule}</Button>
                                  <Button onClick={() => navigate('/doctor/appointments')} size="small" variant="contained" sx={{ bgcolor: c.primary, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.book_again}</Button>
                                </>
                              )}
                            </Box>
                          </Box>
                         );
                      })
                    ) : (
                      <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${c.line}`, borderRadius: 2, bgcolor: c.soft }}>
                        <CalendarIcon sx={{ fontSize: 40, color: c.muted, mb: 2 }} />
                        <Typography sx={{ color: c.muted, fontSize: 15 }}>{t.no_appointments}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} xl={3.5}>
                <Box sx={{ h: '100%', p: 3, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <PeopleIcon sx={{ color: c.primary }} />
                    <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text }}>{t.recent_patients}</Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {(data?.recentPatients || []).length ? (
                      data.recentPatients.slice(0, 6).map((patient) => (
                        <Box key={patient._id} sx={{ p: 1.6, borderRadius: 1.5, border: `1px solid ${c.line}`, bgcolor: '#fff', '&:hover': { borderColor: c.primary } }}>
                           <Typography sx={{ fontSize: 15, fontWeight: 600, color: c.text }}>{patient.full_name}</Typography>
                           <Typography sx={{ color: c.muted, fontSize: 13 }}>{patient.specialization || t.general_consult}</Typography>
                           <Typography sx={{ color: c.muted, fontSize: 12, mt: 0.5 }}>{t.last_visit}: {formatDate(patient.lastAppointmentDate, t.date_pending)}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                         <PeopleIcon sx={{ fontSize: 40, color: '#d0d0d0', mb: 1.5 }} />
                         <Typography sx={{ color: c.muted, fontSize: 14.5 }}>{t.no_recent_patients}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} xl={3}>
                <Stack spacing={3} sx={{ height: '100%' }}>
                  <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <NotificationIcon sx={{ color: c.primary }} />
                      <Typography sx={{ fontSize: 17, fontWeight: 600 }}>{t.notifications}</Typography>
                    </Stack>
                    <Stack spacing={1.2}>
                      {(data?.notifications || []).slice(0, 4).map((item) => (
                        <Box key={item._id} sx={{ p: 1.2, borderRadius: 1.5, bgcolor: c.soft, border: `1px solid ${c.line}` }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 600, color: c.text }}>{item.title}</Typography>
                          <Typography sx={{ color: c.muted, fontSize: 12.5, mt: 0.4 }}>{item.message}</Typography>
                        </Box>
                      ))}
                      {!(data?.notifications || []).length && (
                        <Typography sx={{ color: c.muted, fontSize: 14, py: 2, textAlign: 'center' }}>{t.no_notifications}</Typography>
                      )}
                    </Stack>
                  </Box>
                  <Box sx={{ p: 3, flexGrow: 1, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <PrescriptionIcon sx={{ color: c.primary }} />
                      <Typography sx={{ fontSize: 17, fontWeight: 600 }}>{t.profile_snapshot}</Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: c.primarySoft, color: c.primaryDark, fontWeight: 700 }}>{dashboardName[0]}</Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: c.text }}>{data?.profile?.user?.full_name || 'Doctor'}</Typography>
                        <Typography sx={{ fontSize: 13, color: c.muted }}>{data?.profile?.doctor?.specialization || t.spec_not_added}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: c.muted, mb: 2 }}>{data?.profile?.doctor?.hospitalName || t.hosp_not_added}</Typography>
                    <Button onClick={() => navigate('/doctor/profile')} fullWidth sx={{ py: 1, borderRadius: 1.5, border: `1px solid ${c.line}`, color: c.text, textTransform: 'none', fontSize: 14, fontWeight: 600, '&:hover': { bgcolor: c.soft } }}>{t.view_profile}</Button>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>
      <Dialog open={rescheduleData.open} onClose={() => setRescheduleData(p => ({ ...p, open: false }))} PaperProps={{ sx: { borderRadius: 2, width: '100%', maxWidth: 450 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: c.text }}>{t.reschedule_title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: c.muted, mb: 3 }}>{t.reschedule_desc}</Typography>
          <Stack spacing={3}>
            <TextField label={t.choose_date} type="date" value={rescheduleData.date} onChange={(e) => handleDateChange(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: c.text }}>{t.choose_time}</Typography>
              {rescheduleData.loadingSlots ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} sx={{ color: c.primary }} /></Box>
              ) : rescheduleData.slots.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center', bgcolor: c.bg, borderRadius: 2, border: `1px solid ${c.line}` }}>
                   <Typography variant="body2" sx={{ color: c.muted }}>{t.no_slots}</Typography>
                </Box>
              ) : (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                   {rescheduleData.slots.map(slot => (
                     <Chip key={slot} label={slot} onClick={() => setRescheduleData(p => ({ ...p, selectedSlot: slot }))} sx={{ borderRadius: 1.5, fontWeight: 700, border: '1px solid', borderColor: rescheduleData.selectedSlot === slot ? c.primary : c.line, bgcolor: rescheduleData.selectedSlot === slot ? c.primarySoft : 'transparent', color: rescheduleData.selectedSlot === slot ? c.primaryDark : c.text }} />
                   ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setRescheduleData(p => ({ ...p, open: false }))} sx={{ color: c.muted, textTransform: 'none', fontWeight: 600 }}>{t.cancel}</Button>
          <Button onClick={handleRescheduleSubmit} disabled={!rescheduleData.selectedSlot || rescheduleData.loadingSlots} variant="contained" sx={{ bgcolor: c.primary, borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700, boxShadow: `0 4px 12px ${c.primary}30`, '&:hover': { bgcolor: c.primaryDark } }}>{rescheduleData.loadingSlots ? t.rescheduling : t.confirm_reschedule}</Button>
        </DialogActions>
      </Dialog>
      <PatientHistoryDialog open={historyDialog.open} onClose={() => setHistoryDialog(p => ({ ...p, open: false }))} patient={historyDialog.patient} />
      <PrescriptionViewDialog open={prescriptionDialog.open} onClose={() => setPrescriptionDialog(p => ({ ...p, open: false }))} consultationId={prescriptionDialog.consultationId} />
    </DoctorLayout>
  );
}
