import React, { useState } from 'react';
import {
  Box, Typography, Stack, Avatar, Button, TextField,
  Divider, Paper, List, ListItem, ListItemIcon,
  ListItemText, Switch, Select, MenuItem, FormControl,
  InputLabel, IconButton, Chip, Grid, Snackbar, Alert,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  NotificationsNone as NotifIcon,
  Language as LanguageIcon,
  LocationOn as RegionIcon,
  Edit as EditIcon,
  CameraAlt as CameraIcon,
  MoreHoriz as MoreIcon,
  KeyboardArrowDown as ChevronDown,
  Check as CheckIcon,
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';

/* ─── constants ─────────────────────────────────────── */
const PRIMARY = '#2563EB';
const ACCENT  = '#6C63FF';
const BG      = '#F8FAFC';

const SETTINGS_NAV = [
  { key: 'account',      label: 'Account',      icon: <AccountIcon  fontSize="small" /> },
  { key: 'notification', label: 'Notification', icon: <NotifIcon    fontSize="small" /> },
  { key: 'language',     label: 'Language',     icon: <LanguageIcon fontSize="small" /> },
  { key: 'region',       label: 'Region',       icon: <RegionIcon   fontSize="small" /> },
];

/* ─── Notification toggle row ───────────────────────── */
const NotifRow = ({ label, desc, defaultOn = true }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
      <Box>
        <Typography fontSize="0.85rem" fontWeight={600} color="#0F172A">{label}</Typography>
        <Typography fontSize="0.75rem" color="text.secondary">{desc}</Typography>
      </Box>
      <Switch
        checked={on}
        onChange={e => setOn(e.target.checked)}
        size="small"
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT },
        }}
      />
    </Box>
  );
};

/* ─── Language option row ───────────────────────────── */
const LangRow = ({ flag, name, active }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    p: 1.5, borderRadius: 2,
    bgcolor: active ? '#EFF6FF' : 'transparent',
    border: active ? `1px solid ${PRIMARY}30` : '1px solid transparent',
  }}>
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Typography fontSize="1.4rem">{flag}</Typography>
      <Typography fontSize="0.85rem" fontWeight={active ? 700 : 500} color="#0F172A">{name}</Typography>
    </Stack>
    {active && <CheckIcon sx={{ fontSize: 16, color: PRIMARY }} />}
  </Box>
);

/* ─── Account Tab ───────────────────────────────────── */
const AccountTab = () => {
  const [form, setForm] = useState({
    name: 'Dr. Farhan Ahmed',
    phone: '384-728-0541x8699',
    email: 'farhan@example.com',
    message: '',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const handleSave = () => setSaved(true);

  return (
    <Box>
      {/* Cover + avatar */}
      <Box sx={{ position: 'relative', mb: 3 }}>
        <Box sx={{
          height: 140, borderRadius: 3, overflow: 'hidden',
          background: 'linear-gradient(135deg, #C7B8EA 0%, #B8C8F0 50%, #D4C5F9 100%)',
        }}>
          {/* decorative lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <Box key={i} sx={{
              position: 'absolute', left: `${i * 12}%`, top: 0, bottom: 0,
              width: 1, bgcolor: 'rgba(255,255,255,0.15)',
              transform: 'rotate(15deg) scaleY(2)',
            }} />
          ))}
        </Box>
        <IconButton size="small" sx={{
          position: 'absolute', bottom: 10, right: 12,
          bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#F1F5F9' },
        }}>
          <CameraIcon sx={{ fontSize: 16, color: '#64748B' }} />
        </IconButton>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ width: '100%' }}>
        {/* Left — profile info */}
        <Box sx={{ width: { xs: '100%', md: '35%' }, display: 'flex' }}>
          <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography fontSize="0.88rem" fontWeight={700} color="#0F172A">Profile Information</Typography>
              <IconButton size="small"><MoreIcon fontSize="small" /></IconButton>
            </Box>

            {/* Avatar with edit badge */}
            <Box sx={{ position: 'relative', width: 64, mb: 2.5 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: '#DBEAFE', color: PRIMARY, fontWeight: 800, fontSize: '1.6rem', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>F</Avatar>
              <Box sx={{
                position: 'absolute', bottom: 0, right: 0,
                width: 20, height: 20, borderRadius: '50%',
                bgcolor: ACCENT, border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <EditIcon sx={{ fontSize: 10, color: 'white' }} />
              </Box>
            </Box>

            {[
              { label: 'About me', value: 'Cardiologist Surgeon' },
              { label: 'Work',     value: 'Seva TeleHealth' },
              { label: 'Country',  value: 'Bangladesh 🇧🇩' },
            ].map(row => (
              <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.2, borderBottom: '1px solid #F1F5F9' }}>
                <Box>
                  <Typography fontSize="0.82rem" fontWeight={600} color="#0F172A">{row.label}</Typography>
                  <Typography fontSize="0.72rem" color="text.secondary">{row.value}</Typography>
                </Box>
                <IconButton size="small"><EditIcon sx={{ fontSize: 14, color: '#94A3B8' }} /></IconButton>
              </Box>
            ))}

            {/* Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid #F1F5F9' }}>
              {[{ val: '120', lbl: 'Following' }, { val: '8k+', lbl: 'Follower' }, { val: '151k', lbl: 'Like' }].map(s => (
                <Box key={s.lbl} textAlign="center">
                  <Typography fontWeight={800} fontSize="1.1rem" color="#0F172A">{s.val}</Typography>
                  <Typography fontSize="0.7rem" color="text.secondary">{s.lbl}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Right — edit form */}
        <Box sx={{ width: { xs: '100%', md: '65%' }, display: 'flex' }}>
          <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography fontSize="0.88rem" fontWeight={700} color="#0F172A">Profile Information</Typography>
              <IconButton size="small"><MoreIcon fontSize="small" /></IconButton>
            </Box>

            <Stack spacing={2.5}>
              <Box>
                <Typography fontSize="0.75rem" fontWeight={600} color="#64748B" sx={{ mb: 0.8 }}>Full Name</Typography>
                <TextField
                  fullWidth size="small" value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Dr. Farhan Ahmed"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem', bgcolor: '#FAFAFA' } }}
                />
              </Box>
              <Box>
                <Typography fontSize="0.75rem" fontWeight={600} color="#64748B" sx={{ mb: 0.8 }}>Phone Number</Typography>
                <TextField
                  fullWidth size="small" value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="Phone number"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem', bgcolor: '#FAFAFA' } }}
                />
              </Box>
              <Box>
                <Typography fontSize="0.75rem" fontWeight={600} color="#64748B" sx={{ mb: 0.8 }}>Email Address</Typography>
                <TextField
                  fullWidth size="small" value={form.email}
                  onChange={handleChange('email')}
                  placeholder="Email address"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem', bgcolor: '#FAFAFA' } }}
                />
              </Box>
              <Box>
                <Typography fontSize="0.75rem" fontWeight={600} color="#64748B" sx={{ mb: 0.8 }}>Message / Bio</Typography>
                <TextField
                  fullWidth multiline rows={4}
                  value={form.message}
                  onChange={handleChange('message')}
                  placeholder="Type Here..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem', bgcolor: '#FAFAFA' } }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  sx={{
                    borderRadius: 2, textTransform: 'none', fontWeight: 700,
                    px: 4, bgcolor: ACCENT,
                    '&:hover': { bgcolor: '#5B52D6' },
                    boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
                  }}
                >
                  Save
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Stack>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>Profile saved successfully!</Alert>
      </Snackbar>
    </Box>
  );
};

/* ─── Notification Tab ───────────────────────────────── */
const NotificationTab = () => (
  <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, width: '100%' }}>
    <Typography fontSize="0.88rem" fontWeight={700} color="#0F172A" sx={{ mb: 0.5 }}>Notification Preferences</Typography>
    <Typography fontSize="0.75rem" color="text.secondary" sx={{ mb: 2 }}>Choose how and when you want to be notified.</Typography>
    <Divider sx={{ mb: 1 }} />
    <NotifRow label="Appointment Reminders" desc="Get notified before each appointment" defaultOn={true} />
    <NotifRow label="New Patient Requests" desc="Alert when a patient books a slot" defaultOn={true} />
    <NotifRow label="Messages" desc="Receive notifications for new messages" defaultOn={true} />
    <NotifRow label="System Updates" desc="Platform news and maintenance alerts" defaultOn={false} />
    <NotifRow label="Weekly Summary" desc="Get a weekly report every Monday" defaultOn={false} />
  </Paper>
);

/* ─── Language Tab ───────────────────────────────────── */
const LanguageTab = () => {
  const [selected, setSelected] = useState('English');
  const langs = [
    { flag: '🇺🇸', name: 'English' },
    { flag: '🇧🇩', name: 'Bangla' },
    { flag: '🇵🇰', name: 'Urdu' },
    { flag: '🇸🇦', name: 'Arabic' },
    { flag: '🇫🇷', name: 'French' },
    { flag: '🇩🇪', name: 'German' },
  ];
  return (
    <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, width: '100%' }}>
      <Typography fontSize="0.88rem" fontWeight={700} color="#0F172A" sx={{ mb: 0.5 }}>Display Language</Typography>
      <Typography fontSize="0.75rem" color="text.secondary" sx={{ mb: 2 }}>Select the language for your dashboard.</Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={1}>
        {langs.map(l => (
          <Box key={l.name} onClick={() => setSelected(l.name)} sx={{ cursor: 'pointer' }}>
            <LangRow flag={l.flag} name={l.name} active={selected === l.name} />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

/* ─── Region Tab ─────────────────────────────────────── */
const RegionTab = () => {
  const [timezone, setTimezone] = useState('Asia/Dhaka');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');

  return (
    <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, width: '100%' }}>
      <Typography fontSize="0.88rem" fontWeight={700} color="#0F172A" sx={{ mb: 0.5 }}>Region & Time</Typography>
      <Typography fontSize="0.75rem" color="text.secondary" sx={{ mb: 2 }}>Configure your local timezone and date preferences.</Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3}>
        <FormControl size="small" fullWidth>
          <Typography fontSize="0.75rem" fontWeight={600} color="#64748B" sx={{ mb: 0.8 }}>Timezone</Typography>
          <Select value={timezone} onChange={e => setTimezone(e.target.value)} sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
            <MenuItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</MenuItem>
            <MenuItem value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</MenuItem>
            <MenuItem value="America/New_York">America/New_York (GMT-5)</MenuItem>
            <MenuItem value="Europe/London">Europe/London (GMT+0)</MenuItem>
            <MenuItem value="Asia/Dubai">Asia/Dubai (GMT+4)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <Typography fontSize="0.75rem" fontWeight={600} color="#64748B" sx={{ mb: 0.8 }}>Date Format</Typography>
          <Select value={dateFormat} onChange={e => setDateFormat(e.target.value)} sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
            <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
            <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
            <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography fontSize="0.75rem" fontWeight={600} color="#64748B" sx={{ mb: 1 }}>Time Format</Typography>
          <Stack direction="row" spacing={1}>
            {['12h', '24h'].map(f => (
              <Button
                key={f}
                onClick={() => setTimeFormat(f)}
                variant={timeFormat === f ? 'contained' : 'outlined'}
                size="small"
                sx={{
                  borderRadius: 2, textTransform: 'none', fontWeight: 600,
                  minWidth: 70,
                  bgcolor: timeFormat === f ? ACCENT : 'transparent',
                  borderColor: timeFormat === f ? ACCENT : '#E2E8F0',
                  color: timeFormat === f ? 'white' : '#64748B',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: timeFormat === f ? '#5B52D6' : '#F8FAFC', borderColor: ACCENT },
                }}
              >
                {f}
              </Button>
            ))}
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            sx={{
              borderRadius: 2, textTransform: 'none', fontWeight: 700,
              px: 4, bgcolor: ACCENT,
              '&:hover': { bgcolor: '#5B52D6' },
              boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

/* ─── Main Settings Page ─────────────────────────────── */
export default function DoctorSettings() {
  const [activeTab, setActiveTab] = useState('account');

  const TAB_CONTENT = {
    account:      <AccountTab />,
    notification: <NotificationTab />,
    language:     <LanguageTab />,
    region:       <RegionTab />,
  };

  return (
    <DoctorLayout title="Settings">
      <Box sx={{ display: 'flex', width: '100%', minHeight: 'calc(100vh - 64px)', bgcolor: BG, fontFamily: '"Outfit", sans-serif' }}>

        {/* ── Settings nav sidebar ──────────────────── */}
        <Box sx={{
          width: 220, flexShrink: 0,
          borderRight: '1px solid #E2E8F0',
          bgcolor: 'white', p: 2.5,
        }}>
          <Typography fontSize="0.68rem" fontWeight={700} color="#94A3B8" textTransform="uppercase" letterSpacing={1} sx={{ mb: 1.5 }}>
            General Settings
          </Typography>

          <Stack spacing={0.5}>
            {SETTINGS_NAV.map(item => {
              const active = activeTab === item.key;
              return (
                <Box
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 1.5, py: 1.2, borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: active ? '#EEF2FF' : 'transparent',
                    color: active ? ACCENT : '#64748B',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.85rem',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: active ? '#EEF2FF' : '#F8FAFC', color: active ? ACCENT : '#1E293B' },
                  }}
                >
                  <Box sx={{ color: 'inherit', display: 'flex' }}>{item.icon}</Box>
                  <Typography fontSize="0.85rem" fontWeight="inherit" color="inherit">{item.label}</Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* ── Settings content ─────────────────────── */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { xs: '100%', md: 'calc(100% - 220px)' }, overflowY: 'auto', minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>
            {activeTab === 'account'      && 'Account Setting'}
            {activeTab === 'notification' && 'Notification Setting'}
            {activeTab === 'language'     && 'Language Setting'}
            {activeTab === 'region'       && 'Region Setting'}
          </Typography>

          {TAB_CONTENT[activeTab]}
        </Box>
      </Box>
    </DoctorLayout>
  );
}
