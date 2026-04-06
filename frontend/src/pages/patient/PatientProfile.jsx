import React, { useState, useEffect } from 'react';
import { Avatar, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { PhotoCameraRounded as CameraIcon, EditRounded as EditIcon, SaveRounded as SaveIcon, CloseRounded as CloseIcon } from '@mui/icons-material';
import PatientShell from '../../components/patient/PatientShell';
import { fetchPatientProfile, updatePatientProfile } from '../../api/patientApi';
import { useLanguage } from '../../context/LanguageContext';
import { PATIENT_PROFILE_TRANSLATIONS } from '../../utils/translations/patient';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MyLocationRounded as LocationIcon } from '@mui/icons-material';

// Fix for leaflet default icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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
  const { language } = useLanguage();
  const t = PATIENT_PROFILE_TRANSLATIONS[language] || PATIENT_PROFILE_TRANSLATIONS['en'];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const getInitialUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch { return {}; }
  };

  const initialUser = getInitialUser();
  
  const [profileData, setProfileData] = useState({
    name: initialUser.full_name || initialUser.name || 'User',
    email: initialUser.email || '',
    phone: initialUser.phone || '',
    role: initialUser.role ? (initialUser.role.charAt(0).toUpperCase() + initialUser.role.slice(1)) : 'Patient',
    dob: '',
    age: '',
    gender: '',
    bloodGroup: '',
    address: '',
    profile_image: initialUser.profile_image || '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    location: { lat: 17.3850, lng: 78.4867 }
  });

  const [counts, setCounts] = useState({
    consultations: 0,
    prescriptions: 0,
    records: 0
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching patient profile...');
        const res = await fetchPatientProfile();
        console.log('Profile response:', res);

        if (res && res.success) {
          const { user, profile, counts: resCounts } = res;
          
          const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = { 
            ...cachedUser, 
            full_name: user.full_name, 
            name: user.full_name, // Sync both for compatibility
            email: user.email, 
            phone: user.phone, 
            profile_image: user.profile_image,
            role: user.role
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));

          const newData = {
            name: user.full_name || 'User',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Patient',
            profile_image: user.profile_image || '',
            dob: profile?.dob || '',
            age: profile?.age || '',
            gender: profile?.gender || '',
            bloodGroup: profile?.bloodGroup || '',
            address: profile?.address || '',
            emergencyContactName: profile?.emergency_contact?.name || '',
            emergencyContactRelation: profile?.emergency_contact?.relation || '',
            emergencyContactPhone: profile?.emergency_contact?.phone || '',
            location: profile?.location?.lat ? profile.location : { lat: 17.3850, lng: 78.4867 }
          };
          
          setProfileData(newData);
          setEditForm(newData);
          if (resCounts) setCounts(resCounts);
        } else {
          console.error('Failed to load profile: Success was false', res);
        }
      } catch (err) {
        console.error('Failed to load profile exception:', err);
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
      console.log('Update profile RAW response:', res);
      
      if (res && res.success) {
        const { user, profile, counts: resCounts } = res;
        
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { 
          ...cachedUser, 
          full_name: user.full_name,
          name: user.full_name,
          email: user.email, 
          phone: user.phone, 
          profile_image: user.profile_image,
          role: user.role
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        const newData = {
          name: user.full_name || 'User',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Patient',
          profile_image: user.profile_image || '',
          dob: profile?.dob || '',
          age: profile?.age || '',
          gender: profile?.gender || '',
          bloodGroup: profile?.bloodGroup || '',
          address: profile?.address || '',
          emergencyContactName: profile?.emergency_contact?.name || '',
          emergencyContactRelation: profile?.emergency_contact?.relation || '',
          emergencyContactPhone: profile?.emergency_contact?.phone || '',
          location: profile?.location?.lat ? profile.location : { lat: 17.3850, lng: 78.4867 }
        };
        setProfileData(newData);
        if (resCounts) {
          console.log('Setting counts:', resCounts);
          setCounts(resCounts);
        }
        setIsEditing(false);
      } else {
        console.error('Update failed: res.success is false', res);
        alert(res?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile EXCEPTION:', err);
      // More detailed alert to catch "next is not a function" source
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update profile';
      const detail = err.response?.data ? JSON.stringify(err.response.data) : (err.stack || '');
      alert(`${errorMsg}\n\nDetails: ${detail.substring(0, 200)}`);
    } finally {
      setSaving(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const village = addr.village || addr.town || addr.suburb || addr.neighbourhood || '';
        const mandal = addr.county || addr.subdistrict || '';
        const dist = addr.state_district || addr.county || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';
        
        const fullParts = [village, mandal, dist, state, pincode].filter(Boolean);
        return fullParts.join(', ');
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.error('Reverse geocode failed:', err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleSaveDirectly = async (fields) => {
    try {
      setSaving(true);
      
      let updatedFields = { ...fields };
      if (fields.location && !fields.address) {
        const addrText = await reverseGeocode(fields.location.lat, fields.location.lng);
        updatedFields.address = addrText;
      }
      
      const res = await updatePatientProfile({ ...profileData, ...updatedFields });
      if (res && res.success) {
        const { user, profile } = res;
        const newData = {
          ...profileData,
          name: user.full_name || profileData.name,
          email: user.email || profileData.email,
          phone: user.phone || profileData.phone,
          profile_image: user.profile_image || profileData.profile_image,
          address: profile?.address || profileData.address,
          location: profile?.location || profileData.location
        };
        setProfileData(newData);
        setEditForm(newData);
      }
    } catch (err) {
      console.error('Direct save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(t.file_size_error);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profile_image: reader.result }));
      };
      reader.readAsDataURL(file);
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
              {t.title}
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16 }}>
              {isEditing ? t.subtitle_edit : t.subtitle_view}
            </Typography>
          </Box>

          {!isEditing && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button onClick={handleEditClick} startIcon={<EditIcon />} sx={{ px: 3, py: 1.25, borderRadius: 1.5, border: `1px solid ${colors.primary}`, bgcolor: colors.primary, color: '#fff', textTransform: 'none', fontSize: 14, fontWeight: 600, '&:hover': { bgcolor: colors.primaryDark } }}>
                {t.edit_profile}
              </Button>
            </Stack>
          )}
          {isEditing && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button onClick={handleCancelEdit} startIcon={<CloseIcon />} sx={{ px: 3, py: 1.25, borderRadius: 1.5, border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, textTransform: 'none', fontSize: 14, fontWeight: 600 }}>
                {t.cancel}
              </Button>
              <Button onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} sx={{ px: 3, py: 1.25, borderRadius: 1.5, border: `1px solid ${colors.primary}`, bgcolor: colors.primary, color: '#fff', textTransform: 'none', fontSize: 14, fontWeight: 600, '&:hover': { bgcolor: colors.primaryDark } }}>
                {t.save_changes}
              </Button>
            </Stack>
          )}
        </Stack>

        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={isEditing ? editForm.profile_image : profileData.profile_image}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: (isEditing ? editForm.profile_image : profileData.profile_image) ? 'transparent' : colors.primarySoft,
                    color: colors.primaryDark,
                    fontSize: 36,
                    fontWeight: 600
                  }}
                >
                  {initials(isEditing ? editForm.name : profileData.name)}
                </Avatar>
                {isEditing && (
                  <Box component="label" sx={{ position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: '50%', bgcolor: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', cursor: 'pointer', '&:hover': { bgcolor: colors.primaryDark } }}>
                    <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
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
                    placeholder={t.full_name_placeholder} 
                  />
                ) : (
                  <Typography sx={{ fontSize: 28, fontWeight: 600, color: colors.text }}>
                    {profileData.name}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 1 }}>
                  <Typography sx={{ color: colors.muted, fontSize: 15 }}>{t.role_label} {profileData.role}</Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" justifyContent={{ xs: 'center', lg: 'flex-end' }} sx={{ width: { xs: '100%', lg: 'auto' } }}>
              {[
                [counts.consultations, t.stats.consultations],
                [counts.prescriptions, t.stats.prescriptions],
                [counts.records, t.stats.records]
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
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.text }}>{t.basic_info.title}</Typography>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              {[
                { label: t.basic_info.dob, key: 'dob', placeholder: t.basic_info.dob_placeholder },
                { label: t.basic_info.age, key: 'age', placeholder: t.basic_info.age_placeholder },
                { label: t.basic_info.gender, key: 'gender', placeholder: t.basic_info.gender_placeholder, options: t.basic_info.gender_options || ['Male', 'Female', 'Other', 'Prefer not to say'] },
                { label: t.basic_info.blood_group, key: 'bloodGroup', placeholder: t.basic_info.blood_group_placeholder, options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }
              ].map(({ label, key, placeholder, options }) => (
                <Box key={key}>
                  <Typography sx={{ color: colors.muted, fontSize: 14 }}>{label}</Typography>
                  {isEditing ? (
                    options ? (
                      <TextField 
                        select
                        name={key}
                        value={editForm[key]}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        sx={{ mt: 1 }}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="" disabled>{placeholder}</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </TextField>
                    ) : (
                      <TextField 
                        name={key}
                        value={editForm[key]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        fullWidth
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )
                  ) : (
                    <Typography sx={{ mt: 0.5, color: profileData[key] ? colors.text : colors.gray, fontSize: 15, fontWeight: profileData[key] ? 500 : 400 }}>
                      {profileData[key] || t.not_set}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.text, mb: 3 }}>{t.contact_info.title}</Typography>
            <Stack spacing={0}>
              {[
                [t.contact_info.mobile, 'phone', t.contact_info.mobile_placeholder],
                [t.contact_info.email, 'email', t.contact_info.email_placeholder],
                [t.contact_info.address, 'address', t.contact_info.address_placeholder]
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
                          InputProps={key === 'address' ? {
                            endAdornment: (
                              <Button 
                                size="small" 
                                onClick={async () => {
                                  if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(async (pos) => {
                                      const { latitude, longitude } = pos.coords;
                                      const addrText = await reverseGeocode(latitude, longitude);
                                      setEditForm(prev => ({ 
                                        ...prev, 
                                        location: { lat: latitude, lng: longitude },
                                        address: addrText
                                      }));
                                    });
                                  }
                                }}
                                sx={{ minWidth: 'auto', p: 0.5, borderRadius: 1 }}
                              >
                                📍
                              </Button>
                            )
                          } : undefined}
                        />
                    ) : (
                      <Box>
                        <Typography sx={{ mt: 0.5, fontSize: 15, color: profileData[key] ? colors.text : colors.gray, fontWeight: profileData[key] ? 500 : 400 }}>
                          {profileData[key] || t.not_provided}
                        </Typography>
                        {key === 'address' && profileData.location?.lat && (
                          <Typography sx={{ mt: 0.5, fontSize: 11, color: colors.muted, bgcolor: colors.soft, display: 'inline-block', px: 1, py: 0.25, borderRadius: 1 }}>
                            {t.coordinates} {profileData.location.lat.toFixed(6)}, {profileData.location.lng.toFixed(6)}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                  {!isEditing && (
                    <Stack direction="row" spacing={1}>
                      {key === 'address' && (
                        <Button
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(async (pos) => {
                                handleSaveDirectly({ 
                                  location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                                  address: `Current Location: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
                                });
                              });
                            }
                          }}
                          sx={{
                            minWidth: 40, px: 2, py: 0.75, borderRadius: 1.5, border: `1px solid ${colors.line}`,
                            bgcolor: '#fff', color: colors.primary, textTransform: 'none', fontSize: 13, fontWeight: 500
                          }}
                        >
                          <LocationIcon sx={{ fontSize: 16 }} />
                        </Button>
                      )}
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
                        {profileData[key] ? t.verified : t.add}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.text, mb: 3 }}>{t.emergency.title}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {[
                { label: t.emergency.name, key: 'emergencyContactName', placeholder: t.emergency.name_placeholder },
                { label: t.emergency.relation, key: 'emergencyContactRelation', placeholder: t.emergency.relation_placeholder },
                { label: t.emergency.phone, key: 'emergencyContactPhone', placeholder: t.emergency.phone_placeholder }
              ].map(({ label, key, placeholder }) => (
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
                      {profileData[key] || t.not_set}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.text }}>{t.geo.title}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>{t.geo.subtitle}</Typography>
              </Box>
              {isEditing && (
                <Button 
                  variant="outlined" 
                  startIcon={<LocationIcon />} 
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setEditForm(prev => ({ ...prev, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
                      });
                    }
                  }}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  {t.geo.detect}
                </Button>
              )}
            </Stack>
            
            <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', border: `1px solid ${colors.line}`, position: 'relative' }}>
              <MapContainer 
                center={[isEditing ? editForm.location.lat : profileData.location.lat, isEditing ? editForm.location.lng : profileData.location.lng]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[isEditing ? editForm.location.lat : profileData.location.lat, isEditing ? editForm.location.lng : profileData.location.lng]} />
                {isEditing && <LocationPicker onLocationSelect={(lat, lng) => setEditForm(prev => ({ ...prev, location: { lat, lng } }))} />}
                <MapUpdater center={[isEditing ? editForm.location.lat : profileData.location.lat, isEditing ? editForm.location.lng : profileData.location.lng]} />
              </MapContainer>
              {!isEditing && (
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 1000, bgcolor: 'rgba(255,255,255,0.01)', cursor: 'default' }} />
              )}
            </Box>
            <Typography sx={{ mt: 2, fontSize: 12, color: colors.muted, textAlign: 'center' }}>
              {t.coordinates} {isEditing ? editForm.location.lat.toFixed(4) : profileData.location.lat.toFixed(4)}, {isEditing ? editForm.location.lng.toFixed(4) : profileData.location.lng.toFixed(4)}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </PatientShell>
  );
}

function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}
