import React, { useEffect, useState } from 'react';
import {
  Box, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, Stack, Typography, Chip, Divider, Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  ReceiptLongRounded as PrescriptionIcon,
  CalendarMonthRounded as DateIcon,
  PersonRounded as PatientIcon,
  LocalHospitalRounded as HospitalIcon
} from '@mui/icons-material';
import { fetchPrescriptionByConsultation } from '../../api/doctorApi';

const colors = {
  line: '#d8d0c4',
  paper: '#fffdf8',
  soft: '#e9e2d8',
  muted: '#8b857d',
  green: '#26a37c',
  greenSoft: '#dff3eb'
};

export default function PrescriptionViewDialog({ open, onClose, consultationId }) {
  const [loading, setLoading] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && consultationId) {
      const load = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await fetchPrescriptionByConsultation(consultationId);
          setPrescription(res.prescription);
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'Failed to load prescription');
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [open, consultationId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: colors.paper } }}>
      <DialogTitle sx={{ borderBottom: `1px solid ${colors.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
           <PrescriptionIcon sx={{ color: colors.green }} />
           <Typography variant="h6" fontWeight="bold">Prescription Details</Typography>
        </Stack>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress sx={{ color: colors.green }} /></Box>
        ) : error ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
             <Typography color="error" variant="body1">{error}</Typography>
          </Box>
        ) : !prescription ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
             <Typography color="text.secondary">No prescription found for this consultation.</Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            <Box>
               <Typography sx={{ fontSize: 13, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, letterSpacing: 0.5, mb: 1 }}>PATIENT INFORMATION</Typography>
               <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1, borderRadius: '50%', bgcolor: '#f0f0f0' }}><PatientIcon sx={{ color: colors.muted }} /></Box>
                  <Box>
                     <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{prescription.patient?.full_name}</Typography>
                     <Typography sx={{ color: colors.muted, fontSize: 14 }}>{prescription.patient?.email} • {prescription.patient?.phone}</Typography>
                  </Box>
               </Stack>
            </Box>

            <Divider />

            <Box>
               <Typography sx={{ fontSize: 13, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, letterSpacing: 0.5, mb: 1.5 }}>DIAGNOSIS</Typography>
               <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8f8f8', borderColor: colors.line }}>
                  <Typography sx={{ fontSize: 15 }}>{prescription.diagnosis}</Typography>
               </Paper>
            </Box>

            <Box>
               <Typography sx={{ fontSize: 13, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, letterSpacing: 0.5, mb: 1.5 }}>MEDICATIONS</Typography>
               <Stack spacing={1.5}>
                  {prescription.medications.map((med, idx) => (
                    <Box key={idx} sx={{ p: 2, borderRadius: 2.5, border: `1px solid ${colors.line}`, bgcolor: '#fff' }}>
                       <Typography sx={{ fontWeight: 700, fontSize: 15, color: colors.green }}>{med.name}</Typography>
                       <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                          <Box>
                             <Typography sx={{ fontSize: 12, color: colors.muted }}>Dosage</Typography>
                             <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{med.dosage}</Typography>
                          </Box>
                          <Box>
                             <Typography sx={{ fontSize: 12, color: colors.muted }}>Frequency</Typography>
                             <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{med.frequency}</Typography>
                          </Box>
                          <Box>
                             <Typography sx={{ fontSize: 12, color: colors.muted }}>Duration</Typography>
                             <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{med.duration}</Typography>
                          </Box>
                       </Stack>
                       {med.instructions && (
                         <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #eee' }}>
                            <Typography sx={{ fontSize: 12, color: colors.muted }}>Instructions</Typography>
                            <Typography sx={{ fontSize: 14 }}>{med.instructions}</Typography>
                         </Box>
                       )}
                    </Box>
                  ))}
               </Stack>
            </Box>

            {prescription.notes && (
              <Box>
                 <Typography sx={{ fontSize: 13, textTransform: 'uppercase', color: colors.muted, fontWeight: 700, letterSpacing: 0.5, mb: 1 }}>ADDITIONAL NOTES</Typography>
                 <Typography sx={{ fontSize: 14.5 }}>{prescription.notes}</Typography>
              </Box>
            )}

            <Box sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: colors.greenSoft, border: `1px solid ${colors.green}20` }}>
               <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                     <Typography sx={{ fontSize: 12, color: colors.green, fontWeight: 700 }}>DIGITALLY SIGNED BY</Typography>
                     <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>{prescription.digitalSignature?.signerName}</Typography>
                     <Typography sx={{ fontSize: 12.5, color: colors.muted }}>{prescription.digitalSignature?.doctorLicense}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                     <Typography sx={{ fontSize: 12, color: colors.muted }}>Issued At</Typography>
                     <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>{new Date(prescription.issuedAt).toLocaleDateString()}</Typography>
                  </Box>
               </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
