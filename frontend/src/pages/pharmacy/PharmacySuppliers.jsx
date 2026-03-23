import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Avatar, Chip
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  AddRounded as AddIcon,
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
  graySoft: '#f1eee7'
};

const STATS = [
  { title: 'Total\nsuppliers', value: '4', sub: 'All active', color: colors.blue },
  { title: 'In transit', value: '1', sub: 'Arriving\ntomorrow', color: colors.green },
  { title: 'Pending\npayment', value: '₹18,200', sub: '2 suppliers', color: colors.amber },
  { title: 'This month\nspend', value: '₹44,800', sub: '4 orders\nplaced', color: colors.blue }
];

const FILTERS = [
  { label: 'All', active: true },
  { label: 'In transit' },
  { label: 'Confirmed' },
  { label: 'Ordered' },
  { label: 'Delivered' },
  { label: 'Draft' }
];

const ORDERS = [
  {
    supplier: 'Medico Pharma',
    orderId: '#ORD-2026-041',
    status: 'In transit',
    statusColor: colors.green,
    statusBg: colors.greenSoft,
    details: '8 items • ₹12,400 • Placed 20 Mar 2026 • Due tomorrow',
    items: ['Paracetamol 500mg × 100', 'Cough syrup × 24', '+6 more'],
    buttons: ['Confirm delivery', 'View items', 'Track order', 'Call supplier'],
    borderColor: colors.green,
    initials: 'MP'
  },
  {
    supplier: 'Apollo Wholesale',
    orderId: '#ORD-2026-039',
    status: 'Confirmed',
    statusColor: colors.amber,
    statusBg: colors.amberSoft,
    details: '3 items • ₹5,800 • Placed 21 Mar 2026 • Due 25 Mar',
    items: ['Amlodipine 5mg × 200', 'Telmisartan 40mg × 100', '+1 more'],
    buttons: ['View items', 'Edit order', 'Call supplier'],
    borderColor: colors.amber,
    initials: 'AW'
  },
  {
    supplier: 'Jan Aushadhi Depot',
    orderId: '#ORD-2026-038',
    status: 'Ordered',
    statusColor: colors.blue,
    statusBg: colors.blueSoft,
    details: '12 items • ₹3,800 • Placed 22 Mar 2026 • Due 1 Apr',
    items: ['ORS Sachets × 50', 'Vitamin C × 300', '+10 more'],
    buttons: ['View items', 'Cancel order', 'Call supplier'],
    borderColor: colors.blue,
    initials: 'JA'
  },
  {
    supplier: 'Cipla Distributor',
    orderId: 'Draft order',
    status: 'Draft',
    statusColor: colors.muted,
    statusBg: colors.graySoft,
    details: '5 items • ₹7,600 • Not placed yet • Due 5 Apr',
    items: ['Metformin 500mg × 200', 'Glimepiride 1mg × 100', '+3 more'],
    buttons: ['Place order', 'Edit draft', 'Delete'],
    borderColor: colors.line,
    initials: 'CD'
  }
];

const DIRECTORY = [
  { name: 'Medico Pharma', phone: '+91 98100 44321', city: 'Ludhiana', initials: 'MP' },
  { name: 'Apollo Wholesale', phone: '+91 98200 11234', city: 'Chandigarh', initials: 'AW' },
  { name: 'Jan Aushadhi Depot', phone: '+91 97300 55678', city: 'Hoshiarpur', initials: 'JA' },
  { name: 'Cipla Distributor', phone: '+91 95000 87654', city: 'Amritsar', initials: 'CD' }
];

const PAYMENTS = [
  { name: 'Medico Pharma', date: 'Due 30 Mar 2026', amt: '₹12,400' },
  { name: 'Apollo Wholesale', date: 'Due 6 Apr 2026', amt: '₹5,800' }
];

const REORDER = [
  { name: 'Telmisartan 40mg', need: 'Need 100 strips', color: colors.red },
  { name: 'ORS Sachets', need: 'Need 50 packs', color: colors.red },
  { name: 'Paracetamol 500mg', need: 'Need 100 strips', color: colors.amber },
  { name: 'Glimepiride 1mg', need: 'Need 50 strips', color: colors.amber }
];

const StatCard = ({ title, value, sub, color }) => (
  <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, flex: '1 1 0' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: color }} />
      <Typography sx={{ fontSize: 13, color: colors.text, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{title}</Typography>
    </Box>
    <Typography sx={{ fontSize: 32, fontFamily: 'Georgia, serif' }}>{value}</Typography>
    <Typography sx={{ mt: 0.5, fontSize: 12.5, color: colors.green, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{sub}</Typography>
  </Box>
);

const SectionTitle = ({ title, action }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
    <Typography sx={{ fontSize: 18 }}>{title}</Typography>
    {action && <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>{action}</Typography>}
  </Stack>
);

export default function PharmacySuppliers() {
  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              Suppliers
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5 }}>
              Manage distributor relationships, orders and<br/>deliveries
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
              + New<br/>order
            </Button>
          </Stack>
        </Stack>

        {/* Stats Row */}
        <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {STATS.map(s => <StatCard key={s.title} {...s} />)}
        </Stack>

        {/* Main Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' }, gap: 3 }}>
          
          {/* Left Column: Orders */}
          <Box>
            <SectionTitle title="Orders" action="Purchase history →" />
            
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              {FILTERS.map(f => (
                <Box key={f.label} sx={{ px: 2, py: 0.6, borderRadius: 99, border: `1px solid ${colors.line}`, fontSize: 13, bgcolor: f.active ? colors.green : 'transparent', color: f.active ? '#fff' : colors.text }}>
                  {f.label}
                </Box>
              ))}
            </Stack>

            <Stack spacing={2.5}>
              {ORDERS.map((o, idx) => (
                <Box key={idx} sx={{ 
                  display: 'flex', gap: 2.5, p: 3, bgcolor: colors.paper, borderRadius: 4, 
                  border: `1px solid ${colors.line}`, borderLeft: `3px solid ${o.borderColor}` 
                }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: colors.soft, color: colors.muted, fontSize: 16 }}>{o.initials}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>{o.supplier} —</Typography>
                        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>{o.orderId}</Typography>
                      </Box>
                      <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: o.statusBg, color: o.statusColor, fontSize: 11, fontWeight: 600 }}>
                        {o.status}
                      </Box>
                    </Stack>
                    <Typography sx={{ fontSize: 13, color: colors.muted, mb: 2, whiteSpace: 'pre-line' }}>{o.details}</Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                      {o.items.map(item => (
                        <Box key={item} sx={{ px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: colors.graySoft, color: colors.muted, fontSize: 11 }}>
                          {item}
                        </Box>
                      ))}
                    </Stack>

                    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                      {o.buttons.map(btn => (
                        <Button key={btn} sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, px: 2.5, py: 0.8, fontSize: 13, textTransform: 'none' }}>
                          {btn}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Right Column: Sidebar */}
          <Stack spacing={3}>
            
            {/* Supplier Directory */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 16, mb: 3 }}>Supplier directory</Typography>
              <Stack spacing={3}>
                {DIRECTORY.map(d => (
                  <Box key={d.name} sx={{ display: 'flex', gap: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: colors.soft, color: colors.muted, fontSize: 14 }}>{d.initials}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{d.name}</Typography>
                        <Typography sx={{ fontSize: 10, color: colors.green, fontWeight: 600 }}>Active</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>{d.phone}</Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>{d.city}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Button fullWidth startIcon={<AddIcon />} sx={{ mt: 3, border: `1px dashed ${colors.line}`, color: colors.green, borderRadius: 2, textTransform: 'none', py: 1, fontSize: 13 }}>
                Add supplier
              </Button>
            </Box>

            {/* Pending Payments */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 16, mb: 3 }}>Pending payments</Typography>
              <Stack spacing={2}>
                {PAYMENTS.map(p => (
                  <Stack key={p.name} direction="row" justifyContent="space-between">
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{p.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>{p.date}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: colors.red }}>{p.amt}</Typography>
                  </Stack>
                ))}
                <Divider />
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Total due</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.red }}>₹18,200</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Auto-reorder suggestions */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 16, mb: 1 }}>Auto-reorder suggestions</Typography>
              <Typography sx={{ fontSize: 12, color: colors.muted, mb: 3 }}>Items below reorder point —<br/>pre-fill order form</Typography>
              <Stack spacing={2.5}>
                {REORDER.map(r => (
                  <Stack key={r.name} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: r.color, mt: 0.8 }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{r.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>{r.need}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
              <Button fullWidth sx={{ mt: 3, bgcolor: colors.green, color: '#fff', borderRadius: 2, textTransform: 'none', py: 1.2, fontWeight: 600, '&:hover': { bgcolor: colors.greenDark } }}>
                Create reorder draft
              </Button>
            </Box>

          </Stack>
        </Box>
      </Box>
    </PharmacyLayout>
  );
}
