import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  CloudDoneRounded as SyncIcon,
  CloudOffRounded as OfflineIcon,
  DeleteOutline as DeleteIcon,
  DescriptionOutlined as FileIcon,
  Search as SearchIcon,
  UploadRounded as UploadIcon,
  DownloadRounded as DownloadIcon,
  VisibilityRounded as ViewIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PatientShell from '../../components/patient/PatientShell';
import { addMedicalRecord, deleteMedicalRecord, fetchMyRecords, uploadFile } from '../../api/patientApi';
import { useLanguage } from '../../context/LanguageContext';
import { PATIENT_HEALTH_RECORDS_TRANSLATIONS } from '../../utils/translations/patient';
import {
  applyPendingHealthRecordOps,
  getCachedHealthRecords,
  getHealthRecordMeta,
  getPendingHealthRecordOps,
  isHealthRecordCacheSupported,
  queueHealthRecordOp,
  removeCachedHealthRecord,
  replaceCachedHealthRecords,
  removePendingHealthRecordOp,
  setHealthRecordMeta,
  syncPendingHealthRecordOps,
  upsertCachedHealthRecord
} from '../../utils/healthRecordsCache';

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

// filterChips are now built dynamically from translation inside the component

const createDraftRecord = (record) => ({
  _id: `local-${Date.now()}`,
  ...record,
  source: 'offline',
  isOfflineAvailable: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

function PatientHealthRecords() {
  const { language } = useLanguage();
  const t = PATIENT_HEALTH_RECORDS_TRANSLATIONS[language] || PATIENT_HEALTH_RECORDS_TRANSLATIONS['en'];

  const filterChips = [
    ['all', t.filter_chips.all],
    ['prescription', t.filter_chips.prescription],
    ['lab_report', t.filter_chips.lab_report],
    ['note', t.filter_chips.note],
    ['imaging', t.filter_chips.imaging],
    ['vaccine', t.filter_chips.vaccine]
  ];

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newRecord, setNewRecord] = useState({
    type: 'prescription',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const refreshSyncMeta = async () => {
    if (!isHealthRecordCacheSupported()) return;

    const [pendingOps, syncMeta] = await Promise.all([
      getPendingHealthRecordOps(),
      getHealthRecordMeta('lastSyncAt')
    ]);

    setPendingSyncCount(pendingOps.length);
    setLastSyncAt(syncMeta?.value || null);
  };

  const loadRecords = async ({ preferCacheOnly = false } = {}) => {
    setLoading(true);
    try {
      const cacheSupported = isHealthRecordCacheSupported();
      const cachedRecords = cacheSupported ? await getCachedHealthRecords() : [];
      const pendingOps = cacheSupported ? await getPendingHealthRecordOps() : [];

      if (cachedRecords.length > 0 || preferCacheOnly) {
        setRecords(applyPendingHealthRecordOps(cachedRecords, pendingOps));
      }

      if (preferCacheOnly || !isOnline) {
        return;
      }

      const res = await fetchMyRecords();
      if (res.success) {
        const serverRecords = res.records || [];
        const merged = applyPendingHealthRecordOps(serverRecords, pendingOps);
        setRecords(merged);

        if (cacheSupported) {
          await replaceCachedHealthRecords(serverRecords);
          await setHealthRecordMeta('lastSyncAt', new Date().toISOString());
        }
      }
    } catch (error) {
      console.error(error);
      if (isHealthRecordCacheSupported()) {
        const cachedRecords = await getCachedHealthRecords();
        const pendingOps = await getPendingHealthRecordOps();
        setRecords(applyPendingHealthRecordOps(cachedRecords, pendingOps));
      }
    } finally {
      await refreshSyncMeta();
      setLoading(false);
    }
  };

  const syncPendingRecords = async () => {
    if (!isOnline || !isHealthRecordCacheSupported()) return;

    setSyncing(true);
    try {
      const result = await syncPendingHealthRecordOps();
      if (result.syncedCount > 0) {
        setSnackbar({
          open: true,
          message: `${t.messages.synced} ${result.syncedCount} ${result.syncedCount > 1 ? t.messages.pending_updates_plural : t.messages.pending_update}.`,
          severity: 'success'
        });
      }
      await loadRecords();
    } catch (error) {
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadRecords({ preferCacheOnly: !isOnline });
    
    // Check for action=add in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add') {
      setOpenAdd(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await syncPendingRecords();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: t.messages.file_too_large, severity: 'warning' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAdd = async () => {
    if (!newRecord.title) return;
    setSaving(true);
    try {
      let fileUrl = '';
      if (selectedFile && isOnline) {
        const uploadRes = await uploadFile(selectedFile);
        if (uploadRes.success) {
          fileUrl = uploadRes.fileUrl;
        }
      }

      const recordToSave = { ...newRecord, fileUrl };

      if (!isOnline) {
        if (selectedFile) {
          setSnackbar({ open: true, message: t.messages.file_offline, severity: 'warning' });
        }
        const draftRecord = createDraftRecord(recordToSave);
        await upsertCachedHealthRecord(draftRecord);
        await queueHealthRecordOp({
          id: `add-${draftRecord._id}`,
          type: 'add',
          clientRecordId: draftRecord._id,
          payload: recordToSave,
          record: draftRecord
        });
        setRecords((prev) => [draftRecord, ...prev]);
        setSnackbar({ open: true, message: t.messages.saved_offline, severity: 'info' });
      } else {
        const res = await addMedicalRecord(recordToSave);
        if (res.success) {
          if (isHealthRecordCacheSupported()) {
            await upsertCachedHealthRecord(res.record);
            await setHealthRecordMeta('lastSyncAt', new Date().toISOString());
          }
          setSnackbar({ open: true, message: t.messages.record_added, severity: 'success' });
          await loadRecords();
        }
      }

      setOpenAdd(false);
      setNewRecord({
        type: 'prescription',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedFile(null);
      await refreshSyncMeta();
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: error.message || t.messages.add_failed, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = (record) => {
    try {
      const doc = new jsPDF();
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Header Banner
      doc.setFillColor(26, 115, 232); // #1a73e8
      doc.rect(0, 0, 210, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.text('Seva TeleHealth Medical Record', 105, 22, { align: 'center' });
      
      // Basic Info
      doc.setFontSize(11);
      doc.text(`Official Consultation Summary | ID: ${record.prescription?.prescriptionId || record._id}`, 105, 32, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 38, { align: 'center' });
      
      // Details Columns
      doc.setTextColor(32, 33, 36);
      doc.setFontSize(16);
      doc.text('Patient Info', 15, 60);
      doc.setFontSize(11);
      doc.text(`Name: ${user.full_name || user.name || 'N/A'}`, 15, 70);
      doc.text(`Email: ${user.email || 'N/A'}`, 15, 77);
      
      doc.setFontSize(16);
      doc.text('Visit Info', 110, 60);
      doc.setFontSize(11);
      const docName = record.doctorInfo?.name || record.doctor?.full_name || 'N/A';
      doc.text(`Doctor: Dr. ${docName}`, 110, 70);
      doc.text(`Specialization: ${record.doctorInfo?.specialization || 'General'}`, 110, 77);
      doc.text(`Date: ${new Date(record.date || record.createdAt).toLocaleDateString()}`, 110, 84);
      
      doc.setDrawColor(224, 224, 224);
      doc.line(15, 92, 195, 92);
      
      // Clinical Content
      doc.setFontSize(15);
      doc.text('Record Details', 15, 105);
      doc.setFontSize(12);
      doc.text(`Type: ${record.type.toUpperCase().replace('_', ' ')}`, 15, 115);
      doc.text(`Title: ${record.title}`, 15, 122);
      
      doc.setFontSize(11);
      doc.text(`Diagnosis/Complaint: ${record.diagnosis || record.description || 'N/A'}`, 15, 132, { maxWidth: 180 });
      
      if (record.consultationSummary) {
        doc.text(`Notes: ${record.consultationSummary}`, 15, 142, { maxWidth: 180 });
      }
      
      // Medication Table
      if (record.prescriptionDetails?.length > 0) {
        doc.setFontSize(15);
        doc.text('Prescribed Medications', 15, doc.consultationSummary ? 165 : 155);
        
        autoTable(doc, {
          startY: doc.consultationSummary ? 170 : 160,
          head: [['Medicine Name', 'Dosage', 'Duration', 'Instructions']],
          body: record.prescriptionDetails.map(m => [
            m.name, 
            m.dosage || 'N/A', 
            m.duration || 'N/A', 
            m.instructions || 'As advised'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [26, 115, 232], textColor: [255, 255, 255] },
          margin: { left: 15, right: 15 }
        });
      }
      
      // Legend / Footer
      doc.setFontSize(10);
      doc.setTextColor(95, 99, 104);
      doc.text('This is a computer-generated medical document from the Seva TeleHealth Rural Platform.', 105, 280, { align: 'center' });
      doc.text('Verification: Scan QR code on original digital portal.', 105, 286, { align: 'center' });
      
      doc.save(`Seva_Record_${record.title.replace(/\s+/g, '_')}.pdf`);
      setSnackbar({ open: true, message: t.messages.pdf_success, severity: 'success' });
    } catch (err) {
      console.error('PDF Generate Error:', err);
      setSnackbar({ open: true, message: `PDF Error: ${err.message}`, severity: 'error' });
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(t.messages.delete_confirm)) return;

    try {
      const isLocalOnlyRecord = String(record._id).startsWith('local-');

      if (!isOnline) {
        await removeCachedHealthRecord(record._id);
        if (isLocalOnlyRecord) {
          await removePendingHealthRecordOp(`add-${record._id}`);
        } else {
          await queueHealthRecordOp({
            id: `delete-${record._id}`,
            type: 'delete',
            recordId: record._id
          });
        }
        setRecords((prev) => prev.filter((entry) => entry._id !== record._id));
        setSnackbar({ open: true, message: t.messages.delete_queued, severity: 'info' });
      } else {
        if (!isLocalOnlyRecord) {
          const res = await deleteMedicalRecord(record._id);
          if (res.success) {
            await removeCachedHealthRecord(record._id);
            await setHealthRecordMeta('lastSyncAt', new Date().toISOString());
            setSnackbar({ open: true, message: t.messages.record_deleted, severity: 'success' });
          }
        } else {
          await removeCachedHealthRecord(record._id);
          await removePendingHealthRecordOp(`add-${record._id}`);
          setSnackbar({ open: true, message: t.messages.draft_removed, severity: 'success' });
        }
        await loadRecords();
      }

      await refreshSyncMeta();
    } catch (error) {
      setSnackbar({ open: true, message: t.messages.delete_failed, severity: 'error' });
    }
  };

  const formatDoctorLine = (record) => {
    const doctorName = record.doctorInfo?.name || record.doctor?.name;
    const specialization = record.doctorInfo?.specialization;
    return [doctorName, specialization].filter(Boolean).join(' - ');
  };

  const filteredRecords = records
    .filter((record) => {
      const typeMatch = activeFilter === 'all' || record.type === activeFilter;
      const searchSource = [
        record.title,
        record.description,
        record.diagnosis,
        record.consultationSummary,
        record.doctorInfo?.name,
        record.doctorInfo?.specialization,
        ...(record.prescriptionDetails || []).map((item) => item.name)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const searchMatch = !search || searchSource.includes(search.toLowerCase());
      return typeMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
      if (sort === 'oldest') return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
      if (sort === 'doctor') return formatDoctorLine(a).localeCompare(formatDoctorLine(b));
      return 0;
    });

  const counts = {
    prescription: records.filter((record) => record.type === 'prescription').length,
    lab: records.filter((record) => record.type === 'lab_report').length,
    notes: records.filter((record) => record.type === 'note').length,
    imaging: records.filter((record) => record.type === 'imaging' || record.type === 'Imaging').length
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
              {t.title}
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16 }}>
              {t.subtitle}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Chip
              icon={isOnline ? <SyncIcon sx={{ fontSize: 16 }} /> : <OfflineIcon sx={{ fontSize: 16 }} />}
              label={isOnline ? (syncing ? t.sync_chip_syncing : t.sync_chip_online) : t.sync_chip_offline}
              sx={{
                borderRadius: 1.5,
                bgcolor: isOnline ? colors.primarySoft : '#fff4e5',
                color: isOnline ? colors.primaryDark : '#8a4b00',
                border: `1px solid ${isOnline ? colors.primary : '#f9ab00'}`
              }}
            />
            <Button
              onClick={() => setOpenAdd(true)}
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
              {t.upload_btn}
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${colors.line}`,
            bgcolor: colors.paper,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' }
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{t.ehr_status_title}</Typography>
            <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>
              {isOnline ? t.ehr_online : t.ehr_offline}
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>
              {t.last_sync}: {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : t.not_synced} - {t.pending_updates}: {pendingSyncCount}
            </Typography>
          </Box>
          <Button
            onClick={syncPendingRecords}
            disabled={!isOnline || syncing || pendingSyncCount === 0}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 1.5,
              border: `1px solid ${colors.primary}`,
              color: colors.primary,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {syncing ? t.syncing : t.sync_btn}
          </Button>
        </Box>

        <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: 600 }}>{t.dialog.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField select label={t.dialog.record_type} value={newRecord.type} onChange={(event) => setNewRecord({ ...newRecord, type: event.target.value })} fullWidth>
                {filterChips.filter((chip) => chip[0] !== 'all').map((chip) => <MenuItem key={chip[0]} value={chip[0]}>{chip[1]}</MenuItem>)}
              </TextField>
              <TextField label={t.dialog.title_label} placeholder={t.dialog.title_placeholder} value={newRecord.title} onChange={(event) => setNewRecord({ ...newRecord, title: event.target.value })} fullWidth />
              <TextField label={t.dialog.description_label} multiline rows={2} value={newRecord.description} onChange={(event) => setNewRecord({ ...newRecord, description: event.target.value })} fullWidth />
              <TextField type="date" label={t.dialog.date_label} value={newRecord.date} onChange={(event) => setNewRecord({ ...newRecord, date: event.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
              
              <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1.5, textAlign: 'center' }}>
                <input
                  accept=".jpg,.jpeg,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="outlined" component="span" startIcon={<UploadIcon />} sx={{ textTransform: 'none' }}>
                    {selectedFile ? t.dialog.change_file : t.dialog.select_file}
                  </Button>
                </label>
                {selectedFile && (
                  <Typography sx={{ fontSize: 13, mt: 1, color: colors.success }}>
                    {t.dialog.selected}: {selectedFile.name}
                  </Typography>
                )}
                {!selectedFile && (
                  <Typography sx={{ fontSize: 12, mt: 1, color: colors.muted }}>
                    {t.dialog.max_size}
                  </Typography>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenAdd(false)} sx={{ color: colors.muted, textTransform: 'none' }}>{t.dialog.cancel}</Button>
            <Button variant="contained" onClick={handleAdd} disabled={saving || !newRecord.title} sx={{ bgcolor: colors.primary, px: 3, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}>
              {saving ? t.dialog.saving : t.dialog.save}
            </Button>
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
            [t.stat_cards.prescriptions, counts.prescription, t.stat_cards.prescriptions_sub],
            [t.stat_cards.lab, counts.lab, t.stat_cards.lab_sub],
            [t.stat_cards.notes, counts.notes, t.stat_cards.notes_sub],
            [t.stat_cards.imaging, counts.imaging, t.stat_cards.imaging_sub]
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
                placeholder={t.search_placeholder}
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
                <MenuItem value="newest">{t.sort.newest}</MenuItem>
                <MenuItem value="oldest">{t.sort.oldest}</MenuItem>
                <MenuItem value="doctor">{t.sort.doctor}</MenuItem>
              </TextField>
            </Stack>

            {loading ? (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : filteredRecords.length > 0 ? (
              <Stack spacing={2}>
                {filteredRecords.map((record) => (
                  <Box key={record._id} sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.line}`, bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: colors.soft, color: colors.primary }}><FileIcon /></Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{record.title}</Typography>
                        <Typography sx={{ fontSize: 13, color: colors.muted }}>
                          {record.type.replace('_', ' ')} - {new Date(record.date || record.createdAt).toLocaleDateString()}
                        </Typography>
                        {formatDoctorLine(record) && <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>{formatDoctorLine(record)}</Typography>}
                        {record.consultationSummary && <Typography sx={{ fontSize: 13, color: colors.text, mt: 0.75 }}>{t.record.summary}: {record.consultationSummary}</Typography>}
                        {record.diagnosis && <Typography sx={{ fontSize: 13, color: colors.text, mt: 0.5 }}>{t.record.diagnosis}: {record.diagnosis}</Typography>}
                        {record.description && <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>{record.description}</Typography>}
                        {Array.isArray(record.prescriptionDetails) && record.prescriptionDetails.length > 0 && (
                          <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.75 }}>
                            {t.record.medicines}: {record.prescriptionDetails.map((item) => item.name).join(', ')}
                          </Typography>
                        )}
                        {Array.isArray(record.labTests) && record.labTests.length > 0 && (
                          <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>
                            {t.record.lab_tests}: {record.labTests.join(', ')}
                          </Typography>
                        )}
                        {String(record._id).startsWith('local-') && (
                          <Chip size="small" label={t.record.pending_sync} sx={{ mt: 1, bgcolor: '#fff4e5', color: '#8a4b00', borderRadius: 1 }} />
                        )}
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      {record.fileUrl && (
                        <Button 
                          onClick={() => window.open(record.fileUrl, '_blank')} 
                          sx={{ minWidth: 40, color: colors.success }} 
                          title="View Uploaded File"
                        >
                          <ViewIcon fontSize="small" />
                        </Button>
                      )}
                      <Button onClick={() => handleDownloadPDF(record)} sx={{ minWidth: 40, color: colors.primary }} title="Download Summary PDF"><DownloadIcon fontSize="small" /></Button>
                      <Button onClick={() => handleDelete(record)} sx={{ minWidth: 40, color: colors.danger }} title="Delete Record"><DeleteIcon fontSize="small" /></Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ py: 8, textAlign: 'center', bgcolor: colors.soft, borderRadius: 2, border: `1px dashed ${colors.line}` }}>
                <FileIcon sx={{ fontSize: 48, color: colors.gray, mb: 2 }} />
                <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 500 }}>{t.empty.title}</Typography>
                <Typography sx={{ color: colors.muted, fontSize: 14, mt: 1 }}>
                  {search || activeFilter !== 'all' ? t.empty.filter_desc : t.empty.no_records_desc}
                </Typography>
                {!(search || activeFilter !== 'all') && (
                  <Button onClick={() => setOpenAdd(true)} startIcon={<UploadIcon />} variant="outlined" sx={{ mt: 3, borderRadius: 1.5, borderColor: colors.primary, color: colors.primary, textTransform: 'none', fontWeight: 600 }}>
                    {t.empty.upload_btn}
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
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.primaryDark }}>{t.offline_ready_title}</Typography>
              <Typography sx={{ mt: 1, color: colors.primaryDark, fontSize: 13, lineHeight: 1.5 }}>
                {t.offline_ready_desc}
              </Typography>
              <Button
                onClick={syncPendingRecords}
                disabled={!isOnline || syncing || pendingSyncCount === 0}
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
                {syncing ? t.syncing : t.run_sync}
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>
    </PatientShell>
  );
}

export default PatientHealthRecords;
