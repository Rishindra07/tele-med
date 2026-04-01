const mongoose = require('mongoose');
const Pharmacy = require('../src/models/Pharmacy');
const PharmacyStock = require('../src/models/PharmacyStock');
const User = require('../src/models/User');
require('dotenv').config();

const seedInventory = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const pharmacist = await User.findOne({ role: 'pharmacist' });
        if (!pharmacist) process.exit(1);
        const pharmacy = await Pharmacy.findOne({ user: pharmacist._id });
        if (!pharmacy) process.exit(1);

        console.log('Seeding inventory with expiry for:', pharmacy.pharmacyName);

        const items = [
            { medicineName: 'Cough Syrup 100ml', batch: 'B221', days: 10, qty: 12, mrp: 120, cat: 'General' },
            { medicineName: 'Amoxicillin 250mg', batch: 'B2024-088', days: 23, qty: 14, mrp: 85, cat: 'Antibiotic' },
            { medicineName: 'Vitamin C 500mg', batch: 'B2025-031', days: 69, qty: 200, mrp: 15, cat: 'Surgical' },
            { medicineName: 'ORS Sachets 21g', batch: 'B2025-044', days: 99, qty: 8, mrp: 18, cat: 'Jan Aushadhi' },
            { medicineName: 'Paracetamol 500mg', batch: 'B2024-112', days: 270, qty: 38, mrp: 12, cat: 'OTC' }
        ];

        for (const it of items) {
            const exp = new Date();
            exp.setDate(exp.getDate() + it.days);
            
            await PharmacyStock.findOneAndUpdate(
                { pharmacy: pharmacy._id, medicineName: it.medicineName },
                {
                    quantity: it.qty,
                    mrp: it.mrp,
                    category: it.cat,
                    batchNumber: it.batch,
                    expiryDate: exp,
                    lowStockThreshold: 10
                },
                { upsert: true }
            );
        }

        console.log('Successfully seeded inventory.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedInventory();
