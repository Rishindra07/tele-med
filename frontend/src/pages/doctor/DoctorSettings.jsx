import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import {
  NotificationsNoneRounded as NotificationIcon,
  SaveRounded as SaveIcon,
  WarningAmberRounded as WarningIcon
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import { fetchDoctorProfile, updateDoctorProfile } from '../../api/doctorApi';
import { Alert, CircularProgress, Snackbar } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_SETTINGS_TRANSLATIONS } from '../../utils/translations/doctor';

const colors = {
  paper: '#fffdf8',
  line: '#d8d0c4',
  soft: '#e9e2d8',
  text: '#2c2b28',
  muted: '#8b857d',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  blue: '#4a90e2',
  amber: '#c57d17',
  amberSoft: '#fbefdc',
  red: '#d9635b',
  redSoft: '#fdeaea'
};

function Row({ name, desc, action, danger = false }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
      sx={{ py: 1.7, borderBottom: `1px solid ${danger ? '#f7d4d4' : colors.soft}` }}
    >
      <Box sx={{ pr: 2 }}>
        <Typography sx={{ fontSize: 15, color: danger ? '#892727' : colors.text }}>{name}</Typography>
        <Typography sx={{ mt: 0.35, color: danger ? '#a24a4a' : colors.muted, fontSize: 13.5, lineHeight: 1.45 }}>
          {desc}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

function PillGroup({ options, selected, onSelect }) {
  return (
    <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
      {options.map((option) => (
        <Button
          key={option}
          onClick={() => onSelect?.(option)}
          sx={{
            px: 1.8,
            py: 0.7,
            borderRadius: 999,
            border: `1px solid ${selected === option ? colors.green : colors.line}`,
            bgcolor: selected === option ? colors.greenSoft : '#fff',
            color: selected === option ? '#0d5d49' : '#67625b',
            textTransform: 'none',
            fontSize: 13.5
          }}
        >
          {option}
        </Button>
      ))}
    </Stack>
  );
}

function Card({ children }) {
  return (
    <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
      {children}
    </Box>
  );
}

export default function DoctorSettings() {
  const { language: currentLanguage } = useLanguage();
  const t = DOCTOR_SETTINGS_TRANSLATIONS[currentLanguage] || DOCTOR_SETTINGS_TRANSLATIONS['en'];

  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  const [toggles, setToggles] = useState({
    appointmentAlerts: true,
    bookingRequests: true,
    cancellations: true,
    sms: true,
    push: true,
    email: false,
    autoConfirm: false,
    lowBandwidth: true,
    audioFallback: true,
    biometric: false,
    loginAlerts: true
  });
  const [language, setLanguage] = useState('English');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    clinic: '',
    bio: ''
  });

  React.useEffect(() => {
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
          bio: dr.bio || ''
        });
        setLanguage(usr.preferred_language === 'HI' ? 'Hindi' : 'English');
      } catch (err) {
        setSnackbar({ open: true, severity: 'error', message: 'Failed to load settings' });
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
        full_name: profile.name,
        phone: profile.phone,
        specialization: profile.specialization,
        hospitalName: profile.hospitalName,
        bio: profile.bio
      };
      await updateDoctorProfile(payload);
      
      // Update local storage so sidebar reflects the change
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...currentUser, 
        full_name: profile.name, 
        phone: profile.phone,
        specialization: profile.specialization 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSnackbar({ open: true, severity: 'success', message: 'Settings saved successfully' });
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const doctorName = profile.name || 'Doctor';
  const pageHeader = t.tabs[activeTab] || ['', ''];

  const toggle = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const actionButton = (label, kind = 'outline', onClick, disabled) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{
        px: 2.2,
        py: 0.8,
        borderRadius: 2.2,
        border: `1px solid ${kind === 'danger' ? colors.red : kind === 'outline' ? colors.green : colors.line}`,
        bgcolor: kind === 'filled' ? colors.green : '#fff',
        color: kind === 'filled' ? '#fff' : kind === 'danger' ? colors.red : kind === 'outline' ? colors.green : colors.text,
        textTransform: 'none',
        fontSize: 13.5
      }}
    >
      {label}
    </Button>
  );

  const renderPanel = () => {
    if (activeTab === 'account') {
      return (
        <Card>
          <Row
            name={t.account.overview}
            desc={t.account.overview_desc}
            action={actionButton(saving ? t.saving : t.account.save_btn, 'filled', handleSave, saving)}
          />
          <Stack spacing={2.1} sx={{ mt: 2 }}>
            <TextField
              label={t.account.full_name}
              value={profile.name}
              onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
            />
            <TextField
              label={t.account.specialty}
              value={profile.specialization}
              onChange={(event) => setProfile((prev) => ({ ...prev, specialization: event.target.value }))}
              fullWidth
            />
            <TextField
              label={t.account.clinic}
              value={profile.hospitalName}
              onChange={(event) => setProfile((prev) => ({ ...prev, hospitalName: event.target.value }))}
              fullWidth
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label={t.account.email}
                value={profile.email}
                onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
                fullWidth
              />
              <TextField
                label={t.account.phone}
                value={profile.phone}
                onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              label={t.account.bio}
              multiline
              minRows={4}
              value={profile.bio}
              onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2.4 }}>
            <Box sx={{ flex: 1, p: 2, borderRadius: 3, bgcolor: '#f5f1e9', border: `1px solid ${colors.soft}` }}>
              <Typography sx={{ fontSize: 14.5 }}>{t.account.verification}</Typography>
              <Typography sx={{ mt: 0.4, color: colors.green, fontSize: 13.5 }}>{t.account.verified}</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2, borderRadius: 3, bgcolor: '#f5f1e9', border: `1px solid ${colors.soft}` }}>
              <Typography sx={{ fontSize: 14.5 }}>{t.account.public_name}</Typography>
              <Typography sx={{ mt: 0.4, color: colors.muted, fontSize: 13.5 }}>{doctorName}</Typography>
            </Box>
          </Stack>
        </Card>
      );
    }

    if (activeTab === 'notification') {
      return (
        <Card>
          <Typography sx={{ color: '#a7a198', fontSize: 11, letterSpacing: 1.1, mb: 1 }}>{t.notification.appointments?.toUpperCase()}</Typography>
          <Row name={t.notification.upcoming} desc={t.notification.upcoming_desc} action={<Switch checked={toggles.appointmentAlerts} onChange={() => toggle('appointmentAlerts')} />} />
          <Row name={t.notification.booking} desc={t.notification.booking_desc} action={<Switch checked={toggles.bookingRequests} onChange={() => toggle('bookingRequests')} />} />
          <Row name={t.notification.cancel} desc={t.notification.cancel_desc} action={<Switch checked={toggles.cancellations} onChange={() => toggle('cancellations')} />} />
          <Typography sx={{ color: '#a7a198', fontSize: 11, letterSpacing: 1.1, mb: 1, mt: 2 }}>{t.notification.channels?.toUpperCase()}</Typography>
          <Row name={t.notification.sms} desc={t.notification.sms_desc} action={<Switch checked={toggles.sms} onChange={() => toggle('sms')} />} />
          <Row name={t.notification.push} desc={t.notification.push_desc} action={<Switch checked={toggles.push} onChange={() => toggle('push')} />} />
          <Row name={t.notification.email} desc={`${t.notification.email_desc} ${profile.email}`} action={<Switch checked={toggles.email} onChange={() => toggle('email')} />} />
          <Row name={t.notification.dnd} desc={t.notification.dnd_desc} action={<Stack direction="row" spacing={1}><Select size="small" value="10 PM"><MenuItem value="10 PM">10 PM</MenuItem></Select><Typography sx={{ alignSelf: 'center', color: colors.muted, fontSize: 12 }}>{t.notification.to}</Typography><Select size="small" value="7 AM"><MenuItem value="7 AM">7 AM</MenuItem></Select></Stack>} />
        </Card>
      );
    }

    if (activeTab === 'language') {
      return (
        <Card>
          <Row
            name={t.language.display}
            desc={t.language.display_desc}
            action={<PillGroup options={['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali']} selected={language} onSelect={setLanguage} />}
          />
          <Row
            name={t.language.time}
            desc={t.language.time_desc}
            action={<PillGroup options={['12h', '24h']} selected={timeFormat} onSelect={setTimeFormat} />}
          />
          <Row
            name={t.language.date}
            desc={t.language.date_desc}
            action={<PillGroup options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} selected={dateFormat} onSelect={setDateFormat} />}
          />
          <Row
            name={t.language.prescription}
            desc={t.language.prescription_desc}
            action={<Select size="small" value="English"><MenuItem value="English">English</MenuItem><MenuItem value="Hindi">Hindi</MenuItem></Select>}
          />
        </Card>
      );
    }

    if (activeTab === 'region') {
      return (
        <Stack spacing={3}>
          <Card>
            <Box sx={{ mb: 2.2 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: 14.5 }}>{t.region.connectivity}</Typography>
                <Typography sx={{ fontSize: 14.5, color: colors.green }}>72%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={72}
                sx={{ height: 8, borderRadius: 999, bgcolor: '#f0efe8', '& .MuiLinearProgress-bar': { bgcolor: colors.green } }}
              />
              <Typography sx={{ mt: 0.8, color: colors.muted, fontSize: 12.5 }}>
                {t.region.connectivity_desc}
              </Typography>
            </Box>
            <Row name={t.region.timezone} desc={t.region.timezone_desc} action={<Select size="small" value={timezone} onChange={(event) => setTimezone(event.target.value)}><MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem><MenuItem value="Asia/Dhaka">Asia/Dhaka</MenuItem><MenuItem value="Asia/Dubai">Asia/Dubai</MenuItem></Select>} />
            <Row name={t.region.slot_length} desc={t.region.slot_length_desc} action={<Select size="small" value="20 minutes"><MenuItem value="20 minutes">20 minutes</MenuItem><MenuItem value="30 minutes">30 minutes</MenuItem></Select>} />
            <Row name={t.region.auto_confirm} desc={t.region.auto_confirm_desc} action={<Switch checked={toggles.autoConfirm} onChange={() => toggle('autoConfirm')} />} />
            <Row name={t.region.low_bandwidth} desc={t.region.low_bandwidth_desc} action={<Switch checked={toggles.lowBandwidth} onChange={() => toggle('lowBandwidth')} />} />
            <Row name={t.region.audio_fallback} desc={t.region.audio_fallback_desc} action={<Switch checked={toggles.audioFallback} onChange={() => toggle('audioFallback')} />} />
          </Card>

          <Card>
            <Row name={t.region.password} desc={t.region.password_desc} action={actionButton(t.region.change_password)} />
            <Row name={t.region.biometric} desc={t.region.biometric_desc} action={<Switch checked={toggles.biometric} onChange={() => toggle('biometric')} />} />
            <Row name={t.region.login_alerts} desc={t.region.login_alerts_desc} action={<Switch checked={toggles.loginAlerts} onChange={() => toggle('loginAlerts')} />} />
            <Row name={t.region.contact} desc="+91 98765 43210" action={actionButton(t.region.edit)} />
          </Card>

          <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid #f0a2a2`, bgcolor: '#fff' }}>
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ pb: 1.8, mb: 1.2, borderBottom: '1px solid #f7d4d4' }}>
              <Box sx={{ width: 30, height: 30, borderRadius: 2, bgcolor: '#fcebeb', display: 'grid', placeItems: 'center', color: '#a32d2d' }}>
                <WarningIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: 16, color: '#a32d2d' }}>{t.region.controls}</Typography>
            </Stack>
            <Row danger name={t.region.pause} desc={t.region.pause_desc} action={actionButton(t.region.btn_pause, 'danger')} />
            <Row danger name={t.region.disable} desc={t.region.disable_desc} action={actionButton(t.region.btn_disable, 'danger')} />
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ pt: 1.7 }}>
              <Box>
                <Typography sx={{ fontSize: 15, color: '#892727' }}>{t.region.deactivate}</Typography>
                <Typography sx={{ mt: 0.35, color: '#a24a4a', fontSize: 13.5 }}>{t.region.deactivate_desc}</Typography>
              </Box>
              <Button sx={{ px: 2.2, py: 0.8, borderRadius: 2.2, bgcolor: '#a32d2d', color: '#fff', textTransform: 'none', fontSize: 13.5 }}>
                {t.region.btn_deactivate}
              </Button>
            </Stack>
          </Box>
        </Stack>
      );
    }

    return null;
  };

  return (
    <DoctorLayout>
      <Box>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 2.5, bgcolor: '#fff', borderBottom: `1px solid ${colors.soft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ color: '#a7a198', fontSize: 14 }}>
              {t.home} {'›'} {t.settings} {'›'} {pageHeader[0]}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: { xs: 34, md: 42 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              {t.settings}
            </Typography>
            <Typography sx={{ mt: 0.6, color: colors.muted, fontSize: 15.5 }}>
              {pageHeader[1]}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.2} alignItems="center" useFlexGap flexWrap="wrap">
            <Box sx={{ px: 2.2, py: 1.1, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f5f4f0', fontSize: 15.5 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button sx={{ minWidth: 42, width: 42, height: 42, borderRadius: 2.2, border: `1px solid ${colors.line}`, bgcolor: '#f5f4f0', color: colors.text, position: 'relative' }}>
              <NotificationIcon />
              <Box sx={{ position: 'absolute', top: 9, right: 9, width: 7, height: 7, borderRadius: '50%', bgcolor: colors.red }} />
            </Button>
            <Button 
                onClick={handleSave} 
                disabled={saving}
                startIcon={<SaveIcon />} 
                sx={{ px: 2.2, py: 1.05, borderRadius: 2.2, bgcolor: colors.green, color: '#fff', textTransform: 'none', fontSize: 14.5 }}
            >
              {saving ? t.saving : t.save}
            </Button>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ py: 12, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.green }} />
          </Box>
        ) : (
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
              {Object.keys(t.tabs).map((key) => (
                <Button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  sx={{
                    px: 2.5,
                    py: 1,
                    borderRadius: 999,
                    border: `1px solid ${activeTab === key ? colors.green : colors.line}`,
                    bgcolor: activeTab === key ? colors.green : '#fff',
                    color: activeTab === key ? '#fff' : '#6c665f',
                    textTransform: 'none',
                    fontSize: 14.5
                  }}
                >
                  {t.tabs[key][0]}
                </Button>
              ))}
            </Stack>

            {renderPanel()}
          </Box>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>
    </DoctorLayout>
  );
}
