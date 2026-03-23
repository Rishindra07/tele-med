import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Switch,
  Typography
} from '@mui/material';
import {
  CalendarMonthRounded as CalendarIcon,
  EmailOutlined as EmailIcon,
  LocationOnOutlined as LocationIcon,
  MessageOutlined as MessageIcon,
  PhoneOutlined as PhoneIcon,
  VerifiedUserOutlined as LicenseIcon,
  VideocamOutlined as VideoIcon
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
  amberSoft: '#fbefdc'
};

const DOCTOR = {
  name: 'Dr. Farhan Ahmed',
  specialty: 'Cardiologist Surgeon',
  phone: '+880 740-766 045',
  email: 'farhan@example.com',
  address: '100 Smart Street, SimCity USA',
  about:
    'I am pleased to be part of the Northwest Ohio community since 2012. I provide general and cosmetic surgery, medical and medication management services to reduce pain and suffering of patients.',
  licenses: [
    { id: '#048645 2008 2024', country: 'USA', status: 'Active' },
    { id: '#563655 8455 2026', country: 'Australia', status: 'Active' }
  ],
  specialties: ['Cardiologist', 'Surgeon'],
  languages: 'English, Urdu, Bangla'
};

const TEAM = [
  { name: 'Brooklyn Simmons', role: 'Cardiologist Surgeon', active: true },
  { name: 'Dr. Farhan Ahmed', role: 'Cardiologist Surgeon', active: false },
  { name: 'Dianne Russell', role: 'Neurosurgeons', active: false },
  { name: 'Jerry Weise', role: 'Obstetrician', active: false },
  { name: 'Dianna Pena', role: 'Plastic Surgeon', active: false },
  { name: 'Cameron Williamson', role: 'Neurosurgeons', active: false },
  { name: 'Courtney Henry', role: 'Plastic Surgeon', active: false }
];

const SCHEDULE = [
  { time: 'Today, 12:00 PM', name: 'Brooklyn Simmons', type: 'Video', color: colors.blue },
  { time: 'Today, 12:00 PM', name: 'Jenny Bell', type: 'Video', color: colors.blue },
  { time: 'Today, 01:00 PM', name: 'Floyd Miles', type: 'In-Person', color: colors.green },
  { time: 'Today, 02:30 PM', name: 'Dianna Pena', type: 'Video', color: colors.blue },
  { time: 'Today, 03:00 PM', name: 'Brooklyn Simmons', type: 'In-Person', color: colors.green }
];

const BAR_DATA = [
  { day: 'Sun', old: 18, new: 22 },
  { day: 'Mon', old: 30, new: 35 },
  { day: 'Tue', old: 25, new: 28 },
  { day: 'Wed', old: 40, new: 45 },
  { day: 'Thu', old: 20, new: 25 },
  { day: 'Fri', old: 35, new: 30 },
  { day: 'Sat', old: 28, new: 32 }
];

const MAX_VAL = 55;
const CHART_H = 100;
const BAR_W = 10;
const GAP = 6;
const GROUP_W = BAR_W * 2 + GAP + 16;

const BarChart = () => (
  <Box sx={{ width: '100%', overflowX: 'auto' }}>
    <svg width="100%" viewBox={`0 0 ${BAR_DATA.length * GROUP_W + 10} ${CHART_H + 34}`} style={{ display: 'block' }}>
      {BAR_DATA.map((item, index) => {
        const x = index * GROUP_W + 10;
        const oldH = (item.old / MAX_VAL) * CHART_H;
        const newH = (item.new / MAX_VAL) * CHART_H;
        return (
          <g key={item.day}>
            <rect x={x} y={CHART_H - oldH} width={BAR_W} height={oldH} rx={3} fill="#dbe8f9" />
            <rect x={x + BAR_W + GAP} y={CHART_H - newH} width={BAR_W} height={newH} rx={3} fill={colors.green} />
            <text x={x + BAR_W + 2} y={CHART_H + 20} textAnchor="middle" fontSize="10" fill="#8b857d">
              {item.day}
            </text>
          </g>
        );
      })}
    </svg>
  </Box>
);

const LicenseCard = ({ license }) => (
  <Box sx={{ border: `1px solid ${colors.soft}`, borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#fff' }}>
    <Stack direction="row" spacing={1.4} alignItems="center">
      <Box sx={{ p: 1, bgcolor: '#eef9f4', borderRadius: 2, color: colors.green }}>
        <LicenseIcon sx={{ fontSize: 18 }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 14.5 }}>{license.id}</Typography>
        <Typography sx={{ color: colors.muted, fontSize: 13 }}>{license.country}</Typography>
      </Box>
    </Stack>
    <Chip label={license.status} sx={{ bgcolor: colors.greenSoft, color: colors.green, fontSize: 12.5 }} />
  </Box>
);

const ScheduleRow = ({ item }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.3, borderBottom: `1px solid ${colors.soft}` }}>
    <Box sx={{ width: 4, height: 38, borderRadius: 2, bgcolor: item.color, flexShrink: 0 }} />
    <Avatar sx={{ width: 34, height: 34, bgcolor: item.color === colors.blue ? colors.blueSoft : colors.greenSoft, color: item.color, fontWeight: 700, fontSize: '0.85rem' }}>
      {item.name.charAt(0)}
    </Avatar>
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography noWrap sx={{ fontSize: 14.5 }}>{item.name}</Typography>
      <Typography sx={{ color: colors.muted, fontSize: 12.8 }}>{item.time}</Typography>
    </Box>
    <Chip
      label={item.type}
      icon={item.type === 'Video' ? <VideoIcon style={{ fontSize: 13 }} /> : <PhoneIcon style={{ fontSize: 13 }} />}
      sx={{
        bgcolor: item.type === 'Video' ? colors.blueSoft : colors.greenSoft,
        color: item.type === 'Video' ? colors.blue : colors.green,
        fontSize: 12.5,
        '& .MuiChip-icon': { color: 'inherit' }
      }}
    />
  </Box>
);

export default function DoctorProfile() {
  const [available, setAvailable] = useState(true);

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              Doctor Profile
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 440, lineHeight: 1.2 }}>
              Review professional details, licences, team members and consultation schedule
            </Typography>
          </Box>

          <Box sx={{ px: 2.5, py: 1.25, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 17, lineHeight: 1.15 }}>
            Last update: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ width: { xs: '100%', md: '35%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ border: `1px solid ${colors.line}`, borderRadius: 4, p: 3, bgcolor: colors.paper, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 18, mb: 2, textAlign: 'left' }}>Doctor Profile</Typography>

              <Avatar sx={{ width: 92, height: 92, margin: '0 auto', bgcolor: colors.greenSoft, color: colors.green, fontSize: '2rem', fontWeight: 800, border: '4px solid #dceee8', mb: 1.5 }}>
                F
              </Avatar>

              <Typography sx={{ fontSize: 24, fontFamily: 'Georgia, serif' }}>{DOCTOR.name}</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 14.5, mb: 2 }}>{DOCTOR.specialty}</Typography>

              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>Available</Typography>
                <Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.green }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.green } }} />
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5} sx={{ textAlign: 'left' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ p: 0.8, bgcolor: '#eef9f4', borderRadius: 1.5, color: colors.green }}><PhoneIcon sx={{ fontSize: 14 }} /></Box>
                  <Typography sx={{ fontSize: 14.5 }}>{DOCTOR.phone}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ p: 0.8, bgcolor: '#eef9f4', borderRadius: 1.5, color: colors.green }}><EmailIcon sx={{ fontSize: 14 }} /></Box>
                  <Typography noWrap sx={{ fontSize: 14.5 }}>{DOCTOR.email}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ p: 0.8, bgcolor: '#eef9f4', borderRadius: 1.5, color: colors.green, flexShrink: 0 }}><LocationIcon sx={{ fontSize: 14 }} /></Box>
                  <Typography sx={{ fontSize: 14.5 }}>{DOCTOR.address}</Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1.5} justifyContent="center">
                <Button variant="outlined" startIcon={<CalendarIcon sx={{ fontSize: 16 }} />} sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: 14, flex: 1, borderColor: colors.line, color: colors.text }}>
                  Edit
                </Button>
                <Button variant="contained" startIcon={<MessageIcon sx={{ fontSize: 16 }} />} sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: 14, flex: 1, bgcolor: colors.green, boxShadow: 'none', '&:hover': { bgcolor: '#228f6e' } }}>
                  Message
                </Button>
              </Stack>
            </Box>

            <Box sx={{ border: `1px solid ${colors.line}`, borderRadius: 4, p: 3, bgcolor: colors.paper }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ fontSize: 18 }}>About Doctor</Typography>
                <Chip label="Monthly" sx={{ fontSize: 12.5, bgcolor: '#f5f1e9', color: colors.muted }} />
              </Box>
              <Typography sx={{ color: colors.muted, fontSize: 14.5, lineHeight: 1.7, mb: 2 }}>
                {DOCTOR.about}
              </Typography>

              <Stack spacing={1.5}>
                <Box>
                  <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>Specialty</Typography>
                  <Stack direction="row" spacing={0.7} flexWrap="wrap" sx={{ mt: 0.6 }}>
                    {DOCTOR.specialties.map((specialty) => (
                      <Chip key={specialty} label={specialty} sx={{ bgcolor: colors.blueSoft, color: colors.blue, fontSize: 12.5 }} />
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>Department</Typography>
                  <Typography sx={{ mt: 0.3, fontSize: 14.5 }}>{DOCTOR.specialties[0]}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>Language</Typography>
                  <Typography sx={{ mt: 0.3, fontSize: 14.5 }}>{DOCTOR.languages}</Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ border: `1px solid ${colors.line}`, borderRadius: 4, p: 3, bgcolor: colors.paper }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: 18 }}>Licenses</Typography>
                <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>Department · Cardiologist</Typography>
              </Box>
              <Stack spacing={1.5}>
                {DOCTOR.licenses.map((license, index) => <LicenseCard key={index} license={license} />)}
              </Stack>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '65%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ border: `1px solid ${colors.line}`, borderRadius: 4, p: 3, bgcolor: colors.paper }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                <Typography sx={{ fontSize: 18 }}>Patient Overview</Typography>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  {[
                    ['Old Patient', '#dbe8f9'],
                    ['New Patient', colors.green]
                  ].map(([label, color]) => (
                    <Stack key={label} direction="row" spacing={0.6} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                      <Typography sx={{ color: colors.muted, fontSize: 12.5 }}>{label}</Typography>
                    </Stack>
                  ))}
                  <Chip label="Monthly" sx={{ fontSize: 12.5, bgcolor: '#f5f1e9', color: colors.muted }} />
                </Stack>
              </Box>
              <Typography sx={{ color: colors.muted, fontSize: 13.5, mb: 2 }}>April 2024</Typography>
              <BarChart />
            </Box>

            <Box sx={{ border: `1px solid ${colors.line}`, borderRadius: 4, p: 3, bgcolor: colors.paper }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: 18 }}>Today&apos;s Schedule</Typography>
                <Typography sx={{ color: colors.green, fontSize: 14.5 }}>See All</Typography>
              </Box>
              {SCHEDULE.map((item, index) => (
                <ScheduleRow key={index} item={item} />
              ))}
            </Box>

            <Box sx={{ border: `1px solid ${colors.line}`, borderRadius: 4, p: 3, bgcolor: colors.paper }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: 18 }}>Care Team</Typography>
                <Chip label="7 members" sx={{ bgcolor: '#f5f1e9', color: colors.muted, fontSize: 12.5 }} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, 1fr)' }, gap: 1.5 }}>
                {TEAM.map((member) => (
                  <Box key={member.name} sx={{ p: 1.8, borderRadius: 3, border: `1px solid ${colors.soft}`, bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 42, height: 42, bgcolor: member.active ? colors.greenSoft : colors.blueSoft, color: member.active ? colors.green : colors.blue }}>
                      {member.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 14.8 }}>{member.name}</Typography>
                      <Typography sx={{ color: colors.muted, fontSize: 13 }}>{member.role}</Typography>
                    </Box>
                    {member.active && <Chip label="Active" sx={{ bgcolor: colors.greenSoft, color: colors.green, fontSize: 12.5 }} />}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Stack>
      </Box>
    </DoctorLayout>
  );
}
