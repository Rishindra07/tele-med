import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  TextField, MenuItem, Select, FormControl, InputAdornment, Avatar,
  Switch, Slider
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  SearchRounded as SearchIcon,
  WarningRounded as WarningIcon,
  ScheduleRounded as ClockIcon,
  ErrorOutlineRounded as ErrorIcon,
} from '@mui/icons-material';
import { fetchExpiryAlerts, updatePharmacyProfile } from '../../api/pharmacyApi';
import PharmacyLayout from '../../components/PharmacyLayout';
import { CircularProgress, Snackbar, Alert } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';
import { PHARMACY_EXPIRY_TRANSLATIONS } from '../../utils/translations/pharmacy';

const colors = {
  paper: '#ffffff',
  bg: '#f9f9f9',
  line: '#ebe9e0',
  soft: '#f5f1e8',
  text: '#252525',
  muted: '#6f6a62',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  amber: '#d18a1f',
  amberSoft: '#fbefdc',
  red: '#d9635b',
  redSoft: '#fdeaea',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  graySoft: '#f1eee7'
};

// Helper for currency
const fRs = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const LOSSES = (t) => [
  { name: 'Cough Syrup (12 bottles)', val: '₹1,440' },
  { name: 'Amoxicillin 250mg (14 strips)', val: '₹448' },
  { name: 'Vitamin C 500mg (200 strips)', val: '₹600' },
  { name: `${t.other_items} (4 SKUs)`, val: '₹1,352' }
];

const StatCard = ({ title, value, sub, color }) => (
  <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, flex: '1 1 0' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: color }} />
      <Typography sx={{ fontSize: 13, color: colors.text, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{title}</Typography>
    </Box>
    <Typography sx={{ fontSize: 32, fontFamily: 'Georgia, serif' }}>{value}</Typography>
    <Typography sx={{ mt: 0.5, fontSize: 12.5, color: colors.muted, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{sub}</Typography>
  </Box>
);

const PillFilter = ({ label, count, active }) => (
  <Button sx={{ 
    textTransform: 'none', borderRadius: 99, px: 2, py: 0.6, fontSize: 13,
    bgcolor: active ? colors.red : 'transparent',
    color: active ? '#fff' : colors.text,
    border: `1px solid ${active ? colors.red : colors.line}`,
    minWidth: 0,
    '&:hover': { bgcolor: active ? colors.red : colors.graySoft }
  }}>
    {label}{count !== undefined && <Typography component="span" sx={{ ml: 1, px: 0.8, py: 0.2, borderRadius: 99, fontSize: 11, bgcolor: active ? 'rgba(255,255,255,0.2)' : colors.graySoft }}>{count}</Typography>}
  </Button>
);

export default function PharmacyExpiry() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [settings, setSettings] = useState({ alertDays: 30, smsAlert: true, autoReturn: false });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const { language } = useLanguage();
  const t = PHARMACY_EXPIRY_TRANSLATIONS[language] || PHARMACY_EXPIRY_TRANSLATIONS['en'];

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchExpiryAlerts();
      setAlerts(res.data.alerts || []);
      setSummary(res.data.summary);
      if (res.data.settings) setSettings(res.data.settings);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to fetch expiry data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpdateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await updatePharmacyProfile({ expirySettings: updated });
      setSnackbar({ open: true, message: 'Settings saved!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
    }
  };

  const handleAction = (btn, item) => {
    setSnackbar({ open: true, message: `Action [${btn}] initiated for ${item.medicineName}`, severity: 'info' });
  };

  if (loading && !alerts.length) return (
    <PharmacyLayout>
      <Box sx={{ p: 5, display: 'grid', placeItems: 'center', height: '100vh', bgcolor: colors.bg }}>
        <CircularProgress size={40} sx={{ color: colors.green }} />
      </Box>
    </PharmacyLayout>
  );

  const filtered = alerts.filter(a => {
    const matchesSearch = a.medicineName.toLowerCase().includes(search.toLowerCase()) || (a.batchNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const STATS = [
    { title: t.stats_7, value: alerts.filter(a => a.daysRemaining < 7).length, sub: t.stats_7_sub, color: colors.red },
    { title: t.stats_30, value: summary?.critical || 0, sub: t.stats_30_sub, color: colors.amber },
    { title: t.stats_90, value: summary?.warning || 0, sub: t.stats_90_sub, color: colors.blue },
    { title: t.loss, value: fRs(summary?.totalLoss), sub: t.loss_sub, color: colors.red }
  ];

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              {t.title}
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5, whiteSpace: 'pre-line' }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ bgcolor: colors.soft, color: '#5f5a52', borderRadius: 2.5, px: 2, py: 1, fontSize: 13, lineHeight: 1.25, textAlign: 'center' }}>
              Mon, 23<br />March<br />2026
            </Box>
            <IconButton 
              onClick={() => setSnackbar({ open: true, message: `You have ${summary?.critical || 0} critical expiries.`, severity: 'warning' })}
              sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', width: 42, height: 42 }}
            >
              <Badge color={summary?.critical > 0 ? "error" : "default"} variant="dot">
                <BellIcon sx={{ color: '#5f5a52' }} />
              </Badge>
            </IconButton>
            <Button 
              onClick={() => setSnackbar({ open: true, message: 'Return list generated for April 2026', severity: 'success' })}
              sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, borderRadius: 2.5, px: 2, py: 1, textTransform: 'none', fontSize: 14.5, height: 42, whiteSpace: 'pre-line', lineHeight: 1.2, minWidth: 100 }}
            >
              {t.create_list}
            </Button>
          </Stack>
        </Stack>

        {/* Stats Row */}
        <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {STATS.map(s => <StatCard key={s.title} {...s} />)}
        </Stack>

        {/* Search & Filter Card */}
        <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 4 }}>
          <TextField
            fullWidth
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: colors.paper } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
            }}
          />
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {[
              { val: 'All', label: t.filter_all },
              { val: 'Critical', label: t.filter_critical },
              { val: 'Warning', label: t.filter_warning },
              { val: 'Watch', label: t.filter_watch }
            ].map(f => (
              <Box key={f.val} onClick={() => setFilter(f.val)}>
                <PillFilter label={f.label} count={alerts.filter(a => f.val === 'All' || a.status === f.val).length} active={filter === f.val} />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Main Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' }, gap: 3 }}>
          
          {/* Left Column: Expiry List */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16 }}>{t.expiry_list}</Typography>
              <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>{t.export_list}</Typography>
            </Stack>
            
            <Stack spacing={2.5}>
              {filtered.map((item, idx) => (
                <Box key={idx} sx={{ 
                  display: 'grid', gridTemplateColumns: '70px 1fr 160px', 
                  bgcolor: colors.paper, borderRadius: 4, border: `1px solid ${colors.line}`, 
                  borderLeft: `3px solid ${item.status === 'Critical' ? colors.red : item.status === 'Warning' ? colors.amber : colors.blue}`, overflow: 'hidden'
                }}>
                  <Box sx={{ display: 'grid', placeItems: 'center', bgcolor: item.status === 'Critical' ? colors.redSoft : item.status === 'Warning' ? colors.amberSoft : colors.blueSoft, opacity: 0.8 }}>
                    {item.status === 'Critical' ? <ErrorIcon sx={{ color: colors.red }} /> : item.status === 'Warning' ? <WarningIcon sx={{ color: colors.amber }} /> : <ClockIcon sx={{ color: colors.blue }} />}
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 500, mb: 1 }}>{item.medicineName} — Batch {item.batchNumber}</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.muted, lineHeight: 1.4, mb: 2 }}>
                      {t.expires} {new Date(item.expiryDate).toLocaleDateString()} • {item.daysRemaining} {t.days_remaining} • {item.quantity} {t.units} • {t.supplier} {item.category}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Box sx={{ px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: item.status === 'Critical' ? colors.redSoft : colors.amberSoft, color: item.status === 'Critical' ? colors.red : colors.amber, fontSize: 11, fontWeight: 500 }}>
                        {item.status === 'Critical' ? t.filter_critical : item.status === 'Warning' ? t.filter_warning : t.filter_watch} — {item.daysRemaining} {t.days_dynamic}
                      </Box>
                      <Box sx={{ px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: colors.graySoft, color: colors.text, fontSize: 11, fontWeight: 500 }}>
                        {t.est_loss} {fRs(item.atRiskRevenue)}
                      </Box>
                      {item.daysRemaining < 30 && <Box sx={{ px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: colors.blueSoft, color: colors.blue, fontSize: 11, fontWeight: 500 }}>{t.return_eligible}</Box>}
                    </Stack>
                  </Box>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center', borderLeft: `1px solid ${colors.line}` }}>
                    {[
                      { key: 'initiate', label: t.init_return },
                      { key: 'dispose', label: t.mark_dispose },
                      { key: 'view', label: t.view_stock }
                    ].map(btn => (
                      <Button key={btn.key} onClick={() => handleAction(btn.key, item)} fullWidth sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, fontSize: 12.5, textTransform: 'none', py: 0.6 }}>
                        {btn.label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              ))}
              {!filtered.length && <Typography sx={{ p: 5, textAlign: 'center', color: colors.muted }}>{t.no_meds}</Typography>}
            </Stack>
          </Box>

          {/* Right Column: Sidebar */}
          <Stack spacing={3}>
            
            {/* Calendar Placeholder */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <SectionTitle title={`${t.cal_title} April 2026`} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, textAlign: 'center', mb: 2 }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <Typography key={d} sx={{ fontSize: 10, color: colors.muted }}>{d}</Typography>)}
                {[...Array(30)].map((_, i) => (
                  <Typography key={i} sx={{ 
                    fontSize: 12, py: 0.5, 
                    color: filtered.some(a => new Date(a.expiryDate).getDate() === i+1 && new Date(a.expiryDate).getMonth() === 3) ? colors.red : colors.text,
                    fontWeight: filtered.some(a => new Date(a.expiryDate).getDate() === i+1 && new Date(a.expiryDate).getMonth() === 3) ? 600 : 400
                  }}>
                    {i+1}
                  </Typography>
                ))}
              </Box>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: colors.red }} />
                  <Typography sx={{ fontSize: 11, color: colors.muted }}>{t.critical_expiry}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: colors.amber }} />
                  <Typography sx={{ fontSize: 11, color: colors.muted }}>{t.warning}</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Estimated Loss */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <SectionTitle title={t.loss_title} />
              <Stack spacing={2}>
                {LOSSES(t).map(l => (
                  <Stack key={l.name} direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: 13, color: colors.text }}>{l.name}</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.red }}>{l.val}</Typography>
                  </Stack>
                ))}
                <Divider />
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{t.total_risk}</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.red }}>₹3,840</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Alert Settings */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <SectionTitle title={t.alert_settings} />
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 13 }}>{t.sms}</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>+91 98140 56872</Typography>
                    </Box>
                    <Switch checked={settings.smsAlert} onChange={(e) => handleUpdateSettings({ smsAlert: e.target.checked })} size="small" />
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 13 }}>{t.auto_return}</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>{t.auto_return_sub}</Typography>
                    </Box>
                    <Switch checked={settings.autoReturn} onChange={(e) => handleUpdateSettings({ autoReturn: e.target.checked })} size="small" />
                  </Stack>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: colors.muted, mb: 1 }}>{t.custom_threshold}</Typography>
                  <Slider 
                    value={settings.alertDays} 
                    onChange={(_, v) => handleUpdateSettings({ alertDays: v })} 
                    max={90} min={7} 
                    sx={{ color: colors.blue }} 
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: 10, color: colors.muted }}>{t.days_7}</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.blue, fontWeight: 600 }}>{settings.alertDays} {t.days_dynamic}</Typography>
                    <Typography sx={{ fontSize: 10, color: colors.muted }}>{t.days_90}</Typography>
                  </Stack>
                </Box>
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

function SectionTitle({ title }) {
  return (
    <Typography sx={{ fontSize: 16, mb: 2.5, lineHeight: 1.2 }}>{title}</Typography>
  );
}
