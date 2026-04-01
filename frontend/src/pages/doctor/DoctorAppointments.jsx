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

const colors = {
  paper: '#fffdf8', line: '#d8d0c4', soft: '#e7dfd3', muted: '#8a857d',
  text: '#2c2b28',
  green: '#26a37c', greenSoft: '#dff3eb',
  amber: '#d18a1f', amberSoft: '#fbefdc',
  gray: '#8b8b8b', graySoft: '#f1eee7',
  red: '#d9635b', redSoft: '#fdeaea'
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date pending'
    : date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export default function DoctorAppointments() {
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
      // Access doctorId from data or appt
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
        specialization: a.specialization || 'General consultation',
        dateLabel: formatDate(a.appointmentDate),
        timeLabel: a.timeSlot || '--:--'
      };
    }), [appointments]);

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
      <Box key={a._id} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.soft}`, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600 }}>{a.patientName}</Typography>
            <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{a.specialization}</Typography>
            <Stack spacing={0.8} sx={{ mt: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarIcon sx={{ fontSize: 16, color: colors.muted }} />
                <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{a.dateLabel}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <TimeIcon sx={{ fontSize: 16, color: colors.muted }} />
                <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{a.timeLabel}</Typography>
              </Stack>
            </Stack>
          </Box>
          <Chip label={dashStatus.toUpperCase()} size="small" sx={{ 
              bgcolor: dashStatus === 'ongoing' ? colors.greenSoft : dashStatus === 'upcoming' ? colors.amberSoft : dashStatus === 'missed' ? colors.redSoft : colors.graySoft,
              color: dashStatus === 'ongoing' ? colors.green : dashStatus === 'upcoming' ? colors.amber : dashStatus === 'missed' ? colors.red : colors.muted,
              fontWeight: 'bold', fontSize: 11
          }} />
        </Stack>

        <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {dashStatus === 'upcoming' && (
            <>
              {isJoinNear ? (
                <Button size="small" variant="contained" startIcon={<VideoIcon />} sx={{ bgcolor: colors.green, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none', '&:hover': { bgcolor: colors.green } }}>Join Consultation</Button>
              ) : (
                <Box sx={{ px: 2, py: 0.8, borderRadius: 1.5, bgcolor: colors.amberSoft, border: `1px solid ${colors.amber}30` }}>
                   <Typography sx={{ color: colors.amber, fontSize: 13, fontWeight: 600 }}>{a.callLabel}</Typography>
                </Box>
              )}
              <Button onClick={() => handleOpenReschedule(a)} disabled={updatingId === a._id} size="small" variant="outlined" sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>Reschedule</Button>
              <Button onClick={() => handleStatusUpdate(a._id, 'Cancelled')} disabled={updatingId === a._id} size="small" variant="text" sx={{ color: colors.red, textTransform: 'none' }}>{updatingId === a._id ? 'Processing...' : 'Cancel Appointment'}</Button>
            </>
          )}
          {dashStatus === 'ongoing' && (
            <>
              <Button size="small" variant="contained" startIcon={<OngoingIcon />} sx={{ bgcolor: colors.green, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none', '&:hover': { bgcolor: colors.green } }}>Join Now</Button>
              <Button size="small" variant="outlined" startIcon={<ChatIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>Chat with Patient</Button>
              <Button size="small" variant="outlined" startIcon={<UploadIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>Upload Reports</Button>
              <Button onClick={() => navigate('/doctor/prescribe', { state: { appointment: a } })} variant="contained" startIcon={<CompleteIcon />} sx={{ ml: 'auto', bgcolor: colors.green, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none', '&:hover': { bgcolor: colors.green } }}>Prescribe</Button>
            </>
          )}
          {dashStatus === 'completed' && (
            <>
              <Button onClick={() => setPrescriptionDialog({ open: true, consultationId: a._id })} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>View Prescription</Button>
              <Button onClick={() => setHistoryDialog({ open: true, patient: a.patient })} size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>View Records</Button>
              <Button size="small" variant="outlined" startIcon={<StarIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>Feedback</Button>
            </>
          )}
          {dashStatus === 'cancelled' && (
            <Button size="small" variant="outlined" startIcon={<HistoryIcon />} sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>Rebook Patient</Button>
          )}
          {dashStatus === 'missed' && (
            <>
              <Button size="small" variant="outlined" sx={{ borderColor: colors.line, color: colors.text, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none' }}>Reschedule</Button>
              <Button size="small" variant="contained" sx={{ bgcolor: colors.amber, borderRadius: 1.5, py: 0.8, px: 2, textTransform: 'none', '&:hover': { bgcolor: colors.amber } }}>Book Again</Button>
            </>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
          Appointments Queue
        </Typography>
        <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, mb: 3 }}>
          Manage your schedule and perform actions based on consultation status.
        </Typography>

        <TextField
          placeholder="Search patient or visit type"
          value={query}
          onChange={e => setQuery(e.target.value)}
          fullWidth
          sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: colors.muted }} /></InputAdornment> }}
        />

        <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap" sx={{ mb: 2.5 }}>
          {[['all', 'All'], ['upcoming', 'Upcoming'], ['ongoing', 'Ongoing'], ['completed', 'Completed'], ['missed', 'Missed'], ['cancelled', 'Cancelled']].map(([value, label]) => (
            <Chip
              key={value}
              label={label}
              clickable
              onClick={() => setActiveFilter(value)}
              sx={{ borderRadius: 999, border: `1px solid ${activeFilter === value ? colors.green : colors.line}`, bgcolor: activeFilter === value ? colors.green : '#fff', color: activeFilter === value ? '#fff' : '#67625b' }}
            />
          ))}
        </Stack>

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress sx={{ color: colors.green }} /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        ) : (
          <Stack spacing={4}>
            {(grouped.ongoing.length > 0 || grouped.upcoming.length > 0) && (
              <Box>
                <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, mb: 1.5, fontWeight: 700 }}>LIVE & UPCOMING</Typography>
                <Stack spacing={2}>{[...grouped.ongoing, ...grouped.upcoming].map(renderAppointment)}</Stack>
              </Box>
            )}
            {grouped.completed.length > 0 && (
              <Box>
                <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, mb: 1.5, fontWeight: 700 }}>COMPLETED</Typography>
                <Stack spacing={2}>{grouped.completed.map(renderAppointment)}</Stack>
              </Box>
            )}
            {grouped.missed.length > 0 && (
              <Box>
                <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, mb: 1.5, fontWeight: 700 }}>MISSED</Typography>
                <Stack spacing={2}>{grouped.missed.map(renderAppointment)}</Stack>
              </Box>
            )}
            {grouped.cancelled.length > 0 && (
              <Box>
                <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, mb: 1.5, fontWeight: 700 }}>CANCELLED</Typography>
                <Stack spacing={2}>{grouped.cancelled.map(renderAppointment)}</Stack>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={rescheduleData.open} onClose={() => setRescheduleData(p => ({ ...p, open: false }))} PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Reschedule Consultation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.muted, mb: 3 }}>Move this session to another time based on your set availability.</Typography>
          
          <Stack spacing={3}>
            <TextField label="Choose New Date" type="date" value={rescheduleData.date} onChange={(e) => handleDateChange(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Select New Time</Typography>
              {rescheduleData.loadingSlots ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
              ) : rescheduleData.slots.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 3 }}>
                   <Typography variant="body2" sx={{ color: colors.muted }}>No available slots for this date.</Typography>
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
          <Button onClick={() => setRescheduleData(p => ({ ...p, open: false }))} sx={{ color: colors.muted, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleRescheduleSubmit} disabled={!rescheduleData.selectedSlot || rescheduleData.loadingSlots} variant="contained" sx={{ bgcolor: colors.green, borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: colors.green } }}>
             {rescheduleData.loadingSlots ? 'Rescheduling...' : 'Confirm Reschedule'}
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
