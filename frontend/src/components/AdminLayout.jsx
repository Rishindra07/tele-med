import React, { useState } from 'react';
import { Avatar, Box, Button, CssBaseline, Stack, Typography, Badge, Divider } from '@mui/material';
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
  LanguageRounded as LanguageIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const colors = {
  bg: '#f5f1e8',
  sidebarBg: '#fcfbf7',
  line: '#ebe9e0',
  muted: '#6f6a62',
  text: '#252525',
  blue: '#2563eb',
  blueSoft: '#eff6ff',
  blueDark: '#1e40af',
  red: '#dc2626',
  green: '#16a34a',
  orange: '#ea580c'
};

const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { text: 'Dashboard', icon: DashboardIcon, path: '/admin' },
      { text: 'Analytics', icon: AnalyticsIcon, path: '/admin/analytics' }
    ]
  },
  {
    title: 'PLATFORM',
    items: [
      { text: 'Patients', icon: PatientsIcon, path: '/admin/patients', badge: '12.4K', badgeColor: colors.green },
      { text: 'Doctors', icon: DoctorsIcon, path: '/admin/doctors', badge: 'Pending', badgeColor: colors.orange },
      { text: 'Pharmacies', icon: PharmaciesIcon, path: '/admin/pharmacies' },
      { text: 'Consultations', icon: ConsultationsIcon, path: '/admin/consultations', badge: '924', badgeColor: colors.blue }
    ]
  },
  {
    title: 'INSIGHTS & FINANCES',
    items: [
      { text: 'Health records', icon: RecordsIcon, path: '/admin/records' },
      { text: 'Financial', icon: FinanceIcon, path: '/admin/financials', badge: '3', badgeColor: colors.red, badgeTextColor: '#fff' },
      { text: 'Reports', icon: ReportsIcon, path: '/admin/reports' }
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { text: 'System Health', icon: HealthIcon, path: '/admin/health', badge: '1', badgeColor: colors.red },
      { text: 'User management', icon: UserMgmtIcon, path: '/admin/users' },
      { text: 'Audit log', icon: AuditIcon, path: '/admin/audit' },
      { text: 'Settings', icon: SettingsIcon, path: '/admin/settings' }
    ]
  }
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState('EN');
  const adminUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

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
        key={item.text}
        onClick={() => navigate(item.path)}
        sx={{
          justifyContent: 'flex-start',
          gap: 1.5,
          px: 2,
          py: 1.2,
          borderRadius: 2.5,
          textTransform: 'none',
          fontSize: 14.5,
          color: active ? colors.blueDark : colors.text,
          bgcolor: active ? colors.blueSoft : 'transparent',
          '&:hover': { bgcolor: active ? colors.blueSoft : '#f3eee4' },
          width: '100%',
          mb: 0.5
        }}
      >
        <Icon sx={{ fontSize: 20, color: active ? colors.blue : colors.muted }} />
        <Box sx={{ flex: 1, textAlign: 'left', fontWeight: active ? 600 : 400 }}>{item.text}</Box>
        {item.badge && (
          <Box
            sx={{
              px: 1,
              py: 0.2,
              borderRadius: 1,
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, color: colors.text, display: 'flex' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <Box
        component="aside"
        sx={{
          width: 280,
          bgcolor: colors.sidebarBg,
          borderRight: `1px solid ${colors.line}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          flexShrink: 0
        }}
      >
        <Box sx={{ px: 3, py: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 32, height: 32, bgcolor: colors.blue, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>S</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: colors.blueDark, fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                Seva TeleHealth
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                <Typography sx={{ color: colors.muted, fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>ADMIN CONSOLE</Typography>
                <Box sx={{ px: 0.6, py: 0.1, bgcolor: colors.blueSoft, borderRadius: 0.5 }}>
                  <Typography sx={{ fontSize: 9, color: colors.blue, fontWeight: 800 }}>PRO</Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ px: 2, flex: 1, pb: 4 }}>
          {NAV_SECTIONS.map((section, idx) => (
            <Box key={section.title} sx={{ mt: idx === 0 ? 0 : 4 }}>
              <Typography sx={{ px: 2, mb: 1.5, fontSize: 11, fontWeight: 700, color: colors.muted, letterSpacing: 1 }}>
                {section.title}
              </Typography>
              <Stack spacing={0}>
                {section.items.map(renderNavItem)}
              </Stack>
            </Box>
          ))}
        </Box>

        {/* Footer Sidebar */}
        <Box sx={{ p: 2, borderTop: `1px solid ${colors.line}`, bgcolor: '#fcfbf7' }}>
          <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
            {['EN', 'HI', 'PB', 'TA'].map((lang) => (
              <Button
                key={lang}
                size="small"
                onClick={() => setLanguage(lang)}
                sx={{
                  minWidth: 0, px: 1, py: 0.4, borderRadius: 1, fontSize: 11, fontWeight: 600,
                  bgcolor: language === lang ? colors.blueSoft : 'transparent',
                  color: language === lang ? colors.blue : colors.muted,
                  '&:hover': { bgcolor: colors.blueSoft }
                }}
              >
                {lang}
              </Button>
            ))}
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2, bgcolor: '#fff', border: `1px solid ${colors.line}` }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: colors.blueSoft, color: colors.blue, fontWeight: 700, fontSize: 14 }}>
              {(adminUser?.full_name || adminUser?.name || 'Admin')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join('') || 'AD'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.1 }}>{adminUser?.full_name || adminUser?.name || 'Admin User'}</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 11, mt: 0.2 }}>{adminUser?.role || 'admin'}</Typography>
            </Box>
            <IconButton onClick={handleLogout} size="small" sx={{ color: colors.muted }}>
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
}

function IconButton({ children, onClick, size, sx }) {
  return (
    <Button onClick={onClick} sx={{ minWidth: 0, p: 0.8, borderRadius: 1.5, ...sx }}>
      {children}
    </Button>
  );
}
