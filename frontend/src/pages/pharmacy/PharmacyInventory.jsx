import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  TextField, MenuItem, Select, FormControl, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  SearchRounded as SearchIcon,
  AddRounded as AddIcon
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
  { title: 'Total SKUs', value: '142', sub: '12 added this\nmonth', color: colors.green, textColor: colors.green },
  { title: 'In stock', value: '128', sub: '90%\navailability', color: colors.green, textColor: colors.green },
  { title: 'Low stock', value: '6', sub: 'Below reorder\npoint', color: colors.amber, textColor: colors.amber },
  { title: 'Out of\nstock', value: '8', sub: 'Action needed', color: colors.red, textColor: colors.red }
];

const FILTERS = [
  { label: 'All', count: 142, active: true },
  { label: 'In stock', count: 128 },
  { label: 'Low stock', count: 6 },
  { label: 'Out of stock', count: 8, color: colors.red },
  { label: 'Expiring soon', count: 3, color: colors.red },
  { label: 'Jan Aushadhi' }
];

const STOCK = [
  { name: 'Paracetamol 500mg', type: 'Paracetamol • Tablet', cat: 'OTC', catBg: colors.graySoft, catColor: colors.text, stock: '38 strips', status: 'low', mrp: '₹12', expiry: 'Jun 2028' },
  { name: 'Amoxicillin 250mg', type: 'Amoxicillin • Capsule', cat: 'Antibiotic', catBg: colors.blueSoft, catColor: colors.blue, stock: '14 strips', status: 'low', mrp: '₹85', expiry: 'Apr 2026' },
  { name: 'Amlodipine 5mg', type: 'Amlodipine • Tablet', cat: 'Antihypert.', catBg: colors.blueSoft, catColor: colors.blue, stock: '120 strips', status: 'ok', mrp: '₹45', expiry: 'Nov 2027' },
  { name: 'Telmisartan 40mg', type: 'Telmisartan • Tablet', cat: 'Antihypert.', catBg: colors.blueSoft, catColor: colors.blue, stock: '0 strips', status: 'out', mrp: '₹45', expiry: '—' },
  { name: 'ORS Sachets', type: 'Oral Rehydration • Sachet', cat: 'Jan Aushadhi', catBg: colors.greenSoft, catColor: colors.greenDark, stock: '8 packs', status: 'out', mrp: '₹18', expiry: 'Jan 2026' },
  { name: 'Metformin 500mg', type: 'Metformin • Tablet', cat: 'Antidiabetic', catBg: colors.blueSoft, catColor: colors.blue, stock: '88 strips', status: 'ok', mrp: '₹28', expiry: 'Aug 2027' },
  { name: 'Vitamin C 500mg', type: 'Ascorbic Acid • Tablet', cat: 'Vitamin', catBg: colors.graySoft, catColor: colors.text, stock: '200 strips', status: 'ok', mrp: '₹15', expiry: 'Dec 2026' },
  { name: 'Glimepiride 1mg', type: 'Glimepiride • Tablet', cat: 'Antidiabetic', catBg: colors.blueSoft, catColor: colors.blue, stock: '22 strips', status: 'low', mrp: '₹35', expiry: 'Sep 2027' }
];

const CATEGORIES = [
  { count: 48, label: 'Antibiotics' },
  { count: 31, label: 'Antihypert.' },
  { count: 24, label: 'Antidiabetic' },
  { count: 19, label: 'Vitamins' },
  { count: 12, label: 'Jan\nAushadhi' },
  { count: 8, label: 'OTC /\nGeneral' }
];

const REORDERS = [
  { title: 'Telmisartan 40mg —\nout of stock', sub: '0 units • 2 active\nprescriptions waiting', dot: colors.red },
  { title: 'ORS Sachets —\ncritically low', sub: '8 packs • reorder point:\n20', dot: colors.red },
  { title: 'Paracetamol 500mg\n— low stock', sub: '38 strips • reorder point:\n50', dot: colors.amber },
  { title: 'Amoxicillin 250mg —\nlow + near expiry', sub: '14 strips • expires Apr\n2026', dot: colors.amber },
  { title: 'Glimepiride 1mg —\nlow stock', sub: '22 strips • reorder point:\n30', dot: colors.amber }
];

const StatCard = ({ title, value, sub, color, textColor }) => (
  <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, flex: '1 1 0', minWidth: 140 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: color }} />
      <Typography sx={{ fontSize: 13, color: colors.text, whiteSpace: 'pre-line', lineHeight: 1.3 }}>
        {title}
      </Typography>
    </Box>
    <Typography sx={{ fontSize: 32, fontWeight: 400, fontFamily: 'Georgia, serif' }}>
      {value}
    </Typography>
    <Typography sx={{ mt: 0.5, fontSize: 12.5, color: textColor, whiteSpace: 'pre-line', lineHeight: 1.3 }}>
      {sub}
    </Typography>
  </Box>
);

const PillFilter = ({ label, count, active, color }) => (
  <Button sx={{ 
    textTransform: 'none', 
    borderRadius: 99, 
    px: 1.8, 
    py: 0.6, 
    fontSize: 13,
    bgcolor: active ? colors.green : 'transparent',
    color: active ? '#fff' : colors.text,
    border: `1px solid ${active ? colors.green : colors.line}`,
    minWidth: 0,
    '&:hover': { bgcolor: active ? colors.greenDark : colors.graySoft }
  }}>
    {label}{count !== undefined && (
      <Box component="span" sx={{ 
        ml: 1, 
        px: 0.8, 
        py: 0.2, 
        borderRadius: 99, 
        fontSize: 11, 
        bgcolor: active ? '#fff' : colors.graySoft, 
        color: active ? colors.greenDark : (color || colors.text),
        fontWeight: color ? 600 : 400
      }}>
        {count}
      </Box>
    )}
  </Button>
);

export default function PharmacyInventory() {
  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-start' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              Inventory
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5 }}>
              Manage your complete medicines<br/>stock
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
              + Add<br/>medicine
            </Button>
          </Stack>
        </Stack>

        {/* Stats Row */}
        <Stack direction="row" spacing={2} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
          {STATS.map(s => <StatCard key={s.title} {...s} />)}
        </Stack>

        {/* Filters */}
        <Box sx={{ p: 2, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 4 }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'flex', alignItems: 'center', border: `1px solid ${colors.line}`, borderRadius: 2.5, px: 1.5, py: 0.5, bgcolor: colors.paper, width: 42 
            }}>
              <SearchIcon sx={{ color: colors.muted, fontSize: 20 }} />
            </Box>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value="all" sx={{ borderRadius: 2.5, bgcolor: colors.paper, fontSize: 14, '& fieldset': { borderColor: colors.line } }}>
                <MenuItem value="all">All categories</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value="name" sx={{ borderRadius: 2.5, bgcolor: colors.paper, fontSize: 14, '& fieldset': { borderColor: colors.line } }}>
                <MenuItem value="name">Sort: Name A–Z</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {FILTERS.map(f => <PillFilter key={f.label} {...f} />)}
          </Stack>
        </Box>

        {/* Main 2-Col Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3 }}>
          
          {/* Left Col: Stock List */}
          <Box sx={{ borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper, overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 16 }}>Stock list</Typography>
              <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>Export CSV →</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.soft }}>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>Medicine</TableCell>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>Category</TableCell>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>Stock</TableCell>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>Level</TableCell>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>MRP</TableCell>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>Expiry</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {STOCK.map((row, idx) => {
                    let statusColor = colors.green;
                    if (row.status === 'low') statusColor = colors.amber;
                    if (row.status === 'out') statusColor = colors.red;
                    
                    return (
                      <TableRow key={idx} sx={{ '& td': { borderBottom: `1px solid ${colors.line}`, py: 2 } }}>
                        <TableCell>
                          <Typography sx={{ fontSize: 14 }}>{row.name}</Typography>
                          <Typography sx={{ fontSize: 12, color: colors.muted }}>{row.type}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'inline-flex', px: 1.2, py: 0.4, borderRadius: 99, bgcolor: row.catBg, color: row.catColor, fontSize: 11 }}>
                            {row.cat}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, color: statusColor }}>{row.stock}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ width: 24, height: 4, borderRadius: 2, bgcolor: statusColor }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{row.mrp}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{row.expiry}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Right Col: Cards Stack */}
          <Stack spacing={3}>
            
            {/* Quick add medicine */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 15, mb: 2 }}>Quick add medicine</Typography>
              <Stack spacing={1.5}>
                <TextField placeholder="Medicine name" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: colors.paper } }} />
                <TextField placeholder="Generic name" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: colors.paper } }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField placeholder="Batch n" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  <TextField placeholder="Qty" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField placeholder="MRP (₹)" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  <TextField placeholder="Expiry Date" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Box>
                <FormControl size="small">
                  <Select value="cat" sx={{ borderRadius: 2, color: colors.muted, '& fieldset': { borderColor: colors.line } }}>
                    <MenuItem value="cat">Select category</MenuItem>
                  </Select>
                </FormControl>
                <TextField placeholder="Rack / shelf location" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: colors.paper } }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
                  <Button sx={{ bgcolor: colors.green, color: '#fff', borderRadius: 2, textTransform: 'none', py: 1, '&:hover': { bgcolor: colors.greenDark } }}>
                    Save<br/>medicine
                  </Button>
                  <Button sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, textTransform: 'none', py: 1 }}>
                    Scan<br/>barcode
                  </Button>
                </Box>
              </Stack>
            </Box>

            {/* Stock by category */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 15, mb: 2 }}>Stock by category</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {CATEGORIES.map(c => (
                  <Box key={c.label} sx={{ p: 1.5, borderRadius: 2, bgcolor: colors.soft }}>
                    <Typography sx={{ fontSize: 18, fontFamily: 'Georgia, serif' }}>{c.count}</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.muted, whiteSpace: 'pre-line', lineHeight: 1.2, mt: 0.5 }}>{c.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Reorder alerts */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 15, mb: 2 }}>Reorder alerts</Typography>
              <Stack spacing={2.5}>
                {REORDERS.map((r, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: r.dot, mt: 0.8, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontSize: 13.5, lineHeight: 1.25, mb: 0.3, whiteSpace: 'pre-line' }}>{r.title}</Typography>
                      <Typography sx={{ fontSize: 12.5, color: colors.muted, lineHeight: 1.2, whiteSpace: 'pre-line' }}>{r.sub}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Button fullWidth sx={{ mt: 3, bgcolor: colors.green, color: '#fff', borderRadius: 2, textTransform: 'none', py: 1, '&:hover': { bgcolor: colors.greenDark } }}>
                Create reorder list
              </Button>
            </Box>

          </Stack>

        </Box>
      </Box>
    </PharmacyLayout>
  );
}
