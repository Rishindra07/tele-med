import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Avatar, Chip, CircularProgress
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  AddRounded as AddIcon,
} from '@mui/icons-material';
import PharmacyLayout from '../../components/PharmacyLayout';
import { fetchSuppliers, fetchSupplyOrders, fetchReorderSuggestions } from '../../api/pharmacyApi';
import { useLanguage } from '../../context/LanguageContext';
import { PHARMACY_SUPPLIERS_TRANSLATIONS } from '../../utils/translations/pharmacy';

const colors = {
  paper: '#ffffff',
  bg: '#f9f9f9',
  line: '#ebe9e0',
  soft: '#f5f1e8',
  text: '#252525',
  muted: '#6f6a62',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  amber: '#d18a1f',
  amberSoft: '#fbefdc',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  graySoft: '#f1eee7',
  red: '#d9635b'
};

const getStatusTheme = (status, t) => {
  switch (status) {
    case 'In transit': case t.status_in_transit: return { color: colors.green, bg: colors.greenSoft };
    case 'Confirmed': case t.status_confirmed: return { color: colors.amber, bg: colors.amberSoft };
    case 'Ordered': case t.status_ordered: return { color: colors.blue, bg: colors.blueSoft };
    case 'Draft': case t.status_draft: return { color: colors.muted, bg: colors.graySoft };
    case 'Delivered': case t.status_delivered: return { color: colors.green, bg: colors.greenSoft };
    default: return { color: colors.muted, bg: colors.graySoft };
  }
};

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'SP';

const StatCard = ({ title, value, sub, color }) => (
  <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, flex: '1 1 0' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: color }} />
      <Typography sx={{ fontSize: 13, color: colors.text, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{title}</Typography>
    </Box>
    <Typography sx={{ fontSize: 32, fontFamily: 'Georgia, serif' }}>{value}</Typography>
    <Typography sx={{ mt: 0.5, fontSize: 12.5, color: colors.green, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{sub}</Typography>
  </Box>
);

const SectionTitle = ({ title, action }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
    <Typography sx={{ fontSize: 18 }}>{title}</Typography>
    {action && <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>{action}</Typography>}
  </Stack>
);

export default function PharmacySuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const { language } = useLanguage();
  const t = PHARMACY_SUPPLIERS_TRANSLATIONS[language] || PHARMACY_SUPPLIERS_TRANSLATIONS['en'];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [supRes, ordRes, sugRes] = await Promise.all([
          fetchSuppliers(), 
          fetchSupplyOrders(),
          fetchReorderSuggestions()
        ]);
        if (supRes.success) setSuppliers(supRes.suppliers || []);
        if (ordRes.success) setOrders(ordRes.orders || []);
        if (sugRes.success) setSuggestions(sugRes.suggestions || []);
      } catch (err) {
        console.error('Failed to load supplier data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const inTransit = orders.filter(o => o.status === 'In transit').length;
    const pendingPayment = orders.reduce((sum, o) => o.paymentStatus === 'Pending' ? sum + (o.totalAmount || 0) : sum, 0);
    const monthSpend = orders.reduce((sum, o) => {
        const d = new Date(o.createdAt);
        if (d.getMonth() === new Date().getMonth()) return sum + (o.totalAmount || 0);
        return sum;
    }, 0);

    return [
      { title: t.stats_total, value: String(suppliers.length), sub: t.stats_total_sub, color: colors.blue },
      { title: t.stats_transit, value: String(inTransit), sub: inTransit > 0 ? t.stats_transit_sub1 : t.stats_transit_sub2, color: colors.green },
      { title: t.stats_pending, value: `₹${pendingPayment.toLocaleString()}`, sub: `${orders.filter(o => o.paymentStatus === 'Pending').length} ${t.stats_pending_sub}`, color: colors.amber },
      { title: t.stats_spend, value: `₹${monthSpend.toLocaleString()}`, sub: `${orders.filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth()).length} ${t.stats_spend_sub}`, color: colors.blue }
    ];
  }, [suppliers, orders, t]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'All' || activeFilter === t.filter_all) return orders;
    return orders.filter(o => {
      if (activeFilter === t.filter_transit) return o.status === 'In transit';
      if (activeFilter === t.filter_confirmed) return o.status === 'Confirmed';
      if (activeFilter === t.filter_ordered) return o.status === 'Ordered';
      if (activeFilter === t.filter_delivered) return o.status === 'Delivered';
      if (activeFilter === t.filter_draft) return o.status === 'Draft';
      return o.status === activeFilter;
    });
  }, [orders, activeFilter, t]);

  const FILTERS = [
    { key: 'All', label: t.filter_all },
    { key: 'In transit', label: t.filter_transit },
    { key: 'Confirmed', label: t.filter_confirmed },
    { key: 'Ordered', label: t.filter_ordered },
    { key: 'Delivered', label: t.filter_delivered },
    { key: 'Draft', label: t.filter_draft }
  ];

  if (loading) return <PharmacyLayout><Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress sx={{ color: colors.green }} /></Box></PharmacyLayout>;

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              {t.title}
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5, whiteSpace: 'pre-line' }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ bgcolor: colors.soft, color: '#5f5a52', borderRadius: 2.5, px: 2, py: 1.1, fontSize: 13, lineHeight: 1.25, textAlign: 'center' }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}<br />{new Date().toLocaleDateString('en-GB', { month: 'long' })}<br />{new Date().getFullYear()}
            </Box>
            <IconButton sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', width: 42, height: 42 }}>
              <Badge color="error" variant="dot">
                <BellIcon sx={{ color: '#5f5a52' }} />
              </Badge>
            </IconButton>
            <Button sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, borderRadius: 2.5, px: 2, py: 1, textTransform: 'none', fontSize: 14.5, height: 42, whiteSpace: 'pre-line', lineHeight: 1.2 }}>
              {t.new_order}
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {stats.map(s => <StatCard key={s.title} {...s} />)}
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3 }}>
          <Box>
            <SectionTitle title={t.orders_title} action={t.purchase_history} />
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              {FILTERS.map(f => (
                <Box key={f.key} 
                  onClick={() => setActiveFilter(f.label)}
                  sx={{ px: 2, py: 0.6, borderRadius: 99, border: `1px solid ${colors.line}`, fontSize: 13, cursor: 'pointer', bgcolor: activeFilter === f.label ? colors.green : 'transparent', color: activeFilter === f.label ? '#fff' : colors.text }}>
                  {f.label}
                </Box>
              ))}
            </Stack>

            <Stack spacing={2.5}>
              {filteredOrders.length > 0 ? filteredOrders.map((o) => {
                const theme = getStatusTheme(o.status, t);
                const init = getInitials(o.supplier?.name || 'S');
                
                // Map status to translated status
                let transStatus = o.status;
                if (o.status === 'In transit') transStatus = t.status_in_transit;
                if (o.status === 'Confirmed') transStatus = t.status_confirmed;
                if (o.status === 'Ordered') transStatus = t.status_ordered;
                if (o.status === 'Draft') transStatus = t.status_draft;
                if (o.status === 'Delivered') transStatus = t.status_delivered;

                return (
                  <Box key={o._id} sx={{ display: 'flex', gap: 2.5, p: 3, bgcolor: colors.paper, borderRadius: 4, border: `1px solid ${colors.line}`, borderLeft: `3px solid ${theme.color}` }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: colors.soft, color: colors.muted, fontSize: 16 }}>{init}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>{o.supplier?.name || 'Supplier'} — {o.orderId}</Typography>
                        <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: theme.bg, color: theme.color, fontSize: 11, fontWeight: 600 }}>{transStatus}</Box>
                      </Stack>
                      <Typography sx={{ fontSize: 13, color: colors.muted, mb: 2 }}>{o.items?.length || 0} {t.items} • ₹{(o.totalAmount || 0).toLocaleString()} • {t.placed} {o.placedDate ? new Date(o.placedDate).toLocaleDateString() : 'N/A'}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                        {(o.items || []).slice(0, 3).map((it, idx) => <Box key={idx} sx={{ px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: colors.graySoft, color: colors.muted, fontSize: 11 }}>{it.medicineName} × {it.quantity}</Box>)}
                      </Stack>
                      <Stack direction="row" spacing={1.5}>
                        <Button sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, px: 2, textTransform: 'none', fontSize: 13 }}>{t.view_items}</Button>
                        <Button sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, px: 2, textTransform: 'none', fontSize: 13 }}>{t.call_supplier}</Button>
                      </Stack>
                    </Box>
                  </Box>
                );
              }) : <Box sx={{ p: 10, textAlign: 'center', bgcolor: colors.soft, borderRadius: 4, border: `1px dashed ${colors.line}` }}><Typography sx={{ color: colors.muted }}>{t.no_orders}</Typography></Box>}
            </Stack>
          </Box>

          <Stack spacing={3}>
            {/* Auto-reorder suggestions */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 16, mb: 3 }}>{t.suggestions_title}</Typography>
              <Stack spacing={2}>
                {suggestions.length > 0 ? suggestions.map((s, idx) => (
                  <Box key={idx} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: s.priority === 'High' ? colors.amberSoft : colors.soft, border: `1px solid ${s.priority === 'High' ? colors.amber : 'transparent'}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{s.medicineName}</Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted }}>{t.supplier} {s.reason} • {t.stock} {s.currentStock}</Typography>
                      </Box>
                      <Button size="small" sx={{ color: colors.green, fontSize: 11.5, textTransform: 'none', minWidth: 0, p: 0 }}>{t.add}</Button>
                    </Stack>
                  </Box>
                )) : (
                  <Typography sx={{ fontSize: 13, color: colors.muted, textAlign: 'center', py: 2 }}>{t.healthy_stock}</Typography>
                )}
              </Stack>
            </Box>

            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 16, mb: 3 }}>{t.directory_title}</Typography>
              <Stack spacing={3}>
                {suppliers.slice(0, 5).map(s => (
                  <Box key={s._id} sx={{ display: 'flex', gap: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: colors.soft, color: colors.muted, fontSize: 14 }}>{getInitials(s.name)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{s.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>{s.phone}</Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>{s.city || s.address}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Button fullWidth startIcon={<AddIcon />} sx={{ mt: 3, border: `1px dashed ${colors.line}`, color: colors.green, borderRadius: 2, textTransform: 'none', py: 1.1, fontSize: 13 }}>{t.add_supplier}</Button>
            </Box>

            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 16, mb: 3 }}>{t.pending_payments}</Typography>
              <Stack spacing={2}>
                {orders.filter(o => o.paymentStatus === 'Pending').slice(0, 3).map(o => (
                  <Stack key={o._id} direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{o.supplier?.name || 'S'}</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.red }}>₹{(o.totalAmount || 0).toLocaleString()}</Typography>
                  </Stack>
                ))}
                <Divider />
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{t.total_due}</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: colors.red }}>₹{orders.reduce((s,o) => o.paymentStatus === 'Pending' ? s + o.totalAmount : s, 0).toLocaleString()}</Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </PharmacyLayout>
  );
}
