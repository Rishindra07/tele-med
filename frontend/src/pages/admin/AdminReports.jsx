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
  line: '#ebe9e0',
  muted: '#6f6a62',
  green: '#16a34a',
  greenSoft: '#f0fdf4',
  blue: '#2563eb',
  blueSoft: '#eff6ff',
  orange: '#ea580c',
  orangeSoft: '#fff7ed',
  soft: '#f5f1e8'
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
        <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>Reports</Typography>
        <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5, mb: 4 }}>
          Generate and download live platform reports from the backend.
        </Typography>

        {message && <Alert severity="success" sx={{ borderRadius: 3, mb: 3 }} onClose={() => setMessage('')}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.blue }} />
          </Box>
        ) : (
          <Stack spacing={4}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 4 }}>Quick reports</Typography>
              <Stack spacing={3}>
                {quickReports.map((report) => (
                  <Stack key={report.key} direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                    <Box>
                      <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{report.title}</Typography>
                      <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.5 }}>{report.desc}</Typography>
                      <Typography sx={{ fontSize: 11.5, color: colors.muted, mt: 0.8 }}>{report.helper}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button startIcon={<PdfIcon />} variant="outlined" onClick={() => handleExport(report.key, 'pdf')} disabled={loadingType === `${report.key}:pdf`} sx={{ borderRadius: 1.5, textTransform: 'none' }}>
                        {loadingType === `${report.key}:pdf` ? 'Generating...' : 'PDF'}
                      </Button>
                      <Button startIcon={<ExcelIcon />} variant="outlined" onClick={() => handleExport(report.key, 'excel')} disabled={loadingType === `${report.key}:excel`} sx={{ borderRadius: 1.5, textTransform: 'none' }}>
                        {loadingType === `${report.key}:excel` ? 'Generating...' : 'Excel'}
                      </Button>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3 }}>Live report snapshot</Typography>
              <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
                {snapshotChips.map((chip) => (
                  <Chip key={chip.label} label={chip.label} sx={chip.sx} />
                ))}
              </Stack>
            </Paper>
          </Stack>
        )}
      </Box>
    </AdminLayout>
  );
}
