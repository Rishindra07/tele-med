import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  SaveRounded as SaveIcon,
  WarningAmberRounded as WarningIcon,
  SecurityRounded as SecurityIcon,
  NotificationsActiveRounded as NotifyIcon,
  AccountCircleRounded as AccountIcon,
  LogoutRounded as LogoutIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { fetchDoctorProfile, updateDoctorProfile, updateDoctorSettings, changePassword } from '../../api/doctorApi';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_SETTINGS_TRANSLATIONS } from '../../utils/translations/doctor';

const c = {
  bg: '#f8f9fa',
  paper: '#ffffff',
  line: '#e1e3e1',
  soft: '#f1f3f4',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#174ea6',
  success: '#1e8e3e',
  successSoft: '#e6f4ea',
  warning: '#f9ab00',
  warningSoft: '#fef7e0',
  danger: '#d93025',
  dangerSoft: '#fce8e6'
};

const sectionTitles = {
    account: ['Professional Profile', 'Update your public medical profile and contact information'],
    preferences: ['Clinical Workflow', 'Configure how you interact with patients and the system'],
    security: ['Security & Access', 'Manage your account security and data privacy'],
    danger: ['Account Actions', 'Irreversible actions relating to your workspace status']
};

function Row({ label, desc, action, danger = false }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
      sx={{ py: 3, borderBottom: `1px solid ${danger ? c.dangerSoft : c.line}`, '&:last-child': { borderBottom: 'none' } }}
    >
      <Box sx={{ maxWidth: '75%' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: danger ? c.danger : c.text }}>{label}</Typography>
        <Typography sx={{ mt: 0.5, color: danger ? '#d35c5c' : c.muted, fontSize: 14, lineHeight: 1.5 }}>{desc}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0, minWidth: 120 }}>{action}</Box>
    </Stack>
  );
}

export default function DoctorSettings() {
  const { language: currentLanguage, setLanguage } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const section = ['account', 'preferences', 'security', 'danger'].includes(searchParams.get('section')) 
    ? searchParams.get('section') 
    : 'account';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    hospitalName: '',
    bio: '',
    medicalLicense: '',
    qualification: ''
  });

  const [toggles, setToggles] = useState({
    appointmentAlerts: true,
    bookingRequests: true,
    lowBandwidth: true,
    biometric: false,
    emailNotifications: true,
    dataSync: true
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchDoctorProfile();
        const dr = res.doctor || {};
        const usr = res.user || {};
        setProfile({
          name: usr.full_name || '',
          email: usr.email || '',
          phone: usr.phone || '',
          specialization: dr.specialization || '',
          hospitalName: dr.hospitalName || '',
          bio: dr.bio || '',
          medicalLicense: dr.medicalLicense || '',
          qualification: dr.qualification || ''
        });
        if (usr.settings) {
            setToggles(prev => ({ ...prev, ...usr.settings }));
        }
      } catch (err) {
        setSnackbar({ open: true, severity: 'error', message: 'Failed to load profile settings' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoctorProfile({
        full_name: profile.name,
        phone: profile.phone,
        specialization: profile.specialization,
        hospitalName: profile.hospitalName,
        medicalLicense: profile.medicalLicense,
        qualification: profile.qualification,
        bio: profile.bio
      });

      await updateDoctorSettings(toggles);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          full_name: profile.name,
          phone: profile.phone,
          specialization: profile.specialization,
          settings: toggles
      }));

      setSnackbar({ open: true, severity: 'success', message: 'Settings saved successfully!' });
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new) {
        return setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
    }
    if (passwords.new !== passwords.confirm) {
        return setSnackbar({ open: true, message: 'New passwords do not match', severity: 'error' });
    }
    if (passwords.new.length < 6) {
        return setSnackbar({ open: true, message: 'Password must be at least 6 characters', severity: 'error' });
    }
    setSaving(true);
    try {
        await changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
        setSnackbar({ open: true, severity: 'success', message: 'Password updated successfully!' });
        setPasswordDialog(false);
        setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
        setSnackbar({ open: true, severity: 'error', message: err.response?.data?.message || 'Password change failed' });
    } finally {
        setSaving(false);
    }
  };

  const header = sectionTitles[section] || sectionTitles.account;

  const renderPanel = () => {
      if (loading) return (
        <Box sx={{ py: 10, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: c.primary }} />
        </Box>
      );

      if (section === 'account') {
          return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <TextField label="Full Name" fullWidth value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} variant="outlined" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="Specialization" fullWidth value={profile.specialization} onChange={e => setProfile({...profile, specialization: e.target.value})} variant="outlined" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="Medical Registration #" fullWidth value={profile.medicalLicense} onChange={e => setProfile({...profile, medicalLicense: e.target.value})} variant="outlined" placeholder="e.g. REG-2024-XXXX" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="Hospital/Clinic Name" fullWidth value={profile.hospitalName} onChange={e => setProfile({...profile, hospitalName: e.target.value})} variant="outlined" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="Qualification" fullWidth value={profile.qualification} onChange={e => setProfile({...profile, qualification: e.target.value})} variant="outlined" placeholder="MBBS, MD" />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField label="Professional Bio" fullWidth multiline rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} variant="outlined" />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: c.primarySoft, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <InfoIcon sx={{ color: c.primary }} />
                    <Typography sx={{ fontSize: 13, color: c.primaryDark, fontWeight: 500 }}>
                        Updating these details will also update your public profile visible to patients.
                    </Typography>
                </Box>
            </Paper>
          );
      }

      if (section === 'preferences') {
          return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <Row label="Appointment Alerts" desc="Instant notifications for new patient bookings and cancellations" action={<Switch checked={toggles.appointmentAlerts} onChange={(e) => setToggles({...toggles, appointmentAlerts: e.target.checked})} color="primary" />} />
                <Row label="Email Summaries" desc="Receive daily schedule and patient report summaries via email" action={<Switch checked={toggles.emailNotifications} onChange={(e) => setToggles({...toggles, emailNotifications: e.target.checked})} color="primary" />} />
                <Row label="Low Bandwidth Mode" desc="Optimise video/voice for rural areas with weak mobile network" action={<Switch checked={toggles.lowBandwidth} onChange={(e) => setToggles({...toggles, lowBandwidth: e.target.checked})} color="primary" />} />
                
                <Row label="Interface Language" desc="Choose the language for your dashboard and reports" action={
                    <Select 
                        size="small" 
                        value={currentLanguage} 
                        onChange={(e) => setLanguage(e.target.value)}
                        sx={{ borderRadius: 2, minWidth: 160, bgcolor: '#fff' }}
                    >
                        <MenuItem value="en">English (UK/US)</MenuItem>
                        <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                        <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
                        <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
                        <MenuItem value="bn">বাংলা (Bengali)</MenuItem>
                    </Select>
                } />
                <Row label="Operational Timezone" desc="Used for patient scheduling and reminders" action={<Typography sx={{ fontWeight: 700, color: c.primary, fontSize: 14 }}>Asia/Kolkata (GMT+5:30)</Typography>} />
            </Paper>
          );
      }

      if (section === 'security') {
          return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <Row label="Password" desc="Safeguard your medical records with a strong password" action={<Button variant="outlined" onClick={() => setPasswordDialog(true)} sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600, borderColor: c.line, color: c.text }}>Change Password</Button>} />
                <Row label="Biometric Login" desc="Enable FaceID or Fingerprint authentication on supported devices" action={<Switch checked={toggles.biometric} onChange={(e) => setToggles({...toggles, biometric: e.target.checked})} color="primary" />} />
                <Row label="Data Synchronization" desc="Auto-sync records between your various workspace devices" action={<Switch checked={toggles.dataSync} onChange={(e) => setToggles({...toggles, dataSync: e.target.checked})} color="primary" />} />
            </Paper>
          );
      }

      if (section === 'danger') {
          return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${c.dangerSoft}`, bgcolor: '#fff', boxShadow: '0 4px 12px rgba(217,48,37,0.05)' }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                   <WarningIcon sx={{ color: c.danger, fontSize: 32 }} />
                   <Typography variant="h6" fontWeight={800} color={c.danger}>Sensitive Account Actions</Typography>
                </Stack>
                <Row 
                    label="Deactivate Workspace" 
                    desc="Temporarily hide your profile and stop receiving new appointments." 
                    action={<Button variant="outlined" sx={{ color: c.danger, borderColor: c.danger, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Deactivate</Button>} 
                />
                <Row 
                    label="Delete Medical Account" 
                    desc="Permanently delete all patient records, history and your professional profile. This action is irreversible." 
                    danger 
                    action={<Button variant="contained" onClick={() => setDeleteDialogOpen(true)} sx={{ bgcolor: c.danger, borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>Delete Permanently</Button>} 
                />
            </Paper>
          );
      }
  };

  return (
    <DoctorLayout activeSettingSection={section}>
      <Box sx={{ bgcolor: c.bg, minHeight: '100vh' }}>
        <Box sx={{ px: { xs: 2.5, md: 5 }, py: 4, bgcolor: '#fff', borderBottom: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: c.text, letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>{header[0]}</Typography>
            <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 16 }}>{header[1]}</Typography>
          </Box>
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
            variant="contained"
            sx={{ px: 4, py: 1.25, borderRadius: 2.5, bgcolor: c.primary, textTransform: 'none', fontWeight: 800, '&:hover': { bgcolor: c.primaryDark }, boxShadow: `0 8px 16px ${c.primary}20` }}
          > 
            {saving ? 'Saving...' : 'Save All Changes'} 
          </Button>
        </Box>
        
        <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1000 }}>
            {renderPanel()}
        </Box>
      </Box>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: c.danger }}>Delete Account Permanently?</DialogTitle>
        <DialogContent>
            <Typography sx={{ color: c.muted, fontWeight: 500 }}>
                Are you sure you want to delete your doctor profile? All your consultation history, patient records, and pending follow-ups will be lost forever. This action cannot be undone.
            </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: c.text, fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" sx={{ bgcolor: c.danger, borderRadius: 2, fontWeight: 800, textTransform: 'none' }}>Confirm Deletion</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Update Security Password</DialogTitle>
        <DialogContent sx={{ minWidth: { xs: '100%', sm: 400 }, pt: 2 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField label="Current Password" type="password" fullWidth value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                <TextField label="New Password" type="password" fullWidth value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                <TextField label="Confirm New Password" type="password" fullWidth value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setPasswordDialog(false)} sx={{ color: c.muted, fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
            <Button 
                onClick={handlePasswordChange} 
                variant="contained" 
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />} 
                sx={{ bgcolor: c.primary, borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
            >
                {saving ? 'Updating...' : 'Update Password'}
            </Button>
        </DialogActions>
      </Dialog>
    </DoctorLayout>
  );
}
