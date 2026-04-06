import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, Switch, TextField, MenuItem, Select,
  FormControl, InputLabel, Chip, Alert,
} from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';
import { ADMIN_SETTINGS_TRANSLATIONS } from '../../utils/translations/admin';
import {
  SettingsRounded as SettingsIcon,
  SecurityRounded as SecurityIcon,
  NotificationsActiveRounded as NotifyIcon,
  BuildRounded as ConfigIcon,
  StorageRounded as DataIcon,
  PaletteRounded as BrandIcon,
  TranslateRounded as LangIcon,
  AccessTimeRounded as TimeIcon,
  SaveRounded as SaveIcon,
  DeleteForeverRounded as DangerIcon,
  ArrowForwardIosRounded as ArrowIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';

const colors = {
  paper: '#fffdf8',
  line: '#d8d0c4',
  text: '#2c2b28',
  muted: '#8b857d',
  blue: '#4a90e2',
  blueSoft: '#e9f2ff',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  red: '#d9635b',
  redSoft: '#fbeaea',
  orange: '#d18a1f',
  orangeSoft: '#fdf4e4',
  soft: '#f7f3ea'
};

const SectionHeader = ({ icon, title, desc }) => (
  <Stack direction="row" spacing={2.5} sx={{ mb: 4, mt: 1 }}>
    <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: colors.soft, display: 'grid', placeItems: 'center' }}>
      {React.cloneElement(icon, { sx: { color: colors.muted, fontSize: 22 } })}
    </Box>
    <Box>
      <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{title}</Typography>
      <Typography sx={{ fontSize: 13.5, color: colors.muted, mt: 0.2 }}>{desc}</Typography>
    </Box>
  </Stack>
);

const SettingRow = ({ label, desc, action, subLabel }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 3, borderBottom: `1px solid ${colors.line}`, '&:last-child': { borderBottom: 'none' } }}>
    <Box>
      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{label}</Typography>
      {desc && <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>{desc}</Typography>}
    </Box>
    <Stack direction="row" spacing={2} alignItems="center">
       {subLabel && <Typography sx={{ fontSize: 14, fontWeight: 800, color: colors.muted }}>{subLabel}</Typography>}
       {action}
    </Stack>
  </Stack>
);

export default function AdminSettings() {
  const { language } = useLanguage();
  const t = ADMIN_SETTINGS_TRANSLATIONS[language] || ADMIN_SETTINGS_TRANSLATIONS['en'];
  const [activeTab, setActiveTab] = useState('General');

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1200, mx: 'auto' }}>
        
        {/* Main Header */}
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>{t.title}</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              sx={{
                bgcolor: colors.blue,
                borderRadius: 3,
                px: 3,
                py: 1.25,
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 700,
                '&:hover': { bgcolor: colors.blue }
              }}
            >
              {t.save_changes}
            </Button>
          </Box>
        </Stack>

        <Grid container spacing={4}>
          {/* Sidebar Nav */}
          <Grid item xs={12} md={3}>
            <Box sx={{ p: 1.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                {Object.keys(t.tabs).map((tab) => (
                  <Button
                    key={tab}
                    fullWidth
                    onClick={() => setActiveTab(tab)}
                    sx={{
                      justifyContent: 'flex-start',
                      px: 2.5, py: 1.8,
                      borderRadius: 2.5,
                      mb: 1,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: 15,
                      color: activeTab === tab ? colors.blue : colors.text,
                      bgcolor: activeTab === tab ? colors.blueSoft : 'transparent',
                      '&:hover': { bgcolor: activeTab === tab ? colors.blueSoft : colors.soft },
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    {t.tabs[tab]}
                  </Button>
                ))}
             </Box>
          </Grid>

          {/* Content Area */}
          <Grid item xs={12} md={9}>
             <Box sx={{ p: 5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                
                {activeTab === 'General' && (
                  <Box>
                    <SectionHeader icon={<SettingsIcon />} title={t.general.title} desc={t.general.desc} />
                    <Stack>
                       <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: colors.soft }}>
                          <Avatar sx={{ width: 72, height: 72, bgcolor: colors.blue, fontSize: 24, fontWeight: 700 }}>SA</Avatar>
                          <Box>
                             <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Super Admin</Typography>
                             <Typography sx={{ fontSize: 14, color: colors.muted }}>seva.admin@seva.health</Typography>
                          </Box>
                          <Button variant="outlined" size="small" sx={{ ml: 'auto', borderRadius: 2, fontWeight: 700, borderColor: colors.line, color: colors.text, '&:hover': { borderColor: colors.text, bgcolor: 'transparent' } }}>{t.general.change_photo}</Button>
                       </Stack>
                       <SettingRow label={t.general.language} desc="Platform display language" action={<Button endIcon={<LangIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', fontWeight: 700 }}>English</Button>} />
                       <SettingRow label={t.general.timezone} desc="System-wide timestamp reference" action={<Button endIcon={<TimeIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', fontWeight: 700 }}>(GMT+05:30) IST</Button>} />
                    </Stack>
                  </Box>
                )}

                {activeTab === 'Security' && (
                  <Box>
                    <SectionHeader icon={<SecurityIcon />} title={t.security.title} desc={t.security.desc} />
                    <Stack>
                       <SettingRow label={t.security.two_factor} desc={t.security.two_factor_desc} action={<Switch defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.green }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.green } }} />} />
                       <SettingRow label={t.security.password_mgmt} desc={t.security.password_desc} action={<Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>{t.security.update_password}</Button>} />
                       <SettingRow label={t.security.session_timeout} desc="Auto-logout duration for inactive sessions" action={<Button sx={{ textTransform: 'none', fontWeight: 800, color: colors.blue }}>{t.security.hours_24}</Button>} />
                    </Stack>
                  </Box>
                )}

                {activeTab === 'Notifications' && (
                  <Box>
                    <SectionHeader icon={<NotifyIcon />} title={t.notifications.title} desc={t.notifications.desc} />
                    <Stack>
                       <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.muted, mt: 1, mb: 1 }}>{t.notifications.email_alerts}</Typography>
                       <SettingRow label={t.notifications.promotions} action={<Switch size="small" />} />
                       <SettingRow label={t.notifications.service_updates} action={<Switch defaultChecked size="small" />} />
                       <SettingRow label={t.notifications.security_alerts} action={<Switch defaultChecked size="small" />} />
                       
                       <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.muted, mt: 3, mb: 1 }}>{t.notifications.push_notifications}</Typography>
                       <SettingRow label={t.notifications.ongoing_consultations} action={<Switch defaultChecked size="small" />} />
                       <SettingRow label={t.notifications.system_health} action={<Switch defaultChecked size="small" />} />
 
                       <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.muted, mt: 3, mb: 1 }}>{t.notifications.sms_alerts}</Typography>
                       <SettingRow label={t.notifications.infra_error} action={<Switch defaultChecked size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.red }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.red } }} />} />
                    </Stack>
                  </Box>
                )}

                {activeTab === 'Platform' && (
                  <Box>
                    <SectionHeader icon={<ConfigIcon />} title={t.platform.title} desc={t.platform.desc} />
                    <Stack>
                       <SettingRow label={t.platform.new_enrollment} desc={t.platform.new_enrollment_desc} action={<Switch defaultChecked />} />
                       <SettingRow label={t.platform.doctor_verification} desc={t.platform.doctor_verification_desc} action={<Switch defaultChecked />} />
                       <SettingRow label={t.platform.patient_reg} desc={t.platform.patient_reg_desc} action={<Switch defaultChecked />} />
                       <SettingRow label={t.platform.min_fee} desc={t.platform.min_fee_desc} subLabel="₹100" />
                    </Stack>
                  </Box>
                )}

                {activeTab === 'Data' && (
                  <Box>
                    <SectionHeader icon={<DataIcon />} title={t.data.title} desc={t.data.desc} />
                    <Stack>
                       <SettingRow label={t.data.export_data} desc={t.data.export_desc} action={<Button variant="contained" sx={{ bgcolor: colors.text, borderRadius: 2 }}>{t.data.export_btn}</Button>} />
                       <SettingRow label={t.data.auto_delete} desc={t.data.auto_delete_desc} action={<Switch />} />
                       <SettingRow label={t.data.db_backup} desc={t.data.db_backup_desc} action={<Button sx={{ textTransform: 'none', fontWeight: 700 }}>{t.data.backup_interval}</Button>} />
                    </Stack>
                  </Box>
                )}

                {activeTab === 'Branding' && (
                  <Box>
                    <SectionHeader icon={<BrandIcon />} title={t.branding.title} desc={t.branding.desc} />
                    <Stack>
                       <SettingRow label={t.branding.logo} desc={t.branding.logo_desc} action={<Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>{t.branding.upload_svg}</Button>} />
                       <SettingRow label={t.branding.primary_color} subLabel="#2563eb" action={<Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: colors.blue, border: `1px solid ${colors.line}` }} />} />
                       <SettingRow label={t.branding.secondary_color} subLabel="#16a34a" action={<Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: colors.green, border: `1px solid ${colors.line}` }} />} />
                    </Stack>
                  </Box>
                )}

             </Box>

             {/* Danger Zone */}
             <Box sx={{ mt: 4, p: 4, borderRadius: 3.5, border: `1px solid ${colors.red}40`, bgcolor: colors.redSoft }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                   <Box>
                      <Typography sx={{ fontSize: 18, fontWeight: 800, color: colors.red }}>{t.danger_zone.title}</Typography>
                      <Typography sx={{ fontSize: 14, color: colors.red, mt: 0.5, opacity: 0.8 }}>{t.danger_zone.desc}</Typography>
                   </Box>
                   <Button startIcon={<DangerIcon />} variant="contained" color="error" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 800, px: 3, py: 1.25, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
                      {t.danger_zone.reset_btn}
                   </Button>
                </Stack>
             </Box>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}
