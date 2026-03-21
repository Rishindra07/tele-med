import React from 'react';
import { Chip } from '@mui/material';

const statusColorMap = {
  Ready: 'success',
  Completed: 'success',
  Pending: 'warning',
  Scheduled: 'primary',
  'Out of Stock': 'error',
  Partial: 'warning',
};

const StatusBadge = ({ status }) => {
  const color = statusColorMap[status] || 'default';
  
  return (
    <Chip 
      label={status} 
      color={color} 
      size="small" 
      sx={{ fontWeight: 600, borderRadius: 1 }} 
    />
  );
};

export default StatusBadge;
