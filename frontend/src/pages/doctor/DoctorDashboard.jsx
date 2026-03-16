
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
  Grid,
  Paper,
  Button,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { setDoctorAvailability } from '../../api/doctorAvailabilityApi';
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../../api/notificationApi';

const drawerWidth = 240;

function DoctorDashboard() {
  const navigate = useNavigate();
  const [slotDate, setSlotDate] = useState('');
  const [slotInput, setSlotInput] = useState('');
  const [slotList, setSlotList] = useState([]);
  const [savingSlots, setSavingSlots] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'success',
    message: ''
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };


  const handleAddSlot = () => {
    const trimmed = slotInput.trim();
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!trimmed) return;
    if (!timePattern.test(trimmed)) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Slot must be in HH:mm format (e.g., 10:30).'
      });
      return;
    }
    if (slotList.includes(trimmed)) {
      setSlotInput('');
      return;
    }
    setSlotList((prev) => [...prev, trimmed]);
    setSlotInput('');
  };

  const handleRemoveSlot = (slot) => {
    setSlotList((prev) => prev.filter((s) => s !== slot));
  };

  const handleSaveSlots = async () => {
    if (!slotDate || slotList.length === 0) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Please pick a date and add at least one slot.'
      });
      return;
    }

    setSavingSlots(true);
    try {
      await setDoctorAvailability(slotDate, slotList);
      setSnackbar({
        open: true,
        severity: 'success',
        message: 'Availability saved.'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: error.message || 'Failed to save availability.'
      });
    } finally {
      setSavingSlots(false);
    }
  };

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const res = await getMyNotifications(20);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (error) {
      setNotificationsError(error.message || 'Failed to load notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: error.message || 'Failed to update notifications.'
      });
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: error.message || 'Failed to update notification.'
      });
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Seva TeleHealth - Doctor Dashboard
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
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
            {['Dashboard', 'Appointments', 'Patients', 'Profile'].map((text, index) => (
              <ListItem
                button
                key={text}
                onClick={() => {
                  if (index === 0) navigate("/doctor");
                  if (index === 1) navigate("/doctor/appointments");
                }}
              >
                <ListItemIcon>
                  {index === 0 && <DashboardIcon />}
                  {index === 1 && <CalendarIcon />}
                  {index === 2 && <PeopleIcon />}
                  {index === 3 && <PersonIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4} lg={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Today's Appointments
                </Typography>
                <Typography component="p" variant="h4">
                  -
                </Typography>
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  View details in Appointments
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Total Patients
                </Typography>
                <Typography component="p" variant="h4">
                  124
                </Typography>
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  Lifetime
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Pending Reports
                </Typography>
                <Typography component="p" variant="h4">
                  3
                </Typography>
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  To Review
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Appointments Table */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Today's Schedule
                </Typography>
                <Typography color="text.secondary">
                  View appointment details in the Appointments page.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Notifications */}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography component="h2" variant="h6" color="primary">
                    Notifications {unreadCount > 0 ? `(${unreadCount} unread)` : ''}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleMarkAllRead}
                    disabled={notifications.length === 0 || unreadCount === 0}
                  >
                    Mark All Read
                  </Button>
                </Box>

                <Box sx={{ mt: 2 }}>
                  {notificationsLoading ? (
                    <CircularProgress size={24} />
                  ) : notificationsError ? (
                    <Typography color="error">{notificationsError}</Typography>
                  ) : notifications.length === 0 ? (
                    <Typography color="text.secondary">
                      No notifications yet.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {notifications.map((notification) => (
                        <Paper
                          key={notification._id}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderColor: notification.read ? 'divider' : 'primary.light',
                            backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                            <Box>
                              <Typography variant="subtitle1">
                                {notification.title}
                              </Typography>
                              <Typography color="text.secondary">
                                {notification.message}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {!notification.read && (
                                <Chip label="Unread" color="primary" size="small" />
                              )}
                              {!notification.read && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleMarkRead(notification._id)}
                                >
                                  Mark Read
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Manage Availability */}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Manage Availability
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Date"
                      type="date"
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: new Date().toISOString().split('T')[0] }}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Add Slot (e.g. 10:30)"
                      value={slotInput}
                      onChange={(e) => setSlotInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSlot();
                        }
                      }}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md="auto">
                    <Button variant="outlined" onClick={handleAddSlot}>
                      Add Slot
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  {slotList.length === 0 ? (
                    <Typography color="text.secondary">
                      No slots added yet.
                    </Typography>
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {slotList.map((slot) => (
                        <Chip
                          key={slot}
                          label={slot}
                          onDelete={() => handleRemoveSlot(slot)}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveSlots}
                    disabled={savingSlots}
                  >
                    {savingSlots ? 'Saving...' : 'Save Availability'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DoctorDashboard;
