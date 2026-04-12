import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  TextField, MenuItem, Select, FormControl, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar, Alert, CircularProgress
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  SearchRounded as SearchIcon,
  AddRounded as AddIcon,
  DeleteOutlineRounded as DeleteIcon,
  QrCodeScannerRounded as ScanIcon
} from '@mui/icons-material';
import { fetchInventory, addInventoryItem, deleteInventoryItem } from '../../api/pharmacyApi';
import PharmacyLayout from '../../components/PharmacyLayout';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { PHARMACY_INVENTORY_TRANSLATIONS } from '../../utils/translations/pharmacy';

const colors = {
  paper: '#ffffff',
  bg: '#f8f9fa',
  line: '#e1e3e1',
  soft: '#f1f3f4',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#174ea6',
  success: '#1e8e3e',
  successSoft: '#e6f4ea',
  warning: '#f9ab00',
  red: '#d93025',
  redSoft: '#fdeaea',
  blue: '#1a73e8',
  blueSoft: '#e8f0fe',
  graySoft: '#f1f3f4'
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Helper to get category styles
const getCategoryStyle = (cat) => {
  const categories = {
    'Antibiotic': { bg: colors.blueSoft, col: colors.blue },
    'Antihypert.': { bg: colors.blueSoft, col: colors.blue },
    'Antidiabetic': { bg: colors.blueSoft, col: colors.blue },
    'Vitamin': { bg: colors.graySoft, col: colors.text },
    'Jan Aushadhi': { bg: colors.successSoft, col: colors.success },
    'OTC': { bg: colors.graySoft, col: colors.text }
  };
  return categories[cat] || { bg: colors.graySoft, col: colors.text };
};

const StatCard = ({ title, value, sub, color, textColor }) => (
  <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, flex: '1 1 0', minWidth: 140, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: color }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Typography>
    </Box>
    <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: colors.text }}>
      {value}
    </Typography>
    <Typography sx={{ mt: 0.5, fontSize: 12.5, color: textColor, fontWeight: 600 }}>
      {sub}
    </Typography>
  </Box>
);

const PillFilter = ({ label, count, active, color }) => (
  <Button sx={{ 
    textTransform: 'none', 
    borderRadius: 99, 
    px: 2, 
    py: 0.75, 
    fontSize: 13,
    fontWeight: 600,
    bgcolor: active ? colors.primary : 'transparent',
    color: active ? '#fff' : colors.text,
    border: `1px solid ${active ? colors.primary : colors.line}`,
    minWidth: 0,
    '&:hover': { bgcolor: active ? colors.primaryDark : colors.graySoft }
  }}>
    {label}{count !== undefined && (
      <Box component="span" sx={{ 
        ml: 1, 
        px: 0.8, 
        py: 0.2, 
        borderRadius: 99, 
        fontSize: 11, 
        bgcolor: active ? '#fff' : colors.graySoft, 
        color: active ? colors.primaryDark : (color || colors.text),
        fontWeight: 700
      }}>
        {count}
      </Box>
    )}
  </Button>
);

export default function PharmacyInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [form, setForm] = useState({ 
    medicineName: '', genericName: '', batchNumber: '', quantity: '', 
    mrp: '', expiryDate: '', category: 'OTC', rackLocation: '',
    strength: '', formValue: '', lowStockThreshold: '10' 
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const { language } = useLanguage();
  const t = PHARMACY_INVENTORY_TRANSLATIONS[language] || PHARMACY_INVENTORY_TRANSLATIONS['en'];

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchInventory(searchTerm);
      setItems(res.items || []);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to load inventory', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [searchTerm]);

  const handleSave = async () => {
    if (!form.medicineName || !form.quantity) {
      setSnackbar({ open: true, message: 'Please fill name and quantity', severity: 'warning' });
      return;
    }
    try {
      setIsSaving(true);
      await addInventoryItem({ ...form, form: form.formValue });
      setSnackbar({ open: true, message: 'Medicine added to inventory!', severity: 'success' });
      setForm({ 
        medicineName: '', genericName: '', batchNumber: '', quantity: '', 
        mrp: '', expiryDate: '', category: 'OTC', rackLocation: '',
        strength: '', formValue: '', lowStockThreshold: '10' 
      });
      load();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Error saving medicine', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteInventoryItem(id);
      setSnackbar({ open: true, message: 'Item deleted', severity: 'success' });
      load();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
    }
  };

  // Dynamic values
  const totalSkus = items.length;
  const inStock = items.filter(i => i.quantity > 0).length;
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= i.lowStockThreshold).length;
  const outOfStock = items.filter(i => i.quantity <= 0).length;

  const filteredItems = items.filter(i => {
    if (filter === 'All') return true;
    if (filter === 'In stock') return i.quantity > 0;
    if (filter === 'Low stock') return i.quantity > 0 && i.quantity <= i.lowStockThreshold;
    if (filter === 'Out of stock') return i.quantity <= 0;
    if (filter === 'Jan Aushadhi') return i.category === 'Jan Aushadhi';
    return true;
  });

  const categoriesCount = items.reduce((acc, i) => {
    const cat = i.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const displayedCategories = Object.entries(categoriesCount).map(([label, count]) => ({ label, count }));

  const STATS = [
    { title: t.stats_all_skus, value: totalSkus, sub: t.stats_all_skus_sub, color: colors.primary, textColor: colors.primary },
    { title: t.filter_in_stock, value: inStock, sub: `${Math.round(totalSkus > 0 ? inStock/totalSkus*100 : 0)}${t.stats_in_stock_sub1}`, color: colors.success, textColor: colors.success },
    { title: t.filter_low_stock, value: lowStock, sub: t.stats_low_stock_sub, color: colors.warning, textColor: colors.warning },
    { title: t.filter_out, value: outOfStock, sub: t.stats_out_sub, color: colors.red, textColor: colors.red }
  ];

  const FILTERS = [
    { label: t.filter_all, count: totalSkus, active: filter === 'All' || filter === t.filter_all },
    { label: t.filter_in_stock, count: inStock, active: filter === 'In stock' || filter === t.filter_in_stock },
    { label: t.filter_low_stock, count: lowStock, active: filter === 'Low stock' || filter === t.filter_low_stock },
    { label: t.filter_out, count: outOfStock, active: filter === 'Out of stock' || filter === t.filter_out, color: colors.red },
    { label: 'Jan Aushadhi', active: filter === 'Jan Aushadhi' }
  ];

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px', color: colors.text }}>
              {t.title}
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 16 }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ bgcolor: colors.soft, color: '#5f5a52', borderRadius: 2.5, px: 2, py: 1, fontSize: 13, lineHeight: 1.25, textAlign: 'center' }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <IconButton sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', width: 42, height: 42 }}>
              <Badge color="error" variant="dot">
                <BellIcon sx={{ color: '#5f5a52' }} />
              </Badge>
            </IconButton>
          </Stack>
        </Stack>

        {/* Stats Row */}
        <Stack direction="row" spacing={2} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
          {STATS.map(s => <StatCard key={s.title} {...s} />)}
        </Stack>

        {/* Filters */}
        <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            <TextField 
              placeholder={t.search} 
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: colors.paper, '& fieldset': { borderColor: colors.line } } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: colors.muted, fontSize: 20 }} /></InputAdornment> }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value="all" sx={{ borderRadius: 2.5, bgcolor: colors.paper, fontSize: 14, '& fieldset': { borderColor: colors.line } }}>
                <MenuItem value="all">{t.all_categories}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {FILTERS.map(f => (
              <Box key={f.label} onClick={() => setFilter(f.label)}>
                <PillFilter {...f} />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Main 2-Col Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3 }}>
          
          {/* Left Col: Stock List */}
          <Box sx={{ borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 16 }}>{t.stock_list}</Typography>
              <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>{t.export_csv}</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.soft }}>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>{t.th_medicine}</TableCell>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>{t.th_category}</TableCell>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>{t.th_stock}</TableCell>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>{t.th_level}</TableCell>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>{t.th_mrp}</TableCell>
                    <TableCell sx={{ color: colors.muted, fontSize: 12.5, borderBottom: `1px solid ${colors.line}`, py: 1.5 }}>{t.th_expiry}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((item) => {
                    const status = item.quantity <= 0 ? 'out' : item.quantity <= item.lowStockThreshold ? 'low' : 'ok';
                    let statusColor = colors.green;
                    if (status === 'low') statusColor = colors.amber;
                    if (status === 'out') statusColor = colors.red;
                    
                    const catStyle = getCategoryStyle(item.category);
                    
                    return (
                      <TableRow key={item._id} sx={{ '& td': { borderBottom: `1px solid ${colors.line}`, py: 2 } }}>
                        <TableCell>
                          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{item.medicineName}</Typography>
                          <Typography sx={{ fontSize: 12, color: colors.muted }}>{item.genericName || t.generic_name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'inline-flex', px: 1.2, py: 0.4, borderRadius: 99, bgcolor: catStyle.bg, color: catStyle.col, fontSize: 11 }}>
                            {item.category || t.general}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, color: statusColor, fontWeight: 700 }}>{item.quantity} {t.units}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ width: 32, height: 6, borderRadius: 3, bgcolor: colors.line, position: 'relative' }}>
                            <Box sx={{ 
                              position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3, bgcolor: statusColor,
                              width: `${Math.min(100, (item.quantity / (item.lowStockThreshold * 3)) * 100)}%`
                            }} />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>₹{item.mrp || 0}</TableCell>
                        <TableCell sx={{ fontSize: 13, color: item.expiryDate && new Date(item.expiryDate) < new Date() ? colors.red : colors.text }}>
                          {item.expiryDate ? formatDate(item.expiryDate) : '—'}
                          <IconButton size="small" onClick={() => handleDelete(item._id)} sx={{ ml: 1, color: colors.red }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!loading && !filteredItems.length && (
                    <TableRow><TableCell colSpan={6} sx={{ py: 6, textAlign: 'center', color: colors.muted }}>{t.no_items}</TableCell></TableRow>
                  )}
                  {loading && <TableRow><TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}><CircularProgress size={24} /></TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Right Col: Cards Stack */}
          <Stack spacing={3}>
            
            {/* Quick add medicine */}
            <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>{t.quick_add}</Typography>
              <Stack spacing={1.5}>
                <TextField 
                  placeholder={t.placeholder_name} size="small" fullWidth
                  value={form.medicineName} onChange={e => setForm({...form, medicineName: e.target.value})}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: colors.paper } }} 
                />
                <TextField 
                  placeholder={t.generic_name} size="small" fullWidth
                  value={form.genericName} onChange={e => setForm({...form, genericName: e.target.value})}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: colors.paper } }} 
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField 
                    placeholder={t.strength} size="small"
                    value={form.strength} onChange={e => setForm({...form, strength: e.target.value})}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                  <TextField 
                    placeholder={t.form_type} size="small"
                    value={form.formValue} onChange={e => setForm({...form, formValue: e.target.value})}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField 
                    placeholder={t.batch} size="small"
                    value={form.batchNumber} onChange={e => setForm({...form, batchNumber: e.target.value})}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                  <TextField 
                    placeholder={t.qty} size="small" type="number"
                    value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField 
                    placeholder={t.mrp_placeholder} size="small" type="number"
                    value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                  <TextField 
                    placeholder={t.threshold} size="small" type="number"
                    value={form.lowStockThreshold} onChange={e => setForm({...form, lowStockThreshold: e.target.value})}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                </Box>
                <TextField 
                  placeholder={t.expiry_date} size="small" type="date"
                  value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                />
                <FormControl size="small" fullWidth>
                  <Select 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                    sx={{ borderRadius: 2, '& fieldset': { borderColor: colors.line } }}
                  >
                    <MenuItem value="OTC">OTC / General</MenuItem>
                    <MenuItem value="Antibiotic">Antibiotic</MenuItem>
                    <MenuItem value="Antihypert.">Antihypert.</MenuItem>
                    <MenuItem value="Antidiabetic">Antidiabetic</MenuItem>
                    <MenuItem value="Vitamin">Vitamin</MenuItem>
                    <MenuItem value="Jan Aushadhi">Jan Aushadhi</MenuItem>
                  </Select>
                </FormControl>
                <TextField 
                  placeholder={t.rack} size="small" fullWidth
                  value={form.rackLocation} onChange={e => setForm({...form, rackLocation: e.target.value})}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: colors.paper } }} 
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
                  <Button 
                    disabled={isSaving}
                    onClick={handleSave}
                    sx={{ bgcolor: colors.primary, color: '#fff', borderRadius: 2, textTransform: 'none', py: 1.25, fontWeight: 700, fontSize: 14.5, '&:hover': { bgcolor: colors.primaryDark }, boxShadow: `0 4px 12px ${colors.primary}30` }}
                  >
                    {isSaving ? t.saving : t.save}
                  </Button>
                  <Button 
                    startIcon={<ScanIcon />}
                    sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, textTransform: 'none', py: 1.25, fontWeight: 600, fontSize: 14.5, bgcolor: '#fff', '&:hover': { bgcolor: colors.graySoft } }}
                  >
                    {t.scan}
                  </Button>
                </Box>
              </Stack>
            </Box>

            {/* Stock by category */}
            <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>{t.stock_category}</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {displayedCategories.map(c => (
                  <Box key={c.label} sx={{ p: 1.5, borderRadius: 2, bgcolor: colors.soft }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{c.count}</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.muted, whiteSpace: 'pre-line', lineHeight: 1.2, mt: 0.5 }}>{c.label}</Typography>
                  </Box>
                ))}
                {!displayedCategories.length && <Typography sx={{ color: colors.muted, fontSize: 12 }}>{t.no_categories}</Typography>}
              </Box>
            </Box>

            {/* Reorder alerts */}
            <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>{t.reorder_alerts}</Typography>
              <Stack spacing={2.5}>
                {items.filter(i => i.quantity <= i.lowStockThreshold).map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: item.quantity <= 0 ? colors.red : colors.amber, mt: 0.8, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontSize: 13.5, lineHeight: 1.25, mb: 0.3, whiteSpace: 'pre-line' }}>
                        {item.medicineName} — {item.quantity <= 0 ? t.out_of_stock_alert : t.low_stock_alert}
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: colors.muted, lineHeight: 1.2, whiteSpace: 'pre-line' }}>
                        {item.quantity} {t.units} • {t.reorder_point} {item.lowStockThreshold}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {!items.some(i => i.quantity <= i.lowStockThreshold) && (
                  <Typography sx={{ color: colors.muted, fontSize: 13.5 }}>{t.optimal}</Typography>
                )}
              </Stack>
              <Button fullWidth sx={{ mt: 3, bgcolor: colors.primary, color: '#fff', borderRadius: 2, textTransform: 'none', py: 1.25, fontWeight: 700, '&:hover': { bgcolor: colors.primaryDark }, boxShadow: `0 4px 12px ${colors.primary}30` }}>
                {t.create_reorder}
              </Button>
            </Box>

            <Snackbar 
              open={snackbar.open} autoHideDuration={4000} 
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>

          </Stack>

        </Box>
      </Box>
    </PharmacyLayout>
  );
}
