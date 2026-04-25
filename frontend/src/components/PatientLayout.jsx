import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Avatar, useTheme, useMediaQuery, Stack, Button } from '@mui/material';
import { Dashboard as DashboardIcon, EventNote as EventIcon, FolderShared as MedicalIcon, Logout as LogoutIcon, Menu as MenuIcon, HealthAndSafety as HealthIcon, SmartToy as SmartToyIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, useTranslation } from '../context/LanguageContext';

const drawerWidth = 260;

const PatientLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { textKey: 'dashboard', icon: <DashboardIcon />, path: '/patient' },
    { textKey: 'my_appointments', icon: <EventIcon />, path: '/patient/appointments' },
    { textKey: 'symptom_checker', icon: <SmartToyIcon />, path: '/symptom-checker' },
    { textKey: 'medical_records', icon: <MedicalIcon />, path: '/patient/records' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2, py: 1, backgroundColor: 'primary.main', color: 'white' }}>
        <HealthIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap fontWeight="bold">TeleMedi Plus</Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem 
              button 
              key={item.textKey} 
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{ 
                mb: 1, 
                borderRadius: 1.5, 
                backgroundColor: selected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                color: selected ? 'primary.main' : 'text.primary',
                '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.12)', color: 'primary.main' }
              }}
            >
              <ListItemIcon sx={{ color: selected ? 'primary.main' : 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={t[item.textKey]} primaryTypographyProps={{ fontWeight: selected ? 600 : 500 }} />
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box 
          onClick={() => navigate('/patient/profile')}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            p: 1.5, 
            mb: 2,
            borderRadius: 1.5, 
            bgcolor: 'rgba(37, 99, 235, 0.04)', 
            border: '1px solid rgba(37, 99, 235, 0.1)',
            cursor: 'pointer',
            transition: '0.2s',
            '&:hover': {
              bgcolor: 'rgba(37, 99, 235, 0.08)',
              borderColor: 'primary.main'
            }
          }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>P</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>My Profile</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>View details</Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          {[
            { code: 'en', label: 'EN' },
            { code: 'hi', label: 'HI' },
            { code: 'ta', label: 'TA' },
            { code: 'te', label: 'TE' },
            { code: 'bn', label: 'BN' }
          ].map((lang) => (
            <Button
              key={lang.code}
              size="small"
              onClick={() => setLanguage(lang.code)}
              sx={{
                minWidth: 0, px: 1, py: 0.4, borderRadius: 1, fontSize: 11, fontWeight: 600,
                bgcolor: language === lang.code ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                color: language === lang.code ? 'primary.main' : 'text.secondary',
                '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)' }
              }}
            >
              {lang.label}
            </Button>
          ))}
        </Stack>
        <List disablePadding>
          <ListItem button onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' } }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary={t.logout || "Logout"} primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="fixed" elevation={0} sx={{ 
        width: { md: `calc(100% - ${drawerWidth}px)` }, 
        ml: { md: `${drawerWidth}px` },
        backgroundColor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
            {title || 'Dashboard'}
          </Typography>
          <IconButton onClick={() => navigate('/patient/profile')} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>P</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(0,0,0,0.08)' } }} open>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default PatientLayout;
