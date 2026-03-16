import React, { useEffect, useState } from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Paper,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EventNote as EventIcon,
  FolderShared as MedicalIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMyAppointments } from '../../api/appointmentApi';

const drawerWidth = 240;

function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getMyAppointments();
      setAppointments(res.appointments || []);
    } catch (error) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Seva TeleHealth - Patient Appointments
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button onClick={() => navigate("/patient")}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button selected>
              <ListItemIcon>
                <EventIcon />
              </ListItemIcon>
              <ListItemText primary="My Appointments" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <MedicalIcon />
              </ListItemIcon>
              <ListItemText primary="Medical Records" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
          </List>
          <Divider />
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                My Appointments
              </Typography>
              <Button variant="outlined" onClick={fetchAppointments} disabled={loading}>
                Refresh
              </Button>
            </Box>

            {loading ? (
              <CircularProgress size={24} />
            ) : appointments.length === 0 ? (
              <Typography color="text.secondary">
                No appointments found.
              </Typography>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '10px' }}>Doctor</th>
                    <th style={{ padding: '10px' }}>Specialization</th>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Time</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>
                        {appointment.doctor?.name || 'Doctor'}
                      </td>
                      <td style={{ padding: '10px' }}>{appointment.specialization}</td>
                      <td style={{ padding: '10px' }}>
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px' }}>{appointment.timeSlot}</td>
                      <td style={{ padding: '10px' }}>{appointment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default PatientAppointments;
