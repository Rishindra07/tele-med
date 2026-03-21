import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import { getDoctorAppointments } from '../../api/appointmentApi';
import DoctorLayout from '../../components/DoctorLayout';
import StatusBadge from '../../components/StatusBadge';

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getDoctorAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

  return (
    <DoctorLayout title="All Appointments">
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>Schedule History</Typography>
        <Typography color="text.secondary" mb={4}>View all past and upcoming patient consultations.</Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
        ) : error ? (
           <Alert severity="error">Failed to load appointments. Please try again.</Alert>
        ) : appointments.length === 0 ? (
          <Box py={5} textAlign="center"><Typography variant="h6" color="text.secondary">No appointments found.</Typography></Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Patient Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((apt) => (
                    <TableRow key={apt._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{apt.patient?.name || 'Unknown'}</TableCell>
                      <TableCell>{new Date(apt.appointmentDate).toLocaleDateString()}</TableCell>
                      <TableCell>{apt.timeSlot}</TableCell>
                      <TableCell><StatusBadge status={apt.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={appointments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </DoctorLayout>
  );
}

export default DoctorAppointments;
