import React, { useState, useEffect, useMemo } from 'react';
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
  UploadRounded as UploadIcon,
  DeleteOutline as DeleteIcon,
  DescriptionOutlined as FileIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  CircularProgress, Snackbar, Alert 
} from '@mui/material';
import PatientShell from '../../components/patient/PatientShell';
import { fetchMyRecords, addMedicalRecord, deleteMedicalRecord } from '../../api/patientApi';

const colors = {
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
  warning: '#f9ab00',
  danger: '#d93025',
  gray: '#9aa0a6'
};

const filterChips = [
  ['all', 'All'],
  ['prescription', 'Prescriptions'],
  ['lab', 'Lab Reports'],
  ['notes', 'Doctor Notes'],
  ['imaging', 'Imaging'],
  ['vaccine', 'Vaccination']
];

function PatientHealthRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  
  const [openAdd, setOpenAdd] = useState(false);
  const [newRecord, setNewRecord] = useState({ type: 'prescription', title: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await fetchMyRecords();
      if (res.success) setRecords(res.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleAdd = async () => {
    if (!newRecord.title) return;
    setSaving(true);
    try {
      const res = await addMedicalRecord(newRecord);
      if (res.success) {
        setSnackbar({ open: true, message: 'Record added successfully', severity: 'success' });
        setOpenAdd(false);
        setNewRecord({ type: 'prescription', title: '', description: '', date: new Date().toISOString().split('T')[0] });
        loadRecords();
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add record', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await deleteMedicalRecord(id);
      if (res.success) {
        setSnackbar({ open: true, message: 'Record deleted', severity: 'success' });
        loadRecords();
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
    }
  };

  const filteredRecords = records.filter(r => {
    const typeMatch = activeFilter === 'all' || r.type === activeFilter;
    const searchMatch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
    return typeMatch && searchMatch;
  }).sort((a, b) => {
    if (sort === 'newest') return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    if (sort === 'oldest') return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
    return 0;
  });

  const counts = {
    prescription: records.filter(r => r.type === 'prescription').length,
    lab: records.filter(r => r.type === 'lab_report').length,
    notes: records.filter(r => r.type === 'note').length,
    imaging: records.filter(r => r.type === 'imaging' || r.type === 'Imaging').length
  };

  return (
    <PatientShell activeItem="records">
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: colors.text, fontFamily: 'Inter, sans-serif' }}>
              Health Records
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16 }}>
              Your complete medical history, prescriptions and reports.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Button
              startIcon={<UploadIcon />}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: 2,
                bgcolor: colors.primary,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: '0 2px 4px rgba(26,115,232,0.2)',
                '&:hover': { bgcolor: colors.primaryDark, boxShadow: '0 4px 6px rgba(26,115,232,0.3)' }
              }}
            >
              Upload Record
            </Button>
          </Stack>
        </Stack>

        <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
           <DialogTitle sx={{ fontWeight: 600 }}>Add New Health Record</DialogTitle>
           <DialogContent>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                 <TextField select label="Record Type" value={newRecord.type} onChange={e => setNewRecord({...newRecord, type: e.target.value})} fullWidth>
                    {filterChips.filter(c => c[0] !== 'all').map(c => <MenuItem key={c[0]} value={c[0]}>{c[1]}</MenuItem>)}
                 </TextField>
                 <TextField label="Title" placeholder="e.g. Blood Test Oct 2023" value={newRecord.title} onChange={e => setNewRecord({...newRecord, title: e.target.value})} fullWidth />
                 <TextField label="Short Description (Optional)" multiline rows={2} value={newRecord.description} onChange={e => setNewRecord({...newRecord, description: e.target.value})} fullWidth />
                 <TextField type="date" label="Record Date" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} fullWidth InputLabelProps={{ shrink: true }} />
              </Stack>
           </DialogContent>
           <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenAdd(false)} sx={{ color: colors.muted, textTransform: 'none' }}>Cancel</Button>
              <Button variant="contained" onClick={handleAdd} disabled={saving || !newRecord.title} sx={{ bgcolor: colors.primary, px: 3, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}>{saving ? 'Saving...' : 'Save Record'}</Button>
           </DialogActions>
        </Dialog>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 4
          }}
        >
          {[
            ['Prescriptions', counts.prescription, 'Total records'],
            ['Lab Reports', counts.lab, 'Blood, urine, lipid'],
            ['Doctor Notes', counts.notes, 'Consultation summaries'],
            ['Imaging', counts.imaging, 'X-Rays, Scans']
          ].map(([title, value, subtitle]) => (
            <Box
              key={title}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${colors.line}`,
                bgcolor: colors.paper,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</Typography>
              <Typography sx={{ mt: 1, fontSize: 32, fontWeight: 600, color: colors.text }}>{value}</Typography>
              <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14 }}>{subtitle}</Typography>
            </Box>
          ))}
        </Box>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
               <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: { xs: 2, md: 0 } }}>
                 {filterChips.map(([value, label]) => (
                   <Chip
                     key={value}
                     label={label}
                     clickable
                     onClick={() => setActiveFilter(value)}
                     sx={{
                       px: 1,
                       py: 2,
                       borderRadius: 1.5,
                       border: `1px solid ${activeFilter === value ? colors.primary : colors.line}`,
                       bgcolor: activeFilter === value ? colors.primary : '#fff',
                       color: activeFilter === value ? '#fff' : colors.muted,
                       fontSize: 14,
                       fontWeight: 500,
                       '&:hover': { bgcolor: activeFilter === value ? colors.primaryDark : colors.soft }
                     }}
                   />
                 ))}
               </Stack>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ mb: 4 }}>
              <TextField
                placeholder="Search records, doctor, diagnosis"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                size="small"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: colors.muted }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                size="small"
                sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="doctor">Date & Doctor</MenuItem>
              </TextField>
            </Stack>

            {loading ? (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : filteredRecords.length > 0 ? (
               <Stack spacing={2}>
                  {filteredRecords.map(r => (
                    <Box key={r._id} sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.line}`, bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: colors.soft, color: colors.primary }}><FileIcon /></Box>
                          <Box>
                             <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{r.title}</Typography>
                             <Typography sx={{ fontSize: 13, color: colors.muted }}>{r.type.replace('_', ' ')} • {new Date(r.date || r.createdAt).toLocaleDateString()}</Typography>
                             {r.description && <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>{r.description}</Typography>}
                          </Box>
                       </Stack>
                       <Button onClick={() => handleDelete(r._id)} sx={{ minWidth: 40, color: colors.danger }}><DeleteIcon size="small" /></Button>
                    </Box>
                  ))}
               </Stack>
            ) : (
              <Box sx={{ py: 8, textAlign: 'center', bgcolor: colors.soft, borderRadius: 2, border: `1px dashed ${colors.line}` }}>
                <FileIcon sx={{ fontSize: 48, color: colors.gray, mb: 2 }} />
                <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 500 }}>No health records found</Typography>
                <Typography sx={{ color: colors.muted, fontSize: 14, mt: 1 }}>{search || activeFilter !== 'all' ? 'Try adjusting your search or filters.' : 'You have not uploaded or received any records yet.'}</Typography>
                {!(search || activeFilter !== 'all') && (
                  <Button onClick={() => setOpenAdd(true)} startIcon={<UploadIcon />} variant="outlined" sx={{ mt: 3, borderRadius: 1.5, borderColor: colors.primary, color: colors.primary, textTransform: 'none', fontWeight: 600 }}>
                    Upload Record
                  </Button>
                )}
              </Box>
            )}
          </Box>

          <Stack spacing={3} sx={{ width: { xs: '100%', xl: 320 }, flexShrink: 0 }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px dashed ${colors.primary}`,
                bgcolor: colors.primarySoft,
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#ffffff',
                  color: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 2px 8px rgba(26,115,232,0.15)'
                }}
              >
                <UploadIcon />
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.primaryDark }}>Upload a Health Record</Typography>
              <Typography sx={{ mt: 1, color: colors.primaryDark, fontSize: 13, lineHeight: 1.5 }}>
                PDF, JPG, PNG up to 10MB.<br/>Drag and drop or tap to upload.
              </Typography>
              <Button
                sx={{
                  mt: 2,
                  width: '100%',
                  py: 1.25,
                  borderRadius: 1.5,
                  bgcolor: '#ffffff',
                  color: colors.primaryDark,
                  textTransform: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  '&:hover': { bgcolor: '#f0f0f0' }
                }}
              >
                Choose File
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({...p, open: false}))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>
    </PatientShell>
  );
}

export default PatientHealthRecords;
