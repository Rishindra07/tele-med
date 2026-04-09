import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Alert
} from '@mui/material';
import {
  NotificationsActiveRounded as NotifyIcon,
  RefreshRounded as RefreshIcon,
  CheckCircleOutlineRounded as ReadIcon
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../../api/notificationApi';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_NOTIFICATIONS_TRANSLATIONS } from '../../utils/translations/doctor';

const c = {
  bg: '#f8f9fa',
  paper: '#ffffff',
  line: '#e0e0e0',
  soft: '#f0f0f0',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#1557b0',
  success: '#1e8e3e',
  successSoft: '#e6f4ea',
  warning: '#f9ab00',
  warningSoft: '#fef7e0',
  danger: '#d93025',
  dangerSoft: '#fce8e6'
};

function DoctorNotifications() {
  const { language } = useLanguage();
  const t = DOCTOR_NOTIFICATIONS_TRANSLATIONS[language] || DOCTOR_NOTIFICATIONS_TRANSLATIONS['en'];

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
    <DoctorLayout title={t.title}>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 6 }, bgcolor: c.bg, minHeight: 'calc(100vh - 64px)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: c.text, fontFamily: 'Inter, sans-serif' }}>{t.title}</Typography>
            <Typography sx={{ color: c.muted, mt: 0.5, fontSize: 16 }}>{t.subtitle}</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={loadNotifications} 
                disabled={loading}
                sx={{ borderRadius: 2, border: `1px solid ${c.line}`, color: c.text, fontWeight: 600, textTransform: 'none' }}
            >
                {t.refresh}
            </Button>
            <Button
                variant="contained"
                onClick={handleMarkAllRead}
                disabled={notifications.length === 0 || unreadCount === 0}
                sx={{ bgcolor: c.primary, borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: `0 8px 16px ${c.primary}30`, '&:hover': { bgcolor: c.primaryDark } }}
            >
                {t.mark_all_read}
            </Button>
          </Stack>
        </Stack>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text, mb: 1 }}>
            {t.notification_queue}
          </Typography>
          <Typography sx={{ color: c.muted, mb: 4, fontSize: 15 }}>
            {t.queue_subtitle}
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: c.primary }} /></Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ py: 10, textAlign: 'center', border: `2px dashed ${c.line}`, borderRadius: 2, bgcolor: c.bg }}>
              <NotifyIcon sx={{ fontSize: 48, color: c.line, mb: 2 }} />
              <Typography sx={{ color: c.muted }}>{t.no_notifications}</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {notifications.map((notification) => (
                <Box
                  key={notification._id}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${notification.read ? c.line : c.primary}`,
                    backgroundColor: notification.read ? c.paper : c.primarySoft,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: c.primary,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: 17, fontWeight: 700, color: c.text }}>
                          {notification.title}
                        </Typography>
                        {!notification.read && <Chip label={t.unread_chip} size="small" sx={{ height: 20, fontSize: 10, bgcolor: c.primary, color: '#fff', fontWeight: 700 }} />}
                      </Stack>
                      <Typography sx={{ color: c.muted, fontSize: 15, lineHeight: 1.5 }}>
                        {notification.message}
                      </Typography>
                      <Typography sx={{ color: c.muted, fontSize: 12, display: 'block', mt: 2, fontWeight: 500 }}>
                        {new Date(notification.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </Typography>
                    </Box>
                    <Box>
                      {!notification.read && (
                        <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<ReadIcon />}
                            onClick={() => handleMarkRead(notification._id)}
                            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, borderColor: c.primary, color: c.primary }}
                        >
                          {t.mark_read}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </DoctorLayout>
  );
}

export default DoctorNotifications;
