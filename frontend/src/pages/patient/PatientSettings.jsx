import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography
} from '@mui/material';
import {
  SaveRounded as SaveIcon,
  WarningAmberRounded as WarningIcon
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import PatientShell from '../../components/patient/PatientShell';
import { fetchPatientProfile, updatePatientSettings as savePatientSettings } from '../../api/patientApi';

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

const titles = {
  appearance: ['Appearance', 'Customise how the app looks on your device'],
  language: ['Language', 'Select your preferred language for the interface'],
  notifications: ['Notifications', 'Control when and how you receive alerts'],
  connectivity: ['Connectivity', 'Optimise for low-network rural areas'],
  privacy: ['Privacy', 'Control who can access your health data'],
  security: ['Security', 'Manage your account access and authentication'],
  storage: ['Storage & Sync', 'Manage offline cache and data usage'],
  accessibility: ['Accessibility', 'Make the app easier to use for everyone'],
  account: ['Account', 'Manage your personal and login details'],
  devices: ['Devices', 'Sessions currently logged in to your account'],
  danger: ['Danger Zone', 'Permanent and irreversible account actions']
};

const sectionOrder = [
  'appearance',
  'language',
  'notifications',
  'connectivity',
  'privacy',
  'security',
  'storage',
  'accessibility',
  'account',
  'devices',
  'danger'
];

function Row({ name, desc, action, danger = false }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
      sx={{ py: 2, borderBottom: `1px solid ${danger ? '#fad2d2' : colors.soft}`, '&:last-child': { borderBottom: 'none' } }}
    >
      <Box sx={{ pr: 2 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 500, color: danger ? colors.danger : colors.text }}>{name}</Typography>
        <Typography sx={{ mt: 0.5, color: danger ? '#d35c5c' : colors.muted, fontSize: 13.5, lineHeight: 1.45 }}>
          {desc}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

function PillGroup({ options, selected }) {
  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {options.map((option) => (
        <Button
          key={option}
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1.5,
            border: `1px solid ${selected === option ? colors.primary : colors.line}`,
            bgcolor: selected === option ? colors.primarySoft : '#fff',
            color: selected === option ? colors.primaryDark : colors.text,
            textTransform: 'none',
            fontSize: 14,
            fontWeight: selected === option ? 600 : 400,
            '&:hover': { bgcolor: selected === option ? colors.primarySoft : colors.soft }
          }}
        >
          {option}
        </Button>
      ))}
    </Stack>
  );
}

export default function PatientSettings() {
  const [searchParams] = useSearchParams();
  const section = sectionOrder.includes(searchParams.get('section')) ? searchParams.get('section') : '';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggles, setToggles] = useState({
    compact: false,
    animations: true,
    appointmentReminder: true,
    followup: true,
    sms: true,
    push: true,
    email: false,
    lowBandwidth: true,
    audioOnly: true,
    textFallback: true,
    offline: true,
    backgroundSync: true,
    wifiOnly: false,
    shareDoctors: true,
    sharePharmacy: true,
    research: true,
    location: true,
    analytics: false,
    biometric: false,
    loginAlerts: true,
    highContrast: false,
    largeTap: true,
    screenReader: false,
    voiceInput: false,
    reduceMotion: false,
    helperMode: false
  });

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await fetchPatientProfile();
        if (res.success && res.profile && res.profile.settings) {
          setToggles(prev => ({ ...prev, ...res.profile.settings }));
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const current = section || '';
  const header = current ? titles[current] : ['Settings', 'Select a section from the sidebar to begin.'];

  const toggle = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const res = await savePatientSettings(toggles);
      if (res.success) {
        setToggles(prev => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const actionButton = (label, kind = 'outline') => (
    <Button
      sx={{
        px: 2,
        py: 0.75,
        borderRadius: 1.5,
        border: `1px solid ${kind === 'danger' ? colors.danger : kind === 'outline' ? colors.primary : colors.line}`,
        bgcolor: kind === 'filled' ? colors.primary : '#fff',
        color: kind === 'filled' ? '#fff' : kind === 'danger' ? colors.danger : kind === 'outline' ? colors.primary : colors.text,
        textTransform: 'none',
        fontSize: 14,
        fontWeight: 500,
        '&:hover': { bgcolor: kind === 'filled' ? colors.primaryDark : colors.soft }
      }}
    >
      {label}
    </Button>
  );

  const renderPanel = () => {
    if (!current) {
      return (
        <Box sx={{ py: 10, px: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: 1.5, bgcolor: colors.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <SaveIcon sx={{ color: colors.gray, fontSize: 32 }} />
          </Box>
          <Typography sx={{ fontSize: 18, color: colors.text, fontWeight: 600 }}>Select a category to structure settings</Typography>
          <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 300, mx: 'auto' }}>
            Click an item on the left sidebar to find and modify the settings associated with it.
          </Typography>
        </Box>
      );
    }

    if (current === 'appearance') {
      return (
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Row name="Theme" desc="Choose between light, dark or system default" action={<PillGroup options={['Light', 'Dark', 'System']} selected="Light" />} />
          <Row name="Text size" desc="Adjust for better readability on small screens" action={<PillGroup options={['Small', 'Medium', 'Large']} selected="Medium" />} />
          <Row name="Compact layout" desc="Show more content with tighter spacing" action={<Switch checked={toggles.compact} onChange={() => toggle('compact')} color="primary" />} />
          <Row name="Animations" desc="Enable smooth transitions and motion effects" action={<Switch checked={toggles.animations} onChange={() => toggle('animations')} color="primary" />} />
        </Box>
      );
    }

    if (current === 'language') {
      return (
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {[
              ['English', 'English', true],
              ['हिन्दी', 'Hindi'],
              ['ਪੰਜਾਬੀ', 'Punjabi'],
              ['தமிழ்', 'Tamil'],
              ['తెలుగు', 'Telugu'],
              ['বাংলা', 'Bengali'],
              ['मराठी', 'Marathi']
            ].map(([native, eng, active]) => (
              <Box key={native} sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${active ? colors.primary : colors.line}`, bgcolor: active ? colors.primarySoft : '#fff', textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: active ? colors.primarySoft : colors.soft } }}>
                <Typography sx={{ fontSize: 15, fontWeight: active ? 600 : 500, color: active ? colors.primaryDark : colors.text }}>{native}</Typography>
                <Typography sx={{ mt: 0.5, color: active ? colors.primary : colors.muted, fontSize: 13 }}>{eng}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      );
    }

    if (current === 'notifications') {
      return (
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Typography sx={{ color: colors.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1, mt: 1 }}>Appointments</Typography>
          <Row name="Appointment reminders" desc="Get notified before your consultation" action={<Switch checked={toggles.appointmentReminder} onChange={() => toggle('appointmentReminder')} color="primary" />} />
          <Row name="Reminder timing" desc="How early to send the first reminder" action={<Select size="small" value="24 hours before" sx={{fontSize: 14}}><MenuItem value="24 hours before">24 hours before</MenuItem></Select>} />
          <Row name="Follow-up reminders" desc="Notify when a follow-up is due" action={<Switch checked={toggles.followup} onChange={() => toggle('followup')} color="primary" />} />
          
          <Typography sx={{ color: colors.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1, mt: 4 }}>Channels</Typography>
          <Row name="SMS notifications" desc="Alerts to +91 98140 *****" action={<Switch checked={toggles.sms} onChange={() => toggle('sms')} color="primary" />} />
          <Row name="Push notifications" desc="In-app and browser push alerts" action={<Switch checked={toggles.push} onChange={() => toggle('push')} color="primary" />} />
          <Row name="Email notifications" desc={`Summary emails to ${user?.email || 'user@example.com'}`} action={<Switch checked={toggles.email} onChange={() => toggle('email')} color="primary" />} />
        </Box>
      );
    }

    if (current === 'connectivity') {
      return (
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Box sx={{ mb: 3, px: 2, py: 1.5, borderRadius: 1.5, bgcolor: '#e6f4ea', color: colors.success, fontSize: 14, fontWeight: 500 }}>Connected - 3G · 320 kbps detected</Box>
          <Row name="Low bandwidth mode" desc="Compress images and reduce video quality automatically" action={<Switch checked={toggles.lowBandwidth} onChange={() => toggle('lowBandwidth')} color="primary" />} />
          <Row name="Auto-switch to audio only" desc="Drop to audio if video is unstable" action={<Switch checked={toggles.audioOnly} onChange={() => toggle('audioOnly')} color="primary" />} />
          <Row name="Auto-switch to text chat" desc="Fall back to chat if audio also fails" action={<Switch checked={toggles.textFallback} onChange={() => toggle('textFallback')} color="primary" />} />
        </Box>
      );
    }

    if (current === 'privacy') {
      return (
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Row name="Share records with doctors" desc="Doctors can view your full medical history during consultations" action={<Switch checked={toggles.shareDoctors} onChange={() => toggle('shareDoctors')} color="primary" />} />
          <Row name="Share with pharmacists" desc="Pharmacists receive your prescription and contact details" action={<Switch checked={toggles.sharePharmacy} onChange={() => toggle('sharePharmacy')} color="primary" />} />
          <Row name="Location access" desc="Used to show nearby pharmacies and doctors" action={<Switch checked={toggles.location} onChange={() => toggle('location')} color="primary" />} />
          <Row name="Analytics & usage data" desc="Help us improve the app with anonymised usage patterns" action={<Switch checked={toggles.analytics} onChange={() => toggle('analytics')} color="primary" />} />
          <Box sx={{ mt: 3, p: 2, borderRadius: 1.5, bgcolor: colors.soft, color: colors.text, fontSize: 13, lineHeight: 1.6 }}>
            Seva TeleHealth complies with data protection regulations. Your data is encrypted at rest and in transit. We never sell your data to advertisers.
          </Box>
        </Box>
      );
    }

    if (current === 'security') {
      return (
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Row name="Password" desc="Last changed 3 months ago" action={actionButton('Change password')} />
          <Row name="Two-factor authentication" desc="OTP sent to mobile on each login" action={<Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#e6f4ea', color: colors.success, fontSize: 13, fontWeight: 600 }}>Enabled</Box>} />
          <Row name="Auto-lock timeout" desc="Lock the app after inactivity" action={<Select size="small" value="5 minutes" sx={{fontSize: 14}}><MenuItem value="5 minutes">5 minutes</MenuItem><MenuItem value="15 minutes">15 minutes</MenuItem></Select>} />
          <Row name="Login alerts" desc="SMS alert whenever a new login is detected" action={<Switch checked={toggles.loginAlerts} onChange={() => toggle('loginAlerts')} color="primary" />} />
          <Row name="Export my data" desc="Download all your health records as a PDF archive" action={actionButton('Export PDF', 'gray')} />
        </Box>
      );
    }

    if (current === 'storage') {
      return (
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 500 }}>Offline cache</Typography>
              <Typography sx={{ fontSize: 15, color: colors.primaryDark, fontWeight: 600 }}>0.0 MB / 50 MB</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4, bgcolor: colors.soft, '& .MuiLinearProgress-bar': { bgcolor: colors.primary } }} />
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography sx={{ color: colors.muted, fontSize: 13 }}>0.0 MB used</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 13 }}>50.0 MB free</Typography>
            </Stack>
          </Box>
          <Row name="Clear offline cache" desc="Remove all locally stored files" action={actionButton('Clear cache', 'outline')} />
        </Box>
      );
    }

    if (current === 'accessibility') {
      return (
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Row name="High contrast mode" desc="Increase contrast for better visibility in sunlight" action={<Switch checked={toggles.highContrast} onChange={() => toggle('highContrast')} color="primary" />} />
          <Row name="Large tap targets" desc="Make buttons bigger for easier tapping on phones" action={<Switch checked={toggles.largeTap} onChange={() => toggle('largeTap')} color="primary" />} />
          <Row name="Reduce motion" desc="Minimise animations for motion-sensitive users" action={<Switch checked={toggles.reduceMotion} onChange={() => toggle('reduceMotion')} color="primary" />} />
        </Box>
      );
    }

    if (current === 'account') {
      return (
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Row name="Full name" desc={user?.name || 'Set your name'} action={actionButton('Edit')} />
          <Row name="Mobile number" desc="Verified mobile number" action={actionButton('Change', 'gray')} />
          <Row name="Email address" desc={user?.email || 'Set your email'} action={actionButton('Edit')} />
        </Box>
      );
    }

    if (current === 'devices') {
      return (
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          {[
            ['Current Browser', 'Active now', 'This device']
          ].map(([name, meta, action], index) => (
            <Stack key={name} direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ py: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{name}</Typography>
                <Typography sx={{ mt: 0.5, color: colors.success, fontSize: 13, fontWeight: 500 }}>{meta}</Typography>
              </Box>
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#e6f4ea', color: colors.success, fontSize: 13, fontWeight: 600 }}>This device</Box>
            </Stack>
          ))}
          <Button sx={{ mt: 3, width: '100%', py: 1.25, borderRadius: 1.5, border: `1px solid ${colors.danger}`, color: colors.danger, textTransform: 'none', fontSize: 14, fontWeight: 600, '&:hover': { bgcolor: colors.dangerSoft } }}>
            Sign out of all other devices
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 0, borderRadius: 2, bgcolor: 'transparent' }}>
        <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.danger}`, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(217,48,37,0.1)' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pb: 2, mb: 1, borderBottom: '1px solid #fad2d2' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: colors.dangerSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.danger }}>
              <WarningIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.danger }}>Danger zone</Typography>
          </Stack>
          <Row danger name="Deactivate account" desc="Temporarily disable your account. You can reactivate later." action={actionButton('Deactivate', 'danger')} />
          <Row danger name="Delete all health records" desc="Permanently remove all your stored medical data." action={actionButton('Delete records', 'danger')} />
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ pt: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: colors.danger }}>Delete account permanently</Typography>
              <Typography sx={{ mt: 0.5, color: '#d35c5c', fontSize: 13.5 }}>This cannot be undone. All data will be erased forever.</Typography>
            </Box>
            <Button sx={{ px: 2.5, py: 1, borderRadius: 1.5, bgcolor: colors.danger, color: '#fff', textTransform: 'none', fontSize: 14, fontWeight: 600, '&:hover': { bgcolor: '#b82116' } }}>
              Delete account
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  };

  return (
    <PatientShell activeSetting="settings" activeSettingSection={current}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.bg, minHeight: '100vh' }}>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, bgcolor: '#fff', borderBottom: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: colors.text, fontFamily: 'Inter, sans-serif' }}>
              {header[0]}
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16 }}>
              {header[1]}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button onClick={handleSaveSettings} disabled={saving} startIcon={saving ? null : <SaveIcon />} sx={{ px: 3, py: 1.25, borderRadius: 1.5, bgcolor: colors.primary, color: '#fff', textTransform: 'none', fontSize: 14, fontWeight: 600, boxShadow: '0 2px 4px rgba(26,115,232,0.2)', '&:hover': { bgcolor: colors.primaryDark } }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
          {renderPanel()}
        </Box>
      </Box>
    </PatientShell>
  );
}
