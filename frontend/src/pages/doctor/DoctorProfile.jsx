import React, { useEffect, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress,
  Divider, Grid, Paper, Snackbar, Stack, Switch, TextField, Typography
} from '@mui/material';
import {
  EmailOutlined as EmailIcon,
  LocationOnOutlined as LocationIcon,
  PhoneOutlined as PhoneIcon,
  SaveRounded as SaveIcon,
  EditRounded as EditIcon,
  LanguageRounded as LanguageIcon,
  VerifiedUserRounded as VerifiedIcon,
  AssignmentIndRounded as DetailIcon
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import { fetchDoctorProfile, updateDoctorProfile } from '../../api/doctorApi';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_PROFILE_TRANSLATIONS } from '../../utils/translations/doctor';

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
      const updatedUserProps = { 
        full_name: form.full_name, 
        phone: form.phone,
        specialization: form.specialization 
      };
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUserProps }));
      
      setProfile(prev => ({ 
        ...prev, 
        doctor: res.doctor,
        user: { ...prev.user, ...updatedUserProps }
      }));
      setEditing(false);
      setSnackbar({ open: true, severity: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const doctor = profile?.doctor || {};
  const user = profile?.user || {};
  const name = editing ? form.full_name : (user.full_name || 'Doctor');
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
        
        {/* Header with Glassmorphism effect */}
        <Paper elevation={0} sx={{ 
          p: 3, mb: 4, borderRadius: 3, 
          bgcolor: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(10px)',
          border: `1px solid ${c.line}`,
          display: 'flex', flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, color: c.text, letterSpacing: '-0.5px' }}>
              {t.title}
            </Typography>
            <Typography sx={{ color: c.muted, fontSize: 16 }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
            {editing ? (
              <>
                <Button onClick={() => setEditing(false)} variant="outlined" sx={{ flex: 1, px: 3, py: 1.2, borderRadius: 2, borderColor: c.line, color: c.text, textTransform: 'none', fontWeight: 600 }}>
                  {t.cancel}
                </Button>
                <Button onClick={handleSave} disabled={saving} variant="contained" startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />} sx={{ flex: 1, px: 4, py: 1.2, borderRadius: 2, bgcolor: c.primary, color: '#fff', textTransform: 'none', fontWeight: 600, boxShadow: `0 8px 16px ${c.primary}30` }}>
                  {saving ? t.saving : t.save_changes}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} variant="contained" startIcon={<EditIcon />} sx={{ px: 4, py: 1.2, borderRadius: 2, bgcolor: c.primary, color: '#fff', textTransform: 'none', fontWeight: 600, boxShadow: `0 8px 16px ${c.primary}30` }}>
                {t.edit_profile}
              </Button>
            )}
          </Stack>
        </Paper>

        <Grid container spacing={4}>
          {/* Left Column: Quick Snapshot */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${c.line}`, textAlign: 'center', bgcolor: '#fff' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar sx={{ width: 120, height: 120, bgcolor: c.primarySoft, color: c.primary, fontSize: '3rem', fontWeight: 700, border: `4px solid #fff`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    {initials(name)}
                  </Avatar>
                  <Box sx={{ position: 'absolute', bottom: 5, right: 5, width: 24, height: 24, borderRadius: '50%', bgcolor: available ? c.success : c.danger, border: '3px solid #fff' }} />
                </Box>
                
                <Typography sx={{ fontSize: 24, fontWeight: 700, color: c.text }}>{name}</Typography>
                <Typography sx={{ color: c.primary, fontSize: 16, fontWeight: 600, mb: 3 }}>{form.specialization || doctor.specialization || t.spec_def}</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: available ? c.successSoft : c.soft, mb: 4 }}>
                  <Typography sx={{ color: available ? c.success : c.muted, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
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
                </Box>

                <Divider sx={{ mb: 3 }} />
                
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: c.primarySoft, borderRadius: 1.5, color: c.primary }}><PhoneIcon sx={{ fontSize: 20 }} /></Box>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>{t.f_phone}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{form.phone || user.phone || t.not_provided}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: c.primarySoft, borderRadius: 1.5, color: c.primary }}><EmailIcon sx={{ fontSize: 20 }} /></Box>
                    <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>Email</Typography>
                      <Typography noWrap sx={{ fontSize: 15, fontWeight: 600 }}>{user.email || t.not_provided}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: c.primarySoft, borderRadius: 1.5, color: c.primary }}><LocationIcon sx={{ fontSize: 20 }} /></Box>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>{t.f_hosp}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{form.hospitalName || doctor.hospitalName || t.not_provided}</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${c.line}`, bgcolor: '#fff' }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: c.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DetailIcon sx={{ color: c.primary }} /> {t.about}
                </Typography>
                <Typography sx={{ color: c.muted, fontSize: 15, lineHeight: 1.6, mb: 4 }}>
                  {form.bio || doctor.bio || t.no_bio}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography sx={{ fontSize: 11, color: c.muted, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>{t.lbl_exp}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{form.experience || doctor.experience || 0} {t.years}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography sx={{ fontSize: 11, color: c.muted, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>{t.lbl_lang}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{finalLanguages.length} {t.lbl_lang}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Column: Detailed Info / Form */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${c.line}`, bgcolor: '#fff', height: '100%' }}>
              {editing ? (
                <Stack spacing={4}>
                  <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5 }}>{t.edit_details}</Typography>
                    <Typography sx={{ color: c.muted, fontSize: 14 }}>Update your professional and contact information.</Typography>
                  </Box>
                  
                  <Box sx={{ bgcolor: c.bg, p: 3, borderRadius: 3 }}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label={t.f_name} value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} variant="outlined" sx={{ bgcolor: '#fff' }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label={t.f_phone} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} variant="outlined" sx={{ bgcolor: '#fff' }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label={t.f_spec} value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} variant="outlined" sx={{ bgcolor: '#fff' }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label={t.f_qual} value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} variant="outlined" sx={{ bgcolor: '#fff' }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label={t.f_hosp} value={form.hospitalName} onChange={e => setForm(p => ({ ...p, hospitalName: e.target.value }))} variant="outlined" sx={{ bgcolor: '#fff' }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label={t.f_lic} value={form.medicalLicense} onChange={e => setForm(p => ({ ...p, medicalLicense: e.target.value }))} variant="outlined" sx={{ bgcolor: '#fff' }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label={t.f_fee} type="number" value={form.consultationFee} onChange={e => setForm(p => ({ ...p, consultationFee: e.target.value }))} variant="outlined" sx={{ bgcolor: '#fff' }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label={t.f_exp} type="number" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} variant="outlined" sx={{ bgcolor: '#fff' }} />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField fullWidth label={t.f_lang} value={form.languages} onChange={e => setForm(p => ({ ...p, languages: e.target.value }))} variant="outlined" sx={{ bgcolor: '#fff' }} helperText="Separate by commas (e.g. English, Hindi)" />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField fullWidth multiline rows={4} label={t.f_bio} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} variant="outlined" sx={{ bgcolor: '#fff' }} />
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              ) : (
                <Stack spacing={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5 }}>{t.prof_info}</Typography>
                      <Typography sx={{ color: c.muted, fontSize: 14 }}>Comprehensive view of your professional profile.</Typography>
                    </Box>
                    <Chip icon={<VerifiedIcon />} label="Verified" color="success" size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                  </Box>

                  <Grid container spacing={1}>
                    {[
                      { label: t.f_name, value: name, icon: <DetailIcon fontSize="small" /> },
                      { label: 'Email', value: user.email, icon: <EmailIcon fontSize="small" /> },
                      { label: t.f_phone, value: user.phone, icon: <PhoneIcon fontSize="small" /> },
                      { label: t.f_spec, value: doctor.specialization, icon: <VerifiedIcon fontSize="small" /> },
                      { label: t.f_qual, value: doctor.qualification, icon: <DetailIcon fontSize="small" /> },
                      { label: t.f_hosp, value: doctor.hospitalName, icon: <LocationIcon fontSize="small" /> },
                      { label: t.f_exp, value: doctor.experience ? `${doctor.experience} ${t.years}` : '0 years', icon: <DetailIcon fontSize="small" /> },
                      { label: t.f_fee, value: doctor.consultationFee > 0 ? `₹${doctor.consultationFee}` : 'Free', icon: <DetailIcon fontSize="small" /> },
                      { label: t.f_lic, value: doctor.medicalLicense, icon: <DetailIcon fontSize="small" /> },
                      { label: t.lbl_lang, value: finalLanguages.join(', ') || 'N/A', icon: <LanguageIcon fontSize="small" /> }
                    ].map((item, idx) => (
                      <Grid size={{ xs: 12, md: 6 }} key={idx}>
                        <Box sx={{ p: 2, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center', transition: 'all 0.2s', '&:hover': { bgcolor: c.soft } }}>
                          <Box sx={{ color: c.muted }}>{item.icon}</Box>
                          <Box>
                            <Typography sx={{ fontSize: 11, color: c.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</Typography>
                            <Typography sx={{ fontSize: 16, fontWeight: 600, color: c.text }}>{item.value || 'N/A'}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mt: 2, p: 3, borderRadius: 3, bgcolor: c.bg, border: `1px solid ${c.line}` }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.muted, mb: 1.5, textTransform: 'uppercase' }}>Professional Bio</Typography>
                    <Typography sx={{ fontSize: 15, lineHeight: 1.8, color: c.text }}>{doctor.bio || 'No professional bio provided yet. Update your profile to add one.'}</Typography>
                  </Box>
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', fontWeight: 600, border: `1px solid ${snackbar.severity === 'success' ? c.success : c.danger}` }}>{snackbar.message}</Alert>
      </Snackbar>
    </DoctorLayout>
  );
}
