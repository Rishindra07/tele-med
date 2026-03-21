import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import { getMyAppointments } from '../../api/appointmentApi';
import PatientLayout from '../../components/PatientLayout';
import StatusBadge from '../../components/StatusBadge';

function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getMyAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      setError(true);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <PatientLayout title="My Appointments">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Appointment History
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Track your upcoming and past consultations with doctors.
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
           <Alert severity="error">Failed to load appointments. Please try again.</Alert>
        ) : appointments.length === 0 ? (
          <Box py={5} textAlign="center">
            <Typography variant="h6" color="text.secondary">No appointments found.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Specialization</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((apt) => (
                    <TableRow key={apt._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>Dr. {apt.doctor?.name || 'Unknown'}</TableCell>
                      <TableCell color="text.secondary">{apt.specialization}</TableCell>
                      <TableCell>{new Date(apt.appointmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
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
    </PatientLayout>
  );
}

export default PatientAppointments;
