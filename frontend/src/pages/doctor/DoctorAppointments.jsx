import React, { useState } from 'react';
import {
  Box, Typography, Button, Avatar, Stack, Select,
  MenuItem, FormControl, IconButton, Popover, Chip
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  PhoneInTalk as PhoneIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';

/* ─── helpers ─────────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const DOT_COLORS = {
  checkup:   '#2563EB',
  lab:       '#10B981',
  emergency: '#EF4444',
};

// Seed appointments for visual richness
const SEED_APPTS = {
  '2026-03-02': [{ type: 'checkup' }, { type: 'lab' }],
  '2026-03-04': [{ type: 'emergency' }],
  '2026-03-06': [{ type: 'checkup' }, { type: 'lab' }, { type: 'emergency' }],
  '2026-03-09': [{ type: 'checkup' }],
  '2026-03-10': [{ type: 'lab' }],
  '2026-03-11': [{ type: 'checkup' }, { type: 'emergency' }],
  '2026-03-12': [
    { type: 'checkup', patient: { name: 'Nathan E. Edwards', title: 'Surgeon', status: 'Online' } },
    { type: 'lab' },
  ],
  '2026-03-14': [{ type: 'emergency' }],
  '2026-03-15': [{ type: 'checkup' }, { type: 'lab' }],
  '2026-03-16': [{ type: 'emergency' }],
  '2026-03-17': [{ type: 'lab' }],
  '2026-03-18': [{ type: 'checkup' }],
  '2026-03-19': [{ type: 'lab' }, { type: 'emergency' }],
  '2026-03-22': [{ type: 'checkup' }],
  '2026-03-24': [{ type: 'checkup' }, { type: 'lab' }],
  '2026-03-25': [{ type: 'emergency' }],
  '2026-03-29': [{ type: 'lab' }],
  '2026-03-31': [{ type: 'checkup' }, { type: 'lab' }],
};

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Get first day-of-week (Mon=0) for a given month
function firstWeekdayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay(); // 0=Sun
  return (d + 6) % 7; // convert to Mon=0
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/* ─── Dot indicator ────────────────────────────────────── */
const Dot = ({ color }) => (
  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
);

/* ─── Component ───────────────────────────────────────── */
export default function DoctorAppointments() {
  const today = new Date();
  const [view, setView] = useState('month');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDoctor, setSelectedDoctor] = useState('Nathan E. Edwards');
  const [popover, setPopover] = useState({ anchor: null, day: null });

  const totalDays = daysInMonth(year, month);
  const startOffset = firstWeekdayOfMonth(year, month);

  // Build grid cells: nulls for leading blanks, then 1..totalDays
  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  function handleDayClick(e, day) {
    if (!day) return;
    const key = toKey(year, month, day);
    const appts = SEED_APPTS[key];
    if (appts) setPopover({ anchor: e.currentTarget, day, key });
  }

  const isToday = (day) =>
    day && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  const currentAppts = popover.key ? (SEED_APPTS[popover.key] || []) : [];
  const featuredPatient = currentAppts.find(a => a.patient)?.patient;

  return (
    <DoctorLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: '"Outfit", sans-serif' }}>

        {/* ── Page header ─────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" fontWeight="700" color="#0F172A">
           
          </Typography>
          <Stack direction="row" spacing={1}>
            {['Months', 'Week', 'Year'].map(v => (
              <Button
                key={v}
                size="small"
                onClick={() => setView(v.toLowerCase())}
                variant={view === v.toLowerCase() ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  borderColor: '#E2E8F0',
                  color: view === v.toLowerCase() ? 'white' : '#64748B',
                  bgcolor: view === v.toLowerCase() ? '#2563EB' : 'white',
                  '&:hover': { bgcolor: view === v.toLowerCase() ? '#1D4ED8' : '#F8FAFC', borderColor: '#C4D0E0' },
                  boxShadow: 'none',
                  textTransform: 'none',
                }}
              >
                {v}
              </Button>
            ))}
            {/* Month selector */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={month}
                onChange={e => setMonth(e.target.value)}
                sx={{ borderRadius: 2, fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', borderColor: '#E2E8F0', bgcolor: 'white' }}
              >
                {MONTHS.map((m, i) => <MenuItem key={m} value={i}>{m}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* ── Sub-row: doctor selector + nav ──────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedDoctor}
              onChange={e => setSelectedDoctor(e.target.value)}
              sx={{ borderRadius: 2, fontSize: '0.85rem', fontWeight: 500, bgcolor: 'white', borderColor: '#E2E8F0' }}
            >
              <MenuItem value="Nathan E. Edwards">Nathan E. Edwards</MenuItem>
              <MenuItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small" onClick={prevMonth} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography fontWeight="700" color="#0F172A" sx={{ minWidth: 180, textAlign: 'center' }}>
              {MONTHS[month]} {year}
            </Typography>
            <IconButton size="small" onClick={nextMonth} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2 }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* ── Calendar grid ───────────────────────────── */}
        <Box sx={{
          bgcolor: 'white',
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
        }}>
          {/* Day headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E2E8F0' }}>
            {DAYS.map((d, i) => (
              <Box key={d} sx={{
                py: 1.5,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: '#64748B',
                borderRight: i < 6 ? '1px solid #F1F5F9' : 'none',
              }}>
                {d}
              </Box>
            ))}
          </Box>

          {/* Day cells */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((day, idx) => {
              const key = day ? toKey(year, month, day) : null;
              const appts = key ? (SEED_APPTS[key] || []) : [];
              const today_ = isToday(day);
              const col = idx % 7;

              return (
                <Box
                  key={idx}
                  onClick={(e) => handleDayClick(e, day)}
                  sx={{
                    minHeight: 90,
                    p: 1,
                    borderRight: col < 6 ? '1px solid #F1F5F9' : 'none',
                    borderBottom: idx < cells.length - 7 ? '1px solid #F1F5F9' : 'none',
                    bgcolor: !day ? '#FAFBFC' : today_ ? '#EFF6FF' : 'white',
                    cursor: day && appts.length ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                    '&:hover': day && appts.length ? { bgcolor: '#F0F7FF' } : {},
                    position: 'relative',
                  }}
                >
                  {day && (
                    <>
                      <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: today_ ? '#2563EB' : 'transparent',
                        mb: 1,
                      }}>
                        <Typography
                          sx={{
                            fontSize: '0.82rem',
                            fontWeight: today_ ? 700 : 500,
                            color: today_ ? 'white' : !day ? '#CBD5E1' : '#1E293B',
                          }}
                        >
                          {String(day).padStart(2, '0')}
                        </Typography>
                      </Box>

                      {/* Dot indicators */}
                      {appts.length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                          {appts.map((a, i) => <Dot key={i} color={DOT_COLORS[a.type]} />)}
                        </Stack>
                      )}
                    </>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── Legend ──────────────────────────────────── */}
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 2.5, justifyContent: 'center' }}>
          {[
            { label: 'Doctor Checkup', color: DOT_COLORS.checkup },
            { label: 'Laboratory test', color: DOT_COLORS.lab },
            { label: 'Emergency Patient', color: DOT_COLORS.emergency },
          ].map(item => (
            <Stack key={item.label} direction="row" spacing={0.8} alignItems="center">
              <Dot color={item.color} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>{item.label}</Typography>
            </Stack>
          ))}
        </Stack>

        {/* ── Appointment Popover ──────────────────────── */}
        <Popover
          open={Boolean(popover.anchor)}
          anchorEl={popover.anchor}
          onClose={() => setPopover({ anchor: null, day: null, key: null })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              p: 2.5,
              width: 260,
              border: '1px solid #E2E8F0',
            }
          }}
        >
          {/* Doctor info */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ width: 38, height: 38, bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 700 }}>
                {(featuredPatient?.name || selectedDoctor).charAt(0)}
              </Avatar>
              <Box>
                <Typography fontSize="0.85rem" fontWeight={700} color="#0F172A">
                  {featuredPatient?.name || selectedDoctor}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981' }} />
                  <Typography fontSize="0.7rem" color="#10B981" fontWeight={600}>
                    {featuredPatient?.status || 'Online'}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <IconButton size="small" sx={{ bgcolor: '#EFF6FF', borderRadius: 2 }}>
              <PhoneIcon sx={{ fontSize: 16, color: '#2563EB' }} />
            </IconButton>
          </Box>

          {/* Appointment type chips */}
          <Stack direction="row" spacing={0.8} flexWrap="wrap" sx={{ mb: 2 }}>
            {currentAppts.map((a, i) => (
              <Chip
                key={i}
                label={a.type === 'checkup' ? 'Checkup' : a.type === 'lab' ? 'Lab Test' : 'Emergency'}
                size="small"
                sx={{
                  bgcolor: DOT_COLORS[a.type] + '20',
                  color: DOT_COLORS[a.type],
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  border: `1px solid ${DOT_COLORS[a.type]}40`,
                }}
              />
            ))}
          </Stack>

          {/* Time slots (decorative) */}
          <Box sx={{ display: 'flex', gap: 0.8, mb: 2, flexWrap: 'wrap' }}>
            {['09','10','11','12','13','14','15','16','17','18'].map(t => (
              <Box key={t} sx={{
                px: 1, py: 0.3, borderRadius: 1,
                bgcolor: t === '12' ? '#2563EB' : '#F1F5F9',
                color: t === '12' ? 'white' : '#64748B',
                fontSize: '0.65rem', fontWeight: 600,
                cursor: 'pointer',
              }}>{t}</Box>
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<CalendarIcon sx={{ fontSize: 15 }} />}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              py: 1,
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)' },
            }}
          >
            Book a appointment
          </Button>
        </Popover>

      </Box>
    </DoctorLayout>
  );
}
