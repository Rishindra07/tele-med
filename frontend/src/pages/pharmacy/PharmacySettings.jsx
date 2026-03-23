import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  TextField, MenuItem, Select, FormControl, Avatar, Switch, Slider,
  List, ListItem, ListItemIcon, ListItemText, ListItemButton
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  SettingsRounded as SettingsIcon,
  LanguageRounded as LanguageIcon,
  Inventory2Rounded as InventoryIcon,
  ShoppingCartRounded as OrderIcon,
  ReceiptLongRounded as BillingIcon,
  PeopleRounded as StaffIcon,
  SecurityRounded as SecurityIcon,
  LinkRounded as LinkIcon,
  DeleteForeverRounded as DeleteIcon,
  DownloadRounded as DownloadIcon,
  LightModeRounded as LightIcon,
  DarkModeRounded as DarkIcon,
  MonitorRounded as SystemIcon,
} from '@mui/icons-material';
import PharmacyLayout from '../../components/PharmacyLayout';

const colors = {
  paper: '#ffffff',
  bg: '#f9f9f9',
  line: '#ebe9e0',
  soft: '#f5f1e8',
  text: '#252525',
  muted: '#6f6a62',
  green: '#26a37c',
  greenDark: '#1e8363',
  greenSoft: '#dff3eb',
  red: '#d9635b',
  redSoft: '#fdeaea',
  blue: '#4a90e2',
  graySoft: '#f1eee7'
};

const CATEGORIES = [
  { id: 'general', label: 'General', icon: <SettingsIcon /> },
  { id: 'platform', label: 'Platform Link', icon: <LinkIcon /> },
  { id: 'inventory', label: 'Orders & Inventory', icon: <InventoryIcon /> },
  { id: 'billing', label: 'Billing & GST', icon: <BillingIcon /> },
  { id: 'staff', label: 'Staff & Roles', icon: <StaffIcon /> },
  { id: 'security', label: 'Security', icon: <SecurityIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <BellIcon /> }
];

const LANGUAGES = [
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' }
];

export default function PharmacySettings() {
  const [activeCat, setActiveCat] = useState('inventory');
  const [threshold, setThreshold] = useState(50);
  const [expiryWindow, setExpiryWindow] = useState(90);

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 13, color: colors.muted, mb: 1.5 }}>Home › <Typography component="span" sx={{ color: colors.green }}>Settings</Typography></Typography>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              Settings
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5 }}>
              Manage your pharmacy platform preferences and<br/>configurations
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', width: 42, height: 42 }}>
              <Badge color="error" variant="dot">
                <BellIcon sx={{ color: '#5f5a52' }} />
              </Badge>
            </IconButton>
            <Button sx={{ bgcolor: colors.green, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontSize: 14.5, fontWeight: 600, '&:hover': { bgcolor: colors.greenDark } }}>
              Save changes
            </Button>
          </Stack>
        </Stack>

        {/* Content Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px 1fr' }, gap: 4 }}>
          
          {/* Internal Navigation Sidebar */}
          <Box>
            <List sx={{ p: 0, bgcolor: colors.paper, borderRadius: 4, border: `1px solid ${colors.line}`, overflow: 'hidden' }}>
              {CATEGORIES.map(cat => (
                <ListItem key={cat.id} disablePadding>
                  <ListItemButton 
                    selected={activeCat === cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    sx={{ 
                      py: 2, px: 3,
                      '&.Mui-selected': { 
                        bgcolor: colors.greenSoft, 
                        color: colors.green,
                        '& .MuiListItemIcon-root': { color: colors.green }
                      },
                      '&:hover': { bgcolor: colors.graySoft }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: colors.muted }}>{cat.icon}</ListItemIcon>
                    <ListItemText primary={cat.label} primaryTypographyProps={{ fontSize: 14.5, fontWeight: activeCat === cat.id ? 600 : 400 }} />
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider />
              <ListItem disablePadding>
                <ListItemButton sx={{ py: 2, px: 3, color: colors.red }}>
                  <ListItemIcon sx={{ minWidth: 40, color: colors.red }}><DeleteIcon /></ListItemIcon>
                  <ListItemText primary="Delete account" primaryTypographyProps={{ fontSize: 14.5 }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>

          {/* Settings Canvas */}
          <Stack spacing={4}>
            
            {/* General Section */}
            <SettingsSection title="General Preferences" sub="Language and visual appearance of the portal">
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                <Box>
                  <Typography sx={{ fontSize: 14, mb: 1.5 }}>Primary Language</Typography>
                  <Select fullWidth value="en" size="small" sx={{ borderRadius: 2 }}>
                    {LANGUAGES.map(l => (
                      <MenuItem key={l.code} value={l.code}>{l.flag} &nbsp; {l.name}</MenuItem>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, mb: 1.5 }}>Theme Mode</Typography>
                  <Stack direction="row" spacing={1}>
                    <ThemeButton selected icon={<LightIcon />} label="Light" />
                    <ThemeButton icon={<DarkIcon />} label="Dark" />
                    <ThemeButton icon={<SystemIcon />} label="System" />
                  </Stack>
                </Box>
              </Box>
            </SettingsSection>

            {/* Orders & Inventory Section */}
            <SettingsSection title="Orders & Inventory" sub="Automate and manage your stock thresholds">
              <Stack spacing={4}>
                <Box>
                  <Typography sx={{ fontSize: 14.5, mb: 1 }}>Low stock threshold</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted, mb: 2 }}>Visual warning when items fall below this count</Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider 
                      value={threshold} 
                      onChange={(_, v) => setThreshold(v)} 
                      min={10} max={200} step={10}
                      sx={{ color: colors.green }} 
                    />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>10 units</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.green, fontWeight: 600 }}>{threshold} units</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>200 units</Typography>
                    </Stack>
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 14.5, mb: 1 }}>Expiry warning window</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted, mb: 2 }}>Mark items as 'Expiring Soon' this many days before</Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider 
                      value={expiryWindow} 
                      onChange={(_, v) => setExpiryWindow(v)} 
                      min={30} max={180} step={30}
                      sx={{ color: colors.blue }} 
                    />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>30 days</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.blue, fontWeight: 600 }}>{expiryWindow} days</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>180 days</Typography>
                    </Stack>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <ToggleSetting title="Auto-hide out of stock items" sub="Remove items from patient view if stock is 0" active />
                  <ToggleSetting title="Auto-generate Purchase Orders" sub="Suggest POs when items reach low threshold" />
                  <ToggleSetting title="PO approval required" sub="Owner must approve POs before sending to supplier" active />
                </Stack>
              </Stack>
            </SettingsSection>

            {/* Billing & GST Section */}
            <SettingsSection title="Billing & GST" sub="Tax configuration and localized invoice settings">
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                <Box>
                  <Typography sx={{ fontSize: 14, mb: 1.5 }}>GST Identification Number</Typography>
                  <TextField fullWidth placeholder="03AABCA1234Z1Z5" size="small" />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, mb: 1.5 }}>Taxation Type</Typography>
                  <Select fullWidth value="regular" size="small">
                    <MenuItem value="regular">Regular Taxpayer</MenuItem>
                    <MenuItem value="comp">Composition Scheme</MenuItem>
                  </Select>
                </Box>
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Typography sx={{ fontSize: 14, mb: 1.5 }}>Invoice Footer Text</Typography>
                  <TextField fullWidth multiline rows={2} placeholder="Thank you for your business. Please stay healthy!" />
                </Box>
              </Box>
            </SettingsSection>

            {/* Data & Security Section */}
            <SettingsSection title="Data & Privacy" sub="Manage your data and security preferences">
              <Stack spacing={3}>
                <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.graySoft }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 14.5, fontWeight: 500 }}>Export Audit Logs</Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>Download all pharmacy activity logs in Excel format</Typography>
                    </Box>
                    <Button startIcon={<DownloadIcon />} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', color: colors.text, borderColor: colors.line }}>
                      Export
                    </Button>
                  </Stack>
                </Box>
                <Box>
                  <ToggleSetting title="Two-factor Authentication" sub="Add extra security to owner login" active />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, mb: 1.5 }}>Login Session Duration</Typography>
                  <Select fullWidth value="8h" size="small" sx={{ maxWidth: 300 }}>
                    <MenuItem value="1h">1 Hour</MenuItem>
                    <MenuItem value="8h">8 Hours</MenuItem>
                    <MenuItem value="24h">24 Hours</MenuItem>
                  </Select>
                </Box>
              </Stack>
            </SettingsSection>

          </Stack>
        </Box>
      </Box>
    </PharmacyLayout>
  );
}

function SettingsSection({ title, sub, children }) {
  return (
    <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
      <Typography sx={{ fontSize: 20, mb: 1 }}>{title}</Typography>
      <Typography sx={{ fontSize: 13, color: colors.muted, mb: 4 }}>{sub}</Typography>
      <Divider sx={{ mb: 4 }} />
      {children}
    </Box>
  );
}

function ThemeButton({ selected, icon, label }) {
  return (
    <Button 
      fullWidth 
      startIcon={icon} 
      sx={{ 
        textTransform: 'none', borderRadius: 2, py: 1, px: 2, border: `1px solid ${selected ? colors.green : colors.line}`,
        bgcolor: selected ? colors.greenSoft : 'transparent',
        color: selected ? colors.green : colors.text,
        '&:hover': { bgcolor: selected ? colors.greenSoft : colors.graySoft }
      }}
    >
      {label}
    </Button>
  );
}

function ToggleSetting({ title, sub, active }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography sx={{ fontSize: 14.5 }}>{title}</Typography>
        <Typography sx={{ fontSize: 12, color: colors.muted }}>{sub}</Typography>
      </Box>
      <Switch defaultChecked={active} color="success" />
    </Stack>
  );
}
