import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Grid, Avatar
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  AddRounded as AddIcon,
  CheckRounded as CheckIcon
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
  red: '#d9635b',
  redSoft: '#fdeaea',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  graySoft: '#f1eee7'
};

const STATS = [
  { title: 'Prescriptions\ntoday', value: '7', sub: '+2 pending\ndispensing', color: colors.green },
  { title: 'Medicines\nin stock', value: '142', sub: '6 items low\nstock', color: colors.amber },
  { title: 'Revenue\ntoday', value: '₹4,280', sub: '↑ 12% vs\nyesterday', color: colors.green },
  { title: 'Expiring\nsoon', value: '3', sub: 'Within 30\ndays', color: colors.red }
];

const PRESCRIPTIONS = [
  {
    initials: 'RK', name: 'Ramesh Kumar', details: 'Dr. Priya Sharma • 18 Mar 2026 • SVT-2024-00519',
    medicines: [
      { name: 'Paracetamol 500mg', status: 'ready' },
      { name: 'Amoxicillin 250mg', status: 'ready' },
      { name: 'ORS Sachets', status: 'low' }
    ],
    buttons: ['Mark Dispensed', 'View Rx']
  },
  {
    initials: 'PD', name: 'Priya Devi', details: 'Dr. Manish Rao • 22 Mar 2026 • SVT-2024-00520',
    medicines: [
      { name: 'Amlodipine 5mg', status: 'ready' },
      { name: 'Telmisartan 40mg', status: 'out' }
    ],
    buttons: ['Partial Dispense', 'Find Substitute']
  },
  {
    initials: 'SS', name: 'Suresh Singh', details: 'Dr. Priya Sharma • 23 Mar 2026 • SVT-2024-00521',
    medicines: [
      { name: 'Metformin 500mg', status: 'ready' },
      { name: 'Glimepiride 1mg', status: 'ready' }
    ],
    buttons: ['Mark Dispensed', 'View Rx']
  },
  {
    initials: 'MK', name: 'Meera Kumari', details: 'Dr. Anita Verma • 20 Mar 2026 • SVT-2024-00505',
    medicines: [
      { name: 'Iron + Folic', status: 'ready' },
      { name: 'Calcium 500mg', status: 'ready' }
    ],
    dispensed: true
  }
];

const ALERTS = [
  { title: 'Amoxicillin 250mg — expires 15 Apr 2026', sub: '23 days • 48 strips remaining', color: colors.red },
  { title: 'Cough syrup batch #B221 — expires 2 Apr 2026', sub: '10 days • 12 bottles remaining', color: colors.red },
  { title: 'ORS Sachets — stock low (14 packets)', sub: 'Reorder point: 20 packets', color: colors.amber },
  { title: 'Paracetamol 500mg — 35 strips left', sub: 'High demand item - reorder soon', color: colors.amber },
  { title: 'Supplier delivery: Medico Pharma', sub: 'Expected tomorrow - 5 items ordered', color: colors.blue }
];

const TOP_SOLD = [
  { name: 'Paracetamol 500mg', val: '248 strips' },
  { name: 'Amoxicillin 250mg', val: '156 strips' },
  { name: 'Amlodipine 5mg', val: '82 strips' },
  { name: 'ORS Sachets', val: '74 packs' },
  { name: 'Metformin 500mg', val: '61 strips' }
];

const INVENTORY = [
  { name: 'Paracetamol 500mg', val: '380', color: colors.amber },
  { name: 'Amoxicillin 250mg', val: '48', color: colors.amber },
  { name: 'Amlodipine 5mg', val: '120', color: colors.green },
  { name: 'ORS Sachets', val: '14', color: colors.red },
  { name: 'Telmisartan 40mg', val: '0', color: colors.red },
  { name: 'Vitamin C 500mg', val: '200', color: colors.green }
];

const ORDERS = [
  { name: 'Medico Pharma', sub: '8 items • ₹12,400 • Due tomorrow', status: 'In transit', statusColor: colors.greenSoft, textColor: colors.greenDark },
  { name: 'Apollo Wholesale', sub: '3 items • ₹5,200 • Due 26 Mar', status: 'Confirmed', statusColor: colors.amberSoft, textColor: colors.amber },
  { name: 'Jan Aushadhi Depot', sub: '12 items • ₹3,800 • Due 1 Apr', status: 'Ordered', statusColor: colors.blueSoft, textColor: colors.blue },
  { name: 'Cipla Distributor', sub: '5 items • ₹7,600 • Due 5 Apr', status: 'Draft', statusColor: colors.graySoft, textColor: colors.text }
];

const StatCard = ({ title, value, sub, color }) => (
  <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, flex: '1 1 0', minWidth: 140 }}>
    <Typography sx={{ fontSize: 13, color: colors.text, whiteSpace: 'pre-line', lineHeight: 1.3, height: 40 }}>
      {title}
    </Typography>
    <Typography sx={{ mt: 1, fontSize: 32, fontWeight: 400, fontFamily: 'Georgia, serif' }}>
      {value}
    </Typography>
    <Typography sx={{ mt: 0.5, fontSize: 12.5, color, whiteSpace: 'pre-line', lineHeight: 1.3 }}>
      {sub}
    </Typography>
  </Box>
);

const Pill = ({ label, active, outlined }) => (
  <Box sx={{ 
    px: 1.8, 
    py: 0.5, 
    borderRadius: 99, 
    fontSize: 13, 
    bgcolor: active ? colors.green : outlined ? 'transparent' : colors.graySoft,
    color: active ? '#fff' : colors.text,
    border: outlined ? `1px solid ${colors.line}` : 'none',
    cursor: 'pointer'
  }}>
    {label}
  </Box>
);

const MedBadge = ({ name, status }) => {
  let bgcolor = colors.greenSoft;
  let color = colors.greenDark;
  let icon = <CheckIcon sx={{ fontSize: 14, ml: 0.5 }} />;
  
  if (status === 'low') {
    bgcolor = colors.amberSoft;
    color = colors.amber;
    icon = <Typography component="span" sx={{ fontSize: 11, ml: 0.5 }}>(low)</Typography>;
  } else if (status === 'out') {
    bgcolor = colors.redSoft;
    color = colors.red;
    icon = <Typography component="span" sx={{ fontSize: 11, ml: 0.5 }}>(out)</Typography>;
  }

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor, color, fontSize: 11.5, mr: 1, mb: 1 }}>
      {name}
      {icon}
    </Box>
  );
};

export default function PharmacyDashboard() {
  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-start' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 38 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              Pharmacy<br />Dashboard
            </Typography>
            <Typography sx={{ mt: 1.5, color: colors.muted, fontSize: 14.5 }}>
              Manage prescriptions, stock and<br/>sales
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
            <Button startIcon={<AddIcon />} sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, borderRadius: 2.5, px: 2, py: 1, textTransform: 'none', fontSize: 14.5, height: 42 }}>
              Add Medicine
            </Button>
          </Stack>
        </Stack>

        {/* Stats Row */}
        <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {STATS.map(s => <StatCard key={s.title} {...s} />)}
        </Stack>

        {/* Main Grid 1 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3, mb: 3 }}>
          
          {/* Prescription Queue */}
          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 18 }}>Prescription Queue</Typography>
              <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>View all →</Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto' }}>
              <Pill label="All" active />
              <Pill label="Pending" />
              <Pill label="Ready" />
              <Pill label="Dispensed" outlined />
            </Stack>

            <Stack spacing={0}>
              {PRESCRIPTIONS.map((p, idx) => (
                <Box key={p.name} sx={{ display: 'flex', gap: 2, py: 2.5, borderTop: idx !== 0 ? `1px solid ${colors.line}` : 'none', position: 'relative' }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: colors.greenSoft, color: colors.greenDark, fontSize: 14, fontWeight: 600 }}>
                    {p.initials}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 15, mb: 0.2 }}>{p.name}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: colors.muted, mb: 1.5 }}>{p.details}</Typography>
                    <Box sx={{ mb: 1.5 }}>
                      {p.medicines.map(m => (
                        <MedBadge key={m.name} name={m.name} status={m.status} />
                      ))}
                    </Box>
                    {p.buttons && (
                      <Stack direction="row" spacing={1.5}>
                        {p.buttons.map((btn, i) => (
                          <Button key={btn} sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, px: 2, py: 0.6, fontSize: 13, textTransform: 'none' }}>
                            {btn}
                          </Button>
                        ))}
                      </Stack>
                    )}
                  </Box>
                  {p.dispensed && (
                    <Box sx={{ position: 'absolute', top: 20, right: 0, px: 1.5, py: 0.5, bgcolor: colors.graySoft, borderRadius: 99, fontSize: 11.5 }}>
                      Dispensed
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Expiry Alerts & Sales */}
          <Stack spacing={3}>
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 18, lineHeight: 1.2 }}>Expiry & Stock<br/>Alerts</Typography>
                <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>View<br/>all →</Typography>
              </Stack>
              <Stack spacing={2.5}>
                {ALERTS.map((a, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: a.color, mt: 0.8, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontSize: 13.5, lineHeight: 1.3, mb: 0.3 }}>{a.title}</Typography>
                      <Typography sx={{ fontSize: 12.5, color: colors.muted, lineHeight: 1.2 }}>{a.sub}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
            
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 18, lineHeight: 1.2 }}>Today's<br/>Sales</Typography>
                <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>Full report<br/>→</Typography>
              </Stack>
              <Box sx={{ height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', pt: 2 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'].map((day, i) => (
                  <Box key={day} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Box sx={{ 
                      width: '60%', 
                      bgcolor: i === 6 ? colors.green : i === 5 ? '#5cc09e' : colors.greenSoft, 
                      height: i === 6 ? 60 : i === 5 ? 40 : 20 + Math.random() * 30,
                      borderRadius: '4px 4px 0 0'
                    }} />
                    <Typography sx={{ fontSize: 10.5, color: colors.muted }}>{day}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Bottom Lists */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          
          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 18, lineHeight: 1.2 }}>Top<br/>Medicines<br/>Sold</Typography>
              <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer', textAlign: 'right' }}>This<br/>month<br/>→</Typography>
            </Stack>
            <Stack spacing={0}>
              {TOP_SOLD.map((item, idx) => (
                <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: idx !== TOP_SOLD.length - 1 ? `1px solid ${colors.line}` : 'none' }}>
                  <Typography sx={{ fontSize: 14 }}>{item.name}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: colors.muted, textAlign: 'right', width: 50, lineHeight: 1.2 }}>{item.val}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 18, lineHeight: 1.2 }}>Inventory<br/>Snapshot</Typography>
              <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer', textAlign: 'right' }}>Manage<br/>→</Typography>
            </Stack>
            <Stack spacing={0}>
              {INVENTORY.map((item, idx) => (
                <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: idx !== INVENTORY.length - 1 ? `1px solid ${colors.line}` : 'none' }}>
                  <Typography sx={{ fontSize: 14 }}>{item.name}</Typography>
                  <Typography sx={{ fontSize: 14, color: item.color, fontWeight: 600 }}>{item.val}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 18, lineHeight: 1.2 }}>Supplier<br/>Orders</Typography>
              <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer', textAlign: 'right' }}>New<br/>order<br/>→</Typography>
            </Stack>
            <Stack spacing={0}>
              {ORDERS.map((item, idx) => (
                <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: idx !== ORDERS.length - 1 ? `1px solid ${colors.line}` : 'none', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: 14, mb: 0.2 }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: colors.muted }}>{item.sub}</Typography>
                  </Box>
                  <Box sx={{ px: 1.2, py: 0.4, borderRadius: 99, bgcolor: item.statusColor, color: item.textColor, fontSize: 11 }}>
                    {item.status}
                  </Box>
                </Box>
              ))}
            </Stack>
            <Button fullWidth sx={{ mt: 2, border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, textTransform: 'none', py: 1, fontSize: 14 }}>
              View all orders
            </Button>
          </Box>

        </Box>
      </Box>
    </PharmacyLayout>
  );
}