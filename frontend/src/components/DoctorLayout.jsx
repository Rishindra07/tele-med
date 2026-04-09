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
import { useLanguage, useTranslation } from '../context/LanguageContext';

const colors = {
  bg: '#f8f9fa',
  line: '#e0e0e0',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#1557b0'
};

const navItems = [
  { textKey: 'dashboard', icon: DashboardIcon, path: '/doctor' },
  { textKey: 'appointments', icon: CalendarIcon, path: '/doctor/appointments' },
  { textKey: 'patients', icon: PeopleIcon, path: '/doctor/patients' },
  { textKey: 'profile', icon: PersonIcon, path: '/doctor/profile' },
  { textKey: 'settings', icon: SettingsIcon, path: '/doctor/settings' }
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
  });
  const doctorName = doctor?.full_name || doctor?.name || 'Doctor';
  const profileImage = doctor?.profileImage || doctor?.avatar || doctor?.image || '';
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, color: '#202124', display: 'flex', flexDirection: { xs: 'column', lg: 'row' } }}>
      <CssBaseline />
      <Box
        component="aside"
        sx={{
          width: { xs: '100%', lg: 320 },
          bgcolor: '#ffffff',
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
          <Typography sx={{ fontSize: 26, fontWeight: 700, color: colors.primary, fontFamily: 'Inter, sans-serif' }}>
            Seva TeleHealth
          </Typography>
          <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 17 }}>
            Doctor Workspace
          </Typography>
        </Box>

        <Box sx={{ px: 2.5, py: 3, flex: 1 }}>
          <Stack spacing={1}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.textKey}
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: 'flex-start',
                    gap: 2,
                    px: 2.5,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: 16,
                    fontWeight: active ? 600 : 500,
                    color: active ? colors.primaryDark : '#3c4043',
                    bgcolor: active ? colors.primarySoft : 'transparent',
                    '&:hover': { bgcolor: active ? colors.primarySoft : '#f1f3f4' }
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                  <Box>{t[item.textKey]}</Box>
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Box sx={{ p: 2.5, borderTop: `1px solid ${colors.line}` }}>
          <Typography sx={{ color: colors.muted, fontSize: 14, fontWeight: 600, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Language</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {[
              { code: 'en', label: 'EN' },
              { code: 'hi', label: 'हि' },
              { code: 'pa', label: 'ਪੰ' },
              { code: 'ta', label: 'தமி' },
              { code: 'te', label: 'తె' },
              { code: 'bn', label: 'বা' }
            ].map((lang) => (
              <Button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                sx={{
                  minWidth: 0,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  border: `1px solid ${language === lang.code ? colors.primary : '#dadce0'}`,
                  bgcolor: language === lang.code ? colors.primarySoft : 'transparent',
                  color: language === lang.code ? colors.primaryDark : '#5f6368',
                  textTransform: 'none',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                {lang.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#f8f9fa', border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={profileImage} alt={doctorName} sx={{ width: 44, height: 44, bgcolor: colors.primarySoft, color: colors.primaryDark, fontWeight: 700 }}>
              {initials(doctorName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctorName}</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctor?.specialization || 'Medicine Specialist'}</Typography>
            </Box>
          </Box>

          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              mt: 2,
              width: '100%',
              justifyContent: 'center',
              py: 1,
              borderRadius: 2,
              border: `1px solid #dadce0`,
              bgcolor: '#fff',
              color: '#3c4043',
              textTransform: 'none',
              fontSize: 14.5,
              fontWeight: 500,
              '&:hover': { bgcolor: '#f1f3f4' }
            }}
          >
            {t.logout || 'Logout'}
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
