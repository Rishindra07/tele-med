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
  NotificationsNoneRounded as NotificationIcon,
  SaveRounded as SaveIcon,
  WarningAmberRounded as WarningIcon
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import PatientShell from '../../components/patient/PatientShell';

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

function PillGroup({ options, selected }) {
  return (
    <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
      {options.map((option) => (
        <Button
          key={option}
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

export default function PatientSettings() {
  const [searchParams] = useSearchParams();
  const section = sectionOrder.includes(searchParams.get('section')) ? searchParams.get('section') : '';
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

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const current = section || '';
  const header = current ? titles[current] : ['Settings', 'Select a section from the sidebar to begin'];

  const toggle = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const actionButton = (label, kind = 'outline') => (
    <Button
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
    if (!current) {
      return (
        <Box sx={{ p: 8, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, textAlign: 'center' }}>
          <Box sx={{ width: 52, height: 52, borderRadius: 3, bgcolor: '#f5f1e9', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}>
            <SaveIcon sx={{ color: '#b2aaa0' }} />
          </Box>
          <Typography sx={{ fontSize: 18, color: '#5a554e' }}>Click Settings in the sidebar</Typography>
          <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5, lineHeight: 1.6 }}>
            The settings menu will expand in the sidebar. Click any sub-section to view its options here.
          </Typography>
        </Box>
      );
    }

    if (current === 'appearance') {
      return (
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Row name="Theme" desc="Choose between light, dark or system default" action={<PillGroup options={['Light', 'Dark', 'System']} selected="Light" />} />
          <Row name="Accent color" desc="Main brand color used across the app" action={<Stack direction="row" spacing={1}>{['#1D9E75','#378ADD','#7F77DD','#D85A30','#BA7517','#888780'].map((color, i) => <Box key={color} sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: color, border: i===0 ? '2px solid #222' : '2px solid transparent' }} />)}</Stack>} />
          <Row name="Text size" desc="Adjust for better readability on small screens" action={<PillGroup options={['Small', 'Medium', 'Large']} selected="Medium" />} />
          <Row name="Compact layout" desc="Show more content with tighter spacing" action={<Switch checked={toggles.compact} onChange={() => toggle('compact')} />} />
          <Row name="Animations" desc="Enable smooth transitions and motion effects" action={<Switch checked={toggles.animations} onChange={() => toggle('animations')} />} />
        </Box>
      );
    }

    if (current === 'language') {
      return (
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.2 }}>
            {[
              ['English', 'English', true],
              ['हिन्दी', 'Hindi'],
              ['ਪੰਜਾਬੀ', 'Punjabi'],
              ['தமிழ்', 'Tamil'],
              ['తెలుగు', 'Telugu'],
              ['বাংলা', 'Bengali'],
              ['मराठी', 'Marathi']
            ].map(([native, eng, active]) => (
              <Box key={native} sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${active ? colors.green : colors.line}`, bgcolor: active ? colors.greenSoft : '#fff', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 15 }}>{native}</Typography>
                <Typography sx={{ mt: 0.2, color: colors.muted, fontSize: 12 }}>{eng}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      );
    }

    if (current === 'notifications') {
      return (
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Typography sx={{ color: '#a7a198', fontSize: 11, letterSpacing: 1.1, mb: 1 }}>Appointments</Typography>
          <Row name="Appointment reminders" desc="Get notified before your consultation" action={<Switch checked={toggles.appointmentReminder} onChange={() => toggle('appointmentReminder')} />} />
          <Row name="Reminder timing" desc="How early to send the first reminder" action={<Select size="small" value="24 hours before"><MenuItem value="24 hours before">24 hours before</MenuItem></Select>} />
          <Row name="Follow-up reminders" desc="Notify when a follow-up is due" action={<Switch checked={toggles.followup} onChange={() => toggle('followup')} />} />
          <Typography sx={{ color: '#a7a198', fontSize: 11, letterSpacing: 1.1, mb: 1, mt: 2 }}>Prescriptions & Pharmacy</Typography>
          <Row name="Prescription ready alert" desc="SMS when pharmacy marks medicines as ready" action={<Switch checked />} />
          <Row name="Medicine expiry warnings" desc="Alert when a prescribed course is about to end" action={<Switch checked />} />
          <Typography sx={{ color: '#a7a198', fontSize: 11, letterSpacing: 1.1, mb: 1, mt: 2 }}>Channels</Typography>
          <Row name="SMS notifications" desc="Alerts to +91 98140 55872" action={<Switch checked={toggles.sms} onChange={() => toggle('sms')} />} />
          <Row name="Push notifications" desc="In-app and browser push alerts" action={<Switch checked={toggles.push} onChange={() => toggle('push')} />} />
          <Row name="Email notifications" desc={`Summary emails to ${user?.email || 'ramesh.kumar83@gmail.com'}`} action={<Switch checked={toggles.email} onChange={() => toggle('email')} />} />
          <Row name="Do not disturb" desc="Silence non-emergency alerts at night" action={<Stack direction="row" spacing={1}><Select size="small" value="10 PM"><MenuItem value="10 PM">10 PM</MenuItem></Select><Typography sx={{ alignSelf: 'center', color: colors.muted, fontSize: 12 }}>to</Typography><Select size="small" value="7 AM"><MenuItem value="7 AM">7 AM</MenuItem></Select></Stack>} />
        </Box>
      );
    }

    if (current === 'connectivity') {
      return (
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Box sx={{ mb: 1.8, px: 1.5, py: 1, borderRadius: 2.2, bgcolor: colors.greenSoft, color: '#0d5d49', fontSize: 13.5 }}>Connected - 3G · 320 kbps detected</Box>
          <Row name="Low bandwidth mode" desc="Compress images and reduce video quality automatically" action={<Switch checked={toggles.lowBandwidth} onChange={() => toggle('lowBandwidth')} />} />
          <Row name="Video quality" desc="Default quality for video consultations" action={<Select size="small" value="Auto (recommended)"><MenuItem value="Auto (recommended)">Auto (recommended)</MenuItem></Select>} />
          <Row name="Auto-switch to audio only" desc="Drop to audio if video is unstable" action={<Switch checked={toggles.audioOnly} onChange={() => toggle('audioOnly')} />} />
          <Row name="Auto-switch to text chat" desc="Fall back to chat if audio also fails" action={<Switch checked={toggles.textFallback} onChange={() => toggle('textFallback')} />} />
          <Row name="Offline mode" desc="Cache records locally for use without internet" action={<Switch checked={toggles.offline} onChange={() => toggle('offline')} />} />
          <Row name="Background sync" desc="Sync pending actions when internet reconnects" action={<Switch checked={toggles.backgroundSync} onChange={() => toggle('backgroundSync')} />} />
          <Row name="Sync only on Wi-Fi" desc="Avoid data charges by syncing only on Wi-Fi" action={<Switch checked={toggles.wifiOnly} onChange={() => toggle('wifiOnly')} />} />
        </Box>
      );
    }

    if (current === 'privacy') {
      return (
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Row name="Share records with doctors" desc="Doctors can view your full medical history during consultations" action={<Switch checked={toggles.shareDoctors} onChange={() => toggle('shareDoctors')} />} />
          <Row name="Share with pharmacists" desc="Pharmacists receive your prescription and contact details" action={<Switch checked={toggles.sharePharmacy} onChange={() => toggle('sharePharmacy')} />} />
          <Row name="Contribute to research" desc="Anonymised data helps improve rural healthcare in India" action={<Switch checked={toggles.research} onChange={() => toggle('research')} />} />
          <Row name="Location access" desc="Used to show nearby pharmacies and doctors" action={<Switch checked={toggles.location} onChange={() => toggle('location')} />} />
          <Row name="Analytics & usage data" desc="Help us improve the app with anonymised usage patterns" action={<Switch checked={toggles.analytics} onChange={() => toggle('analytics')} />} />
          <Box sx={{ mt: 1.8, p: 1.6, borderRadius: 2.5, bgcolor: '#f5f1e9', color: colors.muted, fontSize: 13.5, lineHeight: 1.6 }}>
            Seva TeleHealth complies with India's DISHA Digital Health Data Act and the IT Act 2000. Your data is encrypted at rest and in transit. We never sell your data to advertisers.
          </Box>
        </Box>
      );
    }

    if (current === 'security') {
      return (
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Row name="Password" desc="Last changed 3 months ago" action={actionButton('Change password')} />
          <Row name="Two-factor authentication" desc="OTP sent to +91 98140 55872 on each login" action={<Box sx={{ px: 1.3, py: 0.5, borderRadius: 999, bgcolor: colors.greenSoft, color: colors.green, fontSize: 12.5 }}>Enabled</Box>} />
          <Row name="Biometric login" desc="Use fingerprint or face ID to unlock the app" action={<Switch checked={toggles.biometric} onChange={() => toggle('biometric')} />} />
          <Row name="Auto-lock timeout" desc="Lock the app after inactivity" action={<Select size="small" value="5 minutes"><MenuItem value="5 minutes">5 minutes</MenuItem></Select>} />
          <Row name="Login alerts" desc="SMS alert whenever a new login is detected" action={<Switch checked={toggles.loginAlerts} onChange={() => toggle('loginAlerts')} />} />
          <Row name="Export my data" desc="Download all your health records as a PDF archive" action={actionButton('Export PDF', 'gray')} />
        </Box>
      );
    }

    if (current === 'storage') {
      return (
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Box sx={{ mb: 2.2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: 14.5 }}>Offline cache</Typography>
              <Typography sx={{ fontSize: 14.5, color: colors.green }}>6.2 MB / 10 MB</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={62} sx={{ height: 8, borderRadius: 999, bgcolor: '#f0efe8', '& .MuiLinearProgress-bar': { bgcolor: colors.green } }} />
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.6 }}>
              <Typography sx={{ color: '#a7a198', fontSize: 12 }}>6.2 MB used</Typography>
              <Typography sx={{ color: '#a7a198', fontSize: 12 }}>3.8 MB free</Typography>
            </Stack>
          </Box>
          <Row name="Cache limit" desc="Maximum storage for offline health records" action={<Select size="small" value="10 MB"><MenuItem value="10 MB">10 MB</MenuItem></Select>} />
          <Row name="Auto-cache prescriptions" desc="Automatically save new prescriptions for offline access" action={<Switch checked />} />
          <Row name="Auto-cache lab reports" desc="Automatically save new lab reports offline" action={<Switch checked />} />
          <Row name="Clear offline cache" desc="Remove all locally stored files - 6.2 MB will be freed" action={actionButton('Clear cache', 'danger')} />
          <Row name="Last synced" desc="All records are up to date" action={<Box sx={{ px: 1.3, py: 0.5, borderRadius: 999, bgcolor: colors.greenSoft, color: colors.green, fontSize: 12.5 }}>Today 10:30 AM</Box>} />
        </Box>
      );
    }

    if (current === 'accessibility') {
      return (
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Row name="High contrast mode" desc="Increase contrast for better visibility in sunlight" action={<Switch checked={toggles.highContrast} onChange={() => toggle('highContrast')} />} />
          <Row name="Large tap targets" desc="Make buttons bigger for easier tapping on phones" action={<Switch checked={toggles.largeTap} onChange={() => toggle('largeTap')} />} />
          <Row name="Screen reader support" desc="Optimise for TalkBack and VoiceOver" action={<Switch checked={toggles.screenReader} onChange={() => toggle('screenReader')} />} />
          <Row name="Voice input" desc="Use voice to fill forms and describe symptoms" action={<Switch checked={toggles.voiceInput} onChange={() => toggle('voiceInput')} />} />
          <Row name="Reduce motion" desc="Minimise animations for motion-sensitive users" action={<Switch checked={toggles.reduceMotion} onChange={() => toggle('reduceMotion')} />} />
          <Row name="Community helper mode" desc="Simplified interface for assisted use by ASHA/ANM workers" action={<Switch checked={toggles.helperMode} onChange={() => toggle('helperMode')} />} />
        </Box>
      );
    }

    if (current === 'account') {
      return (
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          <Row name="Full name" desc={user?.name || 'Ramesh Kumar'} action={actionButton('Edit')} />
          <Row name="Mobile number" desc="+91 98140 55872 · Verified" action={actionButton('Change', 'gray')} />
          <Row name="Email address" desc={user?.email || 'ramesh.kumar83@gmail.com'} action={actionButton('Edit')} />
          <Row name="Location" desc="Garhshankar, Hoshiarpur, Punjab - 146105" action={actionButton('Edit')} />
          <Row name="Aadhaar" desc="XXXX XXXX 4821 · Linked & verified" action={<Box sx={{ px: 1.3, py: 0.5, borderRadius: 999, bgcolor: colors.greenSoft, color: colors.green, fontSize: 12.5 }}>Verified</Box>} />
          <Row name="ABHA Health ID" desc="7826 5491 3302 8841 · Ayushman Bharat" action={<Box sx={{ px: 1.3, py: 0.5, borderRadius: 999, bgcolor: colors.greenSoft, color: colors.green, fontSize: 12.5 }}>Linked</Box>} />
        </Box>
      );
    }

    if (current === 'devices') {
      return (
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
          {[
            ['Android - Samsung Galaxy M12', 'Hoshiarpur, Punjab · Active now', 'This device'],
            ['Chrome - Windows PC', 'Chandigarh · Last active 2 days ago', 'Sign out']
          ].map(([name, meta, action], index) => (
            <Stack key={name} direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ py: 1.7, borderBottom: `1px solid ${colors.soft}` }}>
              <Box>
                <Typography sx={{ fontSize: 15 }}>{name}</Typography>
                <Typography sx={{ mt: 0.35, color: colors.muted, fontSize: 13.5 }}>{meta}</Typography>
              </Box>
              {index === 0 ? <Box sx={{ px: 1.3, py: 0.5, borderRadius: 999, bgcolor: colors.greenSoft, color: colors.green, fontSize: 12.5 }}>This device</Box> : actionButton(action, 'danger')}
            </Stack>
          ))}
          <Button sx={{ mt: 2, width: '100%', py: 1.05, borderRadius: 2.5, border: `1px solid ${colors.red}`, color: colors.red, textTransform: 'none', fontSize: 14.5 }}>
            Sign out of all other devices
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 0, borderRadius: 3.5, bgcolor: 'transparent' }}>
        <Box sx={{ p: 3, borderRadius: 3.5, border: `1px solid #f0a2a2`, bgcolor: '#fff' }}>
          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ pb: 1.8, mb: 1.2, borderBottom: '1px solid #f7d4d4' }}>
            <Box sx={{ width: 30, height: 30, borderRadius: 2, bgcolor: '#fcebeb', display: 'grid', placeItems: 'center', color: '#a32d2d' }}>
              <WarningIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontSize: 16, color: '#a32d2d' }}>Danger zone</Typography>
          </Stack>
          <Row danger name="Deactivate account" desc="Temporarily disable your account. You can reactivate later." action={actionButton('Deactivate', 'danger')} />
          <Row danger name="Delete all health records" desc="Permanently remove all your stored medical data." action={actionButton('Delete records', 'danger')} />
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ pt: 1.7 }}>
            <Box>
              <Typography sx={{ fontSize: 15, color: '#892727' }}>Delete account permanently</Typography>
              <Typography sx={{ mt: 0.35, color: '#a24a4a', fontSize: 13.5 }}>This cannot be undone. All data will be erased forever.</Typography>
            </Box>
            <Button sx={{ px: 2.2, py: 0.8, borderRadius: 2.2, bgcolor: '#a32d2d', color: '#fff', textTransform: 'none', fontSize: 13.5 }}>
              Delete account
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  };

  return (
    <PatientShell activeSetting="settings" activeSettingSection={current}>
      <Box>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 2.5, bgcolor: '#fff', borderBottom: `1px solid ${colors.soft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ color: '#a7a198', fontSize: 14 }}>
              Home {current ? `› Settings › ${titles[current][0]}` : '› Settings'}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: { xs: 34, md: 42 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              {header[0]}
            </Typography>
            <Typography sx={{ mt: 0.6, color: colors.muted, fontSize: 15.5 }}>
              {header[1]}
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
            <Button startIcon={<SaveIcon />} sx={{ px: 2.2, py: 1.05, borderRadius: 2.2, bgcolor: colors.green, color: '#fff', textTransform: 'none', fontSize: 14.5 }}>
              Save Changes
            </Button>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {renderPanel()}
        </Box>
      </Box>
    </PatientShell>
  );
}
