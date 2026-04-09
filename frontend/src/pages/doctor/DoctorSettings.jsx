import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
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

const colors = {
  bg: '#fcfbf7',
  paper: '#ffffff',
  line: '#ebe9e0',
  soft: '#f5f1e8',
  text: '#252525',
  muted: '#6f6a62',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  greenDark: '#176d57',
  red: '#d9635b',
  redSoft: '#fdeaea'
};

function Row({ label, desc, action, danger = false }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
      sx={{ py: 3, borderBottom: `1px solid ${danger ? colors.redSoft : colors.soft}`, '&:last-child': { borderBottom: 'none' } }}
    >
      <Box>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: danger ? colors.red : colors.text }}>{label}</Typography>
        <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14 }}>{desc}</Typography>
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
      <Box sx={{ p: { xs: 2.5, md: 5 }, maxWidth: 1100, mx: 'auto' }}>
        
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3" sx={{ fontFamily: 'Georgia, serif', fontWeight: 700 }}>Settings</Typography>
            <Typography sx={{ color: colors.muted, mt: 1 }}>Configure your workspace and profile features</Typography>
          </Box>
          <Button 
            startIcon={<SaveIcon />} 
            variant="contained" 
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: colors.green, px: 4, py: 1.25, borderRadius: 3, textTransform: 'none', fontWeight: 800, '&:hover': { bgcolor: colors.greenDark } }}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '260px 1fr' }, gap: 5 }}>
          
          <Stack spacing={1}>
            {tabs.map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                startIcon={tab.icon}
                sx={{
                  justifyContent: 'flex-start',
                  px: 2.5, py: 1.75,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  bgcolor: activeTab === tab.id ? colors.greenSoft : 'transparent',
                  color: activeTab === tab.id ? colors.greenDark : colors.text,
                  '&:hover': { bgcolor: colors.soft }
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ p: 5, borderRadius: 5, bgcolor: colors.paper, border: `1px solid ${colors.line}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            
            {loading ? <CircularProgress sx={{ color: colors.green }} /> : (
              <>
                {activeTab === 'account' && (
                  <Stack spacing={4}>
                    <Typography variant="h6" fontWeight={800}>Professional Details</Typography>
                    <TextField label="Full Name" fullWidth value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                    <Stack direction="row" spacing={2}>
                        <TextField label="Specialization" fullWidth value={profile.specialization} onChange={e => setProfile({...profile, specialization: e.target.value})} />
                        <TextField label="Medical Registration #" fullWidth disabled value="REG-2024-8192" />
                    </Stack>
                    <TextField label="Hospital/Clinic Name" fullWidth value={profile.hospitalName} onChange={e => setProfile({...profile, hospitalName: e.target.value})} />
                    <TextField label="Professional Bio" fullWidth multiline rows={3} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
                  </Stack>
                )}

                {activeTab === 'preferences' && (
                  <Stack spacing={1}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Workflow Settings</Typography>
                    <Row label="Appointment Alerts" desc="Instant notifications for new patient bookings" action={<Switch checked={toggles.appointmentAlerts} color="success" />} />
                    <Row label="Connectivity Optimization" desc="Automatically reduce video quality in low-network rural areas" action={<Switch checked={toggles.lowBandwidth} color="success" />} />
                    <Row label="Timezone" desc="Current operational time" action={<Typography fontWeight={700}>Asia/Kolkata (IST)</Typography>} />
                    <Row label="Clinical Language" desc="Preferred interface language" action={
                        <Select size="small" value="en">
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
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Access & Security</Typography>
                    <Row label="Password" desc="Safeguard your medical account" action={<Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Update Password</Button>} />
                    <Row label="Biometric Login" desc="Use FaceID or Fingerprint on mobile devices" action={<Switch checked={toggles.biometric} />} />
                    <Row label="Data Sync" desc="Synchronize records between your laptop and mobile" action={<Switch defaultChecked />} />
                    <Row label="Delete Account" desc="Permanently remove your workspace" danger action={<Button variant="contained" color="error" sx={{ borderRadius: 2, textTransform: 'none' }}>Request Deletion</Button>} />
                  </Stack>
                )}
              </>
            )}

          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </DoctorLayout>
  );
}
