import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Avatar, Switch, Table, TableBody, TableCell, TableRow, CircularProgress
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  EditRounded as EditIcon,
  SettingsRounded as SettingsIcon,
  AddRounded as AddIcon,
  CheckCircleRounded as VerifiedIcon,
  CameraAltRounded as CameraIcon,
} from '@mui/icons-material';
import PharmacyLayout from '../../components/PharmacyLayout';
import { fetchPharmacyProfile, updatePharmacyProfile } from '../../api/pharmacyApi';
import { Snackbar, Alert, TextField } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';
import { PHARMACY_PROFILE_TRANSLATIONS } from '../../utils/translations/pharmacy';

const colors = {
  paper: '#ffffff',
  bg: '#f8f9fa',
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
  red: '#d93025',
  redSoft: '#fdeaea',
  blue: '#1a73e8',
  blueSoft: '#e8f0fe',
  purple: '#673ab7',
  purpleSoft: '#f3e5f5',
  tan: '#795548',
  tanSoft: '#efebe9',
  graySoft: '#f1f3f4'
};

// TABS will be mapped dynamically later

const InfoRow = ({ label, value, verified, t }) => (
  <TableRow sx={{ '& td': { border: 'none', py: 0.8, px: 0 } }}>
    <TableCell sx={{ color: colors.muted, fontSize: 13, width: 140 }}>{label}</TableCell>
    <TableCell>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography sx={{ fontSize: 13, color: colors.text }}>{value || '--'}</Typography>
        {verified && value && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: colors.successSoft, px: 0.8, py: 0.2, borderRadius: 1.5 }}>
            <VerifiedIcon sx={{ fontSize: 12, color: colors.success }} />
            <Typography sx={{ fontSize: 10, color: colors.success, fontWeight: 700 }}>{t?.verified || 'Verified'}</Typography>
          </Box>
        )}
      </Stack>
    </TableCell>
  </TableRow>
);

export default function PharmacyProfile() {

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null); // 'basic', 'licences', 'hours'
  const [tempProfile, setTempProfile] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { language } = useLanguage();
  const t = PHARMACY_PROFILE_TRANSLATIONS[language] || PHARMACY_PROFILE_TRANSLATIONS['en'];

  const TABS = [t.tab_basic, t.tab_licences, t.tab_staff, t.tab_hours, t.tab_notif, t.tab_bank];
  const [activeTab, setActiveTab] = useState(TABS[0]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchPharmacyProfile();
        if (res.data.success) {
          setProfile(res.data);
          setTempProfile(res.data.pharmacy);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (section) => {
    try {
      await updatePharmacyProfile(tempProfile);
      setProfile({ ...profile, pharmacy: tempProfile });
      setEditingSection(null);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  const p = profile?.pharmacy || {};
  const stats = profile?.stats || {};
  const u = profile?.user || {};

  if (loading) return <PharmacyLayout><Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress sx={{ color: colors.primary }} /></Box></PharmacyLayout>;

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 13, color: colors.muted, mb: 1.5, fontWeight: 600 }}>{t.home} › {t.settings} › <Typography component="span" sx={{ color: colors.primary, fontWeight: 700 }}>{t.profile}</Typography></Typography>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px', color: colors.text }}>
              {t.profile}
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 16 }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ bgcolor: colors.soft, color: '#5f5a52', borderRadius: 2.5, px: 2, py: 1.1, fontSize: 13, lineHeight: 1.25, textAlign: 'center' }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}<br />{new Date().toLocaleDateString('en-GB', { month: 'long' })}<br />{new Date().getFullYear()}
            </Box>
            <IconButton sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', width: 42, height: 42 }}>
              <Badge color="error" variant="dot">
                <BellIcon sx={{ color: '#5f5a52' }} />
              </Badge>
            </IconButton>
          </Stack>
        </Stack>

        {/* Top Profile Card */}
        <Box sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems={{ xs: 'center', md: 'flex-start' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: colors.primarySoft, color: colors.primaryDark, fontSize: 24, fontWeight: 700 }}>
                {p.pharmacyName?.[0] || 'P'}
              </Avatar>
              <IconButton size="small" sx={{ position: 'absolute', bottom: -4, right: -4, bgcolor: colors.primary, color: '#fff', border: '2px solid #fff', '&:hover': { bgcolor: colors.primaryDark } }}>
                <CameraIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: 28, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: colors.text, mb: 1 }}>{p.pharmacyName}</Typography>
              <Typography sx={{ fontSize: 13.5, color: colors.muted, mb: 3 }}>
                {p.address ? `${p.address} — ${p.pincode || ''}` : `${p.city || t.loc_pending}`}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Box sx={{ px: 1.5, py: 0.6, borderRadius: 1.5, bgcolor: colors.successSoft, color: colors.success, fontSize: 12, fontWeight: 700 }}>{t.linked}</Box>
                {p.isJanAushadhi && <Box sx={{ px: 1.5, py: 0.6, borderRadius: 1.5, bgcolor: colors.purpleSoft, color: colors.purple, fontSize: 12, fontWeight: 700 }}>{t.jan_aushadhi}</Box>}
                {p.isGstinVerified && <Box sx={{ px: 1.5, py: 0.6, borderRadius: 1.5, bgcolor: colors.primarySoft, color: colors.primary, fontSize: 12, fontWeight: 700 }}>{t.gstin_ver}</Box>}
                <Box sx={{ px: 1.5, py: 0.6, borderRadius: 1.5, bgcolor: colors.tanSoft, color: colors.tan, fontSize: 12, fontWeight: 700 }}>{t.drug_lic_val}</Box>
              </Stack>
            </Box>
            <Stack direction="row" spacing={6} sx={{ pt: { xs: 2, md: 4 } }}>
              <Box sx={{ textAlign: 'center' }}>
                 <Typography sx={{ fontSize: 22, fontWeight: 700, color: colors.text }}>{stats.stockCount || 0}</Typography>
                <Typography sx={{ fontSize: 12, color: colors.muted }}>{t.stats_sku}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                 <Typography sx={{ fontSize: 22, fontWeight: 700, color: colors.text }}>{stats.staffCount || 1}</Typography>
                <Typography sx={{ fontSize: 12, color: colors.muted }}>{t.stats_staff}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                 <Typography sx={{ fontSize: 22, fontWeight: 700, color: colors.text }}>{stats.yearsOnSeva || 1}</Typography>
                <Typography sx={{ fontSize: 12, color: colors.muted }}>{t.stats_yrs}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* Tab Navigation */}
        <Stack direction="row" spacing={1} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {TABS.map(tab => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                 textTransform: 'none', borderRadius: 99, px: 3, py: 1, fontSize: 14, minWidth: 0, whiteSpace: 'nowrap', fontWeight: 600,
                 bgcolor: activeTab === tab ? colors.primary : 'transparent',
                 color: activeTab === tab ? '#fff' : colors.muted,
                 '&:hover': { bgcolor: activeTab === tab ? colors.primaryDark : colors.soft }
              }}
            >
              {tab}
            </Button>
          ))}
        </Stack>

        {/* Main Grid: 3 Columns of Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
          
          {/* Basic Information */}
          <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16 }}>{t.basic_info}</Typography>
               {editingSection === 'basic' ? (
                 <Button size="small" variant="contained" onClick={() => handleSave('basic')} sx={{ bgcolor: colors.primary, color: '#fff', textTransform: 'none', px: 2, borderRadius: 1.5, fontWeight: 700 }}>{t.btn_save}</Button>
               ) : (
                 <Button size="small" onClick={() => setEditingSection('basic')} sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5, fontWeight: 600 }}>{t.btn_edit}</Button>
               )}
            </Stack>
            {editingSection === 'basic' ? (
              <Stack spacing={2}>
                <TextField label={t.f_pname} size="small" value={tempProfile.pharmacyName || ''} onChange={e => setTempProfile({...tempProfile, pharmacyName: e.target.value})} fullWidth />
                <TextField label={t.f_oname} size="small" value={tempProfile.ownerName || ''} onChange={e => setTempProfile({...tempProfile, ownerName: e.target.value})} fullWidth />
                <TextField label={t.f_village} size="small" value={tempProfile.city || ''} onChange={e => setTempProfile({...tempProfile, city: e.target.value})} fullWidth />
                <TextField label={t.f_dist} size="small" value={tempProfile.district || ''} onChange={e => setTempProfile({...tempProfile, district: e.target.value})} fullWidth />
                <TextField label={t.f_pin} size="small" value={tempProfile.pincode || ''} onChange={e => setTempProfile({...tempProfile, pincode: e.target.value})} fullWidth />
              </Stack>
            ) : (
              <Table size="small">
                <TableBody>
                  <InfoRow t={t} label={t.i_pname} value={p.pharmacyName} />
                  <InfoRow t={t} label={t.i_oname} value={p.ownerName || u.full_name} />
                  <InfoRow t={t} label={t.i_mob} value={p.phone || u.phone} verified />
                  <InfoRow t={t} label={t.i_email} value={p.email || u.email} />
                  <InfoRow t={t} label={t.i_village} value={p.city} />
                  <InfoRow t={t} label={t.i_dist} value={`${p.district || ''} — ${p.pincode || ''}`} />
                  <InfoRow t={t} label={t.i_aadhaar} value={p.aadhaarNumber || 'XXXX XXXX 7821'} verified={p.isAadhaarVerified} />
                </TableBody>
              </Table>
            )}
          </Box>

          {/* Licences & Registrations */}
          <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16 }}>{t.licences}</Typography>
               {editingSection === 'licences' ? (
                 <Button size="small" variant="contained" onClick={() => handleSave('licences')} sx={{ bgcolor: colors.primary, color: '#fff', textTransform: 'none', px: 2, borderRadius: 1.5, fontWeight: 700 }}>{t.btn_save}</Button>
               ) : (
                 <Button size="small" onClick={() => setEditingSection('licences')} sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5, fontWeight: 600 }}>{t.btn_edit}</Button>
               )}
            </Stack>
            {editingSection === 'licences' ? (
              <Stack spacing={2}>
                <TextField label={t.f_drug_lic} size="small" value={tempProfile.licenseNumber || ''} onChange={e => setTempProfile({...tempProfile, licenseNumber: e.target.value})} fullWidth />
                <TextField label={t.f_gstin} size="small" value={tempProfile.gstin || ''} onChange={e => setTempProfile({...tempProfile, gstin: e.target.value})} fullWidth />
                <TextField label={t.f_jan_id} size="small" value={tempProfile.janAushadhiId || ''} onChange={e => setTempProfile({...tempProfile, janAushadhiId: e.target.value})} fullWidth />
              </Stack>
            ) : (
              <Table size="small">
                <TableBody>
                  <InfoRow t={t} label={t.i_drug_lic} value={p.licenseNumber} />
                  <InfoRow t={t} label={t.i_lic_val} value={p.licenceValidTill ? new Date(p.licenceValidTill).toLocaleDateString() : '31 Dec 2026'} />
                  <InfoRow t={t} label={t.i_gstin} value={p.gstin} verified={p.isGstinVerified} />
                  <InfoRow t={t} label={t.i_gst_reg} value={t.taxpayer} />
                  <InfoRow t={t} label={t.i_jan_id} value={p.janAushadhiId} />
                  <InfoRow t={t} label={t.i_jan_val} value={p.janAushadhiValidTill ? new Date(p.janAushadhiValidTill).toLocaleDateString() : 'Mar 2027'} />
                  <InfoRow t={t} label={t.i_fssai} value={p.fssaiNumber || t.fssai_req} />
                </TableBody>
              </Table>
            )}
          </Box>

          {/* Seva TeleHealth Link */}
          <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16 }}>{t.seva_link}</Typography>
               <Button size="small" sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5, fontWeight: 600 }}>{t.btn_settings}</Button>
            </Stack>
            <Table size="small">
              <TableBody>
                <InfoRow t={t} label={t.st_conn} value={t.conn_y} />
                <InfoRow t={t} label={t.st_pid} value={p.pharmacyId || 'SVT-PHM-2023-0091'} />
                <InfoRow t={t} label={t.st_vis} value={p.visibleToPatients ? `${t.vis_y} ${p.distanceKm || 0.8} ${t.radius}` : t.hidden} />
                <InfoRow t={t} label={t.st_rx_rec} value={stats.prescriptionsReceived?.toLocaleString()} />
                <InfoRow t={t} label={t.st_rtg} value={`${stats.patientRating} / 5 (${stats.reviewCount} ${t.reviews})`} />
                <InfoRow t={t} label={t.st_rx_ful} value={stats.fulfilledCount?.toLocaleString()} />
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* Bottom Section Grid: 2:1 Split */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3 }}>
          
          {/* Staff Accounts Card */}
          <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16 }}>{t.s_acc}</Typography>
               <Button startIcon={<AddIcon />} sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5, fontWeight: 600 }}>{t.btn_add_staff}</Button>
            </Stack>
            
            <Stack spacing={3} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: colors.soft, color: colors.muted, fontSize: 15 }}>{p.ownerName?.[0] || u.full_name?.[0]}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                     <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: colors.text }}>{p.ownerName || u.full_name}</Typography>
                     <Typography sx={{ fontSize: 10, color: colors.success, bgcolor: colors.successSoft, px: 1, py: 0.2, borderRadius: 1, fontWeight: 700 }}>{t.r_owner}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 12.5, color: colors.muted }}>{p.phone || u.phone} • {p.email || u.email}</Typography>
                </Box>
                 <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: colors.soft, color: colors.muted, fontSize: 11, fontWeight: 700 }}>
                   {t.r_owner}
                 </Box>
              </Box>
            </Stack>

            <Divider sx={{ mb: 3 }} />
            <Typography sx={{ fontSize: 14.5, mb: 2 }}>{t.r_perms}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: colors.graySoft }}>
                 <Typography sx={{ fontSize: 11, color: colors.success, fontWeight: 700, mb: 0.5 }}>{t.p_o}</Typography>
                <Typography sx={{ fontSize: 12.5, color: colors.muted }}>{t.p_o_desc}</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: colors.graySoft }}>
                 <Typography sx={{ fontSize: 11, color: colors.primary, fontWeight: 700, mb: 0.5 }}>{t.p_p}</Typography>
                <Typography sx={{ fontSize: 12.5, color: colors.muted }}>{t.p_p_desc}</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: colors.graySoft }}>
                <Typography sx={{ fontSize: 11, color: colors.muted, fontWeight: 600, mb: 0.5 }}>{t.p_h}</Typography>
                <Typography sx={{ fontSize: 12.5, color: colors.muted }}>{t.p_h_desc}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Col: Hours and Notifications */}
          <Stack spacing={3}>
            
            {/* Operating Hours */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: 16 }}>{t.op_hours}</Typography>
                 {editingSection === 'hours' ? (
                   <Button size="small" variant="contained" onClick={() => handleSave('hours')} sx={{ bgcolor: colors.primary, color: '#fff', textTransform: 'none', px: 2, borderRadius: 1.5, fontWeight: 700 }}>{t.btn_save}</Button>
                 ) : (
                   <Button size="small" onClick={() => setEditingSection('hours')} sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5, fontWeight: 600 }}>{t.btn_edit}</Button>
                 )}
              </Stack>
              {editingSection === 'hours' ? (
                <TextField 
                  multiline rows={3} fullWidth value={tempProfile.operatingHoursDesc || ''} 
                  onChange={e => setTempProfile({...tempProfile, operatingHoursDesc: e.target.value})}
                  placeholder={t.ph_op}
                />
              ) : (
                <Box sx={{ whiteSpace: 'pre-line', fontSize: 13, color: colors.muted }}>
                  {p.operatingHoursDesc || t.def_op}
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ fontSize: 13.5 }}>{t.m24}</Typography>
                  <Typography sx={{ fontSize: 11, color: colors.muted }}>{t.m24_s}</Typography>
                </Box>
                <Switch 
                  checked={!!p.is24Hour} 
                  onChange={(e) => {
                    const val = e.target.checked;
                    setTempProfile({ ...tempProfile, is24Hour: val });
                    updatePharmacyProfile({ is24Hour: val });
                  }}
                   size="small"
                   color="primary"
                 />
              </Stack>
            </Box>

            {/* Notification Settings */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 16 }}>{t.notif_set}</Typography>
                 <Button size="small" sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5, fontWeight: 600 }}>{t.btn_edit}</Button>
              </Stack>
              <Stack spacing={2.5}>
                {[
                  { title: t.n1, sub: t.n1_s },
                  { title: t.n2, sub: t.n2_s },
                  { title: t.n3, sub: t.n3_s }
                ].map(n => (
                  <Stack key={n.title} direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 13 }}>{n.title}</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>{n.sub}</Typography>
                    </Box>
                     <Switch defaultChecked size="small" color="primary" />
                  </Stack>
                ))}
              </Stack>
            </Box>

          </Stack>
        </Box>
      </Box>

      <Snackbar 
        open={snackbar.open} autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </PharmacyLayout>
  );
}
