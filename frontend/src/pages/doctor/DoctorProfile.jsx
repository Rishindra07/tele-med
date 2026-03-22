import React, { useState } from 'react';
import {
  Box, Typography, Avatar, Stack, Button, Divider,
  Chip, Paper, Switch, IconButton, Grid
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Message as MessageIcon,
  VideoCall as VideoIcon,
  VerifiedUser as LicenseIcon,
  CalendarToday as CalIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';

/* ─── Palette ────────────────────────────────────────── */
const PRIMARY = '#2563EB';
const BG = '#F8FAFC';

/* ─── Seed Data ──────────────────────────────────────── */
const DOCTOR = {
  name: 'Dr. Farhan Ahmed',
  specialty: 'Cardiologist Surgeon',
  phone: '+880 740-766 045',
  email: 'farhan@example.com',
  address: '100 Smart Street, SimCity USA',
  avatar: '',
  about: `I am Pleased to be part of the Northwest Ohio Community since 2012. I provide general and cosmetic Surgery, medical and medication management services to reduce pain and suffering of patient.`,
  licenses: [
    { id: '#048645 2008 2024', country: 'USA', status: 'Active' },
    { id: '#563655 8455 2026', country: 'Australia', status: 'Active' },
  ],
  specialties: ['Cardiologist', 'Surgeon'],
  languages: 'English, Urdu, Bangla',
};

const TEAM = [
  { name: 'Brooklyn Simmons', role: 'Cardiologist Surgeon', active: true },
  { name: 'Dr. Farhan Ahmed', role: 'Cardiologist Surgeon', active: false },
  { name: 'Dianne Russell', role: 'Neurosurgeons', active: false },
  { name: 'Jerry Weise', role: 'Obstetrician', active: false },
  { name: 'Dianna Pena', role: 'Plastic Surgeon', active: false },
  { name: 'Cameron Williamson', role: 'Neurosurgeons', active: false },
  { name: 'Courtney Henry', role: 'Plastic Surgeon', active: false },
];

const SCHEDULE = [
  { time: 'Today, 12:00 PM', name: 'Brooklyn Simmons', type: 'Video', color: '#2563EB' },
  { time: 'Today, 12:00 PM', name: 'Jenny Bell', type: 'Video', color: '#2563EB' },
  { time: 'Today, 01:00 PM', name: 'Floyd Miles', type: 'In-Person', color: '#10B981' },
  { time: 'Today, 02:30 PM', name: 'Dianna Pena', type: 'Video', color: '#2563EB' },
  { time: 'Today, 03:00 PM', name: 'Brooklyn Simmons', type: 'In-Person', color: '#10B981' },
];

/* ─── Chart (SVG bar chart) ─────────────────────────── */
const BAR_DATA = [
  { day: 'Sun', old: 18, new: 22 },
  { day: 'Mon', old: 30, new: 35 },
  { day: 'Tue', old: 25, new: 28 },
  { day: 'Wed', old: 40, new: 45 },
  { day: 'Thu', old: 20, new: 25 },
  { day: 'Fri', old: 35, new: 30 },
  { day: 'Sat', old: 28, new: 32 },
];
const MAX_VAL = 55;
const CHART_H = 100;
const BAR_W = 8;
const GAP = 4;
const GROUP_W = BAR_W * 2 + GAP + 10;

const BarChart = () => (
  <Box sx={{ width: '100%', overflowX: 'auto' }}>
    <svg width="100%" viewBox={`0 0 ${BAR_DATA.length * GROUP_W + 10} ${CHART_H + 30}`} style={{ display: 'block' }}>
      {BAR_DATA.map((d, i) => {
        const x = i * GROUP_W + 10;
        const oldH = (d.old / MAX_VAL) * CHART_H;
        const newH = (d.new / MAX_VAL) * CHART_H;
        return (
          <g key={d.day}>
            {/* Old patients bar */}
            <rect x={x} y={CHART_H - oldH} width={BAR_W} height={oldH} rx={2} fill="#DBEAFE" />
            {/* New patients bar */}
            <rect x={x + BAR_W + GAP} y={CHART_H - newH} width={BAR_W} height={newH} rx={2} fill={PRIMARY} />
            {/* Day label */}
            <text x={x + BAR_W} y={CHART_H + 18} textAnchor="middle" fontSize="9" fill="#94A3B8">{d.day}</text>
          </g>
        );
      })}
    </svg>
  </Box>
);

/* ─── License Card ───────────────────────────────────── */
const LicenseCard = ({ license }) => (
  <Box sx={{
    border: '1px solid #E2E8F0', borderRadius: 2.5, p: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 2, bgcolor: 'white',
  }}>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box sx={{ p: 1, bgcolor: '#EFF6FF', borderRadius: 2 }}>
        <LicenseIcon sx={{ color: PRIMARY, fontSize: 20 }} />
      </Box>
      <Box>
        <Typography fontSize="0.82rem" fontWeight={700} color="#0F172A">{license.id}</Typography>
        <Typography fontSize="0.72rem" color="text.secondary">{license.country}</Typography>
      </Box>
    </Stack>
    <Chip
      label={license.status}
      size="small"
      sx={{ bgcolor: '#D1FAE5', color: '#059669', fontWeight: 700, fontSize: '0.7rem', border: 'none' }}
    />
  </Box>
);

/* ─── Schedule Row ───────────────────────────────────── */
const ScheduleRow = ({ item }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: '1px solid #F1F5F9' }}>
    <Box sx={{ width: 3, height: 36, borderRadius: 2, bgcolor: item.color, flexShrink: 0 }} />
    <Avatar sx={{ width: 32, height: 32, bgcolor: item.color + '20', color: item.color, fontWeight: 700, fontSize: '0.8rem' }}>
      {item.name.charAt(0)}
    </Avatar>
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography noWrap fontSize="0.8rem" fontWeight={600} color="#0F172A">{item.name}</Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <TimeIcon sx={{ fontSize: 11, color: '#94A3B8' }} />
        <Typography fontSize="0.68rem" color="text.secondary">{item.time}</Typography>
      </Stack>
    </Box>
    <Chip
      label={item.type}
      size="small"
      icon={item.type === 'Video' ? <VideoIcon style={{ fontSize: 11 }} /> : <PhoneIcon style={{ fontSize: 11 }} />}
      sx={{
        bgcolor: item.type === 'Video' ? '#EFF6FF' : '#ECFDF5',
        color: item.type === 'Video' ? PRIMARY : '#059669',
        fontWeight: 600, fontSize: '0.68rem', flexShrink: 0,
        '& .MuiChip-icon': { color: 'inherit' },
      }}
    />
  </Box>
);

/* ─── Main Page ──────────────────────────────────────── */
export default function DoctorProfile() {
  const [available, setAvailable] = useState(true);

  return (
    <DoctorLayout title="Doctor Profile">
      <Box sx={{ bgcolor: BG, minHeight: 'calc(100vh - 64px)', p: { xs: 2, md: 3 }, fontFamily: '"Outfit", sans-serif' }}>

        {/* ── Sub-header ─────────────────────────────── */}
        <Box sx={{ display: 'flex', mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
            <Typography fontSize="0.78rem" color="text.secondary">
              Last Update: Jan 2024 Oct 2024
            </Typography>
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ width: '100%' }}>
          {/* ── LEFT COLUMN (Profile & Info) ─────────────── */}
          <Box sx={{ width: { xs: '100%', md: '35%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Doctor Profile */}
            <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, textAlign: 'center' }}>
              <Typography fontSize="0.82rem" fontWeight={700} color="#0F172A" sx={{ mb: 2, textAlign: 'left' }}>Doctor Profile</Typography>

              <Avatar
                sx={{
                  width: 80, height: 80, margin: '0 auto',
                  bgcolor: '#DBEAFE', color: PRIMARY, fontSize: '2rem', fontWeight: 800,
                  border: '4px solid #E2E8F0', mb: 1.5,
                }}
              >
                F
              </Avatar>

              <Typography fontWeight={800} fontSize="1rem" color="#0F172A">{DOCTOR.name}</Typography>
              <Typography fontSize="0.78rem" color="text.secondary" sx={{ mb: 2 }}>{DOCTOR.specialty}</Typography>

              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                <Typography fontSize="0.75rem" color="text.secondary">Available</Typography>
                <Switch
                  checked={available}
                  onChange={e => setAvailable(e.target.checked)}
                  size="small"
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10B981' } }}
                />
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5} sx={{ textAlign: 'left' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ p: 0.8, bgcolor: '#EFF6FF', borderRadius: 1.5 }}><PhoneIcon sx={{ fontSize: 14, color: PRIMARY }} /></Box>
                  <Typography fontSize="0.78rem" color="#0F172A">{DOCTOR.phone}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ p: 0.8, bgcolor: '#EFF6FF', borderRadius: 1.5 }}><EmailIcon sx={{ fontSize: 14, color: PRIMARY }} /></Box>
                  <Typography fontSize="0.78rem" color="#0F172A" noWrap>{DOCTOR.email}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ p: 0.8, bgcolor: '#EFF6FF', borderRadius: 1.5, flexShrink: 0 }}><LocationIcon sx={{ fontSize: 14, color: PRIMARY }} /></Box>
                  <Typography fontSize="0.78rem" color="#0F172A">{DOCTOR.address}</Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1.5} justifyContent="center">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', flex: 1 }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<MessageIcon sx={{ fontSize: 14 }} />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', flex: 1, bgcolor: PRIMARY, '&:hover': { bgcolor: '#1D4ED8' }, boxShadow: 'none' }}
                >
                  Message
                </Button>
              </Stack>
            </Paper>

            {/* About Doctor */}
            <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography fontSize="0.82rem" fontWeight={700} color="#0F172A">About Doctor</Typography>
                <Chip label="Monthly" size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, height: 20 }} />
              </Box>
              <Typography fontSize="0.8rem" color="text.secondary" lineHeight={1.7} sx={{ mb: 2 }}>
                {DOCTOR.about}
              </Typography>

              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography fontSize="0.72rem" color="text.secondary">Specialty</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    {DOCTOR.specialties.map(s => (
                      <Chip key={s} label={s} size="small" sx={{ bgcolor: '#EFF6FF', color: PRIMARY, fontWeight: 600, fontSize: '0.68rem', height: 20 }} />
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize="0.72rem" color="text.secondary">Department</Typography>
                  <Typography fontSize="0.8rem" fontWeight={600} color="#0F172A">{DOCTOR.specialties[0]}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography fontSize="0.72rem" color="text.secondary">Language</Typography>
                  <Typography fontSize="0.8rem" fontWeight={600} color="#0F172A">{DOCTOR.languages}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Licenses */}
            <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography fontSize="0.82rem" fontWeight={700} color="#0F172A">Licenses</Typography>
                <Typography fontSize="0.72rem" color="text.secondary">Department · Cardiologist</Typography>
              </Box>
              <Stack spacing={1.5}>
                {DOCTOR.licenses.map((l, i) => <LicenseCard key={i} license={l} />)}
              </Stack>
            </Paper>

          </Box>

          {/* ── RIGHT COLUMN (Dashboard Analytics) ───────── */}
          <Box sx={{ width: { xs: '100%', md: '65%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Patient Overview chart */}
            <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography fontSize="0.82rem" fontWeight={700} color="#0F172A">Patient Overview</Typography>
                <Stack direction="row" spacing={1}>
                  {['Old Patient', 'New Patient'].map((l, i) => (
                    <Stack key={l} direction="row" spacing={0.5} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === 0 ? '#DBEAFE' : PRIMARY }} />
                      <Typography fontSize="0.68rem" color="text.secondary">{l}</Typography>
                    </Stack>
                  ))}
                  <Chip label="Monthly" size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, height: 20 }} />
                </Stack>
              </Box>
              <Typography fontSize="0.72rem" color="text.secondary" sx={{ mb: 2 }}>April 2024</Typography>
              <BarChart />
            </Paper>

            {/* Today's Schedule */}
            <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography fontSize="0.82rem" fontWeight={700} color="#0F172A">Today's Schedule</Typography>
                <Typography fontSize="0.72rem" color={PRIMARY} fontWeight={600} sx={{ cursor: 'pointer' }}>See All</Typography>
              </Box>
              {SCHEDULE.map((s, i) => <ScheduleRow key={i} item={s} />)}
            </Paper>

          </Box>
        </Stack>
      </Box>
    </DoctorLayout>
  );
}
