import React, { useMemo, useState } from 'react';
import { 
  Avatar, Box, Button, CssBaseline, Stack, Typography, 
  IconButton, Drawer, AppBar, Toolbar, useTheme, useMediaQuery 
} from '@mui/material';
import {
  CalendarTodayRounded as CalendarIcon,
  DashboardRounded as DashboardIcon,
  EditNoteRounded as NoteIcon,
  LogoutRounded as LogoutIcon,
  PeopleRounded as PeopleIcon,
  PersonOutlineRounded as PersonIcon,
  SettingsOutlined as SettingsIcon,
  Menu as MenuIcon,
  ChevronRightRounded as ChevronRightIcon
} from '@mui/icons-material';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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

const settingsSectionKeys = ['account', 'preferences', 'security', 'danger'];
const drawerWidth = 320;

function DoctorLayout({ children, activeSettingSection = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const doctor = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const doctorName = doctor?.full_name || doctor?.name || 'Doctor';
  const profileImage = doctor?.profileImage || doctor?.avatar || doctor?.image || '';
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const [searchParams] = useSearchParams();
  const currentSection = activeSettingSection || searchParams.get('section') || '';
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith('/doctor/settings'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      <Box sx={{ px: 4, py: 4, borderBottom: `1px solid ${colors.line}` }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700, color: colors.primary, fontFamily: 'Inter, sans-serif' }}>
          Seva TeleHealth
        </Typography>
        <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 15 }}>
          Doctor Workspace
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 3, flex: 1, overflowY: 'auto' }}>
        <Stack spacing={0.5}>
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
                      px: 2,
                      py: 1.2,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontSize: 15.5,
                      fontWeight: active ? 600 : 500,
                      color: active ? colors.primaryDark : '#3c4043',
                      bgcolor: active ? colors.primarySoft : 'transparent',
                      '&:hover': { bgcolor: active ? colors.primarySoft : '#f1f3f4' }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Icon sx={{ fontSize: 20 }} />
                      <Box>{t[item.textKey]}</Box>
                    </Stack>
                    <ChevronRightIcon sx={{ fontSize: 18, transform: settingsOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: '0.2s' }} />
                  </Button>
                  
                  {settingsOpen && (
                    <Stack spacing={0.5} sx={{ mt: 0.5, pl: 5 }}>
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
                                  onClick={() => {
                                    navigate(`/doctor/settings?section=${key}`);
                                    if (isMobile) setMobileOpen(false);
                                  }}
                                  sx={{
                                      justifyContent: 'flex-start',
                                      gap: 1.5,
                                      px: 1.5,
                                      py: 0.8,
                                      borderRadius: 1.2,
                                      textTransform: 'none',
                                      fontSize: 14,
                                      fontWeight: isActive ? 600 : 500,
                                      color: key === 'danger' ? '#d93025' : isActive ? colors.primaryDark : colors.muted,
                                      bgcolor: isActive ? colors.primarySoft : 'transparent',
                                      '&:hover': { bgcolor: isActive ? colors.primarySoft : '#f1f3f4' }
                                  }}
                              >
                                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: key === 'danger' ? '#f0a2a2' : isActive ? colors.primary : '#bdbdbd' }} />
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
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  justifyContent: 'flex-start',
                  gap: 2,
                  px: 2,
                  py: 1.2,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: 15.5,
                  fontWeight: active ? 600 : 500,
                  color: active ? colors.primaryDark : '#3c4043',
                  bgcolor: active ? colors.primarySoft : 'transparent',
                  '&:hover': { bgcolor: active ? colors.primarySoft : '#f1f3f4' }
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
                <Box>{t[item.textKey]}</Box>
              </Button>
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ p: 2.5, borderTop: `1px solid ${colors.line}` }}>
        <Typography sx={{ color: colors.muted, fontSize: 13, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Language</Typography>
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
                borderRadius: 1.2,
                border: `1px solid ${language === lang.code ? colors.primary : '#dadce0'}`,
                bgcolor: language === lang.code ? colors.primarySoft : 'transparent',
                color: language === lang.code ? colors.primaryDark : '#5f6368',
                textTransform: 'none',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              {lang.label}
            </Button>
          ))}
        </Stack>

        <Box 
          onClick={() => navigate('/doctor/profile')}
          sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: 2, 
            bgcolor: '#f8f9fa', 
            border: `1px solid ${colors.line}`, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            cursor: 'pointer',
            transition: '0.2s',
            '&:hover': {
              bgcolor: '#f1f3f4',
              borderColor: colors.primary
            }
          }}
        >
          <Avatar src={profileImage} alt={doctorName} sx={{ width: 40, height: 40, bgcolor: colors.primarySoft, color: colors.primaryDark, fontWeight: 700, fontSize: 14 }}>
            {initials(doctorName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctorName}</Typography>
            <Typography sx={{ color: colors.muted, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctor?.specialization || 'Medicine Specialist'}</Typography>
          </Box>
        </Box>

        <Button
          onClick={handleLogout}
          startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
          sx={{
            mt: 2,
            width: '100%',
            justifyContent: 'center',
            p: 1,
            borderRadius: 1.5,
            border: `1px solid #dadce0`,
            bgcolor: '#fff',
            color: '#3c4043',
            textTransform: 'none',
            fontSize: 14,
            fontWeight: 600,
            '&:hover': { bgcolor: '#f1f3f4' }
          }}
        >
          {t.logout || 'Logout'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.bg }}>
      <CssBaseline />
      
      {/* Top Bar (Only visible on Mobile/Tablet) */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          display: { xs: 'flex', lg: 'none' }, // HIDE ON DESKTOP
          bgcolor: '#ffffff',
          color: '#202124',
          borderBottom: `1px solid ${colors.line}`,
          width: '100%',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: colors.primary }}>
              Seva TeleHealth
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={2} alignItems="center">
             <Typography sx={{ display: { xs: 'none', sm: 'block' }, color: colors.muted, fontSize: 14, fontWeight: 500 }}>
               {t.doctor || 'Doctor'}
             </Typography>
             <IconButton onClick={() => navigate('/doctor/profile')} sx={{ p: 0 }}>
               <Avatar src={profileImage} sx={{ width: 36, height: 36, bgcolor: colors.primarySoft, color: colors.primaryDark, fontSize: 14, fontWeight: 700 }}>
                 {initials(doctorName)}
               </Avatar>
             </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: `1px solid ${colors.line}` },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, lg: 0 } // No margin on desktop since top bar is gone
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default DoctorLayout;
