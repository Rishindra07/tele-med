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
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1.05 }}>User management</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Admin accounts, roles and access permissions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
              startIcon={<AddIcon />}
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
              Invite admin
            </Button>
          </Box>
        </Stack>

        <Box sx={{ borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, overflow: 'hidden' }}>
           <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 18 }}>Admin accounts</Typography>
              <Button startIcon={<AuditIcon />} size="small" sx={{ textTransform: 'none', color: colors.green, fontWeight: 800, fontSize: 14 }}>Audit log →</Button>
           </Box>
           
           <Stack spacing={0}>
              {ACCOUNTS.map((a, i) => (
                <Box key={i} sx={{ px: 4, py: 3, display: 'flex', alignItems: 'center', borderBottom: i === ACCOUNTS.length - 1 ? 'none' : `1px solid ${colors.line}`, transition: '0.2s', '&:hover': { bgcolor: '#fbfbfb' } }}>
                   <Avatar sx={{ width: 48, height: 48, bgcolor: a.color + '20', color: a.color, fontWeight: 800, fontSize: 16, mr: 3 }}>{a.avatar}</Avatar>
                   <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{a.name}</Typography>
                      <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.2 }}>{a.email} • {a.access} • Last active: {a.last}</Typography>
                   </Box>
                   <Stack direction="row" spacing={3} alignItems="center">
                      <Chip label={a.role} size="small" sx={{ borderRadius: '12px', height: 26, fontSize: 12, fontWeight: 800, bgcolor: a.color + '15', color: a.color }} />
                      <Button variant="outlined" size="small" sx={{ borderRadius: '12px', textTransform: 'none', px: 3, fontWeight: 700, borderColor: colors.line, color: colors.text, '&:hover': { borderColor: colors.text, bgcolor: 'transparent' } }}>Edit</Button>
                   </Stack>
                </Box>
              ))}
           </Stack>
        </Box>

        <Box sx={{ mt: 5, p: 4, borderRadius: '16px', bgcolor: colors.soft, border: `1px solid ${colors.line}` }}>
           <Stack direction="row" spacing={3} alignItems="flex-start">
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: colors.paper, display: 'grid', placeItems: 'center', border: `1px solid ${colors.line}` }}>
                <SecurityIcon sx={{ color: colors.muted }} />
              </Box>
              <Box>
                 <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Role-based Access Control (RBAC)</Typography>
                 <Typography sx={{ fontSize: 14, color: colors.muted, mt: 1, maxWidth: '85%', lineHeight: 1.6 }}>
                    Define precise permissions for your team. Ensure users only have access to the data and tools they need for their specific role.
                 </Typography>
                 <Button sx={{ mt: 2, textTransform: 'none', fontWeight: 800, color: colors.blue, p: 0, fontSize: 15 }}>Define new role →</Button>
              </Box>
           </Stack>
        </Box>
      </Box>
    </AdminLayout>
  );
}
