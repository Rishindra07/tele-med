import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Avatar, Divider,
  TextField, InputAdornment, MenuItem, Select, FormControl
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  SearchRounded as SearchIcon,
  WarningRounded as WarningIcon,
  CheckRounded as CheckIcon,
  ErrorOutlineRounded as ErrorIcon,
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
  { title: 'Received\ntoday', value: '7', sub: '+2 since\nyesterday', color: colors.green, textColor: colors.green },
  { title: 'Pending', value: '3', sub: '2 awaiting\nstock', color: colors.amber, textColor: colors.amber },
  { title: 'Ready to\ndispense', value: '2', sub: 'Patients\nnotified', color: colors.green, textColor: colors.green },
  { title: 'Dispensed\ntoday', value: '5', sub: 'Last: 11:45\nAM', color: colors.blue, textColor: colors.muted }
];

const FILTERS = [
  { label: 'All', count: 7, active: true },
  { label: 'Pending', count: 2 },
  { label: 'Ready', count: 2 },
  { label: 'Dispensed', count: 5 },
  { label: 'Urgent', count: 1, color: colors.red },
  { label: 'Cancelled', count: 0 }
];

const QUEUE = [
  {
    initials: 'SS', name: 'Suresh Singh', tag: 'Urgent', tagColor: 'red', borderColor: colors.red,
    details: 'Dr. Priya Sharma • General Physician • 23 Mar 2026 • 9:15 AM\nPatient ID: SVT-2024-00523 • Rx: JAK-20251122-001',
    meds: [
      { name: 'Metformin 500mg', status: 'ready' },
      { name: 'Glimepiride 1mg', status: 'ready' },
      { name: 'Vitamin B12', status: 'ready' }
    ],
    buttons: ['Mark dispensed', 'View full Rx', 'Print label', 'Call patient']
  },
  {
    initials: 'RK', name: 'Ramesh Kumar', tag: 'Ready', tagColor: 'green', borderColor: colors.green,
    details: 'Dr. Priya Sharma • General Physician • 18 Mar 2026\nPatient ID: SVT-2024-00482 • Rx: JAK-20263182-001',
    alert: 'Penicillin allergy on record — verify Amoxicillin is appropriate',
    meds: [
      { name: 'Paracetamol 500mg', status: 'ready' },
      { name: 'Amoxicillin 250mg', status: 'low' },
      { name: 'ORS Sachets', status: 'ready' }
    ],
    buttons: ['Mark dispensed', 'View full Rx', 'Print label', 'Call patient']
  },
  {
    initials: 'PD', name: 'Priya Devi', tag: 'Pending', tagColor: 'amber', borderColor: colors.amber,
    details: 'Dr. Manish Rao • Cardiologist • 22 Mar 2026\nPatient ID: SVT-2024-00520 • Rx: MAK-20263222-002',
    meds: [
      { name: 'Amlodipine 5mg', status: 'ready' },
      { name: 'Telmisartan 40mg', status: 'out' }
    ],
    buttons: ['Partial dispense', 'Find substitute', 'View full Rx', 'Notify patient']
  },
  {
    initials: 'MK', name: 'Meera Kumari', tag: 'Pending', tagColor: 'amber', borderColor: colors.amber,
    details: 'Dr. Anita Verma • Gynecologist • 21 Mar 2026\nPatient ID: SVT-2024-00504 • Rx: JAK-20263212-003',
    meds: [
      { name: 'Iron + Folic Acid', status: 'ready' },
      { name: 'Calcium 500mg', status: 'ready' },
      { name: 'Vitamin D3', status: 'ready' }
    ],
    buttons: ['Mark dispensed', 'View full Rx', 'Call patient']
  },
  {
    initials: 'AK', name: 'Ajay Kumar', tag: 'Dispensed', tagColor: 'gray', borderColor: colors.line,
    details: 'Dr. Priya Sharma • General Physician • 20 Mar 2026\nPatient ID: SVT-2024-00497 • Rx: RAK-20263205-180',
    meds: [
      { name: 'Cetirizine 10mg', status: 'ready' },
      { name: 'Montelukast 10mg', status: 'ready' }
    ],
    buttons: ['View receipt', 'Reprint label']
  }
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

const MedBadge = ({ name, status }) => {
  let bgcolor = colors.greenSoft;
  let color = colors.greenDark;
  let icon = <CheckIcon sx={{ fontSize: 13, ml: 0.5 }} />;
  
  if (status === 'low') {
    bgcolor = colors.amberSoft;
    color = colors.amber;
    icon = <Typography component="span" sx={{ fontSize: 11, ml: 0.5 }}>(low)</Typography>;
  } else if (status === 'out') {
    bgcolor = colors.redSoft;
    color = colors.red;
    icon = <Typography component="span" sx={{ fontSize: 11, ml: 0.5 }}>(out of stock)</Typography>;
  }

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor, color, fontSize: 12, mr: 1, mb: 1 }}>
      {name}
      {icon}
    </Box>
  );
};

export default function PharmacyPrescriptions() {
  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-start' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              Prescriptions
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5 }}>
              Manage your upcoming and past<br/>consultations
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
              + Manual<br/>Entry
            </Button>
          </Stack>
        </Stack>

        {/* Stats Row */}
        <Stack direction="row" spacing={2} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
          {STATS.map(s => <StatCard key={s.title} {...s} />)}
        </Stack>

        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'flex', alignItems: 'center', border: `1px solid ${colors.line}`, borderRadius: 2.5, px: 1.5, py: 0.5, bgcolor: colors.paper, width: 42 
            }}>
              <SearchIcon sx={{ color: colors.muted, fontSize: 20 }} />
            </Box>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value="all" sx={{ borderRadius: 2.5, bgcolor: colors.paper, fontSize: 14, '& fieldset': { borderColor: colors.line } }}>
                <MenuItem value="all">All doctors</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value="today" sx={{ borderRadius: 2.5, bgcolor: colors.paper, fontSize: 14, '& fieldset': { borderColor: colors.line } }}>
                <MenuItem value="today">Today</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {FILTERS.map(f => <PillFilter key={f.label} {...f} />)}
          </Stack>
        </Box>

        {/* Main 2-Col Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' }, gap: 3 }}>
          
          {/* Left Col: Queue */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 15, color: colors.muted }}>Prescription<br/>queue</Typography>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select value="newest" sx={{ borderRadius: 2, bgcolor: colors.paper, fontSize: 13, height: 32, '& fieldset': { borderColor: colors.line } }}>
                  <MenuItem value="newest">Sort: Newest first</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack spacing={2}>
              {QUEUE.map(q => {
                let badgeBg = colors.graySoft;
                let badgeColor = colors.text;
                if (q.tagColor === 'red') { badgeBg = colors.redSoft; badgeColor = colors.red; }
                if (q.tagColor === 'green') { badgeBg = colors.greenSoft; badgeColor = colors.greenDark; }
                if (q.tagColor === 'amber') { badgeBg = colors.amberSoft; badgeColor = colors.amber; }

                return (
                  <Box key={q.name} sx={{ 
                    display: 'flex', gap: 2, p: 2.5, pr: 3, pt: 3,
                    bgcolor: colors.paper, borderRadius: 3, 
                    border: `1px solid ${colors.line}`,
                    borderLeft: `3px solid ${q.borderColor}`,
                    position: 'relative' 
                  }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: colors.soft, color: colors.text, fontSize: 15, fontWeight: 500 }}>
                      {q.initials}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>{q.name}</Typography>
                        <Box sx={{ px: 1.5, py: 0.2, borderRadius: 99, bgcolor: badgeBg, color: badgeColor, fontSize: 11.5, fontWeight: q.tagColor==='red'?600:400 }}>
                          {q.tag}
                        </Box>
                      </Stack>
                      <Typography sx={{ fontSize: 13, color: colors.muted, whiteSpace: 'pre-line', lineHeight: 1.4, mb: 1.5 }}>
                        {q.details}
                      </Typography>

                      {q.alert && (
                        <Box sx={{ display: 'flex', gap: 1, p: 1.5, borderRadius: 2, bgcolor: colors.redSoft, color: colors.red, fontSize: 12.5, mb: 2 }}>
                          <WarningIcon sx={{ fontSize: 18 }} />
                          {q.alert}
                        </Box>
                      )}

                      <Box sx={{ mb: 2 }}>
                        {q.meds.map(m => <MedBadge key={m.name} name={m.name} status={m.status} />)}
                      </Box>

                      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                        {q.buttons.map(btn => (
                          <Button key={btn} sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, px: 2, py: 0.6, fontSize: 13, textTransform: 'none' }}>
                            {btn}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Right Col: Details */}
          <Box>
            <Typography sx={{ fontSize: 15, mb: 2 }}>Selected prescription —<br/>Ramesh Kumar</Typography>
            
            <Box sx={{ p: 3, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 1.5, fontSize: 13.5 }}>
                <Typography sx={{ color: colors.muted }}>Patient</Typography>
                <Typography sx={{ textAlign: 'right' }}>Ramesh Kumar<br/>42 yrs, Male</Typography>
                
                <Typography sx={{ color: colors.muted }}>Patient ID</Typography>
                <Typography sx={{ textAlign: 'right' }}>SVT-2024-<br/>00482</Typography>
                
                <Typography sx={{ color: colors.muted, mt: 1 }}>Doctor</Typography>
                <Typography sx={{ textAlign: 'right', mt: 1 }}>Dr. Priya Sharma</Typography>
                
                <Typography sx={{ color: colors.muted }}>Issued on</Typography>
                <Typography sx={{ textAlign: 'right' }}>18 Mar 2026<br/>11:00 AM</Typography>
                
                <Typography sx={{ color: colors.muted }}>Valid till</Typography>
                <Typography sx={{ textAlign: 'right' }}>17 Apr 2026</Typography>
                
                <Typography sx={{ color: colors.muted }}>Diagnosis</Typography>
                <Typography sx={{ textAlign: 'right' }}>Viral fever<br/>(38.5°C)</Typography>
                
                <Typography sx={{ color: colors.muted, mt: 1 }}>Allergy tag</Typography>
                <Typography sx={{ textAlign: 'right', mt: 1 }}>Penicillin<br/>allergy</Typography>
              </Box>
            </Box>

            <Typography sx={{ fontSize: 15, mb: 2 }}>Medicines & dosage</Typography>
            <Box sx={{ p: 2, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 0.5fr', gap: 1, mb: 1, fontSize: 12, color: colors.muted, borderBottom: `1px solid ${colors.line}`, pb: 1 }}>
                <Box>Medicine</Box>
                <Box>Dosage</Box>
                <Box>Days</Box>
                <Box>Status</Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 0.5fr', gap: 1, py: 1.5, borderBottom: `1px solid ${colors.line}`, fontSize: 12.5, alignItems: 'center' }}>
                <Box>Paracetamol<br/>500mg</Box>
                <Box>1-0-1</Box>
                <Box>5</Box>
                <CheckIcon sx={{ fontSize: 16, color: colors.green }} />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 0.5fr', gap: 1, py: 1.5, borderBottom: `1px solid ${colors.line}`, fontSize: 12.5, alignItems: 'center' }}>
                <Box>Amoxicillin<br/>250mg</Box>
                <Box>1-0-1</Box>
                <Box>7</Box>
                <WarningIcon sx={{ fontSize: 16, color: colors.amber }} />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 0.5fr', gap: 1, py: 1.5, fontSize: 12.5, alignItems: 'center' }}>
                <Box>ORS<br/>Sachets</Box>
                <Box>As<br/>needed</Box>
                <Box>—</Box>
                <CheckIcon sx={{ fontSize: 16, color: colors.green }} />
              </Box>

              <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                <Button fullWidth sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, textTransform: 'none', py: 0.8 }}>
                  Mark<br/>dispensed
                </Button>
                <Button fullWidth sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, textTransform: 'none', py: 0.8 }}>
                  Print<br/>label
                </Button>
              </Stack>
            </Box>

            <Typography sx={{ fontSize: 15, mb: 2 }}>Activity timeline</Typography>
            <Box sx={{ p: 3, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 3 }}>
              <Box sx={{ position: 'relative', pl: 3, borderLeft: `2px solid ${colors.line}` }}>
                
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <Box sx={{ position: 'absolute', left: -31, top: 4, width: 10, height: 10, borderRadius: 5, bgcolor: colors.green }} />
                  <Typography sx={{ fontSize: 13, lineHeight: 1.3 }}>Prescription received<br/>from Dr. Priya Sharma</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted, mt: 0.5 }}>18 Mar 2026 11:05 AM</Typography>
                </Box>
                
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <Box sx={{ position: 'absolute', left: -31, top: 4, width: 10, height: 10, borderRadius: 5, bgcolor: colors.blue }} />
                  <Typography sx={{ fontSize: 13, lineHeight: 1.3 }}>Stock verified — all<br/>medicines available</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted, mt: 0.5 }}>18 Mar 2026 11:06 AM</Typography>
                </Box>
                
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <Box sx={{ position: 'absolute', left: -31, top: 4, width: 10, height: 10, borderRadius: 5, bgcolor: colors.amber }} />
                  <Typography sx={{ fontSize: 13, lineHeight: 1.3 }}>Patient notified via<br/>SMS — prescription<br/>ready</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted, mt: 0.5 }}>18 Mar 2026 11:07 AM</Typography>
                </Box>
                
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: -31, top: 4, width: 10, height: 10, borderRadius: 5, bgcolor: colors.line }} />
                  <Typography sx={{ fontSize: 13, lineHeight: 1.3 }}>Awaiting patient pickup</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mt: 0.5 }}>Pending</Typography>
                </Box>

              </Box>
            </Box>

            <Typography sx={{ fontSize: 15, mb: 2 }}>Upcoming reminders</Typography>
            <Box sx={{ p: 3, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: colors.green }} />
                    <Typography sx={{ fontSize: 13, lineHeight: 1.2 }}>Suresh Singh —<br/>urgent pickup</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12.5, color: colors.muted }}>Today</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: colors.amber }} />
                    <Typography sx={{ fontSize: 13, lineHeight: 1.2 }}>Priya Devi —<br/>Telmisartan<br/>restock</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12.5, color: colors.text, fontWeight: 500 }}>Pending</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: colors.blue }} />
                    <Typography sx={{ fontSize: 13, lineHeight: 1.2 }}>Amoxicillin low<br/>stock — reorder</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12.5, color: colors.muted }}>Today</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: colors.graySoft }} />
                    <Typography sx={{ fontSize: 13, lineHeight: 1.2 }}>Amoxicillin<br/>course ends<br/>Ramesh</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12.5, color: colors.text, fontWeight: 500 }}>25 Mar</Typography>
                </Box>
              </Stack>
            </Box>

          </Box>

        </Box>
      </Box>
    </PharmacyLayout>
  );
}
