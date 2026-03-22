import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Autocomplete, Chip, Divider, IconButton } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Delete as DeleteIcon, Print as PrintIcon } from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import { useNavigate } from 'react-router-dom';

const medicineOptions = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Cetirizine 10mg', 'Ibuprofen 400mg', 'Azithromycin 500mg', 'Vitamin C'];

export default function PrescriptionForm() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState('Rahul Verma');
  const [diagnosis, setDiagnosis] = useState('');
  const [medInput, setMedInput] = useState(null);
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [notes, setNotes] = useState('');

  const handleAddMedicine = () => {
    if (medInput && dosage) {
      setPrescriptions([...prescriptions, { med: medInput, dose: dosage, days: duration }]);
      setMedInput(null);
      setDosage('');
      setDuration('');
    }
  };

  const removeMedicine = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  return (
    <DoctorLayout title="Write Prescription">
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, position: 'relative' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" color="secondary" fontWeight="bold">TeleMedi Plus Rx</Typography>
            <Typography variant="subtitle1" color="text.secondary">Dr. Sharma, General Physician</Typography>
            <Divider sx={{ my: 3 }} />
          </Box>

          <Grid container spacing={4}>
            {/* Patient Info */}
            <Grid item xs={12} sm={6}>
              <TextField label="Patient Name" fullWidth value={patient} onChange={(e) => setPatient(e.target.value)} variant="standard" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date" type="date" fullWidth value={new Date().toISOString().split('T')[0]} disabled variant="standard" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Diagnosis / Symptoms" fullWidth value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} variant="standard" placeholder="e.g. Viral Fever" />
            </Grid>

            {/* Medicine Form */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', marginRight: '8px' }}>℞</span> Add Medicines
              </Typography>
              <Box sx={{ bgcolor: '#F8FAFC', p: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} md={5}>
                    <Autocomplete
                      freeSolo
                      options={medicineOptions}
                      value={medInput}
                      onChange={(_, newValue) => setMedInput(newValue)}
                      renderInput={(params) => <TextField {...params} label="Medicine Name" size="small" />}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField label="Dosage" placeholder="e.g. 1-0-1" value={dosage} onChange={(e) => setDosage(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField label="Days" placeholder="e.g. 5" value={duration} onChange={(e) => setDuration(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button variant="contained" color="secondary" fullWidth onClick={handleAddMedicine} disabled={!medInput || !dosage}>Add</Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Added Medicines List */}
            {prescriptions.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Prescribed Items</Typography>
                {prescriptions.map((p, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
                    <Box>
                      <Typography fontWeight="bold">{p.med}</Typography>
                      <Typography variant="body2" color="text.secondary">Dosage: {p.dose} {p.days && `for ${p.days} days`}</Typography>
                    </Box>
                    <IconButton color="error" onClick={() => removeMedicine(idx)}><DeleteIcon /></IconButton>
                  </Box>
                ))}
              </Grid>
            )}

            {/* Notes */}
            <Grid item xs={12}>
              <TextField label="Doctor's Notes / Advice" fullWidth multiline rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} variant="outlined" placeholder="Take ample rest. Follow up after 5 days." />
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" startIcon={<PrintIcon />}>Print Rx</Button>
                <Button variant="contained" color="secondary" startIcon={<CheckCircleIcon />}>Issue Prescription</Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </DoctorLayout>
  );
}
