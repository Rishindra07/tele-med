import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import DashboardShell from '../../components/dashboard/DashboardShell';
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../../api/notificationApi';
import { getDoctorNavItems } from './doctorNavigation.jsx';

function DoctorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getMyNotifications(30);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((item) => (
      item._id === id ? { ...item, read: true } : item
    )));
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <DashboardShell
      title="Doctor Notifications"
      subtitle="Operational inbox for appointment events, reminders, and upcoming consultation alerts."
      brand="Doctor Console"
      navItems={getDoctorNavItems(unreadCount)}
      actions={(
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={loadNotifications} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0 || unreadCount === 0}
          >
            Mark All Read
          </Button>
        </Stack>
      )}
    >
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Notification Queue
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.75, mb: 3 }}>
          Unread items stay visually elevated so the next action is easy to spot.
        </Typography>

        {loading ? (
          <CircularProgress size={24} />
        ) : notifications.length === 0 ? (
          <Typography color="text.secondary">No notifications yet.</Typography>
        ) : (
          <Stack spacing={2}>
            {notifications.map((notification) => (
              <Paper
                key={notification._id}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  borderColor: notification.read ? '#e2e8f0' : '#7dd3fc',
                  backgroundColor: notification.read ? '#fff' : 'rgba(14, 165, 233, 0.08)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', mt: 0.75 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1.25 }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    {!notification.read ? <Chip label="Unread" color="primary" size="small" /> : null}
                    {!notification.read ? (
                      <Button size="small" variant="outlined" onClick={() => handleMarkRead(notification._id)}>
                        Mark Read
                      </Button>
                    ) : null}
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </DashboardShell>
  );
}

export default DoctorNotifications;
