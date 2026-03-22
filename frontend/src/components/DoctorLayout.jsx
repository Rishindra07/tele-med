import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Avatar, useTheme, useMediaQuery, Badge } from '@mui/material';
import { Dashboard as DashboardIcon, CalendarToday as CalendarIcon, People as PeopleIcon, Logout as LogoutIcon, Menu as MenuIcon, LocalHospital as HospitalIcon, EditNote as NoteIcon } from '@mui/icons-material';
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
    { text: 'Appointments', icon: <CalendarIcon />, path: '/doctor/appointments' },
    { text: 'Write Prescription', icon: <NoteIcon />, path: '/doctor/prescription' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2, py: 1, backgroundColor: 'secondary.main', color: 'white' }}>
        <HospitalIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap fontWeight="bold">TeleMedi Plus</Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', fontWeight: 'bold' }}>Dr</Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">Dr. Sharma</Typography>
          <Typography variant="caption" color="text.secondary">General Physician</Typography>
        </Box>
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
                backgroundColor: selected ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                color: selected ? 'secondary.main' : 'text.primary',
                '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.12)', color: 'secondary.main' }
              }}
            >
              <ListItemIcon sx={{ color: selected ? 'secondary.main' : 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: selected ? 600 : 500 }} />
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List sx={{ px: 2, pb: 2 }}>
        <ListItem button onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' } }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItem>
      </List>
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

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DoctorLayout;
