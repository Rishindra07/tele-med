import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress,
  InputAdornment, Snackbar, Stack, TextField, Typography
} from '@mui/material';
import {
  EditRounded as EditIcon,
  MonitorHeartRounded as HeartIcon,
  SearchRounded as SearchIcon,
  StickyNote2Outlined as NoteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { fetchDoctorPatients, fetchPatientHistory } from '../../api/doctorApi';
import {
  Close as CloseIcon,
  DescriptionOutlined as FileIcon,
} from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, IconButton, Divider } from '@mui/material';
import PatientHistoryDialog from '../../components/doctor/PatientHistoryDialog';

const colors = {
  paper: '#fffdf8', line: '#d8d0c4', soft: '#e9e2d8',
  text: '#2c2b28', muted: '#8b857d',
  green: '#26a37c', greenSoft: '#dff3eb',
  blue: '#4a90e2', blueSoft: '#e7f0fe',
  amber: '#d18a1f', amberSoft: '#fbefdc',
  red: '#d9635b', redSoft: '#fdeaea',
  graySoft: '#f1eee7'
};

const initials = (name = '') =>
  name.replace(/^Mr\. |^Mrs\. |^Ms\. /, '')
    .split(' ').filter(Boolean).slice(0, 2)
    .map(p => p[0]?.toUpperCase()).join('') || 'PT';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchDoctorPatients();
        const list = res.patients || [];
        setPatients(list);
        if (list.length > 0) setSelected(list[0]);
      } catch (err) {
        setError(err.message || 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFetchHistory = (patientId) => {
    setHistoryOpen(true);
  };

  const filtered = useMemo(() =>
    patients.filter(p =>
      (p.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.lastDiagnosis || '').toLowerCase().includes(search.toLowerCase())
    ), [patients, search]);

  if (loading) return (
    <DoctorLayout>
      <Box sx={{ py: 12, display: 'grid', placeItems: 'center' }}><CircularProgress sx={{ color: colors.green }} /></Box>
    </DoctorLayout>
  );

  if (error) return (
    <DoctorLayout>
      <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>
    </DoctorLayout>
  );

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
          Patients
        </Typography>
        <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, mb: 3 }}>
          All patients who have consulted with you.
        </Typography>

        {patients.length === 0 ? (
          <Box sx={{ py: 10, textAlign: 'center', border: `1px dashed ${colors.line}`, borderRadius: 4, bgcolor: colors.paper }}>
            <HeartIcon sx={{ fontSize: 52, color: colors.muted, mb: 2 }} />
            <Typography sx={{ color: colors.muted, fontSize: 16 }}>No patients yet. Your patients will appear here after consultations.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '300px 1fr' }, gap: 3, alignItems: 'start' }}>
            {/* Patient List */}
            <Stack spacing={2}>
              <TextField
                size="small"
                placeholder="Search patient"
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: colors.muted }} /></InputAdornment> }}
              />
              <Box sx={{ p: 2.2, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                <Typography sx={{ fontSize: 18, mb: 1.5 }}>All Patients ({filtered.length})</Typography>
                <Stack spacing={1}>
                  {filtered.map(patient => {
                    const isSelected = selected?._id === patient._id;
                    return (
                      <Button
                        key={patient._id}
                        onClick={() => setSelected(patient)}
                        sx={{ justifyContent: 'flex-start', gap: 1.2, px: 1.2, py: 1.25, borderRadius: 2.5, textTransform: 'none', border: `1px solid ${isSelected ? colors.green : 'transparent'}`, bgcolor: isSelected ? '#eef9f4' : 'transparent', color: '#2c2b28', '&:hover': { bgcolor: isSelected ? '#eef9f4' : '#f6f1e9' } }}
                      >
                        <Avatar sx={{ width: 42, height: 42, bgcolor: isSelected ? colors.greenSoft : colors.blueSoft, color: isSelected ? colors.green : colors.blue, fontWeight: 700 }}>
                          {initials(patient.full_name)}
                        </Avatar>
                        <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                          <Typography sx={{ fontSize: 14.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{patient.full_name}</Typography>
                          <Typography sx={{ color: colors.muted, fontSize: 13.2 }}>{patient.lastDiagnosis || 'General'}</Typography>
                        </Box>
                      </Button>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>

            {/* Patient Detail */}
            {selected && (
              <Stack spacing={3}>
                <Typography sx={{ color: '#a7a198', fontSize: 14.5 }}>
                  Patients › Details › {selected.full_name}
                </Typography>

                <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', md: 'center' }}>
                      <Avatar sx={{ width: 96, height: 96, border: '4px solid #dceee8', bgcolor: colors.greenSoft, color: colors.green, fontWeight: 700, fontSize: 34 }}>
                        {initials(selected.full_name)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>{selected.full_name}</Typography>
                        <Typography sx={{ mt: 0.6, color: colors.muted, fontSize: 15.5 }}>{selected.email}</Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
                          {[selected.phone, selected.lastDiagnosis, `${selected.totalVisits} visit${selected.totalVisits !== 1 ? 's' : ''}`, selected.lastStatus].filter(Boolean).map(item => (
                            <Chip key={item} label={item} sx={{ bgcolor: '#f6f3ec', color: '#66615a', fontSize: 13.5 }} />
                          ))}
                        </Stack>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.8 }}>
                          <Button startIcon={<NoteIcon />} onClick={() => navigate(`/doctor/prescribe`, { state: { appointment: { patientName: selected.full_name, patient: { _id: selected._id } } } })} sx={{ px: 2.2, py: 0.9, borderRadius: 2.4, bgcolor: colors.green, color: '#fff', textTransform: 'none', fontSize: 14.5 }}>
                            Write Prescription
                          </Button>
                          <Button startIcon={<FileIcon />} onClick={() => handleFetchHistory(selected._id)} sx={{ px: 2.2, py: 0.9, borderRadius: 2.4, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 14.5 }}>
                            View Records
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, minWidth: { lg: 280 } }}>
                      {[
                        ['Total Visits', selected.totalVisits],
                        ['Last Visit', formatDate(selected.lastVisit)],
                        ['Last Diagnosis', selected.lastDiagnosis || 'General'],
                        ['Status', selected.lastStatus || 'Scheduled']
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
                  <Typography sx={{ fontSize: 18, mb: 1 }}>Contact Information</Typography>
                  {[['Email', selected.email], ['Phone', selected.phone || 'Not provided']].map(([label, value]) => (
                    <Box key={label} sx={{ py: 1.5, borderBottom: `1px solid ${colors.soft}` }}>
                      <Typography sx={{ fontSize: 12.5, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</Typography>
                      <Typography sx={{ mt: 0.4, fontSize: 15.5 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
            )}
          </Box>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>

      <PatientHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        patient={selected}
      />
    </DoctorLayout>
  );
}
