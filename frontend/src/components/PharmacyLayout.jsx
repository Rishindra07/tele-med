import React, { useMemo, useState } from 'react';
import { Avatar, Box, Button, CssBaseline, Stack, Typography, Badge } from '@mui/material';
import {
  GridViewRounded as DashboardIcon,
  StickyNote2Outlined as PrescriptionsIcon,
  Inventory2Outlined as InventoryIcon,
  TimelineRounded as SalesIcon,
  AccessTimeRounded as ExpiryIcon,
  LocalShippingOutlined as SuppliersIcon,
  PersonOutlineRounded as ProfileIcon,
  SettingsOutlined as SettingsIcon,
  LogoutRounded as LogoutIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const colors = {
  bg: '#f5f1e8',
  sidebarBg: '#fcfbf7',
  line: '#d8d0c4',
  muted: '#6f6a62',
  text: '#252525',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  greenDark: '#176d57',
  red: '#d9635b'
};

const mainNavItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/pharmacy' },
  { text: 'Prescriptions', icon: PrescriptionsIcon, path: '/pharmacy/prescriptions', badge: 5, badgeColor: colors.green },
  { text: 'Inventory', icon: InventoryIcon, path: '/pharmacy/inventory' },
  { text: 'Sales & Reports', icon: SalesIcon, path: '/pharmacy/sales' },
  { text: 'Expiry Alerts', icon: ExpiryIcon, path: '/pharmacy/expiry', badge: 3, badgeColor: colors.red },
  { text: 'Suppliers', icon: SuppliersIcon, path: '/pharmacy/suppliers' }
];

const settingsNavItems = [
  { text: 'Pharmacy Profile', icon: ProfileIcon, path: '/pharmacy/profile' },
  { text: 'Settings', icon: SettingsIcon, path: '/pharmacy/settings' }
];

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'RX';

function PharmacyLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState('EN');

  // Hardcoded or fetched profile info
  const pharmacyName = 'Arora Medical';
  const pharmacyAddress = 'Garhshankar, Punjab';
  const profileImage = '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = location.pathname === item.path || (item.path === '/pharmacy' && location.pathname === '/pharmacy/');
    
    return (
      <Button
        key={item.text}
        onClick={() => navigate(item.path)}
        sx={{
          justifyContent: 'flex-start',
          gap: 1.5,
          px: 2,
          py: 1.4,
          borderRadius: 2.5,
          textTransform: 'none',
          fontSize: 15.5,
          color: active ? colors.greenDark : '#3d3d3d',
          bgcolor: active ? colors.greenSoft : 'transparent',
          '&:hover': { bgcolor: active ? colors.greenSoft : '#f3eee4' },
          position: 'relative',
          width: '100%'
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
        <Box sx={{ flex: 1, textAlign: 'left' }}>{item.text}</Box>
        {item.badge && (
          <Box
            sx={{
              minWidth: 22,
              height: 22,
              borderRadius: 11,
              bgcolor: item.badgeColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              ml: 1
            }}
          >
            {item.badge}
          </Box>
        )}
      </Button>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, color: colors.text, display: 'flex', flexDirection: { xs: 'column', lg: 'row' } }}>
      <CssBaseline />
      <Box
        component="aside"
        sx={{
          width: { xs: '100%', lg: 280 },
          bgcolor: colors.sidebarBg,
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
        <Box sx={{ px: 3, py: 4, borderBottom: `1px solid ${colors.line}` }}>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: colors.green, fontFamily: 'Georgia, serif' }}>
            Seva TeleHealth
          </Typography>
          <Typography sx={{ mt: 0.3, color: colors.muted, fontSize: 14 }}>
            Pharmacy Portal
          </Typography>
        </Box>

        <Box sx={{ px: 2, py: 3, flex: 1 }}>
          <Stack spacing={0.5}>
            {mainNavItems.map(renderNavItem)}
          </Stack>

          <Typography sx={{ mt: 4, mb: 1.5, px: 2, fontSize: 12, fontWeight: 600, color: '#a39c93', textTransform: 'uppercase', letterSpacing: 1 }}>
            Settings
          </Typography>
          <Stack spacing={0.5}>
            {settingsNavItems.map(renderNavItem)}
          </Stack>
        </Box>

        <Box sx={{ p: 2.5, borderTop: `1px solid ${colors.line}` }}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
            {['EN', 'हिं', 'ਪੰ', 'தமிழ்'].map((item) => (
              <Button
                key={item}
                onClick={() => setLanguage(item)}
                sx={{
                  minWidth: 0,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  border: `1px solid ${language === item ? colors.green : '#bcb4aa'}`,
                  bgcolor: language === item ? colors.greenSoft : 'transparent',
                  color: language === item ? colors.greenDark : '#5f5a52',
                  textTransform: 'none',
                  fontSize: 13,
                  fontWeight: language === item ? 600 : 400
                }}
              >
                {item}
              </Button>
            ))}
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={profileImage} alt={pharmacyName} sx={{ width: 42, height: 42, bgcolor: '#d8efe8', color: colors.greenDark, fontWeight: 700, fontSize: 15 }}>
              {initials(pharmacyName)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.2 }}>{pharmacyName}</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 13, mt: 0.2 }}>{pharmacyAddress}</Typography>
            </Box>
          </Box>

          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon sx={{ fontSize: 20 }} />}
            sx={{
              mt: 2.5,
              width: '100%',
              justifyContent: 'center',
              py: 1,
              borderRadius: 2.5,
              border: `1px solid ${colors.line}`,
              bgcolor: '#fff',
              color: colors.text,
              textTransform: 'none',
              fontSize: 14.5,
              fontWeight: 500,
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

export default PharmacyLayout;
