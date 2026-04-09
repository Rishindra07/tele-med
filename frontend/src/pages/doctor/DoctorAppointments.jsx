import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Snackbar, Stack, TextField, Typography
} from '@mui/material';
import {
  AccessTimeRounded as TimeIcon,
  CalendarMonthRounded as CalendarIcon,
  CheckCircleOutlineRounded as CompleteIcon,
  SearchRounded as SearchIcon,
  ChatBubbleOutlineRounded as ChatIcon,
  FileUploadOutlined as UploadIcon,
  VisibilityOutlined as ViewIcon,
  StarOutlineRounded as StarIcon,
  HistoryRounded as HistoryIcon,
  VideocamRounded as VideoIcon,
  PlayCircleFilledRounded as OngoingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { getDoctorAppointments, getDoctorSlots } from '../../api/appointmentApi';
import { updateAppointmentStatus, rescheduleAppointment } from '../../api/doctorApi';
import { getConsultationStatus } from '../../utils/consultationUtils';
import PatientHistoryDialog from '../../components/doctor/PatientHistoryDialog';
import PrescriptionViewDialog from '../../components/doctor/PrescriptionViewDialog';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_APPOINTMENTS_TRANSLATIONS, DOCTOR_DASHBOARD_TRANSLATIONS } from '../../utils/translations/doctor';

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
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallbackText
    : date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export default function DoctorAppointments() {
  const { language } = useLanguage();
  const tDash = DOCTOR_DASHBOARD_TRANSLATIONS[language] || DOCTOR_DASHBOARD_TRANSLATIONS['en'];
  const tAppt = DOCTOR_APPOINTMENTS_TRANSLATIONS[language] || DOCTOR_APPOINTMENTS_TRANSLATIONS['en'];

  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  const [rescheduleData, setRescheduleData] = useState({ open: false, appointment: null, date: '', slots: [], selectedSlot: '', loadingSlots: false });
  const [historyDialog, setHistoryDialog] = useState({ open: false, patient: null });
  const [prescriptionDialog, setPrescriptionDialog] = useState({ open: false, consultationId: null });

  const load = async () => {
    try {
      setLoading(true);
      const response = await getDoctorAppointments();
      setAppointments(response.appointments || []);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  
  const handleStatusUpdate = async (id, status) => {
    if (status === 'Cancelled' && !window.confirm('Are you sure you want to cancel?')) return;
    try {
      setUpdatingId(id);
      await updateAppointmentStatus(id, status);
      setSnackbar({ open: true, severity: 'success', message: `Appointment ${status.toLowerCase()} successfully.` });
      load();
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err.message || 'Failed to update status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenReschedule = (appt) => {
    setRescheduleData(p => ({ ...p, open: true, appointment: appt, date: appt.appointmentDate?.split('T')[0] || '', slots: [], selectedSlot: '' }));
  };

  const handleDateChange = async (date) => {
    setRescheduleData(p => ({ ...p, date, loadingSlots: true, slots: [], selectedSlot: '' }));
    try {
      const docId = rescheduleData.appointment?.doctor?._id || rescheduleData.appointment?.doctor;
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

  const normalizedAppointments = useMemo(() =>
    appointments.map(a => {
      const { status: callStatus, label: callLabel, isJoinNear } = getConsultationStatus(a);
      return {
        ...a,
        callStatus,
        callLabel,
        isJoinNear,
        patientName: a.patient?.full_name || 'Patient',
        specialization: a.specialization || tDash.general_consult,
        dateLabel: formatDate(a.appointmentDate, tDash.date_pending),
        timeLabel: a.timeSlot || '--:--'
      };
    }), [appointments, tDash]);

  const filteredAppointments = useMemo(() =>
    normalizedAppointments.filter(a => {
      const filterMatch = activeFilter === 'all' || a.callStatus === activeFilter;
      const queryMatch = !query.trim() || `${a.patientName} ${a.specialization}`.toLowerCase().includes(query.toLowerCase());
      return filterMatch && queryMatch;
    }), [activeFilter, normalizedAppointments, query]);

  const grouped = {
    ongoing: filteredAppointments.filter(a => a.callStatus === 'ongoing'),
    upcoming: filteredAppointments.filter(a => a.callStatus === 'upcoming'),
    completed: filteredAppointments.filter(a => a.callStatus === 'completed'),
    cancelled: filteredAppointments.filter(a => a.callStatus === 'cancelled'),
    missed: filteredAppointments.filter(a => a.callStatus === 'missed')
  };

  const renderAppointment = (a) => {
    const isUpdating = updatingId === a._id;
    const { callStatus: dashStatus, isJoinNear } = a;

    return (
      <Box key={a._id} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: c.text }}>{a.patientName}</Typography>
            <Typography sx={{ color: c.muted, fontSize: 14.5 }}>{a.specialization}</Typography>
            <Stack spacing={0.8} sx={{ mt: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarIcon sx={{ fontSize: 16, color: c.muted }} />
                <Typography sx={{ color: c.muted, fontSize: 14.5 }}>{a.dateLabel}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <TimeIcon sx={{ fontSize: 16, color: c.muted }} />
                <Typography sx={{ color: c.muted, fontSize: 14.5 }}>{a.timeLabel}</Typography>
              </Stack>
            </Stack>
          </Box>
          <Chip label={dashStatus.toUpperCase()} size="small" sx={{ 
              height: 20, 
              fontSize: 10, 
              fontWeight: 700,
              bgcolor: dashStatus === 'ongoing' ? c.successSoft : dashStatus === 'upcoming' ? c.primarySoft : dashStatus === 'missed' ? c.dangerSoft : c.soft,
              color: dashStatus === 'ongoing' ? c.success : dashStatus === 'upcoming' ? c.primaryDark : dashStatus === 'missed' ? c.danger : c.muted 
          }} />
        </Stack>

        <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {dashStatus === 'upcoming' && (
            <>
              {isJoinNear ? (
                <Button 
                  onClick={() => navigate('/doctor/video-call', { state: { appointment: a.raw || a } })} 
                  size="small" 
                  variant="contained" 
                  startIcon={<VideoIcon />} 
                  sx={{ bgcolor: c.primary, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}
                >
                  {tDash.join_consult}
                </Button>
              ) : (
                <Box sx={{ px: 2, py: 0.8, borderRadius: 1.5, bgcolor: c.primarySoft, border: `1px solid ${c.primary}30` }}>
                   <Typography sx={{ color: c.primaryDark, fontSize: 13, fontWeight: 600 }}>{a.callLabel}</Typography>
                </Box>
              )}
              <Button onClick={() => handleOpenReschedule(a)} disabled={updatingId === a._id} size="small" variant="outlined" sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>{tDash.reschedule}</Button>
              <Button onClick={() => handleStatusUpdate(a._id, 'Cancelled')} disabled={updatingId === a._id} size="small" variant="text" sx={{ color: c.danger, textTransform: 'none' }}>{updatingId === a._id ? tAppt.processing : tAppt.cancel_appt}</Button>
            </>
          )}
          {dashStatus === 'ongoing' && (
            <>
              <Button 
                onClick={() => navigate('/doctor/video-call', { state: { appointment: a.raw || a } })} 
                size="small" 
                variant="contained" 
                startIcon={<OngoingIcon />} 
                sx={{ bgcolor: c.success, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none', '&:hover': { bgcolor: c.success } }}
              >
                {tDash.join_now}
              </Button>
              <Button 
                onClick={() => navigate('/doctor/video-call', { state: { appointment: a.raw || a, openChat: true } })} 
                size="small" 
                variant="outlined" 
                startIcon={<ChatIcon />} 
                sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}
              >
                {tDash.chat_patient}
              </Button>
              <Button size="small" variant="outlined" startIcon={<UploadIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>{tAppt.upload_reports}</Button>
              <Button onClick={() => navigate('/doctor/prescribe', { state: { appointment: a } })} variant="contained" startIcon={<CompleteIcon />} sx={{ ml: 'auto', bgcolor: c.primary, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>{tDash.prescribe}</Button>
            </>
          )}
          {dashStatus === 'completed' && (
            <>
              <Button onClick={() => setPrescriptionDialog({ open: true, consultationId: a._id })} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>{tDash.view_prescription}</Button>
              <Button onClick={() => setHistoryDialog({ open: true, patient: a.patient })} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>{tDash.view_records}</Button>
              <Button size="small" variant="outlined" startIcon={<StarIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>{tDash.feedback}</Button>
            </>
          )}
          {dashStatus === 'cancelled' && (
            <Button size="small" variant="outlined" startIcon={<HistoryIcon />} sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>{tDash.rebook}</Button>
          )}
          {dashStatus === 'missed' && (
            <>
              <Button size="small" variant="outlined" sx={{ borderColor: c.line, color: c.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>{tDash.reschedule}</Button>
              <Button size="small" variant="contained" sx={{ bgcolor: c.primary, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>{tDash.book_again}</Button>
            </>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: c.bg, minHeight: '100vh' }}>
        <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: c.text, fontFamily: 'Inter, sans-serif' }}>
          {tAppt.title}
        </Typography>
        <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 16, mb: 4 }}>
          {tAppt.subtitle}
        </Typography>

        <TextField
          placeholder={tAppt.search}
          value={query}
          onChange={e => setQuery(e.target.value)}
          fullWidth
          sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: c.muted }} /></InputAdornment> }}
        />

        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mb: 4 }}>
          {[['all', tAppt.filters.all], ['upcoming', tAppt.filters.upcoming], ['ongoing', tAppt.filters.ongoing], ['completed', tAppt.filters.completed], ['missed', tAppt.filters.missed], ['cancelled', tAppt.filters.cancelled]].map(([value, label]) => (
            <Chip
              key={value}
              label={label}
              clickable
              onClick={() => setActiveFilter(value)}
              sx={{ 
                borderRadius: 2, 
                px: 1,
                py: 2,
                fontWeight: 600,
                border: `1px solid ${activeFilter === value ? c.primary : c.line}`, 
                bgcolor: activeFilter === value ? c.primary : '#fff', 
                color: activeFilter === value ? '#fff' : c.muted,
                '&:hover': { bgcolor: activeFilter === value ? c.primaryDark : c.soft }
              }}
            />
          ))}
        </Stack>

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress sx={{ color: c.primary }} /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : (
          <Stack spacing={5}>
            {(grouped.ongoing.length > 0 || grouped.upcoming.length > 0) && (
              <Box>
                <Typography sx={{ color: c.muted, fontSize: 14, letterSpacing: '0.5px', mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>{tAppt.groups.live}</Typography>
                <Stack spacing={2}>{[...grouped.ongoing, ...grouped.upcoming].map(renderAppointment)}</Stack>
              </Box>
            )}
            {grouped.completed.length > 0 && (
              <Box>
                <Typography sx={{ color: c.muted, fontSize: 14, letterSpacing: '0.5px', mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>{tAppt.groups.completed}</Typography>
                <Stack spacing={2}>{grouped.completed.map(renderAppointment)}</Stack>
              </Box>
            )}
            {grouped.missed.length > 0 && (
              <Box>
                <Typography sx={{ color: c.muted, fontSize: 14, letterSpacing: '0.5px', mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>{tAppt.groups.missed}</Typography>
                <Stack spacing={2}>{grouped.missed.map(renderAppointment)}</Stack>
              </Box>
            )}
            {grouped.cancelled.length > 0 && (
              <Box>
                <Typography sx={{ color: c.muted, fontSize: 14, letterSpacing: '0.5px', mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>{tAppt.groups.cancelled}</Typography>
                <Stack spacing={2}>{grouped.cancelled.map(renderAppointment)}</Stack>
              </Box>
            )}
            {filteredAppointments.length === 0 && (
              <Box sx={{ py: 10, textAlign: 'center', bgcolor: c.paper, borderRadius: 2, border: `1px dashed ${c.line}` }}>
                 <CalendarIcon sx={{ fontSize: 48, color: c.line, mb: 2 }} />
                 <Typography sx={{ color: c.muted }}>{tAppt.no_appointments || 'No appointments found.'}</Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={rescheduleData.open} onClose={() => setRescheduleData(p => ({ ...p, open: false }))} PaperProps={{ sx: { borderRadius: 2, width: '100%', maxWidth: 450 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: c.text }}>{tDash.reschedule_title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: c.muted, mb: 3 }}>{tDash.reschedule_desc}</Typography>
          <Stack spacing={3}>
            <TextField label={tDash.choose_date} type="date" value={rescheduleData.date} onChange={(e) => handleDateChange(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: c.text }}>{tDash.choose_time}</Typography>
              {rescheduleData.loadingSlots ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} sx={{ color: c.primary }} /></Box>
              ) : rescheduleData.slots.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center', bgcolor: c.bg, borderRadius: 2, border: `1px solid ${c.line}` }}>
                   <Typography variant="body2" sx={{ color: c.muted }}>{tDash.no_slots}</Typography>
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
          <Button onClick={() => setRescheduleData(p => ({ ...p, open: false }))} sx={{ color: c.muted, textTransform: 'none', fontWeight: 600 }}>{tDash.cancel}</Button>
          <Button onClick={handleRescheduleSubmit} disabled={!rescheduleData.selectedSlot || rescheduleData.loadingSlots} variant="contained" sx={{ bgcolor: c.primary, borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700, boxShadow: `0 4px 12px ${c.primary}30`, '&:hover': { bgcolor: c.primaryDark } }}>
             {rescheduleData.loadingSlots ? tDash.rescheduling : tDash.confirm_reschedule}
          </Button>
        </DialogActions>
      </Dialog>

      <PatientHistoryDialog
        open={historyDialog.open}
        onClose={() => setHistoryDialog(p => ({ ...p, open: false }))}
        patient={historyDialog.patient}
      />

      <PrescriptionViewDialog
        open={prescriptionDialog.open}
        onClose={() => setPrescriptionDialog(p => ({ ...p, open: false }))}
        consultationId={prescriptionDialog.consultationId}
      />
    </DoctorLayout>
  );
}
