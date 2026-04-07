import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

const colors = {
  paper: '#fffdf8',
  line: '#d8d0c4',
  text: '#2c2b28',
  muted: '#8b857d',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  blue: '#4a90e2',
  amber: '#d18a1f',
  red: '#d9635b'
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
      [t.cards.tot_pat, summary.totalPatients || 0, t.cards.pat_sub, colors.green, '/doctor/patients'],
      [t.cards.tod_app, summary.todayAppointments || 0, t.cards.tod_sub, colors.blue, '/doctor/appointments'],
      [t.cards.upc_app, summary.upcomingAppointments || 0, t.cards.upc_sub, colors.amber, '/doctor/appointments'],
      [t.cards.presc, summary.prescriptionsIssued || 0, t.cards.presc_sub, colors.red, '/doctor/appointments']
    ];
  }, [data, t]);

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              {t.hello}, {dashboardName}
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 520 }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button onClick={() => navigate('/doctor/availability')} variant="contained" startIcon={<CalendarIcon />} sx={{ bgcolor: colors.green, borderRadius: 3, px: 3, py: 1.25, textTransform: 'none', fontSize: 15, '&:hover': { bgcolor: colors.green } }}>
              {t.manage_slots}
            </Button>
          </Box>
        </Stack>

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.green }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              {summaryCards.map(([title, value, subtext, dot, path]) => (
                <Box 
                  key={title} 
                  onClick={() => navigate(path)}
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 3.5, 
                    border: `1px solid ${colors.line}`, 
                    bgcolor: colors.paper,
                    cursor: 'pointer',
                    transition: '0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderColor: dot }
                  }}
                >
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dot }} />
                    <Typography sx={{ fontSize: 16, color: colors.muted }}>{title}</Typography>
                  </Stack>
                  <Typography sx={{ mt: 1.2, fontSize: 30, lineHeight: 1 }}>{value}</Typography>
                  <Typography sx={{ mt: 1, color: dot, fontSize: 15 }}>{subtext}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.2fr 0.9fr 0.9fr' }, gap: 3 }}>
              <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <CalendarIcon />
                  <Typography sx={{ fontSize: 18 }}>{t.appointments_feed}</Typography>
                </Stack>
                <Stack spacing={2}>
                  {(data?.upcomingAppointments || []).length ? (
                    data.upcomingAppointments.map((appointment) => {
                       const { status: dashStatus, isJoinNear } = getConsultationStatus(appointment);
                       return (
                        <Box key={appointment._id} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f7f3ea' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                                {appointment.patient?.full_name || 'Patient'}
                              </Typography>
                              <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>
                                {appointment.specialization || t.general_consult}
                              </Typography>
                              <Typography sx={{ color: colors.muted, fontSize: 13, mt: 0.5 }}>
                                {formatDate(appointment.appointmentDate, t.date_pending)} {t.at} {appointment.timeSlot}
                              </Typography>
                            </Box>
                            <Chip 
                              label={dashStatus.toUpperCase()} 
                              size="small" 
                              sx={{ 
                                bgcolor: dashStatus === 'ongoing' ? colors.greenSoft : dashStatus === 'upcoming' ? colors.blue : dashStatus === 'missed' ? colors.red : colors.muted,
                                color: dashStatus === 'ongoing' ? colors.green : '#fff',
                                fontWeight: 'bold',
                                fontSize: 10
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
                                  sx={{ bgcolor: colors.green, borderRadius: 1.5, fontSize: 11, textTransform: 'none', '&:hover': { bgcolor: colors.green } }}
                                >
                                  {t.join_consult}
                                </Button>
                                <Button onClick={() => handleOpenReschedule(appointment)} size="small" variant="outlined" sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.reschedule}</Button>
                                <Button onClick={() => handleCancel(appointment._id)} disabled={cancellingId === appointment._id} size="small" variant="text" sx={{ color: colors.red, fontSize: 11, textTransform: 'none' }}>{cancellingId === appointment._id ? t.cancelling : t.cancel}</Button>
                              </>
                            )}
                            {dashStatus === 'ongoing' && (
                              <>
                                <Button onClick={() => navigate('/doctor/video-call', { state: { appointment } })} size="small" variant="contained" startIcon={<OngoingIcon />} sx={{ bgcolor: colors.green, borderRadius: 1.5, fontSize: 11, textTransform: 'none', '&:hover': { bgcolor: colors.green } }}>{t.join_now}</Button>
                                <Button onClick={() => navigate('/doctor/video-call', { state: { appointment } })} size="small" variant="outlined" startIcon={<ChatIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.chat_patient}</Button>
                                <Button onClick={() => navigate('/doctor/prescribe', { state: { appointment } })} size="small" variant="contained" startIcon={<PrescriptionIcon />} sx={{ ml: 'auto', bgcolor: colors.green, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.prescribe}</Button>
                              </>
                            )}
                            {dashStatus === 'completed' && (
                              <>
                                <Button onClick={() => setPrescriptionDialog({ open: true, consultationId: appointment._id })} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.view_prescription}</Button>
                                <Button onClick={() => setHistoryDialog({ open: true, patient: appointment.patient })} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.view_records}</Button>
                                <Button size="small" variant="outlined" startIcon={<StarIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.feedback}</Button>
                              </>
                            )}
                            {dashStatus === 'cancelled' && (
                              <Button onClick={() => navigate('/doctor/appointments')} size="small" variant="outlined" startIcon={<HistoryIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.rebook}</Button>
                            )}
                            {dashStatus === 'missed' && (
                              <>
                                <Button onClick={() => navigate('/doctor/appointments')} size="small" variant="outlined" sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, fontSize: 11, textTransform: 'none' }}>{t.reschedule}</Button>
                                <Button onClick={() => navigate('/doctor/appointments')} size="small" variant="contained" sx={{ bgcolor: colors.blue, borderRadius: 1.5, fontSize: 11, textTransform: 'none', '&:hover': { bgcolor: colors.blue } }}>{t.book_again}</Button>
                              </>
                            )}
                          </Box>
                        </Box>
                       );
                    })
                  ) : (
                    <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{t.no_appointments}</Typography>
                  )}
                </Stack>
              </Box>

              <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <PeopleIcon />
                  <Typography sx={{ fontSize: 18 }}>{t.recent_patients}</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {(data?.recentPatients || []).length ? (
                    data.recentPatients.map((patient) => (
                      <Box key={patient._id} sx={{ p: 1.6, borderRadius: 2.5, bgcolor: '#f7f3ea' }}>
                        <Typography sx={{ fontSize: 15.5, fontWeight: 600 }}>{patient.full_name}</Typography>
                        <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>{patient.specialization || t.general_consult}</Typography>
                        <Typography sx={{ color: colors.muted, fontSize: 13.5, mt: 0.5 }}>{t.last_visit}: {formatDate(patient.lastAppointmentDate, t.date_pending)}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{t.no_recent_patients}</Typography>
                  )}
                </Stack>
              </Box>

              <Stack spacing={3}>
                <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <NotificationIcon />
                    <Typography sx={{ fontSize: 18 }}>{t.notifications}</Typography>
                  </Stack>
                  <Stack spacing={1.2}>
                    {(data?.notifications || []).slice(0, 5).map((item) => (
                      <Box key={item._id} sx={{ p: 1.2, borderRadius: 2.2, bgcolor: '#f7f3ea' }}>
                        <Typography sx={{ fontSize: 14.5 }}>{item.title}</Typography>
                        <Typography sx={{ color: colors.muted, fontSize: 12.8, mt: 0.4 }}>{item.message}</Typography>
                      </Box>
                    ))}
                    {!(data?.notifications || []).length && (
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{t.no_notifications}</Typography>
                    )}
                  </Stack>
                </Box>
                <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <PrescriptionIcon />
                    <Typography sx={{ fontSize: 18 }}>{t.profile_snapshot}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 15, color: colors.text }}>{data?.profile?.user?.full_name || 'Doctor'}</Typography>
                  <Typography sx={{ fontSize: 13.5, color: colors.muted, mt: 0.5 }}>{data?.profile?.doctor?.specialization || t.spec_not_added}</Typography>
                  <Typography sx={{ fontSize: 13.5, color: colors.muted, mt: 0.5 }}>{data?.profile?.doctor?.hospitalName || t.hosp_not_added}</Typography>
                  <Button onClick={() => navigate('/doctor/profile')} sx={{ mt: 2, px: 2.2, py: 1, borderRadius: 2.4, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 14.5, '&:hover': { bgcolor: '#f7f3ea' } }}>{t.view_profile}</Button>
                </Box>
              </Stack>
            </Box>
          </>
        )}
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>
      <Dialog open={rescheduleData.open} onClose={() => setRescheduleData(p => ({ ...p, open: false }))} PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{t.reschedule_title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.muted, mb: 3 }}>{t.reschedule_desc}</Typography>
          <Stack spacing={3}>
            <TextField label={t.choose_date} type="date" value={rescheduleData.date} onChange={(e) => handleDateChange(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>{t.choose_time}</Typography>
              {rescheduleData.loadingSlots ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
              ) : rescheduleData.slots.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 3 }}>
                   <Typography variant="body2" sx={{ color: colors.muted }}>{t.no_slots}</Typography>
                </Box>
              ) : (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                   {rescheduleData.slots.map(slot => (
                     <Chip key={slot} label={slot} onClick={() => setRescheduleData(p => ({ ...p, selectedSlot: slot }))} sx={{ borderRadius: 2, fontWeight: 700, border: '1px solid', borderColor: rescheduleData.selectedSlot === slot ? colors.green : 'divider', bgcolor: rescheduleData.selectedSlot === slot ? colors.greenSoft : 'transparent', color: rescheduleData.selectedSlot === slot ? colors.green : colors.text }} />
                   ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setRescheduleData(p => ({ ...p, open: false }))} sx={{ color: colors.muted, textTransform: 'none', fontWeight: 600 }}>{t.cancel}</Button>
          <Button onClick={handleRescheduleSubmit} disabled={!rescheduleData.selectedSlot || rescheduleData.loadingSlots} variant="contained" sx={{ bgcolor: colors.green, borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: colors.green } }}>{rescheduleData.loadingSlots ? t.rescheduling : t.confirm_reschedule}</Button>
        </DialogActions>
      </Dialog>
      <PatientHistoryDialog open={historyDialog.open} onClose={() => setHistoryDialog(p => ({ ...p, open: false }))} patient={historyDialog.patient} />
      <PrescriptionViewDialog open={prescriptionDialog.open} onClose={() => setPrescriptionDialog(p => ({ ...p, open: false }))} consultationId={prescriptionDialog.consultationId} />
    </DoctorLayout>
  );
}
