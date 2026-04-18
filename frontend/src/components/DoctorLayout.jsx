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
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage, useTranslation } from '../context/LanguageContext';
import { ChevronRightRounded as ChevronRightIcon } from '@mui/icons-material';

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

const settingsSectionKeys = ['account', 'preferences', 'security', 'danger'];

function DoctorLayout({ children, activeSettingSection = '' }) {
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
  const [searchParams] = useSearchParams();
  const currentSection = activeSettingSection || searchParams.get('section') || '';
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith('/doctor/settings'));

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
              const active = item.path === '/doctor/settings' 
                ? location.pathname.startsWith('/doctor/settings')
                : location.pathname === item.path;

              if (item.path === '/doctor/settings') {
                return (
                  <Box key={item.path}>
                    <Button
                      onClick={() => {
                        setSettingsOpen(!settingsOpen);
                        if (!location.pathname.startsWith('/doctor/settings')) {
                            navigate('/doctor/settings?section=account');
                        }
                      }}
                      sx={{
                        width: '100%',
                        justifyContent: 'space-between',
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
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Icon sx={{ fontSize: 22 }} />
                        <Box>{t[item.textKey]}</Box>
                      </Stack>
                      <ChevronRightIcon sx={{ transform: settingsOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: '0.2s' }} />
                    </Button>
                    
                    {settingsOpen && (
                      <Stack spacing={0.5} sx={{ mt: 0.5, pl: 5.5 }}>
                        {settingsSectionKeys.map(key => {
                            const sectionLabels = {
                                account: 'Doctor Profile',
                                preferences: 'Clinical Workflow',
                                security: 'Security & Access',
                                danger: 'Account Actions'
                            };
                            const isActive = currentSection === key || (key === 'account' && !currentSection && location.pathname === '/doctor/settings');
                            return (
                                <Button
                                    key={key}
                                    onClick={() => navigate(`/doctor/settings?section=${key}`)}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        gap: 1.5,
                                        px: 1.5,
                                        py: 0.8,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: 14.5,
                                        fontWeight: isActive ? 600 : 500,
                                        color: key === 'danger' ? '#d93025' : isActive ? colors.primaryDark : colors.muted,
                                        bgcolor: isActive ? colors.primarySoft : 'transparent',
                                        '&:hover': { bgcolor: isActive ? colors.primarySoft : '#f1f3f4' }
                                    }}
                                >
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: key === 'danger' ? '#f0a2a2' : isActive ? colors.primary : '#bdbdbd' }} />
                                    {sectionLabels[key]}
                                </Button>
                            );
                        })}
                      </Stack>
                    )}
                  </Box>
                );
              }

              return (
                <Button
                  key={item.textKey}
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: 'flex-start',
                    gap: 2,
                    px: 2,
                    py: 1.4,
                    borderRadius: 4,
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

          <Box sx={{ mt: 3, p: 2, borderRadius: 6, bgcolor: '#f8f9fa', border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
              p: 1.25,
              borderRadius: 4.5,
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
