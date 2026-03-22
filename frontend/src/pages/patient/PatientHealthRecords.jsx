import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  CalendarMonthRounded as CalendarIcon,
  DescriptionOutlined as FileIcon,
  FolderOpenOutlined as ReportIcon,
  MonitorHeartOutlined as NotesIcon,
  NotificationsNoneRounded as NotificationIcon,
  SearchRounded as SearchIcon,
  SyncOutlined as SyncIcon,
  UploadRounded as UploadIcon,
  VaccinesOutlined as VaccineIcon
} from '@mui/icons-material';
import PatientShell from '../../components/patient/PatientShell';

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
  lime: '#7aa63d',
  limeSoft: '#eef6de',
  pink: '#de91b3',
  pinkSoft: '#f8e8f0',
  teal: '#2f8b79',
  tealSoft: '#def2ee'
};

const records = {
  prescriptions: [
    {
      id: 'pres-1',
      title: 'Prescription - Dr. Priya Sharma',
      date: '18 Mar 2026',
      subtitle: 'Paracetamol · Amoxicillin',
      status: 'Offline',
      icon: <FileIcon sx={{ color: '#2d63a8' }} />,
      iconBg: '#e8f1ff'
    },
    {
      id: 'pres-2',
      title: 'Prescription - Dr. Manish Rao',
      date: '2 Mar 2026',
      subtitle: 'Amlodipine · Telmisartan',
      status: 'Synced',
      icon: <FileIcon sx={{ color: '#2d63a8' }} />,
      iconBg: '#e8f1ff'
    }
  ],
  labs: [
    {
      id: 'lab-1',
      title: 'Blood Test Report - Narayana Diagnostics',
      date: '10 Mar 2026',
      subtitle: 'CBC · Lipid Panel',
      status: 'New',
      icon: <ReportIcon sx={{ color: '#9a6722' }} />,
      iconBg: '#fff1dc'
    },
    {
      id: 'lab-2',
      title: 'Urine Routine Report - City Lab',
      date: '20 Feb 2026',
      subtitle: 'Routine · Microscopy',
      status: 'Offline',
      icon: <ReportIcon sx={{ color: '#9a6722' }} />,
      iconBg: '#fff1dc'
    }
  ],
  notes: [
    {
      id: 'note-1',
      doctor: 'Dr. Manish Rao - Cardiologist',
      date: '2 Mar 2026',
      body:
        'Patient presents with hypertension. BP measured at 148/92 mmHg. Advised lifestyle modification, low-sodium diet, daily walks. Medication adjusted - Amlodipine 5mg continued, Telmisartan 40mg added. Follow-up in 3-4 weeks.',
      tags: ['Hypertension', 'BP 148/92', 'Medication adjusted', 'Follow-up 27 Mar']
    },
    {
      id: 'note-2',
      doctor: 'Dr. Priya Sharma - General Physician',
      date: '18 Mar 2026',
      body:
        'Patient reports fever (38.5 C), headache and body ache since 2 days. Diagnosed with viral fever. Prescribed Paracetamol 500mg for 5 days and Amoxicillin 250mg for 7 days. Advised rest and fluids.',
      tags: ['Viral fever', '38.5 C', 'Prescription issued']
    }
  ],
  imaging: [
    {
      id: 'img-1',
      title: 'Chest X-Ray - District Hospital',
      date: '15 Jan 2026',
      subtitle: 'PA View · Normal',
      status: 'Offline',
      icon: <ReportIcon sx={{ color: colors.pink }} />,
      iconBg: colors.pinkSoft
    },
    {
      id: 'vac-1',
      title: 'Vaccination Record - COVID-19 Booster',
      date: '5 Nov 2025',
      subtitle: 'Covaxin · Dose 3',
      status: 'Synced',
      icon: <VaccineIcon sx={{ color: '#1a7360' }} />,
      iconBg: colors.tealSoft
    }
  ]
};

const offlineItems = [
  'Prescription · 18 Mar · Dr. Priya Sharma · PDF',
  'Blood Report · 10 Mar · Narayana Diagnostics · PDF',
  'Consultation Notes · 2 Mar · Dr. Manish Rao · TXT',
  'Chest X-Ray · 15 Jan · District Hospital · JPG'
];

const filterChips = [
  ['all', 'All'],
  ['prescription', 'Prescriptions'],
  ['lab', 'Lab Reports'],
  ['notes', 'Doctor Notes'],
  ['imaging', 'Imaging'],
  ['vaccine', 'Vaccination']
];

const getStatusStyle = (status) => {
  if (status === 'Offline') return { bg: '#f1eee7', color: '#7d776e' };
  if (status === 'Synced') return { bg: colors.greenSoft, color: colors.green };
  if (status === 'New') return { bg: colors.limeSoft, color: colors.lime };
  return { bg: colors.blueSoft, color: colors.blue };
};

function PatientHealthRecords() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  const searchTerm = search.trim().toLowerCase();

  const matchesSearch = (text) => !searchTerm || text.toLowerCase().includes(searchTerm);

  const filtered = useMemo(() => {
    const filterRecordList = (list, type) =>
      list.filter((item) => {
        const typeMatch =
          activeFilter === 'all' ||
          (activeFilter === 'prescription' && type === 'prescription') ||
          (activeFilter === 'lab' && type === 'lab') ||
          (activeFilter === 'notes' && type === 'notes') ||
          (activeFilter === 'imaging' && type === 'imaging') ||
          (activeFilter === 'vaccine' && item.title?.toLowerCase().includes('vaccination'));

        const haystack = `${item.title || ''} ${item.subtitle || ''} ${item.doctor || ''} ${item.body || ''}`;
        return typeMatch && matchesSearch(haystack);
      });

    return {
      prescriptions: filterRecordList(records.prescriptions, 'prescription'),
      labs: filterRecordList(records.labs, 'lab'),
      notes: filterRecordList(records.notes, 'notes'),
      imaging: filterRecordList(records.imaging, 'imaging')
    };
  }, [activeFilter, searchTerm]);

  const renderCompactRecord = (item, showDownload = false) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <Box
        key={item.id}
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px solid ${colors.soft}`,
          bgcolor: '#fff'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              bgcolor: item.iconBg,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}
          >
            {item.icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
              <Box>
                <Typography sx={{ fontSize: 16.5, lineHeight: 1.15 }}>{item.title}</Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.6 }}>
                  <CalendarIcon sx={{ fontSize: 15, color: colors.muted }} />
                  <Typography sx={{ color: colors.muted, fontSize: 14 }}>{item.date}</Typography>
                </Stack>
              </Box>
              <Chip
                label={item.status}
                sx={{ height: 27, bgcolor: statusStyle.bg, color: statusStyle.color, fontSize: 13 }}
              />
            </Stack>

            <Typography sx={{ mt: 0.8, color: colors.muted, fontSize: 14.5, lineHeight: 1.15 }}>
              {item.subtitle}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1.4 }}>
              <Button
                sx={{
                  minWidth: 74,
                  py: 0.55,
                  borderRadius: 2,
                  border: `1px solid ${colors.green}`,
                  color: colors.green,
                  textTransform: 'none',
                  fontSize: 14
                }}
              >
                View
              </Button>
              <Button
                sx={{
                  minWidth: 74,
                  py: 0.55,
                  borderRadius: 2,
                  border: `1px solid ${colors.line}`,
                  color: '#66615a',
                  textTransform: 'none',
                  fontSize: 14
                }}
              >
                {showDownload ? 'Download' : 'Share'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>
    );
  };

  return (
    <PatientShell activeItem="records">
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
              Health Records
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 460, lineHeight: 1.2 }}>
              Your complete medical history, prescriptions and reports
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Box
              sx={{
                px: 2.5,
                py: 1.25,
                borderRadius: 4,
                border: `1px solid ${colors.line}`,
                bgcolor: '#f7f3ea',
                fontSize: 17,
                lineHeight: 1.15
              }}
            >
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Box>
            <Button
              sx={{
                minWidth: 48,
                width: 48,
                height: 48,
                borderRadius: 3,
                border: `1px solid ${colors.line}`,
                bgcolor: '#fff',
                color: colors.text,
                position: 'relative'
              }}
            >
              <NotificationIcon />
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#d9635b'
                }}
              />
            </Button>
            <Button
              startIcon={<UploadIcon />}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: 3,
                border: `1px solid ${colors.line}`,
                bgcolor: '#fff',
                color: colors.text,
                textTransform: 'none',
                fontSize: 16
              }}
            >
              Upload Record
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3
          }}
        >
          {[
            ['Prescriptions', '4', 'Total records', '1 active this week', colors.blue],
            ['Lab Reports', '3', 'Blood, urine, lipid', 'Latest: 10 Mar 2026', colors.amber],
            ['Doctor Notes', '5', 'Consultation summaries', 'Last: 18 Mar 2026', colors.lime],
            ['Offline cached', '8', 'Files available offline', 'Synced 2 hrs ago', colors.green]
          ].map(([title, value, subtitle, helper, dot]) => (
            <Box
              key={title}
              sx={{
                minHeight: 170,
                p: 2.5,
                borderRadius: 3.5,
                border: `1px solid ${colors.line}`,
                bgcolor: colors.paper
              }}
            >
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dot }} />
                <Typography sx={{ fontSize: 16, color: colors.muted }}>{title}</Typography>
              </Stack>
              <Typography sx={{ mt: 1.2, fontSize: 30, lineHeight: 1 }}>{value}</Typography>
              <Typography sx={{ mt: 1, color: '#a29b92', fontSize: 15, lineHeight: 1.15 }}>{subtitle}</Typography>
              <Typography sx={{ mt: 1, color: dot, fontSize: 15, lineHeight: 1.15 }}>{helper}</Typography>
            </Box>
          ))}
        </Box>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap" sx={{ mb: 1.8 }}>
              {filterChips.map(([value, label]) => (
                <Button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  sx={{
                    px: 2.4,
                    py: 0.95,
                    borderRadius: 999,
                    border: `1px solid ${activeFilter === value ? colors.green : colors.line}`,
                    bgcolor: activeFilter === value ? colors.green : '#fff',
                    color: activeFilter === value ? '#fff' : '#67625b',
                    textTransform: 'none',
                    fontSize: 15
                  }}
                >
                  {label}
                </Button>
              ))}
            </Stack>

            <TextField
              fullWidth
              placeholder="Search records, doctor, diagnosis"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{
                mb: 1.8,
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

            <TextField
              select
              fullWidth
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#fff'
                }
              }}
            >
              <MenuItem value="newest">Sort: Newest first</MenuItem>
              <MenuItem value="oldest">Sort: Oldest first</MenuItem>
              <MenuItem value="doctor">Sort: Doctor name</MenuItem>
            </TextField>

            <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, mb: 1.5 }}>PRESCRIPTIONS</Typography>
            <Stack spacing={1.6} sx={{ mb: 3 }}>
              {filtered.prescriptions.map((item) => renderCompactRecord(item))}
            </Stack>

            <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, mb: 1.5 }}>LAB REPORTS</Typography>
            <Stack spacing={1.6} sx={{ mb: 3 }}>
              {filtered.labs.map((item) => renderCompactRecord(item, true))}
            </Stack>

            <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, mb: 1.5 }}>DOCTOR NOTES</Typography>
            <Stack spacing={1.6} sx={{ mb: 3 }}>
              {filtered.notes.map((note) => (
                <Box
                  key={note.id}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${colors.soft}`,
                    bgcolor: '#fff'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                    <Typography sx={{ fontSize: 16.5 }}>{note.doctor}</Typography>
                    <Typography sx={{ color: '#b1aaa1', fontSize: 14 }}>{note.date}</Typography>
                  </Stack>
                  <Typography sx={{ mt: 1, color: '#57524b', fontSize: 15.2, lineHeight: 1.65 }}>
                    {note.body}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
                    {note.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        sx={{
                          height: 28,
                          bgcolor: '#f3efe7',
                          color: '#6e6860',
                          fontSize: 13.5
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>

            <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, mb: 1.5 }}>IMAGING & VACCINATION</Typography>
            <Stack spacing={1.6}>
              {filtered.imaging.map((item) => renderCompactRecord(item, item.status === 'Offline'))}
            </Stack>
          </Box>

          <Stack spacing={3} sx={{ width: { xs: '100%', xl: 320 }, flexShrink: 0 }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: '1px dashed #d9d0c4',
                bgcolor: '#fffdf8',
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: colors.greenSoft,
                  color: colors.green,
                  display: 'grid',
                  placeItems: 'center',
                  mx: 'auto',
                  mb: 1.5
                }}
              >
                <UploadIcon />
              </Box>
              <Typography sx={{ fontSize: 17 }}>Upload a health record</Typography>
              <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5, lineHeight: 1.4 }}>
                PDF, JPG, PNG up to 10MB. Drag and drop or tap to upload.
              </Typography>
              <Button
                sx={{
                  mt: 2,
                  px: 3,
                  py: 1,
                  borderRadius: 2.5,
                  border: `1px solid ${colors.line}`,
                  color: colors.text,
                  textTransform: 'none',
                  fontSize: 15
                }}
              >
                Choose file
              </Button>
            </Box>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: `1px solid ${colors.line}`,
                bgcolor: colors.paper
              }}
            >
              <Typography sx={{ fontSize: 18, mb: 1.75 }}>Storage & Sync</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>Offline cache used</Typography>
              <Box sx={{ mt: 1.2, height: 8, borderRadius: 999, bgcolor: '#ece5d8', overflow: 'hidden' }}>
                <Box sx={{ width: '82%', height: '100%', bgcolor: colors.green }} />
              </Box>
              <Typography sx={{ mt: 0.8, color: colors.muted, fontSize: 13.5 }}>6.2 MB used</Typography>

              <Stack spacing={1.1} sx={{ mt: 2 }}>
                {[
                  ['Total records', '14'],
                  ['Cached offline', '8'],
                  ['Pending sync', '1'],
                  ['Last synced', '2 hrs ago']
                ].map(([label, value]) => (
                  <Stack
                    key={label}
                    direction="row"
                    justifyContent="space-between"
                    sx={{ py: 0.65, borderBottom: `1px solid ${colors.soft}` }}
                  >
                    <Typography sx={{ color: '#656059', fontSize: 14.5 }}>{label}</Typography>
                    <Typography sx={{ color: colors.text, fontSize: 14.5 }}>{value}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Button
                startIcon={<SyncIcon />}
                sx={{
                  mt: 2,
                  width: '100%',
                  py: 1.05,
                  borderRadius: 2.5,
                  bgcolor: colors.greenSoft,
                  color: colors.green,
                  border: `1px solid ${colors.green}`,
                  textTransform: 'none',
                  fontSize: 15
                }}
              >
                Sync now
              </Button>
            </Box>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: '1px solid #f0a43c',
                bgcolor: '#fff3df'
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.6 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    bgcolor: '#ffd18b',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#9a6722'
                  }}
                >
                  <SyncIcon />
                </Box>
                <Typography sx={{ fontSize: 18 }}>Available when offline</Typography>
              </Stack>
              <Typography sx={{ color: '#966323', fontSize: 14.5, lineHeight: 1.45 }}>
                These files are cached to your device and can be read without internet.
              </Typography>
              <Stack spacing={1.1} sx={{ mt: 1.8 }}>
                {offlineItems.map((item) => (
                  <Box
                    key={item}
                    sx={{
                      p: 1.3,
                      borderRadius: 2,
                      bgcolor: '#fff8ee',
                      color: '#8a5c21',
                      fontSize: 14.5,
                      lineHeight: 1.35
                    }}
                  >
                    {item}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </PatientShell>
  );
}

export default PatientHealthRecords;
