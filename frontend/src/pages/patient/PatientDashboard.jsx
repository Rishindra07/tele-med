import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  CalendarTodayRounded as CalendarIcon,
  CheckCircleRounded as CheckCircleIcon,
  CircleRounded as CircleIcon,
  NotificationsNoneRounded as NotificationIcon,
  PlaceOutlined as PlaceIcon,
  ScienceRounded as ReportIcon,
  StickyNote2Outlined as NotesIcon,
  VaccinesOutlined as PrescriptionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PatientShell from '../../components/patient/PatientShell';
import {
  bookAppointment,
  getAllDoctors,
  getDoctorSlots,
  getDoctorsBySpecialization
} from '../../api/appointmentApi';

const c = {
  bg: '#f5f1e8',
  paper: '#fffdf8',
  line: '#d8d0c4',
  soft: '#e7dfd3',
  text: '#252525',
  muted: '#6f6a62',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  greenDark: '#176d57',
  blue: '#4a90e2',
  blueSoft: '#e6f0fe',
  amber: '#d18a1f',
  amberSoft: '#fbefdc',
  lime: '#7aa63d',
  limeSoft: '#eef6de'
};

const staticRecords = [
  ['Prescription - Dr. Priya Sharma', '18 Mar 2026 | Paracetamol, Amoxicillin', 'Offline', 'sky'],
  ['Blood Test Report - Narayana Diagnostics', '10 Mar 2026 | CBC + Lipid Panel', 'New', 'amber'],
  ['Consultation Notes - Dr. Manish Rao', '2 Mar 2026 | Hypertension follow-up', 'Offline', 'lime']
];

const staticPharmacies = [
  ['Arora Medical Store', '0.8 km away', [true, true]],
  ['Singh Pharma', '1.4 km away', [true, false]],
  ['Jan Aushadhi Kendra', '2.1 km away', [true, true]]
];

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
      return JSON.parse(localStorage.getItem('user') || '{}')?.name || 'Ramesh Kumar';
    } catch {
      return 'Ramesh Kumar';
    }
  })();
  const greetingName = patientName.split(' ')[0] || 'Ramesh';

  const [specialization, setSpecialization] = useState('');
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const resetSelection = () => {
    setSelectedDoctor(null);
    setSelectedDate('');
    setSlots([]);
    setSelectedSlot('');
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      setDoctorsLoading(true);
      setDoctorsError('');
      try {
        const res = await getAllDoctors();
        const loaded = res.doctors || [];
        setAllDoctors(loaded);
        setDoctors(loaded);
      } catch (error) {
        setDoctorsError(error.message || 'Failed to load doctors.');
        setAllDoctors([]);
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };
    fetchDoctors();
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
      setDoctors(allDoctors);
      setDoctorsError('');
      resetSelection();
      return;
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
      setSlots((prev) => prev.filter((slot) => slot !== selectedSlot));
      setSelectedSlot('');
    } catch (error) {
      setSnackbar({ open: true, severity: 'error', message: error.message || 'Booking failed.' });
    } finally {
      setBookingLoading(false);
    }
  };

  const doctorName = selectedDoctor?.user?.name || 'Dr. Priya Sharma';
  const appointmentCards =
    selectedDoctor && selectedDate && selectedSlot
      ? [
          {
            id: 'live',
            doctor: doctorName,
            specialty: selectedDoctor.specialization || 'Specialist',
            when: `${fmtDate(selectedDate)} | ${selectedSlot}`,
            status: 'Ready to book',
            action: bookingLoading ? 'Booking...' : 'Confirm Booking',
            accent: c.green,
            bg: c.greenSoft
          },
          {
            id: 'static',
            doctor: 'Dr. Manish Rao',
            specialty: 'Cardiologist',
            when: 'Fri, 27 Mar | 3:30 PM',
            status: 'Follow-up',
            action: 'View Details',
            accent: c.blue,
            bg: c.blueSoft
          }
        ]
      : [
          {
            id: 'a1',
            doctor: 'Dr. Priya Sharma',
            specialty: 'General Physician',
            when: 'Mon, 23 Mar | 10:00 AM',
            status: 'Confirmed',
            action: 'Join Consultation',
            accent: c.green,
            bg: c.greenSoft
          },
          {
            id: 'a2',
            doctor: 'Dr. Manish Rao',
            specialty: 'Cardiologist',
            when: 'Fri, 27 Mar | 3:30 PM',
            status: 'Follow-up',
            action: 'View Details',
            accent: c.blue,
            bg: c.blueSoft
          }
        ];

  const stats = [
    ['Consultations', '12', 'Total this year', '+3 this month', c.green],
    ['Prescriptions', '4', 'Active prescriptions', '1 ready at pharmacy', c.blue],
    ['Next Appointment', selectedDate ? fmtDate(selectedDate) : 'Tomorrow', selectedDoctor ? doctorName : 'Dr. Priya Sharma', selectedSlot ? `${selectedSlot} | Video call` : '10:00 AM | Video call', c.amber],
    ['Offline Records', '8', 'Files cached locally', 'Available offline', c.lime]
  ];

  return (
    <PatientShell activeItem="dashboard">
      <Box sx={{ minWidth: 0, px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between', gap: 3, flexDirection: { xs: 'column', lg: 'row' }, mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.05, fontFamily: 'Georgia, serif' }}>Good morning,</Typography>
            <Typography sx={{ mt: 0.5, fontSize: { xs: 34, md: 46 }, lineHeight: 1.05, color: c.green, fontFamily: 'Georgia, serif' }}>{greetingName}</Typography>
            <Typography sx={{ mt: 1.5, color: c.muted, fontSize: 18 }}>Your health overview for today</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Box sx={{ px: 3, py: 1.5, borderRadius: 4, border: `1px solid ${c.line}`, bgcolor: '#f7f3ea', fontSize: 18, lineHeight: 1.15 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button sx={{ minWidth: 54, width: 54, height: 54, borderRadius: 3, border: `1px solid ${c.line}`, bgcolor: '#fff', color: '#444', position: 'relative' }}>
              <NotificationIcon />
              <Box sx={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef665b' }} />
            </Button>
            <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} sx={{ px: 3, py: 1.5, borderRadius: 3, bgcolor: c.green, color: '#fff', fontSize: 18, textTransform: 'none', '&:hover': { bgcolor: '#228f6e' } }}>+ Book Appointment</Button>
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          {stats.map(([title, value, subtitle, helper, dot]) => (
            <Box key={title} sx={{ minHeight: 188, p: 3, borderRadius: 4, border: `1px solid ${c.line}`, bgcolor: c.paper }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CircleIcon sx={{ color: dot, fontSize: 13 }} />
                <Typography sx={{ fontSize: 16.5, color: '#47443f' }}>{title}</Typography>
              </Stack>
              <Typography sx={{ mt: 1.5, fontSize: 30 }}>{value}</Typography>
              <Typography sx={{ mt: 1, color: c.muted, fontSize: 16, lineHeight: 1.1 }}>{subtitle}</Typography>
              <Typography sx={{ mt: 1, color: dot, fontSize: 16, lineHeight: 1.15 }}>{helper}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.45fr 0.95fr' }, gap: 3, alignItems: 'start' }}>
          <Box sx={{ p: { xs: 2.25, md: 3 }, borderRadius: 4, border: `1px solid ${c.line}`, bgcolor: c.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 23 }}>Upcoming Appointments</Typography>
              <Button onClick={() => navigate('/patient/appointments')} sx={{ color: c.green, textTransform: 'none', fontSize: 16 }}>{'View all ->'}</Button>
            </Stack>
            <Stack spacing={2}>
              {appointmentCards.map((item) => (
                <Box key={item.id} sx={{ p: 2.25, borderRadius: 3, border: `1px solid ${c.soft}`, bgcolor: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: item.accent }} />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 64, height: 64, bgcolor: item.bg, color: item.accent, fontWeight: 700, fontSize: 28 }}>{initials(item.doctor)}</Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{item.doctor}</Typography>
                        <Typography sx={{ color: c.muted, fontSize: 16 }}>{item.specialty}</Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1 }}>
                          <CalendarIcon sx={{ fontSize: 17, color: c.muted }} />
                          <Typography sx={{ color: '#4e4a45', fontSize: 16 }}>{item.when}</Typography>
                        </Stack>
                      </Box>
                    </Stack>
                    <Stack spacing={1.25} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                      <Chip label={item.status} sx={{ bgcolor: item.status === 'Follow-up' ? c.amberSoft : item.status === 'Ready to book' ? '#e7f4ff' : '#e4f6ee', color: item.status === 'Follow-up' ? c.amber : item.status === 'Ready to book' ? c.blue : '#197458', fontSize: 15 }} />
                      <Button onClick={item.id === 'live' ? handleBookAppointment : item.action === 'Join Consultation' ? () => navigate('/patient/appointments') : undefined} disabled={item.id === 'live' && bookingLoading} sx={{ px: 2.5, py: 1, borderRadius: 2.5, border: `1px solid ${c.line}`, color: '#202020', textTransform: 'none', fontSize: 16, bgcolor: '#fff' }}>{item.action}</Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
            <Divider sx={{ my: 3, borderColor: c.soft }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Typography sx={{ fontSize: 17, color: '#494640' }}>Need a specialist?</Typography>
              <Button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} sx={{ px: 2.5, py: 1, borderRadius: 2.5, border: `1px solid ${c.green}`, color: c.green, textTransform: 'none', fontSize: 16 }}>Browse Doctors</Button>
            </Stack>
          </Box>

          <Stack spacing={3}>
            <Box sx={{ p: 3, borderRadius: 4, color: '#f4fbf8', background: 'linear-gradient(180deg, #0d6a52 0%, #0d7d5f 55%, #118163 100%)' }}>
              <Typography sx={{ fontSize: 24, fontFamily: 'Georgia, serif' }}>AI Symptom Checker</Typography>
              <Typography sx={{ mt: 1.5, fontSize: 16, lineHeight: 1.5, maxWidth: 320 }}>Describe your symptoms before booking a consultation and get guided next steps.</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2.5 }}>
                {['Fever', 'Headache', '+ more'].map((tag) => <Chip key={tag} label={tag} sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontSize: 15 }} />)}
              </Stack>
              <Button onClick={() => navigate('/symptom-checker')} sx={{ mt: 3.5, px: 3, py: 1.3, borderRadius: 2.5, bgcolor: '#0f4d3e', color: '#fff', textTransform: 'none', fontSize: 17 }}>Check Symptoms</Button>
            </Box>
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${c.line}`, bgcolor: c.paper }}>
              <Typography sx={{ fontSize: 22, mb: 2.5 }}>Connectivity Status</Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.5, borderRadius: 3, bgcolor: '#e3f4ee' }}><CheckCircleIcon sx={{ color: c.green }} /><Typography sx={{ color: '#1a6d58', fontSize: 16 }}>Connected - 36 Mbps</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.5, borderRadius: 3, bgcolor: c.amberSoft }}><CircleIcon sx={{ color: c.amber, fontSize: 15 }} /><Typography sx={{ color: '#9b6211', fontSize: 16 }}>Low bandwidth mode ready</Typography></Box>
                <Box sx={{ px: 2, py: 1.5, borderRadius: 3, border: '1px dashed #c8bfb3', color: '#5d5952', fontSize: 16 }}>Offline cache enabled for records and prescriptions</Box>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ mt: 3, p: { xs: 2.25, md: 3 }, borderRadius: 4, border: `1px solid ${c.line}`, bgcolor: c.paper }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 23 }}>Health Records</Typography>
            <Button sx={{ color: c.green, textTransform: 'none', fontSize: 16 }}>Download all</Button>
          </Stack>
          <Stack divider={<Divider sx={{ borderColor: c.soft }} />}>
            {staticRecords.map(([title, subtitle, status, tone], index) => (
              <Stack key={title} direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ py: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 54, height: 54, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: tone === 'sky' ? '#e8f1ff' : tone === 'amber' ? '#fff2de' : '#edf5df' }}>
                    {index === 0 ? <PrescriptionIcon sx={{ color: '#f05a87' }} /> : index === 1 ? <ReportIcon sx={{ color: '#7dbb4c' }} /> : <NotesIcon sx={{ color: '#8d8058' }} />}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 17, fontWeight: 500 }}>{title}</Typography>
                    <Typography sx={{ color: c.muted, fontSize: 15.5 }}>{subtitle}</Typography>
                  </Box>
                </Stack>
                <Chip label={status} sx={{ bgcolor: status === 'New' ? '#eaf5d8' : '#f1eee6', color: status === 'New' ? '#71992f' : '#8b857a', fontSize: 15 }} />
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box ref={bookingRef} sx={{ mt: 3, p: { xs: 2.25, md: 3 }, borderRadius: 4, border: `1px solid ${c.line}`, bgcolor: c.paper }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 23 }}>Book Appointment</Typography>
              <Typography sx={{ mt: 0.75, color: c.muted, fontSize: 16 }}>Search by specialization, choose a doctor, then pick an available slot.</Typography>
            </Box>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField label="Specialization" placeholder="e.g., Cardiologist" value={specialization} onChange={(e) => setSpecialization(e.target.value)} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fffdfa' } }} />
            <Button variant="contained" onClick={handleApplyFilter} disabled={doctorsLoading} sx={{ minWidth: 180, borderRadius: 3, bgcolor: c.green, textTransform: 'none', fontSize: 16, boxShadow: 'none', '&:hover': { bgcolor: '#228f6e', boxShadow: 'none' } }}>{doctorsLoading ? 'Loading...' : 'Find Doctors'}</Button>
          </Stack>
          {doctorsError && <Typography sx={{ mb: 2, color: '#c24e43', fontSize: 15.5 }}>{doctorsError}</Typography>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.2fr 0.8fr' }, gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 18, mb: 2 }}>Available Doctors</Typography>
              {doctorsLoading ? <Box sx={{ py: 5, display: 'grid', placeItems: 'center' }}><CircularProgress size={30} sx={{ color: c.green }} /></Box> : doctors.length === 0 ? <Typography sx={{ color: c.muted, fontSize: 16 }}>No doctors found. Try another specialization.</Typography> : <Stack spacing={2}>
                {doctors.map((doctor) => {
                  const name = doctor.user?.name || 'Doctor';
                  const rating = doctor.rating && Number(doctor.rating) > 0 ? Number(doctor.rating).toFixed(1) : 'Not rated';
                  const availability = doctor.availability?.length ? doctor.availability.slice(0, 2).map((entry) => `${entry?.day || 'Day'}: ${Array.isArray(entry?.slots) && entry.slots.length ? entry.slots.join(', ') : 'No slots'}`).join(' | ') : 'Check slots after selecting a date';
                  const selected = selectedDoctor?._id === doctor._id;
                  return (
                    <Box key={doctor._id} sx={{ p: 2.25, borderRadius: 3, border: `1px solid ${selected ? '#8fcdb8' : c.soft}`, bgcolor: selected ? '#f1fbf7' : '#fff' }}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 56, height: 56, bgcolor: selected ? c.greenSoft : '#eef2f4', color: selected ? c.greenDark : '#4d555a', fontWeight: 700 }}>{initials(name)}</Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 17, fontWeight: 600 }}>{name}</Typography>
                            <Typography sx={{ color: c.muted, fontSize: 15.5 }}>{doctor.specialization || 'Specialist'}</Typography>
                            <Typography sx={{ mt: 0.75, color: '#4d4a45', fontSize: 14.5 }}>Rating: {rating}</Typography>
                            <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 14.5 }}>{availability}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1.25} flexWrap="wrap">
                          <Button onClick={() => {
                            if (selected) {
                              resetSelection();
                              return;
                            }
                            setSelectedDoctor(doctor);
                            setSelectedDate('');
                            setSlots([]);
                            setSelectedSlot('');
                          }} sx={{ px: 2.25, py: 1, borderRadius: 2.5, bgcolor: selected ? c.green : '#fff', color: selected ? '#fff' : c.green, border: `1px solid ${c.green}`, textTransform: 'none', fontSize: 15.5 }}>{selected ? 'Selected' : 'Select'}</Button>
                          <Button onClick={() => navigate('/symptom-checker')} sx={{ px: 2.25, py: 1, borderRadius: 2.5, border: `1px solid ${c.line}`, color: '#2b2a28', textTransform: 'none', fontSize: 15.5 }}>Check Symptoms</Button>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>}
            </Box>
            <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${c.soft}`, bgcolor: '#fcfbf8', alignSelf: 'start' }}>
              <Typography sx={{ fontSize: 18, mb: 2 }}>Selected Doctor</Typography>
              {selectedDoctor ? <>
                <Typography sx={{ fontSize: 20, fontWeight: 600 }}>{doctorName}</Typography>
                <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 16 }}>{selectedDoctor.specialization || 'Specialist'}</Typography>
                {selectedDoctor.hospitalName && <Typography sx={{ mt: 0.75, color: c.muted, fontSize: 15.5 }}>{selectedDoctor.hospitalName}</Typography>}
                {selectedDoctor.consultationFee && <Typography sx={{ mt: 0.75, color: '#48443f', fontSize: 15.5 }}>Consultation Fee: Rs. {selectedDoctor.consultationFee}</Typography>}
                <TextField label="Select Date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} fullWidth size="small" sx={{ mt: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }} />
                <Box sx={{ mt: 2.5 }}>
                  <Typography sx={{ mb: 1.25, fontSize: 15.5, color: c.muted }}>Available Slots</Typography>
                  {slotsLoading ? <CircularProgress size={24} sx={{ color: c.green }} /> : slots.length === 0 ? <Typography sx={{ color: c.muted, fontSize: 15.5 }}>{selectedDate ? 'No slots available for this date.' : 'Pick a date to view available slots.'}</Typography> : <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {slots.map((slot) => <Chip key={slot} label={slot} clickable onClick={() => setSelectedSlot(slot)} sx={{ bgcolor: selectedSlot === slot ? c.green : '#fff', color: selectedSlot === slot ? '#fff' : '#3d3d3d', border: `1px solid ${selectedSlot === slot ? c.green : c.line}`, fontSize: 14.5 }} />)}
                  </Stack>}
                </Box>
                <Button variant="contained" onClick={handleBookAppointment} disabled={bookingLoading || !selectedDate || !selectedSlot} sx={{ mt: 3, width: '100%', py: 1.3, borderRadius: 2.75, bgcolor: c.green, textTransform: 'none', fontSize: 16, boxShadow: 'none', '&:hover': { bgcolor: '#228f6e', boxShadow: 'none' } }}>{bookingLoading ? 'Booking...' : 'Confirm Booking'}</Button>
              </> : <Typography sx={{ color: c.muted, fontSize: 15.5, lineHeight: 1.6 }}>Select a doctor from the list to choose a consultation date and available slot.</Typography>}
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 3, p: { xs: 2.25, md: 3 }, borderRadius: 4, border: `1px solid ${c.line}`, bgcolor: c.paper, overflowX: 'auto' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 23 }}>Nearby Pharmacies</Typography>
            <Button sx={{ color: c.green, textTransform: 'none', fontSize: 16 }}>{'See all on map ->'}</Button>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(240px, 1fr))' }, gap: 2, minWidth: { md: 760 } }}>
            {staticPharmacies.map(([name, distance, meds]) => (
              <Box key={name} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${c.soft}`, bgcolor: '#fff' }}>
                <Typography sx={{ fontSize: 18, lineHeight: 1.25 }}>{name}</Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1 }}><PlaceIcon sx={{ fontSize: 18, color: c.muted }} /><Typography sx={{ color: c.muted, fontSize: 15.5 }}>{distance}</Typography></Stack>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {['Paracetamol', 'Amoxicillin'].map((med, index) => <Chip key={med} label={`${med} ${meds[index] ? 'Yes' : 'No'}`} sx={{ alignSelf: 'flex-start', bgcolor: meds[index] ? '#eaf5d8' : '#fdeaea', color: meds[index] ? '#71992f' : '#de5a59', fontSize: 14.5 }} />)}
                </Stack>
                <Button sx={{ mt: 2.5, width: '100%', py: 1.15, borderRadius: 2.5, border: `1px solid ${c.line}`, color: '#252525', textTransform: 'none', fontSize: 16 }}>Send Prescription</Button>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PatientShell>
  );
}

export default PatientDashboard;
