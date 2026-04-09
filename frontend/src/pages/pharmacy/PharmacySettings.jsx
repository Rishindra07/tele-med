import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Button, Divider,
  TextField, MenuItem, Select, Switch, Slider, FormControl,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import {
  SettingsRounded as SettingsIcon,
  Inventory2Rounded as InventoryIcon,
  ReceiptLongRounded as BillingIcon,
  SecurityRounded as SecurityIcon,
  SaveRounded as SaveIcon,
  StoreRounded as StoreIcon
} from '@mui/icons-material';
import PharmacyLayout from '../../components/PharmacyLayout';
import { fetchPharmacyProfile, updatePharmacyProfile, updatePharmacySettings } from '../../api/pharmacyApi';

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
  red: '#d9635b'
};

export default function PharmacySettings() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const [profile, setProfile] = useState({
    pharmacyName: '',
    ownerName: '',
    address: '',
    email: '',
    phone: '',
    gstin: ''
  });

  const [toggles, setToggles] = useState({
    autoAlertExpiry: true,
    lowStockSms: true,
    staffPin: false,
    threshold: 50
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchPharmacyProfile();
        const ph = res.pharmacy || {};
        const usr = res.user || {};
        setProfile({
          pharmacyName: ph.pharmacyName || '',
          ownerName: ph.ownerName || '',
          address: ph.address || '',
          email: ph.email || usr.email || '',
          phone: ph.phone || usr.phone || '',
          gstin: ph.gstin || ''
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
        updatePharmacyProfile(profile),
        updatePharmacySettings(toggles)
      ]);
      setSnackbar({ open: true, severity: 'success', message: 'Saved successfully' });
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'store', label: 'Store Profile', icon: <StoreIcon /> },
    { id: 'inventory', label: 'Inventory Logic', icon: <InventoryIcon /> },
    { id: 'billing', label: 'Tax & Billing', icon: <BillingIcon /> },
    { id: 'security', label: 'Security & Access', icon: <SecurityIcon /> }
  ];

  if (loading) return <PharmacyLayout><Box sx={{ p: 10, textAlign: 'center' }}><CircularProgress color="success" /></Box></PharmacyLayout>;

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 5, xl: 7 }, maxWidth: 1200, mx: 'auto' }}>
        
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }}>
          <Box>
            <Typography variant="h3" sx={{ fontFamily: 'Georgia, serif', fontWeight: 700 }}>Pharmacy Settings</Typography>
            <Typography sx={{ color: colors.muted, mt: 1 }}>Manage your inventory thresholds, billing details, and staff access</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: colors.green, px: 4, py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 800, '&:hover': { bgcolor: colors.greenDark } }}
          >
            {saving ? 'Saving...' : 'Apply Changes'}
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
                  px: 3, py: 2,
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

          <Box sx={{ p: 5, borderRadius: 5, bgcolor: colors.paper, border: `1px solid ${colors.line}`, boxShadow: '0 4px 30px rgba(0,0,0,0.02)' }}>
            
            {activeTab === 'store' && (
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight={800}>General Store Info</Typography>
                <TextField label="Pharmacy Name" fullWidth value={profile.pharmacyName} onChange={e => setProfile({...profile, pharmacyName: e.target.value})} />
                <TextField label="Owner Name" fullWidth value={profile.ownerName} onChange={e => setProfile({...profile, ownerName: e.target.value})} />
                <TextField label="Store Address" fullWidth multiline rows={2} value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                <Stack direction="row" spacing={2}>
                    <TextField label="Contact Email" fullWidth value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                    <TextField label="Support Phone" fullWidth value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </Stack>
                <Divider />
                <Box>
                    <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 14 }}>Primary Language</Typography>
                    <Select size="small" fullWidth value="en">
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                        <MenuItem value="pa">ਪੰਜਾਬੀ (Punjabi)</MenuItem>
                        <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
                    </Select>
                </Box>
              </Stack>
            )}

            {activeTab === 'inventory' && (
              <Stack spacing={5}>
                <Typography variant="h6" fontWeight={800}>Inventory & Stock Logic</Typography>
                <Box>
                    <Typography sx={{ fontWeight: 700, mb: 1 }}>Critical Stock Threshold</Typography>
                    <Typography sx={{ color: colors.muted, fontSize: 13, mb: 3 }}>Notify me when medicine units drop below this number</Typography>
                    <Slider value={toggles.threshold} onChange={(_,v) => setToggles({...toggles, threshold: v})} min={10} max={200} step={10} sx={{ color: colors.green }} valueLabelDisplay="auto" />
                    <Typography sx={{ textAlign: 'right', fontWeight: 800, color: colors.green }}>{toggles.threshold} Units</Typography>
                </Box>
                <Divider />
                <Stack spacing={3}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography sx={{ fontWeight: 700 }}>Auto-Alert Expiry</Typography>
                            <Typography sx={{ color: colors.muted, fontSize: 13 }}>Flag medicines reaching expiry within 90 days</Typography>
                        </Box>
                        <Switch checked={toggles.autoAlertExpiry} onChange={() => setToggles({...toggles, autoAlertExpiry: !toggles.autoAlertExpiry})} color="success" />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography sx={{ fontWeight: 700 }}>Low Stock SMS</Typography>
                            <Typography sx={{ color: colors.muted, fontSize: 13 }}>Send SMS alerts for critical stock outages</Typography>
                        </Box>
                        <Switch checked={toggles.lowStockSms} onChange={() => setToggles({...toggles, lowStockSms: !toggles.lowStockSms})} color="success" />
                    </Stack>
                </Stack>
              </Stack>
            )}

            {activeTab === 'billing' && (
                <Stack spacing={4}>
                    <Typography variant="h6" fontWeight={800}>Taxation & Invoicing</Typography>
                    <TextField label="GSTIN Number" fullWidth value={profile.gstin} onChange={e => setProfile({...profile, gstin: e.target.value})} />
                    <FormControl fullWidth>
                        <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 14 }}>Default Tax Type</Typography>
                        <Select value="regular" size="small">
                            <MenuItem value="regular">Regular GST (18%)</MenuItem>
                            <MenuItem value="composition">Composition Scheme (1%)</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            )}

            {activeTab === 'security' && (
                <Stack spacing={4}>
                    <Typography variant="h6" fontWeight={800}>User Access Control</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3, border: `1px solid ${colors.line}`, borderRadius: 3 }}>
                         <Box>
                            <Typography sx={{ fontWeight: 700 }}>Staff PIN Access</Typography>
                            <Typography sx={{ color: colors.muted, fontSize: 13 }}>Require 4-digit PIN for sales staff login</Typography>
                         </Box>
                         <Switch checked={toggles.staffPin} onChange={() => setToggles({...toggles, staffPin: !toggles.staffPin})} color="success" />
                    </Stack>
                    <Button variant="outlined" sx={{ borderRadius: 2.5, py: 1.5, borderColor: colors.line, color: colors.text, textTransform: 'none', fontWeight: 700 }}>Update Owner Password</Button>
                    <Button variant="contained" color="error" sx={{ borderRadius: 2.5, py: 1.5, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>Danger: Request Account Deactivation</Button>
                </Stack>
            )}

          </Box>
        </Box>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </PharmacyLayout>
  );
}
