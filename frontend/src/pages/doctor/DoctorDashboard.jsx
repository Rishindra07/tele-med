import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography
} from '@mui/material';
import {
  CalendarMonthRounded as CalendarIcon,
  ChatBubbleOutlineRounded as ChatIcon,
  CheckRounded as CheckIcon,
  CloseRounded as CloseIcon,
  DescriptionOutlined as DocumentIcon,
  NotificationsNoneRounded as NotificationIcon,
  PhoneOutlined as PhoneIcon,
  SearchRounded as SearchIcon
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';

const colors = {
  paper: '#fffdf8',
  line: '#d8d0c4',
  soft: '#e9e2d8',
  text: '#2c2b28',
  muted: '#8b857d',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  amber: '#d18a1f',
  amberSoft: '#fbefdc',
  red: '#d9635b',
  redSoft: '#fdeaea'
};

const todayAppointments = [
  { name: 'M.J. Mical', diag: 'Health Checkup', time: 'On Going', tone: 'green' },
  { name: 'Sanath Deo', diag: 'Health Checkup', time: '12:30 PM', tone: 'amber' },
  { name: 'Loeara Phanj', diag: 'Report', time: '01:00 PM', tone: 'amber' },
  { name: 'Komola Haris', diag: 'Common Cold', time: '01:30 PM', tone: 'amber' }
];

const appointmentRequests = [
  { name: 'Maria Sarafat', problem: 'Cold' },
  { name: 'Jhon Deo', problem: 'Over sweating' }
];

const notifications = [
  'New appointment booked for today at 12:30 PM',
  'Lab report uploaded for Sanath Deo',
  'Prescription request awaiting approval'
];

const summaryCards = [
  ['Total Patients', '2000+', 'Till today', colors.green],
  ['Today Patients', '068', '23 Mar 2026', colors.blue],
  ['Today Appointments', '085', '23 Mar 2026', colors.amber]
];

const reviewBars = [
  ['Excellent', 82, colors.green],
  ['Great', 64, colors.blue],
  ['Good', 48, colors.amber],
  ['Average', 28, '#8f8b85']
];

function MetricCard({ title, value, subtext, dot }) {
  return (
    <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
      <Stack direction="row" spacing={0.8} alignItems="center">
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dot }} />
        <Typography sx={{ fontSize: 16, color: colors.muted }}>{title}</Typography>
      </Stack>
      <Typography sx={{ mt: 1.2, fontSize: 30, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ mt: 1, color: dot, fontSize: 15 }}>{subtext}</Typography>
    </Box>
  );
}

export default function DoctorDashboard() {
  const [notifAnchor, setNotifAnchor] = useState(null);
  const notifOpen = Boolean(notifAnchor);

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              Doctor Dashboard
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 450, lineHeight: 1.2 }}>
              Track appointments, review requests and manage today&apos;s patients
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 17, lineHeight: 1.15 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <IconButton onClick={(event) => setNotifAnchor(event.currentTarget)} sx={{ width: 48, height: 48, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: '#fff', position: 'relative' }}>
              <NotificationIcon />
              <Box sx={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', bgcolor: colors.red }} />
            </IconButton>
            <Box sx={{ px: 2, py: 1.15, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 220 }}>
              <SearchIcon sx={{ color: colors.muted }} />
              <Typography sx={{ color: colors.muted, fontSize: 15 }}>Search patient</Typography>
            </Box>
          </Stack>
        </Stack>

        <Popover
          open={notifOpen}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { mt: 1, borderRadius: 3, border: `1px solid ${colors.line}`, width: 320 } } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography sx={{ fontSize: 18, mb: 1.5 }}>Notifications</Typography>
            <Stack spacing={1.2}>
              {notifications.map((item) => (
                <Box key={item} sx={{ p: 1.3, borderRadius: 2.2, bgcolor: '#f7f3ea', color: '#57524b', fontSize: 14.5 }}>
                  {item}
                </Box>
              ))}
            </Stack>
          </Box>
        </Popover>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          {summaryCards.map(([title, value, subtext, dot]) => (
            <MetricCard key={title} title={title} value={value} subtext={subtext} dot={dot} />
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '0.95fr 0.95fr 1.1fr' }, gap: 3, alignItems: 'start' }}>
          <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 18 }}>Appointment Requests</Typography>
              <Button sx={{ color: colors.green, textTransform: 'none', fontSize: 14.5 }}>See all</Button>
            </Stack>
            <Stack spacing={1.5}>
              {appointmentRequests.map((req) => (
                <Stack key={req.name} direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 42, height: 42 }}>{req.name[0]}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 15.5 }}>{req.name}</Typography>
                    <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>{req.problem}</Typography>
                  </Box>
                  <Stack direction="row" spacing={0.6}>
                    <IconButton size="small" sx={{ bgcolor: colors.greenSoft, color: colors.green }}><CheckIcon sx={{ fontSize: 16 }} /></IconButton>
                    <IconButton size="small" sx={{ bgcolor: colors.redSoft, color: colors.red }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                    <IconButton size="small" sx={{ bgcolor: '#eef9f4', color: '#176d57' }}><ChatIcon sx={{ fontSize: 16 }} /></IconButton>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 18 }}>Today Appointments</Typography>
              <Button sx={{ color: colors.green, textTransform: 'none', fontSize: 14.5 }}>See all</Button>
            </Stack>
            <Stack spacing={1.2}>
              {todayAppointments.map((item) => (
                <Stack key={item.name} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.2, borderTop: `1px solid ${colors.soft}`, '&:first-of-type': { borderTop: 'none', pt: 0 } }}>
                  <Stack direction="row" spacing={1.3} alignItems="center">
                    <Avatar sx={{ width: 34, height: 34 }}>{item.name[0]}</Avatar>
                    <Box>
                      <Typography sx={{ fontSize: 14.8 }}>{item.name}</Typography>
                      <Typography sx={{ color: colors.muted, fontSize: 12.8 }}>{item.diag}</Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={item.time}
                    sx={{
                      bgcolor: item.tone === 'green' ? colors.greenSoft : colors.amberSoft,
                      color: item.tone === 'green' ? colors.green : colors.amber,
                      fontSize: 12.5
                    }}
                  />
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 2.8, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Typography sx={{ fontSize: 18, mb: 2 }}>Next Patient Details</Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
              <Avatar sx={{ width: 52, height: 52 }}>S</Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 17 }}>Sanath Deo</Typography>
                <Typography sx={{ color: colors.muted, fontSize: 14.2 }}>Health Checkup</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ color: colors.muted, fontSize: 12.5 }}>Patient ID</Typography>
                <Typography sx={{ fontSize: 13.5 }}>0220092020005</Typography>
              </Box>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2.5 }}>
              {[
                ['D. O. B', '15 Jan 1989'],
                ['Sex', 'Male'],
                ['Weight', '59 Kg'],
                ['Last Appt', '15 Dec 21'],
                ['Height', '172 cm'],
                ['Reg. Date', '10 Dec 21']
              ].map(([label, value]) => (
                <Box key={label}>
                  <Typography sx={{ color: colors.muted, fontSize: 12.5 }}>{label}</Typography>
                  <Typography sx={{ mt: 0.2, fontSize: 14.8 }}>{value}</Typography>
                </Box>
              ))}
            </Box>

            <Typography sx={{ color: colors.muted, fontSize: 13.5, mb: 1 }}>Patient History</Typography>
            <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
              {['Asthma', 'Hypertension', 'Fever'].map((tag) => (
                <Chip key={tag} label={tag} sx={{ bgcolor: '#eef9f4', color: '#176d57', fontSize: 13 }} />
              ))}
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button startIcon={<PhoneIcon />} sx={{ px: 2.2, py: 1, borderRadius: 2.4, bgcolor: colors.blue, color: '#fff', textTransform: 'none', fontSize: 14.5 }}>
                (308) 555-0102
              </Button>
              <Button startIcon={<DocumentIcon />} sx={{ px: 2.2, py: 1, borderRadius: 2.4, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 14.5 }}>
                Document
              </Button>
              <Button startIcon={<ChatIcon />} sx={{ px: 2.2, py: 1, borderRadius: 2.4, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 14.5 }}>
                Chat
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr 0.9fr' }, gap: 3, mt: 3 }}>
          <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Typography sx={{ fontSize: 18, mb: 2 }}>Patients Review</Typography>
            <Stack spacing={2.2}>
              {reviewBars.map(([label, value, color]) => (
                <Box key={label}>
                  <Typography sx={{ color: colors.muted, fontSize: 13.5, mb: 0.6 }}>{label}</Typography>
                  <Box sx={{ height: 8, borderRadius: 999, bgcolor: '#efe9de', overflow: 'hidden' }}>
                    <Box sx={{ width: `${value}%`, height: '100%', bgcolor: color }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Typography sx={{ fontSize: 18, mb: 2 }}>Patients Summary</Typography>
            <Box sx={{ width: 200, height: 200, mx: 'auto', borderRadius: '50%', background: 'conic-gradient(#26a37c 0 25%, #d18a1f 25% 60%, #4a90e2 60% 100%)', display: 'grid', placeItems: 'center', mb: 2.5 }}>
              <Box sx={{ width: 120, height: 120, borderRadius: '50%', bgcolor: colors.paper, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 28 }}>2k+</Typography>
                <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>Patients</Typography>
              </Box>
            </Box>
            <Stack spacing={1}>
              {[
                ['New Patients', colors.green],
                ['Old Patients', colors.amber],
                ['Total Patients', colors.blue]
              ].map(([label, color]) => (
                <Stack key={label} direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: color }} />
                  <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 18 }}>Calendar</Typography>
              <Typography sx={{ color: colors.green, fontSize: 14.5 }}>March 2026</Typography>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center' }}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map((day) => <Typography key={day} sx={{ color: colors.muted, fontSize: 12.5 }}>{day}</Typography>)}
              {[23,24,25,26,27,28,29,30,31,1,2,3,4,5].map((day) => (
                <Box key={day} sx={{ width: 32, height: 32, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: day === 23 ? colors.green : 'transparent', color: day === 23 ? '#fff' : colors.text, mx: 'auto', fontSize: 13.5 }}>
                  {day}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </DoctorLayout>
  );
}
