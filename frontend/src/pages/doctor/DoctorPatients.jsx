import React, { useState } from 'react';
import {
  Box, Typography, Avatar, Stack, Chip, Divider,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Button, TextField,
  InputAdornment, Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  ArrowForwardIos as ArrowIcon,
  MonitorHeart as HeartIcon,
  Bloodtype as BloodIcon,
  Science as GlucoseIcon,
  HealthAndSafety as CholIcon,
  Description as NoteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';

/* ─── Seed Data ───────────────────────────────────────── */
const PATIENTS = [
  {
    id: 1,
    name: 'Mrs. Maria Waston',
    email: 'mariawaston2022@gmail.com',
    avatar: '',
    sex: 'Female',
    age: 28,
    blood: 'A+',
    status: 'Active',
    department: 'Cardiology',
    registeredDate: '20 Jan, 2023',
    appointments: 35,
    bedNumber: '#0365',
    vitals: {
      bp: { value: '120/89', unit: 'mm/hg', label: 'Blood Pressure', norm: 'in', icon: <HeartIcon /> },
      hr: { value: '120', unit: 'BPM', label: 'Heart rate', norm: 'above', icon: <HeartIcon /> },
      glucose: { value: '97', unit: 'mg/dl', label: 'Glucose', norm: 'in', icon: <GlucoseIcon /> },
      cholesterol: { value: '85', unit: 'mg/dl', label: 'Cholesterol', norm: 'in', icon: <CholIcon /> },
    },
    history: [
      { date: '20 Jan, 2023', diagnosis: 'Malaria', severity: 'High', visits: 2, status: 'Under Treatment' },
      { date: '12 Jan, 2022', diagnosis: 'Viral Fever', severity: 'Low', visits: 1, status: 'Cured' },
      { date: '20 Jan, 2021', diagnosis: 'Covid 19', severity: 'High', visits: 6, status: 'Cured' },
    ],
  },
  {
    id: 2,
    name: 'Mr. James Collins',
    email: 'jamescollins@email.com',
    avatar: '',
    sex: 'Male',
    age: 45,
    blood: 'O+',
    status: 'Active',
    department: 'Orthopedics',
    registeredDate: '05 Mar, 2022',
    appointments: 12,
    bedNumber: '#0128',
    vitals: {
      bp: { value: '135/92', unit: 'mm/hg', label: 'Blood Pressure', norm: 'above', icon: <HeartIcon /> },
      hr: { value: '88', unit: 'BPM', label: 'Heart rate', norm: 'in', icon: <HeartIcon /> },
      glucose: { value: '110', unit: 'mg/dl', label: 'Glucose', norm: 'above', icon: <GlucoseIcon /> },
      cholesterol: { value: '200', unit: 'mg/dl', label: 'Cholesterol', norm: 'above', icon: <CholIcon /> },
    },
    history: [
      { date: '10 Mar, 2023', diagnosis: 'Fracture', severity: 'High', visits: 4, status: 'Under Treatment' },
      { date: '01 Dec, 2022', diagnosis: 'Back Pain', severity: 'Low', visits: 2, status: 'Cured' },
    ],
  },
  {
    id: 3,
    name: 'Ms. Priya Sharma',
    email: 'priyasharma@email.com',
    avatar: '',
    sex: 'Female',
    age: 33,
    blood: 'B+',
    status: 'Inactive',
    department: 'Neurology',
    registeredDate: '18 Aug, 2021',
    appointments: 7,
    bedNumber: '#0242',
    vitals: {
      bp: { value: '118/76', unit: 'mm/hg', label: 'Blood Pressure', norm: 'in', icon: <HeartIcon /> },
      hr: { value: '72', unit: 'BPM', label: 'Heart rate', norm: 'in', icon: <HeartIcon /> },
      glucose: { value: '88', unit: 'mg/dl', label: 'Glucose', norm: 'in', icon: <GlucoseIcon /> },
      cholesterol: { value: '178', unit: 'mg/dl', label: 'Cholesterol', norm: 'in', icon: <CholIcon /> },
    },
    history: [
      { date: '22 Sep, 2022', diagnosis: 'Migraine', severity: 'Low', visits: 3, status: 'Cured' },
      { date: '18 Aug, 2021', diagnosis: 'Anxiety', severity: 'Low', visits: 2, status: 'Cured' },
    ],
  },
];

/* ─── Sub-components ──────────────────────────────────── */
const SeverityChip = ({ severity }) => (
  <Box sx={{
    display: 'inline-flex', alignItems: 'center', gap: 0.5,
    px: 1.2, py: 0.3, borderRadius: 1,
    bgcolor: severity === 'High' ? '#FEE2E2' : '#D1FAE5',
    color: severity === 'High' ? '#EF4444' : '#10B981',
    fontSize: '0.72rem', fontWeight: 700,
  }}>
    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'currentColor', flexShrink: 0 }} />
    {severity}
  </Box>
);

const StatusChip = ({ status }) => {
  const isActive = status === 'Cured';
  return (
    <Box sx={{
      display: 'inline-block', px: 1.5, py: 0.35, borderRadius: 1,
      bgcolor: isActive ? '#D1FAE5' : '#FEF3C7',
      color: isActive ? '#059669' : '#D97706',
      fontSize: '0.72rem', fontWeight: 700,
    }}>
      {status}
    </Box>
  );
};

const VitalCard = ({ vital }) => (
  <Box sx={{
    flex: '1 1 0',
    minWidth: 130,
    p: 2,
    border: '1px solid #E2E8F0',
    borderRadius: 3,
    bgcolor: 'white',
  }}>
    <Typography variant="caption" color="text.secondary" fontWeight={500}>
      {vital.label}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
      <Typography variant="h5" fontWeight={800} color="#0F172A">
        {vital.value}
      </Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {vital.unit}
      </Typography>
    </Box>
    <Typography
      variant="caption"
      fontWeight={600}
      sx={{ color: vital.norm === 'in' ? '#10B981' : '#EF4444' }}
    >
      {vital.norm === 'in' ? 'In the norm' : 'Above the norm'}
    </Typography>
  </Box>
);

/* ─── Main Page ───────────────────────────────────────── */
export default function DoctorPatients() {
  const [selected, setSelected] = useState(PATIENTS[0]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DoctorLayout title="Patients">
      <Box sx={{
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        bgcolor: '#F8FAFC',
        fontFamily: '"Outfit", sans-serif',
      }}>

        {/* ── Patient List Sidebar ──────────────────────── */}
        <Box sx={{
          width: 280,
          flexShrink: 0,
          borderRight: '1px solid #E2E8F0',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
            <Typography fontWeight={700} color="#0F172A" sx={{ mb: 1.5 }}>
              All Patients
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Search patient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, fontSize: '0.85rem', bgcolor: '#F8FAFC' },
              }}
            />
          </Box>

          <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {filtered.map(p => {
              const isSelected = selected?.id === p.id;
              return (
                <Box
                  key={p.id}
                  onClick={() => setSelected(p)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 2.5, py: 2,
                    cursor: 'pointer',
                    bgcolor: isSelected ? '#EFF6FF' : 'transparent',
                    borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC' },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40, height: 40, flexShrink: 0,
                      bgcolor: isSelected ? '#2563EB' : '#E2E8F0',
                      color: isSelected ? 'white' : '#64748B',
                      fontWeight: 700, fontSize: '1rem',
                    }}
                  >
                    {p.name.charAt(p.name.indexOf('.') + 2)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap fontSize="0.85rem" fontWeight={600} color="#0F172A">
                      {p.name}
                    </Typography>
                    <Typography noWrap fontSize="0.72rem" color="text.secondary">
                      {p.department}
                    </Typography>
                  </Box>
                  <ArrowIcon sx={{ fontSize: 12, color: '#CBD5E1', ml: 'auto', flexShrink: 0 }} />
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── Patient Detail Panel ──────────────────────── */}
        {selected && (
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
            {/* Breadcrumb */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <Typography fontSize="0.82rem" color="text.secondary">Patient</Typography>
              <Typography fontSize="0.82rem" color="text.secondary">›</Typography>
              <Typography fontSize="0.82rem" color="text.secondary">Patient Details</Typography>
              <Typography fontSize="0.82rem" color="text.secondary">›</Typography>
              <Typography fontSize="0.82rem" fontWeight={600} color="#0F172A">{selected.name}</Typography>
            </Stack>

            {/* Profile Card */}
            <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, mb: 3, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* Avatar + name */}
                <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', minWidth: 220 }}>
                  <Avatar
                    sx={{
                      width: 90, height: 90, border: '4px solid #E2E8F0',
                      bgcolor: '#DBEAFE', color: '#2563EB',
                      fontWeight: 800, fontSize: '2rem',
                    }}
                  >
                    {selected.name.charAt(selected.name.indexOf('.') + 2)}
                  </Avatar>
                  <Box sx={{ pt: 0.5 }}>
                    <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 0.3 }}>
                      {selected.name}
                    </Typography>
                    <Typography fontSize="0.8rem" color="text.secondary" sx={{ mb: 1.5 }}>
                      {selected.email}
                    </Typography>
                    <Stack direction="row" spacing={1.5}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          borderRadius: 5, textTransform: 'none', fontSize: '0.75rem',
                          fontWeight: 600, borderColor: '#2563EB', color: '#2563EB',
                          '&:hover': { bgcolor: '#EFF6FF' },
                        }}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate('/doctor/prescription')}
                        startIcon={<NoteIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          borderRadius: 5, textTransform: 'none', fontSize: '0.75rem',
                          fontWeight: 600, bgcolor: '#2563EB', color: 'white',
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' },
                        }}
                      >
                        Prescription
                      </Button>
                    </Stack>
                  </Box>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

                {/* Info grid */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, auto)',
                  gap: '16px 48px',
                  alignContent: 'start',
                  flexGrow: 1,
                }}>
                  {[
                    { label: 'Sex', value: selected.sex },
                    { label: 'Age', value: selected.age },
                    { label: 'Blood', value: selected.blood },
                    { label: 'Status', value: selected.status },
                    { label: 'Department', value: selected.department },
                    { label: 'Registered Date', value: selected.registeredDate },
                    { label: 'Appointment', value: selected.appointments },
                    { label: 'Bed Number', value: selected.bedNumber },
                  ].map(({ label, value }) => (
                    <Box key={label}>
                      <Typography fontSize="0.72rem" color="text.secondary">{label}</Typography>
                      <Typography fontSize="0.9rem" fontWeight={700} color="#0F172A">{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* Vitals */}
            <Typography fontWeight={700} color="#0F172A" sx={{ mb: 1.5 }}>
              Patient Current Vitals
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              {Object.values(selected.vitals).map((v) => (
                <VitalCard key={v.label} vital={v} />
              ))}
            </Box>

            {/* History */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography fontWeight={700} color="#0F172A">Patient History</Typography>
              <Typography fontSize="0.8rem" color="text.secondary" fontWeight={500}>
                Total {selected.history.reduce((s, h) => s + h.visits, 0)} Visits
              </Typography>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                      {['Date Of Visit', 'Diagnosis', 'Severity', 'Total Visits', 'Status', 'Documents'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selected.history.map((row, idx) => (
                      <TableRow key={idx} hover sx={{ '& td': { py: 1.5 }, borderBottom: '1px solid #F1F5F9' }}>
                        <TableCell sx={{ fontSize: '0.82rem', color: '#1E293B' }}>{row.date}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: '#1E293B' }}>{row.diagnosis}</TableCell>
                        <TableCell><SeverityChip severity={row.severity} /></TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: '#1E293B' }}>{row.visits}</TableCell>
                        <TableCell><StatusChip status={row.status} /></TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              textTransform: 'none', fontSize: '0.75rem',
                              fontWeight: 600, color: '#2563EB',
                              '&:hover': { bgcolor: '#EFF6FF' },
                            }}
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </Box>
    </DoctorLayout>
  );
}
