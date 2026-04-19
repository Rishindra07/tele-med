import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  PictureAsPdfRounded as PdfIcon,
  TableChartRounded as ExcelIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import {
  exportAdminReport,
  fetchAdminAnalytics,
  fetchComplaints,
  fetchConsultationMonitor,
  fetchRecordsOverview
} from '../../api/adminApi';

const colors = {
  paper: '#ffffff',
  line: '#e0e0e0',
  text: '#202124',
  muted: '#5f6368',
  blue: '#1a73e8',
  blueSoft: '#e8f0fe',
  green: '#1e8e3e',
  greenSoft: '#e6f4ea',
  red: '#d93025',
  redSoft: '#fbeaea',
  orange: '#f9ab00',
  orangeSoft: '#fff8e1',
  soft: '#f1f3f4'
};

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));

const downloadBlob = (content, fileName, contentType = 'text/csv') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const fileNameMap = {
  overview: 'admin-overview-report.csv',
  complaints: 'admin-complaints-report.csv',
  consultations: 'admin-consultations-report.csv',
  records: 'admin-records-report.csv'
};

export default function AdminReports() {
  const [loadingType, setLoadingType] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [records, setRecords] = useState(null);
  const [consultations, setConsultations] = useState(null);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [analyticsRes, recordsRes, consultationsRes, complaintsRes] = await Promise.all([
          fetchAdminAnalytics(),
          fetchRecordsOverview(),
          fetchConsultationMonitor(),
          fetchComplaints()
        ]);
        setAnalytics(analyticsRes.analytics || null);
        setRecords(recordsRes || null);
        setConsultations(consultationsRes || null);
        setComplaints(complaintsRes.complaints || []);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const quickReports = useMemo(() => ([
    {
      key: 'overview',
      title: 'Platform overview report',
      desc: 'Consultations, active users, fulfillment rate, and system response metrics.',
      helper: `${formatNumber(analytics?.consultations?.month || 0)} consultations this month`
    },
    {
      key: 'complaints',
      title: 'Complaint summary report',
      desc: 'Complaint statuses and resolution timelines exported from the admin backend.',
      helper: `${formatNumber(complaints.length)} complaints in the current dataset`
    },
    {
      key: 'consultations',
      title: 'Consultation activity report',
      desc: 'Live consultation feed, today’s trend, and outcome tracking exported from admin monitoring.',
      helper: `${formatNumber(consultations?.summary?.todaySoFar || 0)} consultations logged today`
    },
    {
      key: 'records',
      title: 'Health records report',
      desc: 'Record storage, sync status, and record-type distribution exported from the records backend.',
      helper: `${formatNumber(records?.summary?.totalRecords || 0)} records stored`
    }
  ]), [analytics, complaints.length, consultations, records]);

  const snapshotChips = useMemo(() => ([
    { label: `Today consultations: ${formatNumber(analytics?.consultations?.today || 0)}`, sx: { bgcolor: colors.greenSoft, color: colors.green } },
    { label: `Week consultations: ${formatNumber(analytics?.consultations?.week || 0)}`, sx: { bgcolor: colors.blueSoft, color: colors.blue } },
    { label: `Month consultations: ${formatNumber(analytics?.consultations?.month || 0)}`, sx: { bgcolor: colors.orangeSoft, color: colors.orange } },
    { label: `Pending approvals: ${formatNumber((analytics?.pendingApprovals || []).length)}`, sx: { bgcolor: colors.soft, color: '#252525' } },
    { label: `Records stored: ${formatNumber(records?.summary?.totalRecords || 0)}`, sx: { bgcolor: colors.greenSoft, color: colors.green } },
    { label: `Complaints tracked: ${formatNumber(complaints.length)}`, sx: { bgcolor: colors.orangeSoft, color: colors.orange } }
  ]), [analytics, records, complaints.length]);

  const handleExport = async (type, format) => {
    try {
      setLoadingType(`${type}:${format}`);
      setError('');
      if (format === 'pdf') {
        const response = await exportAdminReport(type);
        downloadBlob(response, fileNameMap[type].replace('.csv', '.pdf') || `admin-${type}-report.pdf`, 'application/pdf');
      } else {
        const response = await exportAdminReport(type);
        downloadBlob(response, fileNameMap[type] || `admin-${type}-report.csv`, 'text/csv');
      }
      setMessage(`Downloaded ${type} report.`);
    } catch (err) {
      setError(err.message || 'Failed to export report');
    } finally {
      setLoadingType('');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1.05 }}>Reports</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Generate and download live platform reports from the backend.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.blue,
                borderRadius: '12px',
                px: 3,
                py: 1.25,
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 700,
                '&:hover': { bgcolor: colors.blue }
              }}
            >
              Custom Report
            </Button>
          </Box>
        </Stack>

        {message && <Alert severity="success" sx={{ borderRadius: '12px', mb: 3 }} onClose={() => setMessage('')}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ borderRadius: '12px', mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.blue }} />
          </Box>
        ) : (
          <Stack spacing={4}>
            <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 18, mb: 4 }}>Quick reports</Typography>
              <Stack spacing={3}>
                {quickReports.map((report) => (
                  <Stack key={report.key} direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ p: 2, borderRadius: '12px', bgcolor: colors.soft, transition: '0.2s', '&:hover': { bgcolor: '#fbfbfb', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' } }}>
                    <Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{report.title}</Typography>
                      <Typography sx={{ fontSize: 13.5, color: colors.muted, mt: 0.5 }}>{report.desc}</Typography>
                      <Typography sx={{ fontSize: 12.5, color: colors.blue, fontWeight: 700, mt: 0.8 }}>{report.helper}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5}>
                      <Button 
                        startIcon={<PdfIcon />} 
                        variant="outlined" 
                        onClick={() => handleExport(report.key, 'pdf')} 
                        disabled={loadingType === `${report.key}:pdf`} 
                        sx={{ 
                          borderRadius: '12px', 
                          textTransform: 'none', 
                          borderColor: colors.line, 
                          color: colors.text,
                          fontWeight: 700,
                          px: 2,
                          '&:hover': { borderColor: colors.text, bgcolor: 'transparent' }
                        }}
                      >
                        {loadingType === `${report.key}:pdf` ? 'Generating...' : 'PDF'}
                      </Button>
                      <Button 
                        startIcon={<ExcelIcon />} 
                        variant="outlined" 
                        onClick={() => handleExport(report.key, 'excel')} 
                        disabled={loadingType === `${report.key}:excel`} 
                        sx={{ 
                          borderRadius: '12px', 
                          textTransform: 'none', 
                          borderColor: colors.line, 
                          color: colors.text,
                          fontWeight: 700,
                          px: 2,
                          '&:hover': { borderColor: colors.text, bgcolor: 'transparent' }
                        }}
                      >
                        {loadingType === `${report.key}:excel` ? 'Generating...' : 'Excel'}
                      </Button>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 18, mb: 3 }}>Live report snapshot</Typography>
              <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
                {snapshotChips.map((chip) => (
                  <Chip 
                    key={chip.label} 
                    label={chip.label} 
                    sx={{ 
                      ...chip.sx, 
                      borderRadius: '12px', 
                      fontWeight: 700, 
                      fontSize: 14,
                      py: 2.2
                    }} 
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        )}
      </Box>
    </AdminLayout>
  );
}
