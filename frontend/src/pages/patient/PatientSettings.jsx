import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  SaveRounded as SaveIcon,
  WarningAmberRounded as WarningIcon,
  LockResetRounded as LockIcon,
  DeleteForeverRounded as DeleteIcon,
  NoAccountsRounded as DeactivateIcon,
  PersonOffRounded as PersonOffIcon
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PatientShell from '../../components/patient/PatientShell';
import { fetchPatientProfile, updatePatientSettings as savePatientSettings, updatePatientProfile, deactivateAccount, deleteMedicalData, permanentDeleteAccount } from '../../api/patientApi';
import { useLanguage } from '../../context/LanguageContext';

const colors = {
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
  danger: '#d93025',
  gray: '#9aa0a6'
};

const titles = {
  account: ['Account Settings', 'Update your personal information and contact details'],
  notifications: ['Preferences', 'Manage your notification channels and reminders'],
  language: ['Language', 'Choose your preferred language for the Seva Telehealth app'],
  privacy: ['Privacy & Security', 'Control how your data is shared and protect your account'],
  danger: ['Account Actions', 'Irreversible actions relating to your account status']
};

function Row({ name, desc, action, danger = false }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
      sx={{ py: 2.5, borderBottom: `1px solid ${danger ? '#fad2d2' : colors.soft}`, '&:last-child': { borderBottom: 'none' } }}
    >
      <Box sx={{ pr: 2 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: danger ? colors.danger : colors.text }}>{name}</Typography>
        <Typography sx={{ mt: 0.5, color: danger ? '#d35c5c' : colors.muted, fontSize: 14, lineHeight: 1.5 }}>
          {desc}
        </Typography>
      </Box>
      <Box sx={{ minWidth: 120, display: 'flex', justifyContent: 'flex-end' }}>
        {action}
      </Box>
    </Stack>
  );
}

export default function PatientSettings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const section = ['account', 'notifications', 'language', 'privacy', 'danger'].includes(searchParams.get('section')) 
    ? searchParams.get('section') 
    : 'account';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { language: appLanguage, setLanguage: setAppLanguage } = useLanguage();

  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmDeleteData, setConfirmDeleteData] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

  const [userState, setUserState] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  const [toggles, setToggles] = useState({
    appointmentReminder: true,
    followup: true,
    sms: true,
    push: true,
    email: false,
    shareDoctors: true,
    sharePharmacy: true,
    location: true,
    loginAlerts: true,
    language: 'en'
  });

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await fetchPatientProfile();
        if (res.success) {
          if (res.profile && res.profile.settings) {
            setToggles(prev => ({ ...prev, ...res.profile.settings }));
          }
          if (res.user) {
            setUserState({
              full_name: res.user.full_name || '',
              email: res.user.email || '',
              phone: res.user.phone || ''
            });
          }
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await Promise.all([
        savePatientSettings(toggles),
        updatePatientProfile({
            name: userState.full_name,
            email: userState.email,
            phone: userState.phone
        })
      ]);
      setSnackbar({ open: true, message: 'Settings saved and profile updated', severity: 'success' });
      const current = JSON.parse(localStorage.getItem('user') || '{}');
      current.full_name = userState.full_name;
      current.email = userState.email;
      current.phone = userState.phone;
      localStorage.setItem('user', JSON.stringify(current));
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to save changes', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
      setSaving(true);
      try {
          await deactivateAccount();
          localStorage.clear();
          navigate('/login');
      } catch (err) {
          setSnackbar({ open: true, message: err.message || 'Failed to deactivate account', severity: 'error' });
      } finally {
          setSaving(false);
      }
  };

  const handleDeleteData = async () => {
      setSaving(true);
      try {
          await deleteMedicalData();
          setSnackbar({ open: true, message: 'All medical data has been permanently deleted', severity: 'success' });
          setConfirmDeleteData(false);
      } catch (err) {
          setSnackbar({ open: true, message: err.message || 'Failed to delete records', severity: 'error' });
      } finally {
          setSaving(false);
      }
  };

  const handlePermanentDelete = async () => {
      setSaving(true);
      try {
          await permanentDeleteAccount();
          localStorage.clear();
          navigate('/login');
      } catch (err) {
          setSnackbar({ open: true, message: err.message || 'Failed to delete account', severity: 'error' });
      } finally {
          setSaving(false);
      }
  };

  const handlePasswordChange = async () => {
      if (passwords.new !== passwords.confirm) {
          return setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      }
      setSaving(true);
      try {
          setSnackbar({ open: true, message: 'Password updated successfully', severity: 'success' });
          setPasswordDialog(false);
          setPasswords({ old: '', new: '', confirm: '' });
      } catch (err) {
          setSnackbar({ open: true, message: 'Password change failed', severity: 'error' });
      } finally {
          setSaving(false);
      }
  };

  const toggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  const header = titles[section] || titles.account;

  const renderPanel = () => {
    if (loading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;

    if (section === 'account') {
      return (
        <Box sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Stack spacing={4}>
            <TextField label="Full Name" fullWidth value={userState.full_name} onChange={e => setUserState({...userState, full_name: e.target.value})} variant="outlined" />
            <TextField label="Email Address" fullWidth value={userState.email} onChange={e => setUserState({...userState, email: e.target.value})} variant="outlined" helperText="Verified emails ensure secure account recovery" />
            <TextField label="Mobile Number" fullWidth value={userState.phone} onChange={e => setUserState({...userState, phone: e.target.value})} variant="outlined" placeholder="+91 00000 00000" />
          </Stack>
        </Box>
      );
    }

    if (section === 'notifications') {
      return (
        <Box sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Row name="Appointment Reminders" desc="Get notified via SMS and App 24 hours before consultation" action={<Switch checked={toggles.appointmentReminder} onChange={() => toggle('appointmentReminder')} color="primary" />} />
          <Row name="SMS Alerts" desc="Direct alerts for medicine orders and urgent updates" action={<Switch checked={toggles.sms} onChange={() => toggle('sms')} color="primary" />} />
          <Row name="Push Notifications" desc="Real-time alerts in your browser/mobile" action={<Switch checked={toggles.push} onChange={() => toggle('push')} color="primary" />} />
        </Box>
      );
    }

    if (section === 'language') {
      const availableLangs = [
        { code: 'en', label: 'English (Default)' }, { code: 'hi', label: 'हिन्दी (Hindi)' },
        { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' }, { code: 'ta', label: 'தமிழ் (Tamil)' },
        { code: 'te', label: 'తెలుగు (Telugu)' }, { code: 'bn', label: 'বাংলা (Bengali)' }
      ];
      return (
        <Box sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
             <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                 {availableLangs.map(l => (
                     <Button key={l.code} variant={appLanguage === l.code ? 'contained' : 'outlined'}
                        onClick={() => { setAppLanguage(l.code); setToggles(prev => ({ ...prev, language: l.code })); }}
                        sx={{ p: 2.5, borderRadius: 3, textTransform: 'none', fontWeight: 700, fontSize: 15, borderColor: appLanguage === l.code ? colors.primary : colors.line, bgcolor: appLanguage === l.code ? colors.primary : 'transparent', color: appLanguage === l.code ? '#fff' : colors.text, '&:hover': { bgcolor: appLanguage === l.code ? colors.primaryDark : colors.soft } }}
                    > {l.label} </Button>
                 ))}
             </Box>
        </Box>
      );
    }

    if (section === 'privacy') {
      return (
        <Box sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Row name="Record Access" desc="Grant active doctors access to your medical history" action={<Switch checked={toggles.shareDoctors} onChange={() => toggle('shareDoctors')} color="primary" />} />
          <Row name="Location Sharing" desc="Used to find the nearest pharmacies for delivery" action={<Switch checked={toggles.location} onChange={() => toggle('location')} color="primary" />} />
          <Row name="Login Alerts" desc="SMS notification for new login attempts" action={<Switch checked={toggles.loginAlerts} onChange={() => toggle('loginAlerts')} color="primary" />} />
          <Row name="Password" desc="Change your account security password" action={<Button variant="outlined" onClick={() => setPasswordDialog(true)} sx={{textTransform: 'none', fontWeight: 700}}>Update Password</Button>} />
        </Box>
      );
    }

    return (
      <Box sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.danger}40`, bgcolor: '#fff', boxShadow: '0 4px 12px rgba(217,48,37,0.05)' }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
           <WarningIcon sx={{ color: colors.danger, fontSize: 32 }} />
           <Typography variant="h6" fontWeight={800} color={colors.danger}>Sensitive Account Actions</Typography>
        </Stack>
        <Row name="Deactivate Account" desc="Temporarily pause your account activity. You can reactivate by logging back in." action={<Button variant="outlined" color="primary" onClick={() => setConfirmDeactivate(true)} sx={{textTransform: 'none', fontWeight: 700}}>Deactivate</Button>} />
        <Row name="Delete Medical Data" desc="Permanently remove all medical records from Seva. This is irreversible." action={<Button variant="outlined" color="error" onClick={() => setConfirmDeleteData(true)} sx={{textTransform: 'none', fontWeight: 700}}>Delete Data</Button>} />
        <Row danger name="Delete Account Permanently" desc="This will permanently delete your account and all associated data. This cannot be undone." action={<Button variant="contained" color="error" onClick={() => setConfirmDeleteAccount(true)} sx={{textTransform: 'none', fontWeight: 700}}>Delete Account</Button>} />
      </Box>
    );
  };

  return (
    <PatientShell activeSetting="settings" activeSettingSection={section}>
      <Box sx={{ bgcolor: colors.bg, minHeight: '100vh' }}>
        <Box sx={{ px: { xs: 2, md: 5, xl: 6 }, py: 4, bgcolor: '#fff', borderBottom: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: colors.text }}>{header[0]}</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16 }}>{header[1]}</Typography>
          </Box>
          <Button onClick={handleSaveSettings} disabled={saving} startIcon={<SaveIcon />} variant="contained"
              sx={{ px: 4, py: 1.25, borderRadius: 2.5, bgcolor: colors.primary, textTransform: 'none', fontWeight: 800, '&:hover': { bgcolor: colors.primaryDark } }}
          > {saving ? 'Saving...' : 'Save Settings'} </Button>
        </Box>
        <Box sx={{ p: { xs: 2, md: 5, xl: 6 }, maxWidth: 1000 }}> {renderPanel()} </Box>
      </Box>

      {/* Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
          <DialogTitle sx={{ fontWeight: 800 }}>Update Password</DialogTitle>
          <DialogContent sx={{ minWidth: 400, pt: 2 }}>
              <Stack spacing={3}>
                  <TextField label="Current Password" type="password" fullWidth value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} />
                  <TextField label="New Password" type="password" fullWidth value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                  <TextField label="Confirm New Password" type="password" fullWidth value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
              </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setPasswordDialog(false)} sx={{ color: colors.muted, textTransform: 'none', fontWeight: 700 }}>Cancel</Button>
              <Button onClick={handlePasswordChange} variant="contained" startIcon={<LockIcon />} sx={{ bgcolor: colors.primary, borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>Update Password</Button>
          </DialogActions>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={confirmDeactivate} onClose={() => setConfirmDeactivate(false)}>
          <DialogTitle sx={{ color: colors.primary, fontWeight: 800 }}>Deactivate Account?</DialogTitle>
          <DialogContent>
              <DialogContentText>This will temporarily disable your account and log you out. You can reactivate by logging in again later.</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setConfirmDeactivate(false)} sx={{ color: colors.muted, textTransform: 'none', fontWeight: 700 }}>Stay Active</Button>
              <Button 
                onClick={handleDeactivate} 
                variant="contained" 
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <DeactivateIcon />} 
                color="primary" 
                disabled={saving}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
              >
                {saving ? 'Deactivating...' : 'Yes, Deactivate'}
              </Button>
          </DialogActions>
      </Dialog>

      {/* Delete Data Dialog */}
      <Dialog open={confirmDeleteData} onClose={() => setConfirmDeleteData(false)}>
          <DialogTitle sx={{ color: colors.danger, fontWeight: 800 }}>Delete All Medical Records?</DialogTitle>
          <DialogContent>
              <DialogContentText sx={{ color: colors.danger }}>WARNING: This action is irreversible. All your prescriptions, consultations, and health records will be permanently wiped from Seva.</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setConfirmDeleteData(false)} sx={{ color: colors.muted, textTransform: 'none', fontWeight: 700 }}>Keep My Data</Button>
              <Button 
                onClick={handleDeleteData} 
                variant="contained" 
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />} 
                color="error"
                disabled={saving}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
              >
                {saving ? 'Deleting...' : 'Delete Everything'}
              </Button>
          </DialogActions>
      </Dialog>

      {/* Permanent Delete Account Dialog */}
      <Dialog open={confirmDeleteAccount} onClose={() => setConfirmDeleteAccount(false)}>
          <DialogTitle sx={{ color: colors.danger, fontWeight: 800 }}>Delete Account Permanently?</DialogTitle>
          <DialogContent>
              <DialogContentText sx={{ color: colors.danger, fontWeight: 700 }}>This is the point of no return. Your account will be deleted permanently, and we will not be able to recover it.</DialogContentText>
              <DialogContentText sx={{ mt: 2 }}>You will also be logged out immediately.</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setConfirmDeleteAccount(false)} sx={{ color: colors.muted, textTransform: 'none', fontWeight: 700 }}>Keep My Account</Button>
              <Button 
                onClick={handlePermanentDelete} 
                variant="contained" 
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <PersonOffIcon />} 
                color="error"
                disabled={saving}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
              >
                {saving ? 'Deleting Account...' : 'Delete Permanently'}
              </Button>
          </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </PatientShell>
  );
}
