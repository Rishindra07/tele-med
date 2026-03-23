import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Avatar, Switch, Table, TableBody, TableCell, TableRow
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  EditRounded as EditIcon,
  SettingsRounded as SettingsIcon,
  AddRounded as AddIcon,
  CheckCircleRounded as VerifiedIcon,
  CameraAltRounded as CameraIcon,
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
  greenSoft: '#dff3eb',
  amber: '#d18a1f',
  amberSoft: '#fbefdc',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  purple: '#8e44ad',
  purpleSoft: '#f4f0f9',
  tan: '#9b7b4b',
  tanSoft: '#f7f1e8',
  graySoft: '#f1eee7'
};

const TABS = ['Basic info', 'Licences', 'Staff', 'Hours', 'Notifications', 'Bank / UPI'];

const STAFF = [
  { name: 'Rajesh Arora', phone: '+91 98140 22211', email: 'rajesh.arora@gmail.com', role: 'Owner', initials: 'RA' },
  { name: 'Sukhwinder Mehta', phone: '+91 97300 44512', email: 'Registered Pharmacist', role: 'Pharmacist', initials: 'SM' },
  { name: 'Preet Kaur', phone: '+91 95100 78234', email: 'Part-time', role: 'Helper', initials: 'PK' }
];

const NOTIFICATIONS = [
  { title: 'New prescription received', sub: 'SMS + app push alert', active: true },
  { title: 'Low stock alert', sub: 'When below reorder point', active: true },
  { title: 'Expiry alert (30 days)', sub: 'Daily digest SMS', active: true },
  { title: 'Supplier delivery reminder', sub: '1 day before due date', active: true },
  { title: 'Payment due reminder', sub: '3 days before due date', active: false }
];

const InfoRow = ({ label, value, verified }) => (
  <TableRow sx={{ '& td': { border: 'none', py: 0.8, px: 0 } }}>
    <TableCell sx={{ color: colors.muted, fontSize: 13, width: 140 }}>{label}</TableCell>
    <TableCell>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography sx={{ fontSize: 13, color: colors.text }}>{value}</Typography>
        {verified && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: colors.greenSoft, px: 0.8, py: 0.2, borderRadius: 1.5 }}>
            <VerifiedIcon sx={{ fontSize: 12, color: colors.green }} />
            <Typography sx={{ fontSize: 10, color: colors.green, fontWeight: 600 }}>Verified</Typography>
          </Box>
        )}
      </Stack>
    </TableCell>
  </TableRow>
);

export default function PharmacyProfile() {
  const [activeTab, setActiveTab] = useState('Basic info');

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 13, color: colors.muted, mb: 1.5 }}>Home › Settings › <Typography component="span" sx={{ color: colors.green }}>Pharmacy Profile</Typography></Typography>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              Pharmacy Profile
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5 }}>
              Manage your registration, staff and account<br/>settings
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ bgcolor: colors.soft, color: '#5f5a52', borderRadius: 2.5, px: 2, py: 1, fontSize: 13, lineHeight: 1.25, textAlign: 'center' }}>
              Mon, 23<br />March<br />2026
            </Box>
            <IconButton sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', width: 42, height: 42 }}>
              <Badge color="error" variant="dot">
                <BellIcon sx={{ color: '#5f5a52' }} />
              </Badge>
            </IconButton>
            <Button sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, borderRadius: 2.5, px: 2, py: 1, textTransform: 'none', fontSize: 14.5, height: 42 }}>
              Edit<br/>profile
            </Button>
          </Stack>
        </Stack>

        {/* Top Profile Card */}
        <Box sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems={{ xs: 'center', md: 'flex-start' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: colors.greenSoft, color: colors.greenDark, fontSize: 24, fontWeight: 600 }}>AM</Avatar>
              <IconButton size="small" sx={{ position: 'absolute', bottom: -4, right: -4, bgcolor: colors.green, color: '#fff', border: '2px solid #fff', '&:hover': { bgcolor: colors.greenDark } }}>
                <CameraIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: 28, fontFamily: 'Georgia, serif', mb: 1 }}>Arora Medical Store</Typography>
              <Typography sx={{ fontSize: 13.5, color: colors.muted, mb: 3 }}>General Pharmacy - Garhshankar,<br/>Hoshiarpur, Punjab — 144527</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Box sx={{ px: 1.5, py: 0.6, borderRadius: 1.5, bgcolor: colors.greenSoft, color: colors.greenDark, fontSize: 12, fontWeight: 500 }}>Seva TeleHealth linked</Box>
                <Box sx={{ px: 1.5, py: 0.6, borderRadius: 1.5, bgcolor: colors.purpleSoft, color: colors.purple, fontSize: 12, fontWeight: 500 }}>Jan Aushadhi registered</Box>
                <Box sx={{ px: 1.5, py: 0.6, borderRadius: 1.5, bgcolor: colors.blueSoft, color: colors.blue, fontSize: 12, fontWeight: 500 }}>GSTIN verified</Box>
                <Box sx={{ px: 1.5, py: 0.6, borderRadius: 1.5, bgcolor: colors.tanSoft, color: colors.tan, fontSize: 12, fontWeight: 500 }}>Drug licence valid</Box>
              </Stack>
            </Box>
            <Stack direction="row" spacing={6} sx={{ pt: { xs: 2, md: 4 } }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 22, fontWeight: 500 }}>142</Typography>
                <Typography sx={{ fontSize: 12, color: colors.muted }}>SKUs stocked</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 22, fontWeight: 500 }}>4</Typography>
                <Typography sx={{ fontSize: 12, color: colors.muted }}>Staff accounts</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 22, fontWeight: 500 }}>3</Typography>
                <Typography sx={{ fontSize: 12, color: colors.muted }}>Yrs on Seva</Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* Tab Navigation */}
        <Stack direction="row" spacing={1} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {TABS.map(tab => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                textTransform: 'none', borderRadius: 2, px: 2.5, py: 0.8, fontSize: 14, minWidth: 0, whiteSpace: 'nowrap',
                bgcolor: activeTab === tab ? colors.green : 'transparent',
                color: activeTab === tab ? '#fff' : colors.text,
                '&:hover': { bgcolor: activeTab === tab ? colors.greenDark : colors.soft }
              }}
            >
              {tab}
            </Button>
          ))}
        </Stack>

        {/* Main Grid: 3 Columns of Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
          
          {/* Basic Information */}
          <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16 }}>Basic information</Typography>
              <Button size="small" sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5 }}>Edit</Button>
            </Stack>
            <Table size="small">
              <TableBody>
                <InfoRow label="Pharmacy name" value="Arora Medical Store" />
                <InfoRow label="Owner name" value="Rajesh Arora" />
                <InfoRow label="Mobile" value="+91 98140 22211" verified />
                <InfoRow label="Email" value="arora.medical@gmail.com" />
                <InfoRow label="Village / Town" value="Garhshankar" />
                <InfoRow label="District & PIN" value="Hoshiarpur — 144527" />
                <InfoRow label="Aadhaar" value="XXXX XXXX 7821" verified />
              </TableBody>
            </Table>
          </Box>

          {/* Licences & Registrations */}
          <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16 }}>Licences & registrations</Typography>
              <Button size="small" sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5 }}>Edit</Button>
            </Stack>
            <Table size="small">
              <TableBody>
                <InfoRow label="Drug licence no." value="PB-HSP-2021-0482" />
                <InfoRow label="Licence valid till" value="31 Dec 2026" />
                <InfoRow label="GSTIN" value="03AABCA1234Z1Z5" verified />
                <InfoRow label="GST registration" value="Regular taxpayer" />
                <InfoRow label="Jan Aushadhi ID" value="JA-PB-2022-1144" />
                <InfoRow label="Jan Aushadhi valid" value="Mar 2027" />
                <InfoRow label="FSSAI (if food items)" value="required" />
              </TableBody>
            </Table>
          </Box>

          {/* Seva TeleHealth Link */}
          <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16 }}>Seva TeleHealth link</Typography>
              <Button size="small" sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5 }}>Settings</Button>
            </Stack>
            <Table size="small">
              <TableBody>
                <InfoRow label="Connection status" value="Connected" />
                <InfoRow label="Pharmacy ID" value="SVT-PHM-2023-0091" />
                <InfoRow label="Visible to patients" value="Yes — 0.8 km radius" />
                <InfoRow label="Prescriptions received" value="1,248" />
                <InfoRow label="Patient rating" value="4.7 / 5 (88 reviews)" />
                <InfoRow label="Total Rxs fulfilled" value="1,180" />
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* Bottom Section Grid: 2:1 Split */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3 }}>
          
          {/* Staff Accounts Card */}
          <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16 }}>Staff accounts</Typography>
              <Button startIcon={<AddIcon />} sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5 }}>Add staff</Button>
            </Stack>
            
            <Stack spacing={3} sx={{ mb: 4 }}>
              {STAFF.map(s => (
                <Box key={s.name} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: colors.soft, color: colors.muted, fontSize: 15 }}>{s.initials}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontSize: 14.5, fontWeight: 500 }}>{s.name}</Typography>
                      {s.role === 'Owner' && <Typography sx={{ fontSize: 10, color: colors.green, bgcolor: colors.greenSoft, px: 1, py: 0.2, borderRadius: 1 }}>Owner</Typography>}
                    </Stack>
                    <Typography sx={{ fontSize: 12.5, color: colors.muted }}>{s.phone} • {s.email}</Typography>
                  </Box>
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: s.role === 'Pharmacist' ? colors.blueSoft : colors.graySoft, color: s.role === 'Pharmacist' ? colors.blue : colors.muted, fontSize: 11, fontWeight: 500 }}>
                    {s.role}
                  </Box>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ mb: 3 }} />
            <Typography sx={{ fontSize: 14.5, mb: 2 }}>Role permissions</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: colors.graySoft }}>
                <Typography sx={{ fontSize: 11, color: colors.green, fontWeight: 600, mb: 0.5 }}>Owner</Typography>
                <Typography sx={{ fontSize: 12.5, color: colors.muted }}>Full access to all modules and billing</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: colors.graySoft }}>
                <Typography sx={{ fontSize: 11, color: colors.blue, fontWeight: 600, mb: 0.5 }}>Pharmacist</Typography>
                <Typography sx={{ fontSize: 12.5, color: colors.muted }}>Rx + inventory management only</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: colors.graySoft }}>
                <Typography sx={{ fontSize: 11, color: colors.muted, fontWeight: 600, mb: 0.5 }}>Helper</Typography>
                <Typography sx={{ fontSize: 12.5, color: colors.muted }}>Billing and checkout access only</Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Col: Hours and Notifications */}
          <Stack spacing={3}>
            
            {/* Operating Hours */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: 16 }}>Operating hours</Typography>
                <Button size="small" sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5 }}>Edit</Button>
              </Stack>
              <Table size="small">
                <TableBody>
                  <TableRow sx={{ '& td': { border: 'none', py: 0.8, px: 0 } }}>
                    <TableCell sx={{ fontSize: 13, color: colors.muted }}>Mon–Sat</TableCell>
                    <TableCell sx={{ fontSize: 13, textAlign: 'right' }}>8:00 AM — 9:00 PM</TableCell>
                  </TableRow>
                  <TableRow sx={{ '& td': { border: 'none', py: 0.8, px: 0 } }}>
                    <TableCell sx={{ fontSize: 13, color: colors.muted }}>Sunday</TableCell>
                    <TableCell sx={{ fontSize: 13, textAlign: 'right' }}>9:00 AM — 2:00 PM</TableCell>
                  </TableRow>
                  <TableRow sx={{ '& td': { border: 'none', py: 0.8, px: 0 } }}>
                    <TableCell sx={{ fontSize: 13, color: colors.muted }}>Holidays</TableCell>
                    <TableCell sx={{ fontSize: 13, textAlign: 'right', color: colors.red }}>Closed</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ fontSize: 13.5 }}>24-hour mode</Typography>
                  <Typography sx={{ fontSize: 11, color: colors.muted }}>Toggle for emergencies</Typography>
                </Box>
                <Switch size="small" />
              </Stack>
            </Box>

            {/* Notification Settings */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 16 }}>Notification settings</Typography>
                <Button size="small" sx={{ border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', px: 2, borderRadius: 1.5 }}>Edit</Button>
              </Stack>
              <Stack spacing={2.5}>
                {NOTIFICATIONS.map(n => (
                  <Stack key={n.title} direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 13 }}>{n.title}</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>{n.sub}</Typography>
                    </Box>
                    <Switch defaultChecked={n.active} size="small" color="success" />
                  </Stack>
                ))}
              </Stack>
            </Box>

          </Stack>
        </Box>
      </Box>
    </PharmacyLayout>
  );
}
