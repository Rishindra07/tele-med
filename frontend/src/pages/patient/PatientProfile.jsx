import React, { useMemo } from 'react';
import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';
import {
  NotificationsNoneRounded as NotificationIcon,
  PhotoCameraRounded as CameraIcon
} from '@mui/icons-material';
import PatientShell from '../../components/patient/PatientShell';

const colors = {
  paper: '#fffdf8',
  line: '#d8d0c4',
  soft: '#e9e2d8',
  text: '#2c2b28',
  muted: '#8b857d',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  blueSoft: '#e7f0fe',
  red: '#d9635b',
  redSoft: '#fdeaea'
};

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'RK';

const doctorCards = [
  ['PS', 'Dr. Priya Sharma', 'General Physician', '12 consultations', '#dff3eb', '#176d57'],
  ['MR', 'Dr. Manish Rao', 'Cardiologist', '3 consultations', '#e7f0fe', '#2f6db9']
];

export default function PatientProfile() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const patientName = user?.name || 'Ramesh Kumar';
  const profileImage = user?.profileImage || user?.avatar || user?.image || '';

  return (
    <PatientShell activeSetting="profile">
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ color: '#a7a198', fontSize: 16 }}>Home › Settings › My Profile</Typography>
            <Typography sx={{ mt: 0.6, fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              My Profile
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 460, lineHeight: 1.2 }}>
              Manage your personal, health and account information
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 17, lineHeight: 1.15 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, position: 'relative' }}>
              <NotificationIcon />
              <Box sx={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', bgcolor: colors.red }} />
            </Button>
            <Button sx={{ px: 3, py: 1.25, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, textTransform: 'none', fontSize: 16 }}>
              Edit Profile
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 3 }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profileImage}
                  alt={patientName}
                  sx={{
                    width: 122,
                    height: 122,
                    bgcolor: '#dcf6ef',
                    color: '#0f6550',
                    border: '4px solid #8fdcc9',
                    fontSize: 38,
                    fontWeight: 700
                  }}
                >
                  {initials(patientName)}
                </Avatar>
                <Box sx={{ position: 'absolute', right: 2, bottom: 4, width: 28, height: 28, borderRadius: '50%', bgcolor: colors.green, color: '#fff', display: 'grid', placeItems: 'center', border: '2px solid #fff' }}>
                  <CameraIcon sx={{ fontSize: 16 }} />
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: { xs: 34, md: 42 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
                  {patientName}
                </Typography>
                <Stack direction="row" spacing={1.2} alignItems="center" useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                  <Typography sx={{ color: colors.muted, fontSize: 16.5 }}>Patient ID: SVT-2024-00482</Typography>
                  <Chip label="Verified" sx={{ bgcolor: colors.greenSoft, color: colors.green, fontSize: 14 }} />
                </Stack>

                <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap" sx={{ mt: 1.8 }}>
                  {['Male · 42 years', 'B+ Blood Group', 'Hoshiarpur, Punjab'].map((item) => (
                    <Chip key={item} label={item} sx={{ bgcolor: '#f6f3ec', color: '#66615a', fontSize: 14.5, height: 36 }} />
                  ))}
                  {['Hypertension', 'Penicillin Allergy'].map((item) => (
                    <Chip key={item} label={item} sx={{ bgcolor: colors.redSoft, color: colors.red, border: `1px solid #f5a1a1`, fontSize: 14.5, height: 36 }} />
                  ))}
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.6} useFlexGap flexWrap="wrap">
              {[
                ['12', 'Consultations'],
                ['4', 'Prescriptions'],
                ['14', 'Records'],
                ['2', 'Doctors']
              ].map(([value, label]) => (
                <Box key={label} sx={{ width: 116, p: 1.6, borderRadius: 2.5, bgcolor: '#f5f1e9', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 22 }}>{value}</Typography>
                  <Typography sx={{ color: colors.muted, fontSize: 14.5, lineHeight: 1.15 }}>{label}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 1, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            {[
              ['Personal Info', true],
              ['Health Details', false],
              ['Emergency Contacts', false],
              ['Privacy & Security', false]
            ].map(([label, active]) => (
              <Button
                key={label}
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: 2.5,
                  bgcolor: active ? colors.green : 'transparent',
                  color: active ? '#fff' : '#67625b',
                  textTransform: 'none',
                  fontSize: 16,
                  justifyContent: 'flex-start'
                }}
              >
                {label}
              </Button>
            ))}
          </Stack>
        </Box>

        <Stack spacing={3}>
          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 18 }}>Basic information</Typography>
              <Button sx={{ px: 2.6, py: 0.9, borderRadius: 2.5, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 15.5 }}>
                Edit
              </Button>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              {[
                ['Full name', patientName],
                ['Date of birth', '14 August 1983'],
                ['Age', '42 years'],
                ['Gender', 'Male'],
                ['Blood group', 'B+'],
                ['Marital status', 'Married']
              ].map(([label, value]) => (
                <Box key={label}>
                  <Typography sx={{ color: colors.muted, fontSize: 15 }}>{label}</Typography>
                  <Typography sx={{ mt: 0.3, color: label === 'Blood group' ? colors.red : colors.text, fontSize: 17 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Typography sx={{ fontSize: 18, mb: 2.5 }}>Contact information</Typography>
            <Stack spacing={2}>
              {[
                ['Mobile number', '+91 98140 55872', 'Verify'],
                ['Email address', 'ramesh.kumar83@gmail.com', 'Edit'],
                ['Village / Town', 'Garhshankar, Hoshiarpur', 'Edit'],
                ['District & PIN', 'Hoshiarpur, Punjab — 146105', 'Edit'],
                ['Aadhaar number', 'XXXX XXXX 4821', 'Verified']
              ].map(([label, value, action]) => (
                <Stack key={label} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ py: 1.5, borderTop: `1px solid ${colors.soft}`, '&:first-of-type': { borderTop: 'none', pt: 0 } }}>
                  <Box>
                    <Typography sx={{ color: colors.muted, fontSize: 15 }}>{label}</Typography>
                    <Typography sx={{ mt: 0.35, fontSize: 17 }}>{value}</Typography>
                  </Box>
                  <Button
                    sx={{
                      minWidth: 104,
                      px: 2.5,
                      py: 0.95,
                      borderRadius: 2.5,
                      border: `1px solid ${action === 'Verified' ? colors.green : colors.line}`,
                      bgcolor: action === 'Verified' ? colors.greenSoft : '#fff',
                      color: action === 'Verified' ? colors.green : colors.text,
                      textTransform: 'none',
                      fontSize: 15.5
                    }}
                  >
                    {action}
                  </Button>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 18 }}>My doctors</Typography>
              <Button sx={{ color: colors.green, textTransform: 'none', fontSize: 15.5 }}>Add doctor</Button>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              {doctorCards.map(([abbr, name, role, consults, bg, fg]) => (
                <Box key={name} sx={{ p: 2.2, borderRadius: 3, border: `1px solid ${colors.soft}`, bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: bg, color: fg, fontWeight: 700, fontSize: 24 }}>{abbr}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 17, lineHeight: 1.15 }}>{name}</Typography>
                    <Typography sx={{ color: colors.muted, fontSize: 14.5, lineHeight: 1.15 }}>{role}</Typography>
                    <Typography sx={{ mt: 0.6, color: colors.green, fontSize: 15 }}>{consults}</Typography>
                  </Box>
                  <Button sx={{ px: 2.6, py: 0.9, borderRadius: 2.4, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 15.5 }}>
                    Book
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>
      </Box>
    </PatientShell>
  );
}
