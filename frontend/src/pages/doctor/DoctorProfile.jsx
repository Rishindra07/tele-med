import React, { useEffect, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress,
  Divider, Snackbar, Stack, Switch, TextField, Typography
} from '@mui/material';
import {
  EmailOutlined as EmailIcon,
  LocationOnOutlined as LocationIcon,
  PhoneOutlined as PhoneIcon,
  SaveRounded as SaveIcon
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import { fetchDoctorProfile, updateDoctorProfile } from '../../api/doctorApi';

const colors = {
  paper: '#fffdf8', line: '#d8d0c4', soft: '#e9e2d8',
  text: '#2c2b28', muted: '#8b857d',
  green: '#26a37c', greenSoft: '#dff3eb', greenDark: '#176d57',
  blue: '#4a90e2', blueSoft: '#e7f0fe',
  amber: '#d18a1f', amberSoft: '#fbefdc'
};

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || 'DR';

export default function DoctorProfile() {
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
          experience: dr.experience || 0
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
      const res = await updateDoctorProfile({ ...form, is_available_for_booking: available });
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

  if (loading) return (
    <DoctorLayout>
      <Box sx={{ py: 12, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: colors.green }} />
      </Box>
    </DoctorLayout>
  );

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              Doctor Profile
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18 }}>
              Review and update your professional details
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            {editing ? (
              <>
                <Button onClick={() => setEditing(false)} sx={{ px: 2.5, py: 1.1, borderRadius: 3, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 15 }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} startIcon={<SaveIcon />} sx={{ px: 2.5, py: 1.1, borderRadius: 3, bgcolor: colors.green, color: '#fff', textTransform: 'none', fontSize: 15, '&:hover': { bgcolor: colors.greenDark } }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} sx={{ px: 2.5, py: 1.1, borderRadius: 3, border: `1px solid ${colors.green}`, color: colors.green, textTransform: 'none', fontSize: 15 }}>
                Edit Profile
              </Button>
            )}
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Left: Profile Card */}
          <Box sx={{ width: { xs: '100%', md: '35%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ border: `1px solid ${colors.line}`, borderRadius: 4, p: 3, bgcolor: colors.paper, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 18, mb: 2, textAlign: 'left' }}>Doctor Profile</Typography>
              <Avatar sx={{ width: 92, height: 92, margin: '0 auto', bgcolor: colors.greenSoft, color: colors.green, fontSize: '2rem', fontWeight: 800, border: '4px solid #dceee8', mb: 1.5 }}>
                {initials(name)}
              </Avatar>
              <Typography sx={{ fontSize: 22, fontFamily: 'Georgia, serif' }}>{name}</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 14.5, mb: 2 }}>{doctor.specialization || 'Specialist'}</Typography>

              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>Available</Typography>
                <Switch
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  disabled={!editing}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.green }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.green } }}
                />
              </Stack>

              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5} sx={{ textAlign: 'left' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ p: 0.8, bgcolor: '#eef9f4', borderRadius: 1.5, color: colors.green }}><PhoneIcon sx={{ fontSize: 14 }} /></Box>
                  <Typography sx={{ fontSize: 14.5 }}>{user.phone || 'Not provided'}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ p: 0.8, bgcolor: '#eef9f4', borderRadius: 1.5, color: colors.green }}><EmailIcon sx={{ fontSize: 14 }} /></Box>
                  <Typography noWrap sx={{ fontSize: 14.5 }}>{user.email || 'Not provided'}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ p: 0.8, bgcolor: '#eef9f4', borderRadius: 1.5, color: colors.green, flexShrink: 0 }}><LocationIcon sx={{ fontSize: 14 }} /></Box>
                  <Typography sx={{ fontSize: 14.5 }}>{doctor.hospitalName || 'Not provided'}</Typography>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ border: `1px solid ${colors.line}`, borderRadius: 4, p: 3, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 18, mb: 2 }}>About Doctor</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 14.5, lineHeight: 1.7 }}>
                {doctor.bio || 'No bio added yet.'}
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Box>
                  <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>Specialty</Typography>
                  <Chip label={doctor.specialization || 'N/A'} sx={{ bgcolor: colors.blueSoft, color: colors.blue, fontSize: 12.5, mt: 0.6 }} />
                </Box>
                <Box>
                  <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>Experience</Typography>
                  <Typography sx={{ mt: 0.3, fontSize: 14.5 }}>{doctor.experience ? `${doctor.experience} years` : 'Not specified'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>Languages</Typography>
                  <Typography sx={{ mt: 0.3, fontSize: 14.5 }}>{doctor.languages?.join(', ') || 'Not specified'}</Typography>
                </Box>
                {doctor.consultationFee > 0 && (
                  <Box>
                    <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>Consultation Fee</Typography>
                    <Typography sx={{ mt: 0.3, fontSize: 14.5 }}>₹{doctor.consultationFee}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>

          {/* Right: Edit Form */}
          <Box sx={{ flex: 1 }}>
            {editing ? (
              <Box sx={{ border: `1px solid ${colors.line}`, borderRadius: 4, p: 3, bgcolor: colors.paper }}>
                <Typography sx={{ fontSize: 18, mb: 2.5 }}>Edit Details</Typography>
                <Stack spacing={2.2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField fullWidth label="Full Name" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
                    <TextField fullWidth label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField fullWidth label="Specialization" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} />
                    <TextField fullWidth label="Qualification" value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} />
                  </Stack>
                  <TextField fullWidth label="Hospital / Clinic Name" value={form.hospitalName} onChange={e => setForm(p => ({ ...p, hospitalName: e.target.value }))} />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField fullWidth label="Consultation Fee (₹)" type="number" value={form.consultationFee} onChange={e => setForm(p => ({ ...p, consultationFee: e.target.value }))} />
                    <TextField fullWidth label="Experience (years)" type="number" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} />
                  </Stack>
                  <TextField fullWidth multiline minRows={4} label="Professional Bio" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
                </Stack>
              </Box>
            ) : (
              <Box sx={{ border: `1px solid ${colors.line}`, borderRadius: 4, p: 3, bgcolor: colors.paper }}>
                <Typography sx={{ fontSize: 18, mb: 2 }}>Professional Information</Typography>
                {[
                  ['Full Name', name],
                  ['Email', user.email],
                  ['Phone', user.phone],
                  ['Specialization', doctor.specialization],
                  ['Qualification', doctor.qualification],
                  ['Hospital', doctor.hospitalName],
                  ['Experience', doctor.experience ? `${doctor.experience} years` : null],
                  ['Consultation Fee', doctor.consultationFee > 0 ? `₹${doctor.consultationFee}` : null],
                  ['Medical License', doctor.medicalLicense]
                ].map(([label, value]) => value ? (
                  <Box key={label} sx={{ py: 1.5, borderBottom: `1px solid ${colors.soft}` }}>
                    <Typography sx={{ fontSize: 12.5, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</Typography>
                    <Typography sx={{ mt: 0.4, fontSize: 15.5 }}>{value}</Typography>
                  </Box>
                ) : null)}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>
    </DoctorLayout>
  );
}
