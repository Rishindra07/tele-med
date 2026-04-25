import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, Grid, Divider, 
  CircularProgress, Button, Stack, Chip, IconButton 
} from '@mui/material';
import { 
  LocalHospital as HospitalIcon,
  Medication as RxIcon,
  CalendarMonth as DateIcon,
  Person as PatientIcon,
  Fingerprint as IdIcon,
  Download as PrintIcon,
  QrCode as QrIcon,
  Verified as VerifiedIcon,
  Print as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';

const colors = {
  header: '#1E293B',
  primary: '#2563EB',
  secondary: '#64748B',
  bg: '#F8FAFC',
  paper: '#FFFFFF',
  accent: '#FACC15',
  border: '#E2E8F0'
};

const PublicPrescription = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const formattedBaseUrl = (baseUrl && baseUrl.endsWith('/')) ? baseUrl : `${baseUrl}/`;
        const res = await axios.get(`${formattedBaseUrl}api/doctor/prescriptions/verify/${id}`);
        if (res.data.success) {
          setPrescription(res.data.prescription);
        } else {
          setError('Prescription not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load prescription');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh', bgcolor: colors.bg }}>
      <CircularProgress size={60} thickness={4} sx={{ color: colors.primary }} />
    </Box>
  );

  if (error || !prescription) return (
    <Box sx={{ p: 4, textAlign: 'center', mt: 10 }}>
      <Typography variant="h4" color="secondary" sx={{ fontWeight: 800 }}>Hmm...</Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>{error || 'This link seems to be broken'}</Typography>
      <Button variant="contained" href="/" sx={{ mt: 4, borderRadius: 2 }}>Go Home</Button>
    </Box>
  );

  const { patient, doctor, medications, issuedAt, diagnosis, labTests, notes, prescriptionId, digitalSignature } = prescription;

  return (
    <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', py: { xs: 2, md: 6 }, '@media print': { py: 0, bgcolor: 'white' } }}>
      <Container maxWidth="md">
        
        {/* Actions for Web (not shown in print) */}
        <Stack direction="row" spacing={2} sx={{ mb: 3, '@media print': { display: 'none' }, justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={handlePrint}
            sx={{ 
                bgcolor: colors.header, 
                borderRadius: 3, 
                px: 4, 
                fontWeight: 700,
                '&:hover': { bgcolor: '#0F172A' }
            }}
          >
            Save as PDF / Print
          </Button>
        </Stack>

        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 6 }, 
            borderRadius: 4, 
            border: `1px solid ${colors.border}`,
            position: 'relative',
            overflow: 'hidden',
            '@media print': { border: 'none', p: 0 }
          }}
        >
          {/* Header Watermark */}
          <Box sx={{ 
            position: 'absolute', 
            top: -20, 
            right: -20, 
            opacity: 0.03,
            transform: 'rotate(-15deg)',
            '@media print': { display: 'none' }
          }}>
            <HospitalIcon sx={{ fontSize: 300 }} />
          </Box>

          {/* Letterhead */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: colors.primary, borderRadius: 2, color: 'white' }}>
                  <HospitalIcon fontSize="large" />
                </Box>
                <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-1px', color: colors.header }}>
                  Seva TeleHealth
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: colors.primary, fontWeight: 700, mb: 0.5 }}>
                {doctor?.full_name || 'Dr. Health Specialist'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {doctor?.email || 'health@sevatelehealth.com'}
              </Typography>
              {digitalSignature?.doctorLicense && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', fontWeight: 600, color: colors.secondary }}>
                  Reg No: {digitalSignature.doctorLicense}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
               <Box sx={{ mb: 2 }}>
                  <Chip 
                    label="E-PRESCRIPTION" 
                    size="small" 
                    sx={{ bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 'bold', mb: 1 }} 
                  />
                  <Typography variant="h6" fontWeight="800" sx={{ color: colors.header }}>
                    {prescriptionId}
                  </Typography>
               </Box>
               <Stack direction="row" spacing={1} sx={{ justifyContent: { md: 'flex-end' }, color: colors.secondary }}>
                  <DateIcon fontSize="small" />
                  <Typography variant="body2" fontWeight="600">
                    {new Date(issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Typography>
               </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4, borderStyle: 'dashed', borderWidth: 1 }} />

          {/* Patient Details Row */}
          <Box sx={{ bgcolor: colors.bg, p: 3, borderRadius: 3, mb: 4, '@media print': { border: '1px solid #eee' } }}>
             <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                   <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>PATIENT NAME</Typography>
                   <Typography variant="body1" fontWeight="700">{patient?.full_name || '---'}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                   <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>AGE / GENDER</Typography>
                   <Typography variant="body1" fontWeight="700">
                    {patient?.age || '--'} Y / {patient?.gender || '--'}
                   </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                   <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>DIAGNOSIS (SUMMARY)</Typography>
                   <Typography variant="body1" fontWeight="600" sx={{ color: colors.primary }}>{diagnosis || 'General Checklist'}</Typography>
                </Grid>
             </Grid>
          </Box>

          {/* Rx Icon */}
          <Box sx={{ mb: 3, opacity: 0.8 }}>
             <RxIcon sx={{ fontSize: 40, color: colors.header }} />
          </Box>

          {/* Medications Table */}
          <Box sx={{ mb: 6 }}>
             <Typography variant="h6" fontWeight="800" gutterBottom sx={{ color: colors.header, display: 'flex', alignItems: 'center', mb: 2 }}>
                Medications <Divider sx={{ flex: 1, ml: 2, opacity: 0.1 }} />
             </Typography>
             
             {medications?.map((med, index) => (
                <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${colors.border}`, '&:last-child': { border: 'none' } }}>
                   <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                         <Typography variant="subtitle1" fontWeight="800" sx={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8em', opacity: 0.5, marginRight: '10px' }}>{index + 1}.</span> 
                            {med.name}
                            <Chip label={med.dosage} size="small" variant="outlined" sx={{ ml: 2, height: 20, fontSize: 10, fontWeight: 700 }} />
                         </Typography>
                         <Typography variant="body2" sx={{ ml: 4, mt: 0.5, fontStyle: 'italic', color: colors.secondary }}>
                           {med.instructions}
                         </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
                        <Typography variant="body2" fontWeight="700" color="primary">
                          {med.frequency}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Duration: {med.duration}
                        </Typography>
                      </Grid>
                   </Grid>
                </Box>
             ))}
          </Box>

          <Grid container spacing={4}>
            {labTests?.length > 0 && (
              <Grid item xs={12} md={6}>
                 <Typography variant="subtitle2" fontWeight="700" color="secondary" gutterBottom>LAB TESTS PRESCRIBRED</Typography>
                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {labTests.map((t, i) => <Chip key={i} label={t} size="small" sx={{ borderRadius: 1 }} />)}
                 </Box>
              </Grid>
            )}
            {notes && (
               <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="700" color="secondary" gutterBottom>ADDITIONAL INSTRUCTIONS</Typography>
                  <Typography variant="body2" sx={{ p: 2, border: '1px solid #f1f1f1', borderRadius: 2, fontStyle: 'italic' }}>
                    {notes}
                  </Typography>
               </Grid>
            )}
          </Grid>

          {/* Footer Signature Area */}
          <Box sx={{ mt: 10 }}>
            <Grid container alignItems="flex-end">
               <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #eee', borderRadius: 2, display: 'inline-block', opacity: 0.6 }}>
                    <QrIcon size="small" sx={{ mb: 0.5 }} />
                    <Typography variant="caption" display="block">Scan to Verify</Typography>
                  </Box>
               </Grid>
               <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Box sx={{ mb: 2, px: 2 }}>
                     <Typography variant="h6" sx={{ fontFamily: '"Great Vibes", cursive', fontSize: 24, mb: -1 }}>
                        {digitalSignature?.signerName || doctor?.full_name}
                     </Typography>
                     <Divider sx={{ width: 150, ml: 'auto', mt: 1.5, mb: 1 }} />
                     <Typography variant="caption" fontWeight="bold">Digital Signature</Typography>
                  </Box>
                  <Chip 
                    icon={<VerifiedIcon style={{ color: 'white', fontSize: 14 }} />} 
                    label="Electronically Verified" 
                    size="small" 
                    sx={{ bgcolor: '#059669', color: 'white', fontWeight: 'bold' }} 
                  />
               </Grid>
            </Grid>
          </Box>

          <Typography variant="caption" display="block" align="center" sx={{ mt: 8, pt: 2, borderTop: '1px solid #eee', color: colors.secondary }}>
            This is a computer-generated prescription issued via the SevaTelehealth platform. No physical signature required.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicPrescription;
