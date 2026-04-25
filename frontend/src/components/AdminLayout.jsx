import React, { useState } from 'react';
import { 
  Avatar, Box, Button, CssBaseline, Stack, Typography, Badge, Divider,
  IconButton, Drawer, AppBar, Toolbar, useTheme, useMediaQuery
} from '@mui/material';
import {
  GridViewRounded as DashboardIcon,
  TimelineRounded as AnalyticsIcon,
  PeopleRounded as PatientsIcon,
  MedicationRounded as DoctorsIcon,
  LocalPharmacyRounded as PharmaciesIcon,
  VideoChatRounded as ConsultationsIcon,
  AssignmentRounded as RecordsIcon,
  AccountBalanceWalletRounded as FinanceIcon,
  AssessmentRounded as ReportsIcon,
  DnsRounded as HealthIcon,
  ManageAccountsRounded as UserMgmtIcon,
  HistoryRounded as AuditIcon,
  SettingsRounded as SettingsIcon,
  LogoutRounded as LogoutIcon,
  LanguageRounded as LanguageIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage, useTranslation } from '../context/LanguageContext';

const colors = {
  bg: '#f8f9fa',
  sidebarBg: '#ffffff',
  line: '#e0e0e0',
  muted: '#5f6368',
  text: '#202124',
  blue: '#1a73e8',
  blueSoft: '#e8f0fe',
  blueDark: '#1557b0',
  red: '#d93025',
  green: '#1e8e3e',
  orange: '#f9ab00'
};

const NAV_SECTIONS = [
  {
    titleKey: 'overview',
    items: [
      { textKey: 'dashboard', icon: DashboardIcon, path: '/admin' }
    ]
  },
  {
    titleKey: 'platform',
    items: [
      { textKey: 'patients', icon: PatientsIcon, path: '/admin/patients' },
      { textKey: 'doctors', icon: DoctorsIcon, path: '/admin/doctors' },
      { textKey: 'pharmacies', icon: PharmaciesIcon, path: '/admin/pharmacies' },
      { textKey: 'consultations', icon: ConsultationsIcon, path: '/admin/consultations' }
    ]
  },
  {
    titleKey: 'insights_finances',
    items: [
      { textKey: 'reports', icon: ReportsIcon, path: '/admin/reports' }
    ]
  },
  {
    titleKey: 'system',
    items: [
      { textKey: 'settings', icon: SettingsIcon, path: '/admin/settings' }
    ]
  }
];

const drawerWidth = 280;

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  
  const adminUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

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

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;
    
    return (
      <Button
        key={item.textKey}
        onClick={() => {
          navigate(item.path);
          if (isMobile) setMobileOpen(false);
        }}
        sx={{
          justifyContent: 'flex-start',
          gap: 1.5,
          px: 2,
          py: 1.2,
          borderRadius: 1.5,
          textTransform: 'none',
          fontSize: 14.5,
          color: active ? colors.blueDark : colors.text,
          bgcolor: active ? colors.blueSoft : 'transparent',
          '&:hover': { bgcolor: active ? colors.blueSoft : '#f1f3f4' },
          width: '100%',
          mb: 0.5
        }}
      >
        <Icon sx={{ fontSize: 20, color: active ? colors.blue : colors.muted }} />
        <Box sx={{ flex: 1, textAlign: 'left', fontWeight: active ? 600 : 400 }}>{t[item.textKey]}</Box>
        {item.badge && (
          <Box
            sx={{
              px: 1.2,
              py: 0.3,
              borderRadius: '8px',
              bgcolor: item.badgeColor,
              color: item.badgeTextColor || '#fff',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {item.badge}
          </Box>
        )}
      </Button>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.sidebarBg }}>
      <Box sx={{ px: 3, py: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 34, height: 34, bgcolor: colors.blue, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>S</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: colors.blueDark, fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
              Seva TeleHealth
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
              <Typography sx={{ color: colors.muted, fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>ADMIN CONSOLE</Typography>
              <Box sx={{ px: 0.8, py: 0.2, bgcolor: colors.blueSoft, borderRadius: '12px' }}>
                <Typography sx={{ fontSize: 9, color: colors.blue, fontWeight: 800 }}>PRO</Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: 2, flex: 1, overflowY: 'auto', pb: 4 }}>
        {NAV_SECTIONS.map((section, idx) => (
          <Box key={section.titleKey} sx={{ mt: idx === 0 ? 0 : 4 }}>
            <Typography sx={{ px: 2, mb: 1.5, fontSize: 11, fontWeight: 700, color: colors.muted, letterSpacing: 1 }}>
              {t[section.titleKey]}
            </Typography>
            <Stack spacing={0}>
              {section.items.map(renderNavItem)}
            </Stack>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${colors.line}`, bgcolor: colors.sidebarBg }}>
        <Stack direction="row" spacing={0.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
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
              size="small"
              onClick={() => setLanguage(lang.code)}
              sx={{
                minWidth: 32, px: 0.5, py: 0.4, borderRadius: '12px', fontSize: 10, fontWeight: 700,
                bgcolor: language === lang.code ? colors.blueSoft : 'transparent',
                color: language === lang.code ? colors.blue : colors.muted,
                '&:hover': { bgcolor: colors.blueSoft }
              }}
            >
              {lang.label}
            </Button>
          ))}
        </Stack>

        <Box 
          onClick={() => navigate('/admin/settings')}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            p: 1.2, 
            borderRadius: '12px', 
            bgcolor: '#fff', 
            border: `1px solid ${colors.line}`,
            cursor: 'pointer',
            transition: '0.2s',
            '&:hover': {
              borderColor: colors.blue,
              bgcolor: colors.blueSoft
            }
          }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: colors.blueSoft, color: colors.blue, fontWeight: 700, fontSize: 14 }}>
            {(adminUser?.full_name || adminUser?.name || 'Admin')
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('') || 'AD'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminUser?.full_name || adminUser?.name || 'Admin User'}</Typography>
            <Typography sx={{ color: colors.muted, fontSize: 11, mt: 0.2 }}>{adminUser?.role || 'admin'}</Typography>
          </Box>
          <IconButton onClick={handleLogout} size="small" sx={{ color: colors.muted }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, display: 'flex' }}>
      <CssBaseline />
      
      {/* Top Bar (Only visible on Mobile/Tablet) */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          display: { xs: 'flex', lg: 'none' }, // HIDE ON DESKTOP
          bgcolor: '#ffffff',
          color: colors.text,
          borderBottom: `1px solid ${colors.line}`,
          width: '100%',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center">
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: colors.blue }}>
              Seva Admin
            </Typography>
          </Stack>
          
          <Avatar sx={{ width: 32, height: 32, bgcolor: colors.blueSoft, color: colors.blue, fontSize: 12, fontWeight: 700 }}>
            AD
          </Avatar>
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
          mt: { xs: 8, lg: 0 }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
