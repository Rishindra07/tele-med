import React, { useEffect, useState } from 'react';
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
  LanguageRounded as LanguageIcon,
  NotificationsActiveRounded as NotifyIcon,
  AccountCircleRounded as AccountIcon,
  DeleteForeverRounded as DeleteIcon,
  LogoutRounded as LogoutIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import { fetchDoctorProfile, updateDoctorProfile, updateDoctorSettings } from '../../api/doctorApi';
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

function Row({ label, desc, action, danger = false }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
      sx={{ py: 3, borderBottom: `1px solid ${c.line}`, '&:last-child': { borderBottom: 'none' } }}
    >
      <Box sx={{ maxWidth: '70%' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: danger ? c.danger : c.text }}>{label}</Typography>
        <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 14 }}>{desc}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>{action}</Box>
    </Stack>
  );
}

export default function DoctorSettings() {
  const { language: currentLanguage, setLanguage } = useLanguage();
  const t = DOCTOR_SETTINGS_TRANSLATIONS[currentLanguage] || DOCTOR_SETTINGS_TRANSLATIONS['en'];

  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
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
      // 1. Update Profile (Name, Spec, Clinic, License, etc.)
      const res = await updateDoctorProfile({
        full_name: profile.name,
        phone: profile.phone,
        specialization: profile.specialization,
        hospitalName: profile.hospitalName,
        medicalLicense: profile.medicalLicense,
        qualification: profile.qualification,
        bio: profile.bio
      });

      // 2. Update Settings (Toggles)
      await updateDoctorSettings(toggles);
      
      // Update local storage for immediate UI sync across components
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          full_name: profile.name,
          phone: profile.phone,
          specialization: profile.specialization,
          settings: toggles
      }));

      setSnackbar({ open: true, severity: 'success', message: 'Workspace configuration updated!' });
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
        // Implementation for deactivation
        setSnackbar({ open: true, severity: 'info', message: 'Deactivation request submitted.' });
    } catch (err) {}
  };

  const tabs = [
    { id: 'account', label: 'Doctor Profile', icon: <AccountIcon /> },
    { id: 'preferences', label: 'Clinical Workflow', icon: <NotifyIcon /> },
    { id: 'security', label: 'Security & Access', icon: <SecurityIcon /> }
  ];

  if (loading) return (
    <DoctorLayout>
      <Box sx={{ py: 12, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: c.primary }} />
      </Box>
    </DoctorLayout>
  );

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2.5, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: c.bg, minHeight: 'calc(100vh - 64px)' }}>
        
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, color: c.text, letterSpacing: '-1px' }}>Settings</Typography>
            <Typography sx={{ color: c.muted, mt: 0.5, fontSize: 16 }}>Configure your workspace and profile features</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: c.primary, px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 700, boxShadow: `0 8px 24px ${c.primary}30`, '&:hover': { bgcolor: c.primaryDark } }}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </Stack>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 3 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${c.line}`, bgcolor: '#fff' }}>
                <Stack spacing={1}>
                {tabs.map(tab => (
                    <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    startIcon={tab.icon}
                    sx={{
                        justifyContent: 'flex-start',
                        px: 2, py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: 15,
                        fontWeight: activeTab === tab.id ? 700 : 500,
                        bgcolor: activeTab === tab.id ? c.primarySoft : 'transparent',
                        color: activeTab === tab.id ? c.primaryDark : c.muted,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: activeTab === tab.id ? c.primarySoft : c.soft, color: activeTab === tab.id ? c.primaryDark : c.text }
                    }}
                    >
                    {tab.label}
                    </Button>
                ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Button 
                    startIcon={<LogoutIcon />} 
                    fullWidth 
                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }} 
                    sx={{ justifyContent: 'flex-start', color: c.danger, textTransform: 'none', fontWeight: 600, px: 2 }}
                >
                    Logout Session
                </Button>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 9 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, bgcolor: '#fff', border: `1px solid ${c.line}`, minHeight: '500px' }}>
              
                {activeTab === 'account' && (
                  <Stack spacing={4}>
                    <Box sx={{ pb: 2, borderBottom: `1px solid ${c.line}` }}>
                        <Typography sx={{ fontSize: 20, fontWeight: 700, color: c.text }}>Professional Details</Typography>
                        <Typography sx={{ fontSize: 14, color: c.muted }}>Your public information visible to patients.</Typography>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Full Name" fullWidth value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} variant="outlined" sx={{ borderRadius: 2 }} />
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
                            <TextField label="Professional Bio" fullWidth multiline rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} variant="outlined" helperText="Describe your expertise and practice." />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: c.primarySoft, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <InfoIcon sx={{ color: c.primary }} />
                        <Typography sx={{ fontSize: 13, color: c.primaryDark, fontWeight: 500 }}>
                            Updating these details will also update your public profile visible to patients in the app.
                        </Typography>
                    </Box>
                  </Stack>
                )}

                {activeTab === 'preferences' && (
                  <Stack spacing={1}>
                    <Box sx={{ pb: 2, mb: 2, borderBottom: `1px solid ${c.line}` }}>
                        <Typography sx={{ fontSize: 20, fontWeight: 700, color: c.text }}>Clinical Workflow</Typography>
                        <Typography sx={{ fontSize: 14, color: c.muted }}>Configure how you interact with patients and the system.</Typography>
                    </Box>

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
                  </Stack>
                )}

                {activeTab === 'security' && (
                  <Stack spacing={1}>
                    <Box sx={{ pb: 2, mb: 2, borderBottom: `1px solid ${c.line}` }}>
                        <Typography sx={{ fontSize: 20, fontWeight: 700, color: c.text }}>Access & Security</Typography>
                        <Typography sx={{ fontSize: 14, color: c.muted }}>Manage your account security and data privacy.</Typography>
                    </Box>

                    <Row label="Password" desc="Safeguard your medical records with a strong password" action={<Button variant="outlined" sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600, borderColor: c.line, color: c.text }}>Change Password</Button>} />
                    <Row label="Biometric Login" desc="Enable FaceID or Fingerprint authentication on supported devices" action={<Switch checked={toggles.biometric} onChange={(e) => setToggles({...toggles, biometric: e.target.checked})} color="primary" />} />
                    <Row label="Data Synchronization" desc="Auto-sync records between your various workspace devices" action={<Switch checked={toggles.dataSync} onChange={(e) => setToggles({...toggles, dataSync: e.target.checked})} color="primary" />} />
                    
                    <Box sx={{ mt: 4, pt: 4, borderTop: `1px solid ${c.dangerSoft}` }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: c.danger, mb: 2 }}>Danger Zone</Typography>
                        <Row 
                            label="Deactivate Workspace" 
                            desc="Temporarily hide your profile and stop receiving new appointments." 
                            action={<Button variant="outlined" onClick={handleDeactivate} sx={{ color: c.danger, borderColor: c.danger, borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: c.dangerSoft, borderColor: c.danger } }}>Deactivate</Button>} 
                        />
                        <Row 
                            label="Delete Medical Account" 
                            desc="Permanently delete all patient records, history and your professional profile. This action is irreversible." 
                            danger 
                            action={<Button variant="contained" onClick={() => setDeleteDialogOpen(true)} sx={{ bgcolor: c.danger, borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#b71c1c' }, boxShadow: `0 4px 12px ${c.danger}40` }}>Delete Permanently</Button>} 
                        />
                    </Box>
                  </Stack>
                )}

            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: c.danger }}>Delete Account Permanently?</DialogTitle>
        <DialogContent>
            <Typography sx={{ color: c.muted }}>
                Are you sure you want to delete your doctor profile? All your consultation history, patient records, and pending follow-ups will be lost forever.
            </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: c.text, fontWeight: 600 }}>Cancel</Button>
            <Button variant="contained" sx={{ bgcolor: c.danger, borderRadius: 2, fontWeight: 700 }}>Confirm Deletion</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </DoctorLayout>
  );
}
