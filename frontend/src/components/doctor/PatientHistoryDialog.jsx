import React, { useEffect, useState } from 'react';
import {
  Box, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, Stack, Typography, Chip, Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  DescriptionOutlined as FileIcon
} from '@mui/icons-material';
import { fetchPatientHistory } from '../../api/doctorApi';

const colors = {
  line: '#d8d0c4',
  paper: '#fffdf8',
  soft: '#e9e2d8',
  muted: '#8b857d',
  graySoft: '#f1eee7'
};

export default function PatientHistoryDialog({ open, onClose, patient }) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && patient?._id) {
      const load = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await fetchPatientHistory(patient._id);
          setHistory(res.records || []);
        } catch (err) {
          setError(err.message || 'Failed to load history');
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [open, patient?._id]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: colors.paper } }}>
      <DialogTitle sx={{ borderBottom: `1px solid ${colors.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Medical History - {patient?.full_name || 'Patient'}</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>
        ) : error ? (
          <Box sx={{ py: 6, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>
        ) : history.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <FileIcon sx={{ fontSize: 48, color: colors.muted, mb: 2 }} />
            <Typography color="text.secondary">No medical records found for this patient.</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {history.map((rec) => (
              <Box key={rec._id} sx={{ p: 2, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: '#fff' }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: colors.graySoft, color: colors.muted }}><FileIcon /></Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontWeight: 600 }}>{rec.title}</Typography>
                      <Chip label={rec.type.replace('_', ' ')} size="small" sx={{ fontSize: 11, textTransform: 'uppercase' }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {new Date(rec.date || rec.createdAt).toLocaleDateString()} • Dr. {rec.doctorInfo?.name || rec.doctor?.full_name || 'System Generated'}
                    </Typography>
                    {rec.diagnosis && <Typography variant="body2" sx={{ mt: 1 }}><strong>Diagnosis:</strong> {rec.diagnosis}</Typography>}
                    {rec.prescriptionDetails?.length > 0 && (
                      <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: '#f9f9f9', border: '1px dashed #ddd' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1 }}>PRESCRIBED MEDICATIONS</Typography>
                        <Stack spacing={1}>
                          {rec.prescriptionDetails.map((med, idx) => (
                             <Typography key={idx} sx={{ fontSize: 13.5 }}>
                               • <strong>{med.name}</strong> - {med.dosage} ({med.frequency}, {med.duration})
                             </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
