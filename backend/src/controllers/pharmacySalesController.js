const PharmacyBill = require("../models/PharmacyBill.js");
const Pharmacy = require("../models/Pharmacy.js");
const mongoose = require("mongoose");

const getPharmacyIdForUser = async (userId) => {
  const pharmacy = await Pharmacy.findOne({ user: userId }).lean();
  return pharmacy?._id || null;
};

const getInitials = (name) => {
  if (!name) return 'WI';
  return name.split(' ').filter(Boolean).map(n => n[0].toUpperCase()).join('').slice(0, 2);
};

exports.getSalesDashboard = async (req, res) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user._id);
    if (!pharmacyId) return res.status(404).json({ message: "Pharmacy not found" });

    const { period = 'Daily' } = req.query;

    const now = new Date();
    const todayStart = new Date(now).setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart - 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      billsToday,
      billsYesterday,
      billsMonth,
      billsLastMonth,
      medsAgg,
      paymentAgg,
      transactions,
      allBills // For trend
    ] = await Promise.all([
      PharmacyBill.find({ pharmacy: pharmacyId, issuedAt: { $gte: todayStart } }).lean(),
      PharmacyBill.find({ pharmacy: pharmacyId, issuedAt: { $gte: yesterdayStart, $lt: todayStart } }).lean(),
      PharmacyBill.find({ pharmacy: pharmacyId, issuedAt: { $gte: monthStart } }).lean(),
      PharmacyBill.find({ pharmacy: pharmacyId, issuedAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }).lean(),
      PharmacyBill.aggregate([
        { $match: { pharmacy: new mongoose.Types.ObjectId(String(pharmacyId)), issuedAt: { $gte: monthStart } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.medicineName", totalRevenue: { $sum: "$items.total" }, totalQuantity: { $sum: "$items.quantity" } } },
        { $sort: { totalRevenue: -1 } }, { $limit: 6 }
      ]),
      PharmacyBill.aggregate([
        { $match: { pharmacy: new mongoose.Types.ObjectId(String(pharmacyId)), issuedAt: { $gte: monthStart } } },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
      ]),
      PharmacyBill.find({ pharmacy: pharmacyId })
        .populate("patient", "full_name")
        .sort({ issuedAt: -1 }).limit(15).lean(),
      PharmacyBill.find({ 
        pharmacy: pharmacyId, 
        issuedAt: { $gte: period === 'Daily' ? todayStart : (period === 'Weekly' ? new Date(now - 7 * 86400000) : monthStart) } 
      }).lean()
    ]);

    const revenueToday = billsToday.reduce((s, b) => s + b.summary.totalAmount, 0);
    const revenueYesterday = billsYesterday.reduce((s, b) => s + b.summary.totalAmount, 0);
    const revenueMonth = billsMonth.reduce((s, b) => s + b.summary.totalAmount, 0);
    const revenueLastMonth = billsLastMonth.reduce((s, b) => s + b.summary.totalAmount, 0);

    const revenueChange = revenueYesterday === 0 ? (revenueToday > 0 ? 100 : 0) : Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100);
    const monthChange = revenueLastMonth === 0 ? (revenueMonth > 0 ? 100 : 0) : Math.round(((revenueMonth - revenueLastMonth) / revenueLastMonth) * 100);

    let trend = [];
    if (period === 'Daily') {
      trend = Array.from({ length: 24 }, (_, i) => ({
        index: i + 1,
        value: allBills.filter(b => new Date(b.issuedAt).getHours() === i).reduce((s, b) => s + b.summary.totalAmount, 0)
      }));
    } else if (period === 'Weekly') {
      trend = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now - (6 - i) * 86400000);
        return {
          index: d.toLocaleDateString('en-GB', { weekday: 'short' }),
          value: allBills.filter(b => new Date(b.issuedAt).toDateString() === d.toDateString()).reduce((s, b) => s + b.summary.totalAmount, 0)
        };
      });
    } else {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      trend = Array.from({ length: daysInMonth }, (_, i) => ({
        index: i + 1,
        value: allBills.filter(b => new Date(b.issuedAt).getDate() === i + 1).reduce((s, b) => s + b.summary.totalAmount, 0)
      }));
    }

    const split = billsMonth.reduce((acc, b) => {
      if (b.billType === 'Prescription') acc.prescription += b.summary.totalAmount;
      else acc.walkin += b.summary.totalAmount;
      return acc;
    }, { prescription: 0, walkin: 0 });
    const totalSplit = split.prescription + split.walkin || 1;

    const totalBillsMonth = billsMonth.length || 1;
    const paymentBreakdown = paymentAgg.map(p => ({
      label: p._id,
      percent: Math.round((p.count / totalBillsMonth) * 100)
    }));

    const gstSummary = billsMonth.reduce((acc, b) => {
      acc.taxable += b.summary.taxableAmount;
      acc.cgst += b.summary.cgst;
      acc.sgst += b.summary.sgst;
      acc.total += b.summary.totalGst;
      acc.exempt += b.summary.exemptAmount;
      return acc;
    }, { taxable: 0, cgst: 0, sgst: 0, total: 0, exempt: 0 });

    return res.json({
      success: true,
      data: {
        summary: {
          todayRevenue: revenueToday,
          monthRevenue: revenueMonth,
          billsToday: billsToday.length,
          gstCollected: gstSummary.total,
          revenueChange,
          monthChange,
          avgBill: billsToday.length > 0 ? Math.round(revenueToday / billsToday.length) : 0
        },
        revenueTrend: trend,
        revenueSplit: {
          prescription: Math.round((split.prescription / totalSplit) * 100),
          walkin: Math.round((split.walkin / totalSplit) * 100)
        },
        paymentBreakdown: paymentBreakdown.length > 0 ? paymentBreakdown : [{ label: 'N/A', percent: 0 }],
        topMeds: medsAgg.map(m => ({ name: m._id, price: `₹${Math.round(m.totalRevenue)}`, qt: `${m.totalQuantity} items` })),
        transactions: transactions.map(t => ({
          name: t.patient?.full_name || 'Walk-in customer',
          details: `${t.items.slice(0, 2).map(i => i.medicineName).join(", ")}... • ${new Date(t.issuedAt).toLocaleDateString()}`,
          amt: `₹${Math.round(t.summary.totalAmount)}`,
          method: t.paymentMethod,
          initials: getInitials(t.patient?.full_name)
        })),
        gstSummary
      }
    });
  } catch (err) {
    console.error('[SALES_DASHBOARD] Error:', err);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.createBill = async (req, res) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user._id);
    if (!pharmacyId) return res.status(404).json({ message: "Pharmacy not found" });

    const { patientId, items, paymentMethod, billType, prescriptionId } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: "No items provided" });

    const processedItems = [];
    let taxableAmount = 0;
    let exemptAmount = 0;

    const PharmacyStock = require("../models/PharmacyStock");

    for (const item of items) {
      const stock = await PharmacyStock.findOne({ pharmacy: pharmacyId, _id: item.stockId });
      if (!stock) return res.status(404).json({ message: `Medicine not found in stock: ${item.name}` });
      if (stock.quantity < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${stock.medicineName}` });

      const itemTotal = stock.mrp * item.quantity;
      const isExempt = stock.category?.toLowerCase().includes("jan aushadhi");
      
      processedItems.push({
        medicineName: stock.medicineName,
        quantity: item.quantity,
        mrp: stock.mrp,
        total: itemTotal,
        isJanAushadhi: isExempt
      });

      if (isExempt) exemptAmount += itemTotal;
      else taxableAmount += itemTotal;

      stock.quantity -= item.quantity;
      await stock.save();
    }

    const totalGst = Math.round(taxableAmount * 0.12 * 100) / 100;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const totalAmount = taxableAmount + exemptAmount + totalGst;

    const bill = await PharmacyBill.create({
      pharmacy: pharmacyId,
      patient: patientId || null,
      prescription: prescriptionId || null,
      billNumber: `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      items: processedItems,
      summary: {
        taxableAmount,
        cgst,
        sgst,
        totalGst,
        exemptAmount,
        totalAmount
      },
      paymentMethod: paymentMethod || "Cash",
      billType: billType || (patientId || prescriptionId ? "Prescription" : "Walk-in")
    });

    res.status(201).json({ success: true, bill });
  } catch (err) {
    console.error('[CREATE_BILL] Error:', err);
    res.status(500).json({ message: "Failed to create bill" });
  }
};

exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ success: true, patients: [] });

    const patients = await User.find({
      role: 'patient',
      $or: [
        { full_name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }).limit(10).select('full_name phone email');

    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ message: "Failed to search patients" });
  }
};
