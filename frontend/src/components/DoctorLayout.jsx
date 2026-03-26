import React, { useMemo, useState } from 'react';
import { Avatar, Box, Button, CssBaseline, Stack, Typography } from '@mui/material';
import {
  CalendarTodayRounded as CalendarIcon,
  DashboardRounded as DashboardIcon,
  EditNoteRounded as NoteIcon,
  LogoutRounded as LogoutIcon,
  PeopleRounded as PeopleIcon,
  PersonOutlineRounded as PersonIcon,
  SettingsOutlined as SettingsIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const colors = {
  bg: '#f5f1e8',
  line: '#d8d0c4',
  muted: '#6f6a62',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  greenDark: '#176d57'
};

const navItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/doctor' },
  { text: 'Appointments', icon: CalendarIcon, path: '/doctor/appointments' },
  { text: 'Patients', icon: PeopleIcon, path: '/doctor/patients' },
  { text: 'Profile', icon: PersonIcon, path: '/doctor/profile' },
  { text: 'Settings', icon: SettingsIcon, path: '/doctor/settings' },
  { text: 'Prescribe', icon: NoteIcon, path: '/doctor/prescribe' }
];

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'DR';

function DoctorLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);
  const doctorName = doctor?.name || 'Dr. Marttin Deo';
  const profileImage = doctor?.profileImage || doctor?.avatar || doctor?.image || '';
  const [language, setLanguage] = useState('EN');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, color: '#252525', display: 'flex', flexDirection: { xs: 'column', lg: 'row' } }}>
      <CssBaseline />
      <Box
        component="aside"
        sx={{
          width: { xs: '100%', lg: 320 },
          bgcolor: '#fcfbf7',
          borderRight: { xs: 'none', lg: `1px solid ${colors.line}` },
          borderBottom: { xs: `1px solid ${colors.line}`, lg: 'none' },
          display: 'flex',
          flexDirection: 'column',
          position: { xs: 'relative', lg: 'sticky' },
          top: 0,
          height: { xs: 'auto', lg: '100vh' },
          overflowY: { xs: 'visible', lg: 'auto' },
          flexShrink: 0
        }}
      >
        <Box sx={{ px: 4, py: 5, borderBottom: `1px solid ${colors.line}` }}>
          <Typography sx={{ fontSize: 26, fontWeight: 700, color: colors.green, fontFamily: 'Georgia, serif' }}>
            Seva TeleHealth
          </Typography>
          <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 17 }}>
            Doctor Workspace
          </Typography>
        </Box>

        <Box sx={{ px: 2.5, py: 3, flex: 1 }}>
          <Stack spacing={1.25}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: 'flex-start',
                    gap: 1.5,
                    px: 2,
                    py: 1.6,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: 16,
                    color: active ? colors.greenDark : '#3d3d3d',
                    bgcolor: active ? colors.greenSoft : 'transparent',
                    '&:hover': { bgcolor: active ? colors.greenSoft : '#f3eee4' }
                  }}
                >
                  <Icon />
                  <Box>{item.text}</Box>
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Box sx={{ p: 2.5, borderTop: `1px solid ${colors.line}` }}>
          <Typography sx={{ color: colors.muted, fontSize: 16, mb: 1.75 }}>Language</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {['EN', 'HIN', 'TAM', 'TEL', 'BAN'].map((item) => (
              <Button
                key={item}
                onClick={() => setLanguage(item)}
                sx={{
                  minWidth: 0,
                  px: 1.8,
                  py: 0.75,
                  borderRadius: 999,
                  border: `1px solid ${language === item ? colors.green : '#bcb4aa'}`,
                  bgcolor: language === item ? colors.greenSoft : '#fff',
                  color: language === item ? colors.greenDark : '#5f5a52',
                  textTransform: 'none',
                  fontSize: 15
                }}
              >
                {item}
              </Button>
            ))}
          </Stack>

          <Box sx={{ mt: 3.5, p: 2, borderRadius: 3, bgcolor: '#f2efe6', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={profileImage} alt={doctorName} sx={{ width: 48, height: 48, bgcolor: '#d8efe8', color: colors.greenDark, fontWeight: 700 }}>
              {initials(doctorName)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{doctorName}</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 15 }}>{doctor?.specialization || 'Medicine Specialist'}</Typography>
            </Box>
          </Box>

          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              mt: 1.5,
              width: '100%',
              justifyContent: 'center',
              py: 1.1,
              borderRadius: 3,
              border: `1px solid ${colors.line}`,
              bgcolor: '#fff',
              color: '#34322f',
              textTransform: 'none',
              fontSize: 15.5,
              '&:hover': { bgcolor: '#f7f3ea' }
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
}

export default DoctorLayout;
