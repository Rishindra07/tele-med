import React, { useState, useEffect } from 'react';
import { Avatar, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { PhotoCameraRounded as CameraIcon, EditRounded as EditIcon, SaveRounded as SaveIcon, CloseRounded as CloseIcon } from '@mui/icons-material';
import PatientShell from '../../components/patient/PatientShell';
import { fetchPatientProfile, updatePatientProfile } from '../../api/patientApi';

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

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

export default function PatientProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: 'User',
    email: '',
    phone: '',
    role: 'Patient',
    dob: '',
    gender: '',
    bloodGroup: '',
    address: ''
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetchPatientProfile();
        if (res.success) {
          const { user, profile } = res;
          
          // Update local storage so the shell reflects changes if any
          const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...cachedUser, name: user.full_name, email: user.email, phone: user.phone }));

          const newData = {
            name: user.full_name || 'User',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'Patient',
            dob: profile?.dob || '',
            gender: profile?.gender || '',
            bloodGroup: profile?.bloodGroup || '',
            address: profile?.address || ''
          };
          setProfileData(newData);
          setEditForm(newData);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleEditClick = () => {
    setEditForm({ ...profileData });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ ...profileData });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updatePatientProfile(editForm);
      if (res.success) {
        const { user, profile } = res;
        
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...cachedUser, name: user.full_name, email: user.email, phone: user.phone }));
        // dispatch custom event to notify shell
        window.dispatchEvent(new Event('storage'));

        const newData = {
          name: user.full_name || 'User',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'Patient',
          dob: profile?.dob || '',
          gender: profile?.gender || '',
          bloodGroup: profile?.bloodGroup || '',
          address: profile?.address || ''
        };
        setProfileData(newData);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PatientShell activeSetting="profile">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </PatientShell>
    );
  }

  return (
    <PatientShell activeSetting="profile">
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: colors.text, fontFamily: 'Inter, sans-serif' }}>
              My Profile
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16 }}>
              {isEditing ? 'Edit your personal, health and account information' : 'Manage your personal, health and account information'}
            </Typography>
          </Box>

          {!isEditing && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button onClick={handleEditClick} startIcon={<EditIcon />} sx={{ px: 3, py: 1.25, borderRadius: 1.5, border: `1px solid ${colors.primary}`, bgcolor: colors.primary, color: '#fff', textTransform: 'none', fontSize: 14, fontWeight: 600, '&:hover': { bgcolor: colors.primaryDark } }}>
                Edit Profile
              </Button>
            </Stack>
          )}
          {isEditing && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button onClick={handleCancelEdit} startIcon={<CloseIcon />} sx={{ px: 3, py: 1.25, borderRadius: 1.5, border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, textTransform: 'none', fontSize: 14, fontWeight: 600 }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} sx={{ px: 3, py: 1.25, borderRadius: 1.5, border: `1px solid ${colors.primary}`, bgcolor: colors.primary, color: '#fff', textTransform: 'none', fontSize: 14, fontWeight: 600, '&:hover': { bgcolor: colors.primaryDark } }}>
                Save Changes
              </Button>
            </Stack>
          )}
        </Stack>

        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: colors.primarySoft,
                    color: colors.primaryDark,
                    fontSize: 36,
                    fontWeight: 600
                  }}
                >
                  {initials(isEditing ? editForm.name : profileData.name)}
                </Avatar>
                {isEditing && (
                  <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: '50%', bgcolor: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', cursor: 'pointer', '&:hover': { bgcolor: colors.primaryDark } }}>
                    <CameraIcon sx={{ fontSize: 16 }} />
                  </Box>
                )}
              </Box>

              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                {isEditing ? (
                  <TextField 
                    name="name" 
                    value={editForm.name} 
                    onChange={handleChange} 
                    variant="standard" 
                    InputProps={{ style: { fontSize: 24, fontWeight: 600, color: colors.text } }} 
                    placeholder="Full Name" 
                  />
                ) : (
                  <Typography sx={{ fontSize: 28, fontWeight: 600, color: colors.text }}>
                    {profileData.name}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 1 }}>
                  <Typography sx={{ color: colors.muted, fontSize: 15 }}>Role: {profileData.role}</Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" justifyContent={{ xs: 'center', lg: 'flex-end' }} sx={{ width: { xs: '100%', lg: 'auto' } }}>
              {[
                ['0', 'Consultations'],
                ['0', 'Prescriptions'],
                ['0', 'Records']
              ].map(([value, label]) => (
                <Box key={label} sx={{ width: 100, p: 2, borderRadius: 1.5, bgcolor: colors.soft, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 24, fontWeight: 600, color: colors.text }}>{value}</Typography>
                  <Typography sx={{ color: colors.muted, fontSize: 13, mt: 0.5 }}>{label}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Stack spacing={4}>
          <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.text }}>Basic Information</Typography>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              {[
                ['Date of birth', 'dob', 'e.g. 15 Aug 1990'],
                ['Gender', 'gender', 'e.g. Male / Female'],
                ['Blood group', 'bloodGroup', 'e.g. O+']
              ].map(([label, key, placeholder]) => (
                <Box key={key}>
                  <Typography sx={{ color: colors.muted, fontSize: 14 }}>{label}</Typography>
                  {isEditing ? (
                    <TextField 
                      name={key}
                      value={editForm[key]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      fullWidth
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography sx={{ mt: 0.5, color: profileData[key] ? colors.text : colors.gray, fontSize: 15, fontWeight: profileData[key] ? 500 : 400 }}>
                      {profileData[key] || 'Not set'}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.text, mb: 3 }}>Contact Information</Typography>
            <Stack spacing={0}>
              {[
                ['Mobile number', 'phone', 'e.g. +91 9876543210'],
                ['Email address', 'email', 'e.g. user@example.com'],
                ['Address', 'address', 'e.g. 123 Health Ave, Mumbai']
              ].map(([label, key, placeholder]) => (
                <Stack key={label} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ py: 2, borderBottom: `1px solid ${colors.soft}`, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography sx={{ color: colors.muted, fontSize: 14 }}>{label}</Typography>
                    {isEditing ? (
                      <TextField
                        name={key}
                        value={editForm[key]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        fullWidth
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    ) : (
                      <Typography sx={{ mt: 0.5, fontSize: 15, color: profileData[key] ? colors.text : colors.gray, fontWeight: profileData[key] ? 500 : 400 }}>
                        {profileData[key] || 'Not provided'}
                      </Typography>
                    )}
                  </Box>
                  {!isEditing && (
                    <Button
                      sx={{
                        minWidth: 90,
                        px: 2,
                        py: 0.75,
                        borderRadius: 1.5,
                        border: `1px solid ${profileData[key] ? colors.success : colors.line}`,
                        bgcolor: profileData[key] ? '#e6f4ea' : '#fff',
                        color: profileData[key] ? colors.success : colors.text,
                        textTransform: 'none',
                        fontSize: 13,
                        fontWeight: 500
                      }}
                    >
                      {profileData[key] ? 'Verified' : 'Add'}
                    </Button>
                  )}
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </PatientShell>
  );
}
