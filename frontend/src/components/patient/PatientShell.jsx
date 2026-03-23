import React, { useMemo, useState } from 'react';
import { Avatar, Box, Button, CssBaseline, Stack, Typography } from '@mui/material';
import {
  ChevronRightRounded as ChevronRightIcon,
  HomeRounded as HomeIcon,
  EventNoteRounded as EventIcon,
  FavoriteBorderRounded as HealthRecordsIcon,
  LocalHospitalRounded as HospitalIcon,
  LogoutRounded as LogoutIcon,
  PersonOutlineRounded as PersonIcon,
  SearchRounded as SearchIcon,
  SettingsOutlined as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const colors = {
  bg: '#f8f9fa',
  line: '#e0e0e0',
  muted: '#5f6368',
  green: '#1a73e8',
  greenSoft: '#e8f0fe',
  greenDark: '#1557b0'
};

const navItems = [
  { label: 'Home', icon: HomeIcon, action: 'dashboard' },
  { label: 'Appointments', icon: EventIcon, action: 'appointments' },
  { label: 'Health Records', icon: HealthRecordsIcon, action: 'records' },
  { label: 'Symptom Checker', icon: SearchIcon, action: 'symptoms' },
  { label: 'Pharmacies', icon: HospitalIcon, action: 'pharmacies' }
];

const settingsSections = [
  ['appearance', 'Appearance'],
  ['language', 'Language'],
  ['notifications', 'Notifications'],
  ['connectivity', 'Connectivity'],
  ['privacy', 'Privacy'],
  ['security', 'Security'],
  ['storage', 'Storage & Sync'],
  ['accessibility', 'Accessibility'],
  ['account', 'Account'],
  ['devices', 'Devices'],
  ['danger', 'Danger Zone']
];

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'RK';

function PatientShell({ activeItem = 'dashboard', activeSetting = '', activeSettingSection = '', children }) {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);
  const patientName = user?.name || 'Ramesh Kumar';
  const profileImage = user?.profileImage || user?.avatar || user?.image || '';
  const [language, setLanguage] = useState('EN');
  const settingsOpenDefault = activeSetting === 'settings';
  const [settingsOpen, setSettingsOpen] = useState(settingsOpenDefault);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNav = (action) => {
    if (action === 'dashboard') navigate('/patient');
    if (action === 'appointments') navigate('/patient/appointments');
    if (action === 'records') navigate('/patient/records');
    if (action === 'symptoms') navigate('/symptom-checker');
    if (action === 'pharmacies') navigate('/patient/pharmacies');
    if (action === 'profile') navigate('/patient/profile');
    if (action === 'settings') navigate('/patient/settings');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: colors.bg,
        color: '#252525',
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' }
      }}
    >
      <CssBaseline />
      <Box
        component="aside"
        sx={{
          width: { xs: '100%', lg: 345 },
          bgcolor: '#fcfbf7',
          borderRight: { xs: 'none', lg: `1px solid ${colors.line}` },
          borderBottom: { xs: `1px solid ${colors.line}`, lg: 'none' },
          display: 'flex',
          flexDirection: 'column',
          position: { xs: 'relative', lg: 'sticky' },
          top: 0,
          height: { xs: 'auto', lg: '100vh' },
          maxHeight: { xs: 'none', lg: '100vh' },
          overflowY: { xs: 'visible', lg: 'auto' },
          flexShrink: 0
        }}
      >
        <Box sx={{ px: 4, py: 5, borderBottom: `1px solid ${colors.line}` }}>
          <Typography sx={{ fontSize: 26, fontWeight: 700, color: colors.green, fontFamily: 'Georgia, serif' }}>
            Seva TeleHealth
          </Typography>
          <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 17 }}>
            Rural Healthcare Platform
          </Typography>
        </Box>

        <Box sx={{ px: 2.5, py: 3, flex: 1 }}>
          <Stack spacing={1.25}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.action === activeItem;
              return (
                <Button
                  key={item.label}
                  onClick={() => handleNav(item.action)}
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
                  <Box sx={{ flexGrow: 1, textAlign: 'left' }}>{item.label}</Box>
                  {item.action === 'appointments' && (
                    <Box
                      sx={{
                        minWidth: 26,
                        height: 26,
                        px: 1,
                        borderRadius: 10,
                        bgcolor: colors.green,
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 14,
                        fontWeight: 700
                      }}
                    >
                      2
                    </Box>
                  )}
                </Button>
              );
            })}
          </Stack>

          <Typography sx={{ mt: 5, mb: 2, px: 1.5, color: colors.muted, fontSize: 14, letterSpacing: 1.4 }}>
            SETTINGS
          </Typography>
          <Stack spacing={1.25}>
            {[
              ['My Profile', 'profile', <PersonIcon key="profile" />]
            ].map(([label, action, icon]) => {
              const active = action === activeSetting;
              return (
              <Button
                key={label}
                onClick={() => handleNav(action)}
                sx={{
                  justifyContent: 'flex-start',
                  gap: 1.5,
                  px: 2,
                  py: 1.4,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: 16,
                  color: active ? colors.greenDark : '#3d3d3d',
          bgcolor: active ? colors.greenSoft : 'transparent',
          '&:hover': { bgcolor: active ? colors.greenSoft : '#f0f0f0' }
                }}
              >
                {icon}
                <Box>{label}</Box>
              </Button>
              );
            })}

            <Box>
              <Button
                onClick={() => {
                  setSettingsOpen((prev) => !prev);
                  if (activeSetting !== 'settings') {
                    navigate('/patient/settings');
                  }
                }}
                sx={{
                  width: '100%',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  px: 2,
                  py: 1.4,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: 16,
                  color: activeSetting === 'settings' ? colors.greenDark : '#3d3d3d',
                  bgcolor: activeSetting === 'settings' ? colors.greenSoft : 'transparent',
                  '&:hover': { bgcolor: activeSetting === 'settings' ? colors.greenSoft : '#f3eee4' }
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <SettingsIcon />
                  <Box>Settings</Box>
                </Stack>
                <ChevronRightIcon
                  sx={{
                    transform: settingsOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </Button>

              {settingsOpen && (
                <Stack spacing={0.45} sx={{ mt: 0.75, pl: 4 }}>
                  {settingsSections.map(([key, label]) => {
                    const active = key === activeSettingSection;
                    return (
                      <Button
                        key={key}
                        onClick={() => navigate(`/patient/settings?section=${key}`)}
                        sx={{
                          justifyContent: 'flex-start',
                          gap: 1,
                          px: 1.5,
                          py: 0.8,
                          borderRadius: 2.2,
                          textTransform: 'none',
                          fontSize: 14,
                          color: key === 'danger' ? '#d9635b' : active ? colors.greenDark : '#66615a',
                          bgcolor: active ? colors.greenSoft : 'transparent',
                          '&:hover': { bgcolor: active ? colors.greenSoft : '#f3eee4' }
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: key === 'danger' ? '#f0a2a2' : active ? colors.green : '#bdbdbd',
                            flexShrink: 0
                          }}
                        />
                        <Box>{label}</Box>
                      </Button>
                    );
                  })}
                </Stack>
              )}
            </Box>
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

        <Box sx={{ mt: 3.5, p: 2, borderRadius: 2, bgcolor: '#f8f9fa', border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={profileImage}
            alt={patientName}
            sx={{ width: 48, height: 48, bgcolor: colors.greenSoft, color: colors.greenDark, fontWeight: 700 }}
          >
              {initials(patientName)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{patientName}</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 15 }}>Hoshiarpur, Punjab</Typography>
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
            '&:hover': { bgcolor: '#f0f0f0' }
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

export default PatientShell;
