require('dotenv').config();
const mongoose = require('mongoose');
const Pharmacy = require('./src/models/Pharmacy');
const Supplier = require('./src/models/Supplier');
const SupplyOrder = require('./src/models/SupplyOrder');
const User = require('./src/models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a pharmacy user
    let phUser = await User.findOne({ role: 'pharmacy' });
    if (!phUser) phUser = await User.findOne({ role: 'pharmacist' });
    
    if (!phUser) {
        console.warn('No pharmacy/pharmacist user found. Attempting to find by name...');
        phUser = await User.findOne({ full_name: /Arora/i });
    }

    if (!phUser) {
        console.error('No pharmacy/pharmacist user found in DB');
        process.exit(1);
    }

    console.log(`Found user: ${phUser.full_name} (${phUser.role})`);

    // Find or create pharmacy profile
    let pharmacy = await Pharmacy.findOne({ user: phUser._id });
    if (!pharmacy) {
        pharmacy = await Pharmacy.create({
            user: phUser._id,
            pharmacyName: 'Arora Medical Store',
            licenseNumber: 'PB-HSP-2021-0482',
            phone: phUser.phone || '+91 98140 22211',
            email: phUser.email || 'arora.medical@gmail.com'
        });
        console.log('Created pharmacy profile for', phUser.full_name);
    }

    // Create a supplier if not exists
    let supplier = await Supplier.findOne({ pharmacy: pharmacy._id });
    if (!supplier) {
      supplier = await Supplier.create({
        pharmacy: pharmacy._id,
        name: 'Medico Pharma',
        phone: '+91 98123 45678',
        email: 'medico.pharma@example.com',
        city: 'Hoshiarpur'
      });
      console.log('Created supplier Medico Pharma');
    }

    // Create mock order
    const orderCount = await SupplyOrder.countDocuments({ pharmacy: pharmacy._id });
    const orderId = `#ORD-2026-${String(orderCount + 1).padStart(3, '0')}`;
    
    await SupplyOrder.create({
      pharmacy: pharmacy._id,
      supplier: supplier._id,
      orderId,
      status: 'In transit',
      paymentStatus: 'Pending',
      totalAmount: 12400,
      items: [
        { medicineName: 'Paracetamol 500mg', quantity: 100 },
        { medicineName: 'Cough syrup', quantity: 24 }
      ],
      placedDate: new Date()
    });

    console.log('Mock supply order seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
