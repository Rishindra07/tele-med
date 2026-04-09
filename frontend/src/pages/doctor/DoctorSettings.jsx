import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  SaveRounded as SaveIcon,
  WarningAmberRounded as WarningIcon,
  SecurityRounded as SecurityIcon,
  LanguageRounded as LanguageIcon,
  NotificationsActiveRounded as NotifyIcon,
  AccountCircleRounded as AccountIcon
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import { fetchDoctorProfile, updateDoctorProfile, updateDoctorSettings } from '../../api/doctorApi';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_SETTINGS_TRANSLATIONS } from '../../utils/translations/doctor';

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

function Row({ label, desc, action, danger = false }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
      sx={{ py: 3, borderBottom: `1px solid ${c.soft}`, '&:last-child': { borderBottom: 'none' } }}
    >
      <Box>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: danger ? c.danger : c.text }}>{label}</Typography>
        <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 14 }}>{desc}</Typography>
      </Box>
      <Box sx={{ minWidth: 120, display: 'flex', justifyContent: 'flex-end' }}>{action}</Box>
    </Stack>
  );
}

export default function DoctorSettings() {
  const { language: currentLanguage } = useLanguage();
  const t = DOCTOR_SETTINGS_TRANSLATIONS[currentLanguage] || DOCTOR_SETTINGS_TRANSLATIONS['en'];

  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    hospitalName: '',
    bio: ''
  });

  const [toggles, setToggles] = useState({
    appointmentAlerts: true,
    bookingRequests: true,
    lowBandwidth: true,
    biometric: false
  });

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchDoctorProfile();
        const dr = res.doctor || {};
        const usr = res.user || {};
        setProfile({
          name: usr.full_name || '',
          email: usr.email || '',
          phone: usr.phone || '',
          specialization: dr.specialization || '',
          hospitalName: dr.hospitalName || '',
          bio: dr.bio || ''
        });
        if (usr.settings) {
            setToggles(prev => ({ ...prev, ...usr.settings }));
        }
      } catch (err) {
        setSnackbar({ open: true, severity: 'error', message: 'Failed to load' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateDoctorProfile({
          full_name: profile.name,
          phone: profile.phone,
          specialization: profile.specialization,
          hospitalName: profile.hospitalName,
          bio: profile.bio
        }),
        updateDoctorSettings(toggles)
      ]);
      setSnackbar({ open: true, severity: 'success', message: 'Saved successfully' });
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account Profile', icon: <AccountIcon /> },
    { id: 'preferences', label: 'Clinical Prefs', icon: <NotifyIcon /> },
    { id: 'security', label: 'Security & Privacy', icon: <SecurityIcon /> }
  ];

  return (
    <DoctorLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 6 }, bgcolor: c.bg, minHeight: 'calc(100vh - 64px)' }}>
        
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: c.text, fontFamily: 'Inter, sans-serif' }}>Settings</Typography>
            <Typography sx={{ color: c.muted, mt: 0.5, fontSize: 16 }}>Configure your workspace and profile features</Typography>
          </Box>
          <Button 
            startIcon={<SaveIcon />} 
            variant="contained" 
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: c.primary, px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: `0 8px 16px ${c.primary}30`, '&:hover': { bgcolor: c.primaryDark } }}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px 1fr' }, gap: 4 }}>
          
          <Stack spacing={1}>
            {tabs.map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                startIcon={tab.icon}
                sx={{
                  justifyContent: 'flex-start',
                  px: 2.5, py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: 16,
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  bgcolor: activeTab === tab.id ? c.primarySoft : 'transparent',
                  color: activeTab === tab.id ? c.primaryDark : c.muted,
                  '&:hover': { bgcolor: activeTab === tab.id ? c.primarySoft : c.soft }
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>

          <Paper elevation={0} sx={{ p: 5, borderRadius: 2, bgcolor: c.paper, border: `1px solid ${c.line}`, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            
            {loading ? <CircularProgress sx={{ color: c.primary }} /> : (
              <>
                {activeTab === 'account' && (
                  <Stack spacing={4}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: c.text }}>Professional Details</Typography>
                    <TextField label="Full Name" fullWidth value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField label="Specialization" fullWidth value={profile.specialization} onChange={e => setProfile({...profile, specialization: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        <TextField label="Medical Registration #" fullWidth disabled value="REG-2024-8192" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Stack>
                    <TextField label="Hospital/Clinic Name" fullWidth value={profile.hospitalName} onChange={e => setProfile({...profile, hospitalName: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField label="Professional Bio" fullWidth multiline rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Stack>
                )}

                {activeTab === 'preferences' && (
                  <Stack spacing={1}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: c.text, mb: 2 }}>Workflow Settings</Typography>
                    <Row label="Appointment Alerts" desc="Instant notifications for new patient bookings" action={<Switch checked={toggles.appointmentAlerts} color="primary" />} />
                    <Row label="Connectivity Optimization" desc="Automatically reduce video quality in low-network rural areas" action={<Switch checked={toggles.lowBandwidth} color="primary" />} />
                    <Row label="Timezone" desc="Current operational time" action={<Typography sx={{ fontWeight: 600, color: c.primary }}>Asia/Kolkata (IST)</Typography>} />
                    <Row label="Clinical Language" desc="Preferred interface language" action={
                        <Select size="small" value="en" sx={{ borderRadius: 1.5, minWidth: 140 }}>
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                            <MenuItem value="pa">ਪੰਜਾਬੀ (Punjabi)</MenuItem>
                            <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
                            <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
                            <MenuItem value="bn">বাংলা (Bengali)</MenuItem>
                        </Select>
                    } />
                  </Stack>
                )}

                {activeTab === 'security' && (
                  <Stack spacing={1}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: c.text, mb: 2 }}>Access & Security</Typography>
                    <Row label="Password" desc="Safeguard your medical account" action={<Button variant="outlined" sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, borderColor: c.line, color: c.text }}>Update Password</Button>} />
                    <Row label="Biometric Login" desc="Use FaceID or Fingerprint on mobile devices" action={<Switch checked={toggles.biometric} color="primary" />} />
                    <Row label="Data Sync" desc="Synchronize records between your laptop and mobile" action={<Switch defaultChecked color="primary" />} />
                    <Row label="Delete Account" desc="Permanently remove your workspace" danger action={<Button variant="contained" sx={{ bgcolor: c.danger, borderRadius: 1.5, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#b71c1c' } }}>Request Deletion</Button>} />
                  </Stack>
                )}
              </>
            )}

          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{snackbar.message}</Alert>
      </Snackbar>
    </DoctorLayout>
  );
}
