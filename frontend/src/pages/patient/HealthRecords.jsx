import React from 'react';
import { Box, Typography, Paper, Grid, Divider, Button, Avatar, Chip, Tooltip } from '@mui/material';
import { Download as DownloadIcon, WifiOff as OfflineIcon, Medication as MedicationIcon, Description as DocumentIcon } from '@mui/icons-material';
import PatientLayout from '../../components/PatientLayout';

export default function HealthRecords() {

  const records = [
    {
      id: 1,
      date: 'Oct 12, 2025',
      doctor: 'Dr. R. Sharma',
      specialty: 'General Physician',
      diagnosis: 'Viral Fever & Throat Infection',
      medicines: ['Paracetamol 500mg', 'Azithromycin 500mg'],
      downloadReady: true,
    },
    {
      id: 2,
      date: 'Aug 04, 2025',
      doctor: 'Dr. Anita Desai',
      specialty: 'Dermatologist',
      diagnosis: 'Eczema Flare-up',
      medicines: ['Hydrocortisone Cream 1%', 'Cetirizine 10mg'],
      downloadReady: true,
    }
  ];

  return (
    <PatientLayout title="Medical Records">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">My Health Timeline</Typography>
        <Tooltip title="Data synced. Offline access available.">
          <Chip icon={<OfflineIcon sx={{ fontSize: 16 }}/>} label="Available Offline" size="small" variant="outlined" sx={{ color: 'text.secondary', borderColor: 'divider' }} />
        </Tooltip>
      </Box>
      
      <Grid container spacing={3}>
        {records.map((record) => (
          <Grid item xs={12} key={record.id}>
            <Paper sx={{ height: { xs: 'auto', sm: 260 }, p: 0, overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              {/* Date Box */}
              <Box sx={{ bgcolor: 'primary.light', p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 160, borderRight: { sm: '1px solid rgba(0,0,0,0.05)' } }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">{record.date.split(' ')[1].replace(',', '')}</Typography>
                <Typography variant="subtitle1" color="primary.main" fontWeight={500}>{record.date.split(' ')[0]} {record.date.split(' ')[2]}</Typography>
              </Box>
              
              {/* Details Box */}
              <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                  <Grid item xs={12} md={7}>
                    <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight={600} gutterBottom>Consultation</Typography>
                    <Typography variant="h6" fontWeight="bold">{record.doctor}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{record.specialty}</Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2 }}>
                      <DocumentIcon sx={{ color: 'warning.main', mr: 1 }} />
                      <Typography variant="body2"><strong>Diagnosis:</strong> {record.diagnosis}</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={5}>
                    <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight={600} gutterBottom>Prescription</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      {record.medicines.map((med, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                          <MedicationIcon sx={{ fontSize: 16, color: 'secondary.main', mr: 1 }} />
                          <Typography variant="body2">{med}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 'auto' }}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" startIcon={<DownloadIcon />} size="small">
                      Download Rx
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </PatientLayout>
  );
}
