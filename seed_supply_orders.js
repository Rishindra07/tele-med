const mongoose = require('mongoose');
const Pharmacy = require('./backend/src/models/Pharmacy');
const Supplier = require('./backend/src/models/Supplier');
const SupplyOrder = require('./backend/src/models/SupplyOrder');
const User = require('./backend/src/models/User');

async function seed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tele-med');
    console.log('Connected to MongoDB');

    const phUser = await User.findOne({ role: 'pharmacist' }) || await User.findOne({ role: 'pharmacy' });
    if (!phUser) return console.error('No pharmacy user found');

    const pharmacy = await Pharmacy.findOne({ user: phUser._id });
    if (!pharmacy) return console.error('No pharmacy profile found');

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
    }

    // Create a mock order
    await SupplyOrder.create({
      pharmacy: pharmacy._id,
      supplier: supplier._id,
      orderId: '#ORD-2026-001',
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
