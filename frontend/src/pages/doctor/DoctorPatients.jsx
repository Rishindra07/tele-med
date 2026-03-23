import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  DownloadRounded as DownloadIcon,
  EditRounded as EditIcon,
  MonitorHeartRounded as HeartIcon,
  SearchRounded as SearchIcon,
  StickyNote2Outlined as NoteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';

const colors = {
  paper: '#fffdf8',
  line: '#d8d0c4',
  soft: '#e9e2d8',
  text: '#2c2b28',
  muted: '#8b857d',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  amber: '#d18a1f',
  amberSoft: '#fbefdc',
  red: '#d9635b',
  redSoft: '#fdeaea',
  graySoft: '#f1eee7'
};

const PATIENTS = [
  {
    id: 1,
    name: 'Mrs. Maria Waston',
    email: 'mariawaston2022@gmail.com',
    sex: 'Female',
    age: 28,
    blood: 'A+',
    status: 'Active',
    department: 'Cardiology',
    registeredDate: '20 Jan, 2023',
    appointments: 35,
    bedNumber: '#0365',
    vitals: {
      bp: { value: '120/89', unit: 'mm/hg', label: 'Blood Pressure', norm: 'in' },
      hr: { value: '120', unit: 'BPM', label: 'Heart rate', norm: 'above' },
      glucose: { value: '97', unit: 'mg/dl', label: 'Glucose', norm: 'in' },
      cholesterol: { value: '85', unit: 'mg/dl', label: 'Cholesterol', norm: 'in' }
    },
    history: [
      { date: '20 Jan, 2023', diagnosis: 'Malaria', severity: 'High', visits: 2, status: 'Under Treatment' },
      { date: '12 Jan, 2022', diagnosis: 'Viral Fever', severity: 'Low', visits: 1, status: 'Cured' },
      { date: '20 Jan, 2021', diagnosis: 'Covid 19', severity: 'High', visits: 6, status: 'Cured' }
    ]
  },
  {
    id: 2,
    name: 'Mr. James Collins',
    email: 'jamescollins@email.com',
    sex: 'Male',
    age: 45,
    blood: 'O+',
    status: 'Active',
    department: 'Orthopedics',
    registeredDate: '05 Mar, 2022',
    appointments: 12,
    bedNumber: '#0128',
    vitals: {
      bp: { value: '135/92', unit: 'mm/hg', label: 'Blood Pressure', norm: 'above' },
      hr: { value: '88', unit: 'BPM', label: 'Heart rate', norm: 'in' },
      glucose: { value: '110', unit: 'mg/dl', label: 'Glucose', norm: 'above' },
      cholesterol: { value: '200', unit: 'mg/dl', label: 'Cholesterol', norm: 'above' }
    },
    history: [
      { date: '10 Mar, 2023', diagnosis: 'Fracture', severity: 'High', visits: 4, status: 'Under Treatment' },
      { date: '01 Dec, 2022', diagnosis: 'Back Pain', severity: 'Low', visits: 2, status: 'Cured' }
    ]
  },
  {
    id: 3,
    name: 'Ms. Priya Sharma',
    email: 'priyasharma@email.com',
    sex: 'Female',
    age: 33,
    blood: 'B+',
    status: 'Inactive',
    department: 'Neurology',
    registeredDate: '18 Aug, 2021',
    appointments: 7,
    bedNumber: '#0242',
    vitals: {
      bp: { value: '118/76', unit: 'mm/hg', label: 'Blood Pressure', norm: 'in' },
      hr: { value: '72', unit: 'BPM', label: 'Heart rate', norm: 'in' },
      glucose: { value: '88', unit: 'mg/dl', label: 'Glucose', norm: 'in' },
      cholesterol: { value: '178', unit: 'mg/dl', label: 'Cholesterol', norm: 'in' }
    },
    history: [
      { date: '22 Sep, 2022', diagnosis: 'Migraine', severity: 'Low', visits: 3, status: 'Cured' },
      { date: '18 Aug, 2021', diagnosis: 'Anxiety', severity: 'Low', visits: 2, status: 'Cured' }
    ]
  }
];

const initials = (name) => {
  const cleaned = name.replace(/^Mr\. |^Mrs\. |^Ms\. /, '');
  return cleaned
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'PT';
};

const SeverityChip = ({ severity }) => (
  <Chip
    label={severity}
    sx={{
      bgcolor: severity === 'High' ? colors.redSoft : colors.greenSoft,
      color: severity === 'High' ? colors.red : colors.green,
      fontSize: 12.5
    }}
  />
);

const StatusChip = ({ status }) => (
  <Chip
    label={status}
    sx={{
      bgcolor: status === 'Cured' ? colors.greenSoft : colors.amberSoft,
      color: status === 'Cured' ? colors.green : colors.amber,
      fontSize: 12.5
    }}
  />
);

const VitalCard = ({ vital }) => (
  <Box sx={{ p: 2, border: `1px solid ${colors.soft}`, borderRadius: 3, bgcolor: '#fff', minWidth: 150, flex: '1 1 0' }}>
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#eef9f4', display: 'grid', placeItems: 'center', color: colors.green }}>
        <HeartIcon sx={{ fontSize: 18 }} />
      </Box>
      <Typography sx={{ fontSize: 13.5, color: colors.muted }}>{vital.label}</Typography>
    </Stack>
    <Typography sx={{ mt: 1.2, fontSize: 26, lineHeight: 1 }}>
      {vital.value}
    </Typography>
    <Typography sx={{ mt: 0.3, color: colors.muted, fontSize: 13.5 }}>{vital.unit}</Typography>
    <Typography sx={{ mt: 0.8, color: vital.norm === 'in' ? colors.green : colors.red, fontSize: 13.5 }}>
      {vital.norm === 'in' ? 'In the norm' : 'Above the norm'}
    </Typography>
  </Box>
);

export default function DoctorPatients() {
  const [selected, setSelected] = useState(PATIENTS[0]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(
    () =>
      PATIENTS.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.department.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              Patients
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 430, lineHeight: 1.2 }}>
              Review patient profiles, vitals, consultation history and prescription records
            </Typography>
          </Box>


        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '300px 1fr' }, gap: 3, alignItems: 'start' }}>
          <Stack spacing={2}>
            <TextField
              size="small"
              placeholder="Search patient or department"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#fff'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.muted }} />
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ p: 2.2, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 18, mb: 1.5 }}>All Patients</Typography>
            <Stack spacing={1}>
              {filtered.map((patient) => {
                const isSelected = selected?.id === patient.id;
                return (
                  <Button
                    key={patient.id}
                    onClick={() => setSelected(patient)}
                    sx={{
                      justifyContent: 'flex-start',
                      gap: 1.2,
                      px: 1.2,
                      py: 1.25,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      border: `1px solid ${isSelected ? colors.green : 'transparent'}`,
                      bgcolor: isSelected ? '#eef9f4' : 'transparent',
                      color: '#2c2b28',
                      '&:hover': { bgcolor: isSelected ? '#eef9f4' : '#f6f1e9' }
                    }}
                  >
                    <Avatar sx={{ width: 42, height: 42, bgcolor: isSelected ? colors.greenSoft : colors.blueSoft, color: isSelected ? colors.green : colors.blue, fontWeight: 700 }}>
                      {initials(patient.name)}
                    </Avatar>
                    <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {patient.name}
                      </Typography>
                      <Typography sx={{ color: colors.muted, fontSize: 13.2 }}>{patient.department}</Typography>
                    </Box>
                  </Button>
                );
              })}
            </Stack>
          </Box>
        </Stack>

          {selected && (
            <Stack spacing={3}>
              <Typography sx={{ color: '#a7a198', fontSize: 14.5 }}>
                Patient › Patient Details › {selected.name}
              </Typography>

              <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <Avatar sx={{ width: 96, height: 96, border: '4px solid #dceee8', bgcolor: colors.greenSoft, color: colors.green, fontWeight: 700, fontSize: 34 }}>
                      {initials(selected.name)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
                        {selected.name}
                      </Typography>
                      <Typography sx={{ mt: 0.6, color: colors.muted, fontSize: 15.5 }}>{selected.email}</Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
                        {[
                          `${selected.sex}`,
                          `${selected.age} years`,
                          `${selected.blood} Blood Group`,
                          `${selected.department}`,
                          `${selected.status}`
                        ].map((item) => (
                          <Chip key={item} label={item} sx={{ bgcolor: '#f6f3ec', color: '#66615a', fontSize: 13.5 }} />
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.8 }}>
                        <Button startIcon={<EditIcon />} sx={{ px: 2.2, py: 0.9, borderRadius: 2.4, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 14.5 }}>
                          Edit Profile
                        </Button>
                        <Button onClick={() => navigate('/doctor/prescription')} startIcon={<NoteIcon />} sx={{ px: 2.2, py: 0.9, borderRadius: 2.4, bgcolor: colors.green, color: '#fff', textTransform: 'none', fontSize: 14.5 }}>
                          Prescription
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5, minWidth: { lg: 430 } }}>
                    {[
                      ['Appointments', selected.appointments],
                      ['Registered', selected.registeredDate],
                      ['Bed Number', selected.bedNumber],
                      ['Status', selected.status]
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f5f1e9' }}>
                        <Typography sx={{ color: colors.muted, fontSize: 13 }}>{label}</Typography>
                        <Typography sx={{ mt: 0.35, fontSize: 15.5 }}>{value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                <Typography sx={{ fontSize: 18, mb: 2 }}>Patient Current Vitals</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2 }}>
                  {Object.values(selected.vitals).map((vital) => (
                    <VitalCard key={vital.label} vital={vital} />
                  ))}
                </Box>
              </Box>

              <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: 18 }}>Patient History</Typography>
                  <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>
                    Total {selected.history.reduce((sum, item) => sum + item.visits, 0)} visits
                  </Typography>
                </Stack>

                <TableContainer sx={{ border: `1px solid ${colors.soft}`, borderRadius: 3, bgcolor: '#fff' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f7f3ea' }}>
                        {['Date Of Visit', 'Diagnosis', 'Severity', 'Total Visits', 'Status', 'Documents'].map((heading) => (
                          <TableCell key={heading} sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#6f6a62', borderBottom: `1px solid ${colors.soft}` }}>
                            {heading}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selected.history.map((row, index) => (
                        <TableRow key={`${row.date}-${index}`} sx={{ '& td': { borderBottom: `1px solid ${colors.soft}` }, '&:last-child td': { borderBottom: 'none' } }}>
                          <TableCell sx={{ fontSize: '0.9rem', color: colors.text }}>{row.date}</TableCell>
                          <TableCell sx={{ fontSize: '0.9rem', color: colors.text }}>{row.diagnosis}</TableCell>
                          <TableCell><SeverityChip severity={row.severity} /></TableCell>
                          <TableCell sx={{ fontSize: '0.9rem', color: colors.text }}>{row.visits}</TableCell>
                          <TableCell><StatusChip status={row.status} /></TableCell>
                          <TableCell>
                            <Button startIcon={<DownloadIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', fontSize: '0.82rem', color: colors.green }}>
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          )}
        </Box>
      </Box>
    </DoctorLayout>
  );
}
