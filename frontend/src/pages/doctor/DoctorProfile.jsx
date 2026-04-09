import React, { useEffect, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress,
  Divider, Grid, Paper, Snackbar, Stack, Switch, TextField, Typography
} from '@mui/material';
import {
  EmailOutlined as EmailIcon,
  LocationOnOutlined as LocationIcon,
  PhoneOutlined as PhoneIcon,
  SaveRounded as SaveIcon
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import { fetchDoctorProfile, updateDoctorProfile } from '../../api/doctorApi';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_PROFILE_TRANSLATIONS } from '../../utils/translations/doctor';

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

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || 'DR';

export default function DoctorProfile() {
  const { language } = useLanguage();
  const t = DOCTOR_PROFILE_TRANSLATIONS[language] || DOCTOR_PROFILE_TRANSLATIONS['en'];

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [available, setAvailable] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchDoctorProfile();
        setProfile(res);
        const dr = res.doctor || {};
        const usr = res.user || {};
        setForm({
          full_name: usr.full_name || '',
          phone: usr.phone || '',
          specialization: dr.specialization || '',
          bio: dr.bio || '',
          hospitalName: dr.hospitalName || '',
          qualification: dr.qualification || '',
          consultationFee: dr.consultationFee || 0,
          experience: dr.experience || 0,
          languages: dr.languages?.join(', ') || '',
          medicalLicense: dr.medicalLicense || ''
        });
        setAvailable(dr.is_available_for_booking !== false);
      } catch (err) {
        setSnackbar({ open: true, severity: 'error', message: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        is_available_for_booking: available,
        languages: (form.languages || '').split(',').map(s => s.trim()).filter(Boolean)
      };
      const res = await updateDoctorProfile(payload);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...currentUser, 
        full_name: form.full_name, 
        phone: form.phone,
        specialization: form.specialization 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setProfile(prev => ({ ...prev, doctor: res.doctor }));
      setEditing(false);
      setSnackbar({ open: true, severity: 'success', message: 'Profile saved successfully!' });
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const doctor = profile?.doctor || {};
  const user = profile?.user || {};
  const name = form.full_name || user.full_name || 'Doctor';
  const displayLanguages = (form.languages || '').split(',').map(s => s.trim()).filter(Boolean);
  const finalLanguages = displayLanguages.length > 0 ? displayLanguages : (doctor.languages || []);

  if (loading) return (
    <DoctorLayout>
      <Box sx={{ py: 12, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: c.primary }} />
      </Box>
    </DoctorLayout>
  );

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: c.bg, minHeight: 'calc(100vh - 64px)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: c.text, fontFamily: 'Inter, sans-serif' }}>
              {t.title}
            </Typography>
            <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 16 }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            {editing ? (
              <>
                <Button onClick={() => setEditing(false)} sx={{ px: 3, py: 1.2, borderRadius: 2, border: `1px solid ${c.line}`, color: c.text, textTransform: 'none', fontWeight: 600 }}>
                  {t.cancel}
                </Button>
                <Button onClick={handleSave} disabled={saving} startIcon={<SaveIcon />} sx={{ px: 3, py: 1.2, borderRadius: 2, bgcolor: c.primary, color: '#fff', textTransform: 'none', fontWeight: 600, boxShadow: `0 8px 16px ${c.primary}30`, '&:hover': { bgcolor: c.primaryDark } }}>
                  {saving ? t.saving : t.save_changes}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} sx={{ px: 3, py: 1.2, borderRadius: 2, border: `1px solid ${c.primary}`, color: c.primary, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: c.primarySoft } }}>
                {t.edit_profile}
              </Button>
            )}
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} alignItems="flex-start">
          {/* Left: Profile Card */}
          <Box sx={{ width: { xs: '100%', lg: '380px' }, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper elevation={0} sx={{ border: `1px solid ${c.line}`, borderRadius: 2, p: 4, bgcolor: c.paper, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <Avatar sx={{ width: 100, height: 100, margin: '0 auto', bgcolor: c.primarySoft, color: c.primary, fontSize: '2.5rem', fontWeight: 700, border: `4px solid ${c.bg}`, mb: 2 }}>
                {initials(name)}
              </Avatar>
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: c.text }}>{name}</Typography>
              <Typography sx={{ color: c.muted, fontSize: 15, mb: 3 }}>{form.specialization || doctor.specialization || t.spec_def}</Typography>

              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ mb: 3, p: 1, borderRadius: 2, bgcolor: available ? c.successSoft : c.soft }}>
                <Typography sx={{ color: available ? c.success : c.muted, fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>
                  {available ? t.avail : t.busy}
                </Typography>
                <Switch
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  disabled={!editing}
                  sx={{ 
                    '& .MuiSwitch-switchBase.Mui-checked': { color: c.success }, 
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: c.success } 
                  }}
                />
              </Stack>

              <Divider sx={{ mb: 3, borderColor: c.soft }} />
              <Stack spacing={2} sx={{ textAlign: 'left' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1, bgcolor: c.primarySoft, borderRadius: 1.5, color: c.primary }}><PhoneIcon sx={{ fontSize: 18 }} /></Box>
                  <Typography sx={{ fontSize: 15, color: c.text }}>{form.phone || user.phone || t.not_provided}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1, bgcolor: c.primarySoft, borderRadius: 1.5, color: c.primary }}><EmailIcon sx={{ fontSize: 18 }} /></Box>
                  <Typography noWrap sx={{ fontSize: 15, color: c.text }}>{user.email || t.not_provided}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ p: 1, bgcolor: c.primarySoft, borderRadius: 1.5, color: c.primary, flexShrink: 0 }}><LocationIcon sx={{ fontSize: 18 }} /></Box>
                  <Typography sx={{ fontSize: 15, color: c.text }}>{form.hospitalName || doctor.hospitalName || t.not_provided}</Typography>
                </Stack>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ border: `1px solid ${c.line}`, borderRadius: 2, p: 4, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text, mb: 2 }}>{t.about}</Typography>
              <Typography sx={{ color: c.muted, fontSize: 15, lineHeight: 1.6, mb: 4 }}>
                {form.bio || doctor.bio || t.no_bio}
              </Typography>
              <Stack spacing={2.5}>
                <Box>
                  <Typography sx={{ color: c.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>{t.lbl_spec}</Typography>
                  <Chip label={form.specialization || doctor.specialization || 'N/A'} sx={{ bgcolor: c.primarySoft, color: c.primaryDark, fontWeight: 600 }} />
                </Box>
                <Box>
                  <Typography sx={{ color: c.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>{t.lbl_exp}</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: c.text }}>{(form.experience || doctor.experience) ? `${form.experience || doctor.experience} ${t.years}` : t.not_spec}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: c.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>{t.lbl_lang}</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: c.text }}>{finalLanguages.join(', ') || t.not_spec}</Typography>
                </Box>
                {(form.consultationFee > 0 || doctor.consultationFee > 0) && (
                  <Box>
                    <Typography sx={{ color: c.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>{t.lbl_fee}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: c.success }}>₹{form.consultationFee || doctor.consultationFee}</Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>

          {/* Right: Edit Form */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={0} sx={{ border: `1px solid ${c.line}`, borderRadius: 2, p: 4, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              {editing ? (
                <>
                  <Typography sx={{ fontSize: 20, fontWeight: 600, color: c.text, mb: 4 }}>{t.edit_details}</Typography>
                  <Stack spacing={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label={t.f_name} value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label={t.f_phone} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label={t.f_spec} value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label={t.f_qual} value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label={t.f_hosp} value={form.hospitalName} onChange={e => setForm(p => ({ ...p, hospitalName: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label={t.f_lic} value={form.medicalLicense} onChange={e => setForm(p => ({ ...p, medicalLicense: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label={t.f_fee} type="number" value={form.consultationFee} onChange={e => setForm(p => ({ ...p, consultationFee: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label={t.f_exp} type="number" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                    </Grid>
                    <TextField fullWidth label={t.f_lang} value={form.languages} onChange={e => setForm(p => ({ ...p, languages: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField fullWidth multiline minRows={4} label={t.f_bio} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Stack>
                </>
              ) : (
                <>
                  <Typography sx={{ fontSize: 20, fontWeight: 600, color: c.text, mb: 4 }}>{t.prof_info}</Typography>
                  <Grid container spacing={1}>
                    {[
                      [t.f_name, name],
                      ['Email', user.email],
                      [t.f_phone, user.phone],
                      [t.f_spec, doctor.specialization],
                      [t.f_qual, doctor.qualification],
                      [t.f_hosp, doctor.hospitalName],
                      [t.f_exp, doctor.experience ? `${doctor.experience} ${t.years}` : null],
                      [t.f_fee, doctor.consultationFee > 0 ? `₹${doctor.consultationFee}` : null],
                      [t.f_lic, doctor.medicalLicense]
                    ].map(([label, value]) => value ? (
                      <Grid item xs={12} md={6} key={label}>
                        <Box sx={{ py: 2, px: 2, borderRadius: 1.5, '&:hover': { bgcolor: c.bg } }}>
                          <Typography sx={{ fontSize: 12, color: c.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</Typography>
                          <Typography sx={{ mt: 0.5, fontSize: 16, fontWeight: 600, color: c.text }}>{value}</Typography>
                        </Box>
                      </Grid>
                    ) : null)}
                  </Grid>
                </>
              )}
            </Paper>
          </Box>
        </Stack>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{snackbar.message}</Alert>
      </Snackbar>
    </DoctorLayout>
  );
}
