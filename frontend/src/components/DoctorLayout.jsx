  import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Avatar, useTheme, useMediaQuery, Badge } from '@mui/material';
import { Dashboard as DashboardIcon, CalendarToday as CalendarIcon, People as PeopleIcon, Logout as LogoutIcon, Menu as MenuIcon, LocalHospital as HospitalIcon, EditNote as NoteIcon, Person as PersonIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const DoctorLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/doctor' },
    { text: 'Appointment', icon: <CalendarIcon />, path: '/doctor/appointments' },
    { text: 'Patient', icon: <PeopleIcon />, path: '/doctor/patients' },
    { text: 'Profile', icon: <PersonIcon />, path: '/doctor/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/doctor/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0F1C3F' }}>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Avatar 
          src="https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_231208-6640.jpg"
          sx={{ width: 100, height: 100, margin: '0 auto', border: '5px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} 
        />
        <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, color: 'white' }}>Dr. Marttin Deo</Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>MBBS, FCPS • MD (Medicine), MCPS</Typography>
      </Box>
      
      <List sx={{ flexGrow: 1, px: 2 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{ 
                mb: 1, 
                borderRadius: 2, 
                px: 3,
                backgroundColor: selected ? '#2563EB' : 'transparent',
                color: selected ? 'white' : '#94A3B8',
                transition: 'all 0.2s',
                '&:hover': { backgroundColor: selected ? '#1D4ED8' : 'rgba(255, 255, 255, 0.08)', color: 'white' }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: selected ? 600 : 500 }} />
            </ListItem>
          );
        })}
      </List>
      
      <List sx={{ px: 2, pb: 4 }}>
        <ListItem button onClick={handleLogout} sx={{ borderRadius: 2, px: 3, color: '#94A3B8', transition: 'all 0.2s', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' } }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="fixed" elevation={0} sx={{ 
        display: { xs: 'block', md: 'none' }, // Added to hide on desktop
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
            {title || 'Provider Dashboard'}
          </Typography>
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

      <Box component="main" sx={{ flexGrow: 1, p: 0, width: { md: `calc(100% - ${drawerWidth}px)` }, bgcolor: '#F7F9FC', minHeight: '100vh' }}>
        <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
        {children}
      </Box>
    </Box>
  );
};

export default DoctorLayout;
