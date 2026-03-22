import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

export const getDoctorNavItems = (unreadCount = 0) => [
  {
    label: 'Overview',
    path: '/doctor',
    icon: <DashboardIcon />
  },
  {
    label: 'Appointments',
    path: '/doctor/appointments',
    icon: <CalendarTodayIcon />
  },
  {
    label: 'Notifications',
    path: '/doctor/notifications',
    icon: <NotificationsActiveIcon />,
    badge: unreadCount > 0 ? unreadCount : undefined
  },
  {
    label: 'Availability',
    path: '/doctor/availability',
    icon: <EventAvailableIcon />
  }
];
