import React from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, Chip,
} from '@mui/material';
import {
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  SecurityRounded as SecurityIcon,
  HistoryRounded as AuditIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';

const colors = {
  paper: '#ffffff',
  bg: '#f9f9f9',
  line: '#ebe9e0',
  soft: '#f5f1e8',
  text: '#252525',
  muted: '#6f6a62',
  blue: '#2563eb',
  blueSoft: '#eff6ff',
  green: '#16a34a',
  greenSoft: '#f0fdf4',
  red: '#dc2626',
  redSoft: '#fef2f2',
  orange: '#ea580c',
  orangeSoft: '#fff7ed',
  yellow: '#ca8a04',
};

const ACCOUNTS = [
  { name: 'Super Admin', email: 'seva.admin@seva.health', role: 'Super Admin', access: 'Full access', last: 'Now', avatar: 'SA', color: '#6366f1' },
  { name: 'Analytics Team', email: 'analytics.team@seva.health', role: 'Analyst', access: 'Read only', last: '2h ago', avatar: 'AT', color: colors.blue },
  { name: 'Operations Manager', email: 'ops@seva.health', role: 'Operations', access: 'Platform ops', last: 'Yesterday', avatar: 'OPS', color: colors.green },
  { name: 'Finance Admin', email: 'finance@seva.health', role: 'Finance', access: 'Financials only', last: '3h ago', avatar: 'FIN', color: colors.orange }
];

export default function AdminUserManagement() {
  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1000, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>User management</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>Admin accounts, roles and access permissions</Typography>
          </Box>
          <Button startIcon={<AddIcon />} variant="contained" sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600 }}>
            Invite admin
          </Button>
        </Stack>

        <Paper sx={{ p: 0, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', overflow: 'hidden' }}>
           <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Admin accounts</Typography>
              <Button startIcon={<AuditIcon />} size="small" sx={{ textTransform: 'none', color: colors.green, fontWeight: 700 }}>Audit log →</Button>
           </Box>
           
           <Stack spacing={0}>
              {ACCOUNTS.map((a, i) => (
                <Box key={i} sx={{ p: 3, px: 4, display: 'flex', alignItems: 'center', borderBottom: i === ACCOUNTS.length - 1 ? 'none' : `1px solid ${colors.line}` }}>
                   <Avatar sx={{ width: 44, height: 44, bgcolor: a.color + '15', color: a.color, fontWeight: 700, fontSize: 14, mr: 3 }}>{a.avatar}</Avatar>
                   <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{a.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>{a.email} • {a.access} • Last active: {a.last}</Typography>
                   </Box>
                   <Stack direction="row" spacing={2} alignItems="center">
                      <Chip label={a.role} size="small" sx={{ borderRadius: 1.5, height: 24, fontSize: 11, fontWeight: 700, bgcolor: a.color + '10', color: a.color }} />
                      <Button variant="outlined" size="small" sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>Edit</Button>
                   </Stack>
                </Box>
              ))}
           </Stack>
        </Paper>

        <Box sx={{ mt: 5, p: 4, borderRadius: 5, bgcolor: colors.soft, border: `1px solid ${colors.line}` }}>
           <Stack direction="row" spacing={3} alignItems="flex-start">
              <SecurityIcon sx={{ color: colors.muted }} />
              <Box>
                 <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Role-based Access Control (RBAC)</Typography>
                 <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5, maxWidth: '80%', lineHeight: 1.5 }}>
                    Define precise permissions for your team. Ensure users only have access to the data and tools they need for their specific role.
                 </Typography>
                 <Button sx={{ mt: 2, textTransform: 'none', fontWeight: 700, color: colors.blue, p: 0 }}>Define new role →</Button>
              </Box>
           </Stack>
        </Box>
      </Box>
    </AdminLayout>
  );
}
