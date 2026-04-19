import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Button, Divider,
  Avatar, Switch, CircularProgress, Alert, Snackbar,
  Select, MenuItem, FormControl, InputLabel, TextField
} from '@mui/material';
import {
  SettingsRounded as SettingsIcon,
  SecurityRounded as SecurityIcon,
  BuildRounded as ConfigIcon,
  SaveRounded as SaveIcon,
  TranslateRounded as LangIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import { fetchAdminSettings, updateAdminSettings } from '../../api/adminApi';

const colors = {
  paper: '#ffffff',
  line: '#e0e0e0',
  text: '#202124',
  muted: '#5f6368',
  blue: '#1a73e8',
  blueSoft: '#e8f0fe',
  green: '#1e8e3e',
  greenSoft: '#e6f4ea',
  red: '#d93025',
  redSoft: '#fbeaea',
  orange: '#f9ab00',
  orangeSoft: '#fff8e1',
  soft: '#f1f3f4'
};

function SettingRow({ label, desc, action }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 3, borderBottom: `1px solid ${colors.soft}`, '&:last-child': { borderBottom: 'none' } }}>
      <Box sx={{ pr: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{label}</Typography>
        <Typography sx={{ fontSize: 14, color: colors.muted, mt: 0.5 }}>{desc}</Typography>
      </Box>
      <Box>{action}</Box>
    </Stack>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const [toggles, setToggles] = useState({
    doctorVerification: true,
    openRegistration: true,
    newPharmacyEnrollment: true,
    twoFactor: true,
    autoBackup: true
  });

  const [adminUser, setAdminUser] = useState({});

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const usr = JSON.parse(localStorage.getItem('user') || '{}');
        setAdminUser(usr);
        
        const res = await fetchAdminSettings();
        if (res.data.success) {
          setToggles(res.data.settings);
        }
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, severity: 'error', message: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateAdminSettings(toggles);
      if (res.data.success) {
        // Update local storage
        const usr = JSON.parse(localStorage.getItem('user') || '{}');
        usr.settings = res.data.settings;
        localStorage.setItem('user', JSON.stringify(usr));
        setSnackbar({ open: true, severity: 'success', message: 'Global config saved' });
      }
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'System General', icon: <SettingsIcon /> },
    { id: 'platform', label: 'Platform Controls', icon: <ConfigIcon /> },
    { id: 'security', label: 'Security & Maintenance', icon: <SecurityIcon /> }
  ];

  if (loading) return <AdminLayout><Box sx={{ p: 10, textAlign: 'center' }}><CircularProgress /></Box></AdminLayout>;

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 5, xl: 8 }, maxWidth: 1200, mx: 'auto' }}>
        
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1.05 }}>Settings</Typography>
            <Typography sx={{ color: colors.muted, mt: 1 }}>Configure global platform behavior, security protocols, and system metadata</Typography>
          </Box>
            <Button 
            variant="contained" 
            onClick={handleSave}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            sx={{ bgcolor: colors.blue, px: 4, py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 800, '&:hover': { bgcolor: colors.blue } }}
          >
            {saving ? 'Processing...' : 'Save Global Config'}
          </Button>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px 1fr' }, gap: 6 }}>
          
          <Stack spacing={1}>
            {tabs.map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                startIcon={tab.icon}
                sx={{
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1.4,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  bgcolor: activeTab === tab.id ? colors.blueSoft : 'transparent',
                  color: activeTab === tab.id ? colors.blue : colors.text,
                  '&:hover': { bgcolor: colors.soft }
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ p: 5, borderRadius: '16px', bgcolor: colors.paper, border: `1px solid ${colors.line}`, boxShadow: '0 4px 30px rgba(0,0,0,0.02)' }}>
            
            {activeTab === 'general' && (
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight={800}>Administrative Profile</Typography>
                <Stack direction="row" spacing={3} alignItems="center" sx={{ p: 3, borderRadius: '12px', bgcolor: colors.soft }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: colors.blue, fontWeight: 700 }}>
                        {adminUser.full_name?.charAt(0) || 'A'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={800}>{adminUser.full_name || 'Admin Tester'}</Typography>
                        <Typography variant="body2" sx={{ color: colors.muted }}>{adminUser.email || 'admin.test@seva.local'}</Typography>
                    </Box>
                    <Button variant="outlined" size="small" sx={{ ml: 'auto', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>Change Photo</Button>
                </Stack>
                <SettingRow label="Global Language" desc="Default display language for new users" action={
                    <Select 
                      size="small" 
                      value={toggles.globalLanguage || 'en'} 
                      sx={{ minWidth: 200 }}
                      onChange={(e) => setToggles({...toggles, globalLanguage: e.target.value})}
                    >
                        <MenuItem value="en">English (en)</MenuItem>
                        <MenuItem value="hi">हिन्दी (hi)</MenuItem>
                        <MenuItem value="pa">ਪੰਜਾਬੀ (pa)</MenuItem>
                        <MenuItem value="ta">தமிழ் (ta)</MenuItem>
                        <MenuItem value="te">తెలుగు (te)</MenuItem>
                    </Select>
                } />
                <SettingRow label="System Timezone" desc="Used for appointment scheduling synchronization" action={
                    <Select 
                      size="small" 
                      value={toggles.systemTimezone || 'IST'} 
                      sx={{ minWidth: 200 }}
                      onChange={(e) => setToggles({...toggles, systemTimezone: e.target.value})}
                    >
                        <MenuItem value="IST">(GMT+05:30) IST</MenuItem>
                        <MenuItem value="UTC">(GMT+00:00) UTC</MenuItem>
                        <MenuItem value="GMT">(GMT+00:00) GMT</MenuItem>
                    </Select>
                } />
              </Stack>
            )}

            {activeTab === 'platform' && (
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>Enrollment & Logic</Typography>
                <SettingRow 
                    label="Doctor Verification Requirement" 
                    desc="Mandatory manual verification of doctor medical licenses" 
                    action={<Switch checked={toggles.doctorVerification} onChange={() => setToggles({...toggles, doctorVerification: !toggles.doctorVerification})} color="success" />} 
                />
                <SettingRow 
                    label="Open Registration" 
                    desc="Allow new patients to register without referral" 
                    action={<Switch checked={toggles.openRegistration} onChange={() => setToggles({...toggles, openRegistration: !toggles.openRegistration})} color="success" />} 
                />
                <SettingRow label="Minimum Consultation Fee" desc="Global floor for consultation pricing" action={
                    <TextField 
                      size="small" 
                      type="number"
                      value={toggles.minConsultationFee || 100}
                      onChange={(e) => setToggles({...toggles, minConsultationFee: e.target.value})}
                      sx={{ width: 100 }}
                      InputProps={{ startAdornment: <Typography sx={{mr: 0.5, fontWeight: 700}}>₹</Typography> }}
                    />
                } />
                <SettingRow 
                    label="New Pharmacy Enrollment" 
                    desc="Allow pharmacies to request account creation" 
                    action={<Switch checked={toggles.newPharmacyEnrollment} onChange={() => setToggles({...toggles, newPharmacyEnrollment: !toggles.newPharmacyEnrollment})} color="success" />} 
                />
              </Stack>
            )}

            {activeTab === 'security' && (
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>Maintenance & Maintenance</Typography>
                <SettingRow 
                    label="System-wide 2FA" 
                    desc="Require OTP for all administrative logins" 
                    action={<Switch checked={toggles.twoFactor} onChange={() => setToggles({...toggles, twoFactor: !toggles.twoFactor})} color="success" />} 
                />
                <SettingRow 
                    label="Database Auto-Backup" 
                    desc="Backup frequency for cloud storage" 
                    action={<Switch checked={toggles.autoBackup} onChange={() => setToggles({...toggles, autoBackup: !toggles.autoBackup})} color="success" />} 
                />
                <SettingRow label="Session Timeout" desc="Auto-logout for administrative inactivity" action={<Typography fontWeight={700}>4 Hours</Typography>} />
                <Divider sx={{my: 2}} />
                <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, fontSize: 17 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography sx={{ fontWeight: 800, color: colors.red }}>Reset Platform Data</Typography>
                            <Typography sx={{ fontSize: 13, color: colors.red, opacity: 0.8 }}>Caution: This will clear temporary caches and logs</Typography>
                        </Box>
                        <Button variant="contained" color="error" size="small" sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>Initialize Reset</Button>
                    </Stack>
                </Box>
              </Stack>
            )}

          </Box>
        </Box>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
