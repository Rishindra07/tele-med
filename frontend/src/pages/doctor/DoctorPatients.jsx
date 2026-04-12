import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress,
  Grid, InputAdornment, Paper, Snackbar, Stack, TextField, Typography
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
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_PATIENTS_TRANSLATIONS } from '../../utils/translations/doctor';

const c = {
  bg: '#f8f9fa',
  paper: '#ffffff',
  line: '#e0e0e0',
  soft: '#f0f0f0',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#1557b0',
  success: '#1e8e3e',
  successSoft: '#e6f4ea',
  warning: '#f9ab00',
  warningSoft: '#fef7e0',
  danger: '#d93025',
  dangerSoft: '#fce8e6'
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
  const { language } = useLanguage();
  const t = DOCTOR_PATIENTS_TRANSLATIONS[language] || DOCTOR_PATIENTS_TRANSLATIONS['en'];

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
      <Box sx={{ py: 12, display: 'grid', placeItems: 'center' }}><CircularProgress sx={{ color: c.primary }} /></Box>
    </DoctorLayout>
  );

  if (error) return (
    <DoctorLayout>
      <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>
    </DoctorLayout>
  );

  return (
    <DoctorLayout>
      <Box sx={{ px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: c.bg, minHeight: '100vh' }}>
        <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: c.text, fontFamily: 'Inter, sans-serif' }}>
          {t.title}
        </Typography>
        <Typography sx={{ mt: 0.5, color: c.muted, fontSize: 16, mb: 4 }}>
          {t.subtitle}
        </Typography>

        {patients.length === 0 ? (
          <Box sx={{ py: 10, textAlign: 'center', border: `1px dashed ${c.line}`, borderRadius: 2, bgcolor: c.paper }}>
            <HeartIcon sx={{ fontSize: 52, color: c.muted, mb: 2 }} />
            <Typography sx={{ color: c.muted, fontSize: 16 }}>{t.no_patients}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '340px 1fr' }, gap: 4, alignItems: 'start' }}>
            {/* Patient List */}
            <Stack spacing={3}>
              <TextField
                size="medium"
                placeholder={t.search_patient}
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: c.muted }} /></InputAdornment> }}
              />
              <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text, mb: 2 }}>{t.all_patients} ({filtered.length})</Typography>
                <Stack spacing={1}>
                  {filtered.map(patient => {
                    const isSelected = selected?._id === patient._id;
                    return (
                      <Button
                        key={patient._id}
                        onClick={() => setSelected(patient)}
                        sx={{ 
                          justifyContent: 'flex-start', gap: 1.5, px: 1.5, py: 1.5, borderRadius: 2, textTransform: 'none', 
                          border: `1px solid ${isSelected ? c.primary : 'transparent'}`, 
                          bgcolor: isSelected ? c.primarySoft : 'transparent', 
                          color: c.text,
                          '&:hover': { bgcolor: isSelected ? c.primarySoft : c.soft } 
                        }}
                      >
                        <Avatar sx={{ width: 44, height: 44, bgcolor: isSelected ? c.primary : c.soft, color: isSelected ? '#fff' : c.muted, fontWeight: 600 }}>
                          {initials(patient.full_name)}
                        </Avatar>
                        <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                          <Typography sx={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{patient.full_name}</Typography>
                          <Typography sx={{ color: c.muted, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{patient.lastDiagnosis || t.general}</Typography>
                        </Box>
                      </Button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <Typography sx={{ color: c.muted, textAlign: 'center', py: 2 }}>No patients found.</Typography>
                  )}
                </Stack>
              </Box>
            </Stack>

            {/* Patient Detail */}
            {selected ? (
              <Stack spacing={3}>
                <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                      <Avatar sx={{ width: 100, height: 100, bgcolor: c.primarySoft, color: c.primary, fontWeight: 700, fontSize: 36, border: `4px solid ${c.bg}` }}>
                        {initials(selected.full_name)}
                      </Avatar>
                      <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 600, color: c.text }}>{selected.full_name}</Typography>
                        <Typography sx={{ color: c.muted, fontSize: 16 }}>{selected.email}</Typography>
                        <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                          {[selected.phone, selected.lastDiagnosis, `${selected.totalVisits} ${selected.totalVisits !== 1 ? t.visits : t.visit}`, selected.lastStatus].filter(Boolean).map(item => (
                            <Chip key={item} label={item} size="small" sx={{ bgcolor: c.soft, color: c.text, fontSize: 13, fontWeight: 500 }} />
                          ))}
                        </Stack>
                        <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }} useFlexGap flexWrap="wrap" sx={{ mt: 3 }}>
                          <Button 
                            variant="contained" 
                            startIcon={<NoteIcon />} 
                            onClick={() => navigate(`/doctor/prescribe`, { state: { appointment: { patientName: selected.full_name, patient: { _id: selected._id } } } })} 
                            sx={{ px: 3, py: 1, borderRadius: 2, bgcolor: c.primary, fontWeight: 600, textTransform: 'none' }}
                          >
                            {t.write_presc}
                          </Button>
                          <Button 
                            variant="outlined" 
                            startIcon={<FileIcon />} 
                            onClick={() => handleFetchHistory(selected._id)} 
                            sx={{ px: 3, py: 1, borderRadius: 2, border: `1px solid ${c.line}`, color: c.text, fontWeight: 600, textTransform: 'none' }}
                          >
                            {t.view_records}
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, minWidth: { lg: 320 }, width: { xs: '100%', lg: 'auto' } }}>
                      {[
                        [t.total_visits, selected.totalVisits],
                        [t.last_visit, formatDate(selected.lastVisit)],
                        [t.last_diag, selected.lastDiagnosis || t.general],
                        [t.status, selected.lastStatus || t.scheduled]
                      ].map(([label, value]) => (
                        <Box key={label} sx={{ p: 2, borderRadius: 1.5, bgcolor: c.bg, border: `1px solid ${c.line}` }}>
                          <Typography sx={{ color: c.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{label}</Typography>
                          <Typography sx={{ mt: 0.5, fontSize: 16, fontWeight: 600, color: c.text }}>{value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ p: 4, borderRadius: 2, border: `1px solid ${c.line}`, bgcolor: c.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 600, color: c.text, mb: 3 }}>{t.contact_info}</Typography>
                  <Grid container spacing={3}>
                    {[[t.email, selected.email], [t.phone, selected.phone || t.not_provided]].map(([label, value]) => (
                      <Grid size={{ xs: 12, md: 6 }} key={label}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</Typography>
                        <Typography sx={{ mt: 1, fontSize: 16, color: c.text }}>{value}</Typography>
                        <Divider sx={{ mt: 1, borderColor: c.soft }} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            ) : (
                <Box sx={{ py: 10, textAlign: 'center', bgcolor: c.paper, borderRadius: 2, border: `1px dashed ${c.line}` }}>
                   <PeopleIcon sx={{ fontSize: 48, color: c.line, mb: 2 }} />
                   <Typography sx={{ color: c.muted }}>Select a patient to view details.</Typography>
                </Box>
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
