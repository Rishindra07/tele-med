const mongoose = require('mongoose');
const Pharmacy = require('../src/models/Pharmacy');
const PharmacyBill = require('../src/models/PharmacyBill');
const User = require('../src/models/User');
const Prescription = require('../src/models/Prescription');
require('dotenv').config();

const seedSales = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a pharmacy user
        const pharmacist = await User.findOne({ role: 'pharmacist' });
        if (!pharmacist) {
            console.error('No pharmacist user found. Please create one first.');
            process.exit(1);
        }

        const pharmacy = await Pharmacy.findOne({ user: pharmacist._id });
        if (!pharmacy) {
            console.error('No pharmacy profile found for this user.');
            process.exit(1);
        }

        console.log('Seeding for pharmacy:', pharmacy.pharmacyName);

        // Delete existing bills for a clean start if needed
        // await PharmacyBill.deleteMany({ pharmacy: pharmacy._id });

        const medicines = [
            { name: 'Paracetamol 500mg', mrp: 12, isJanAushadhi: false },
            { name: 'Amoxicillin 250mg', mrp: 85, isJanAushadhi: false },
            { name: 'Amlodipine 5mg', mrp: 45, isJanAushadhi: false },
            { name: 'Metformin 500mg', mrp: 28, isJanAushadhi: false },
            { name: 'ORS Sachets', mrp: 18, isJanAushadhi: true },
            { name: 'Vitamin C 500mg', mrp: 15, isJanAushadhi: false }
        ];

        const today = new Date();
        const bills = [];

        // Seed 50 bills over the last 30 days
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(today.getDate() - Math.floor(Math.random() * 30));
            date.setHours(Math.floor(Math.random() * 12) + 9, Math.floor(Math.random() * 60)); // Between 9am and 9pm

            const itemsCount = Math.floor(Math.random() * 4) + 1;
            const items = [];
            let total = 0;
            let exempt = 0;

            for (let j = 0; j < itemsCount; j++) {
                const med = medicines[Math.floor(Math.random() * medicines.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                const itemTotal = med.mrp * qty;
                items.push({
                    medicineName: med.name,
                    quantity: qty,
                    mrp: med.mrp,
                    total: itemTotal,
                    isJanAushadhi: med.isJanAushadhi
                });
                total += itemTotal;
                if (med.isJanAushadhi) exempt += itemTotal;
            }

            const taxable = total - exempt;
            const gst = Math.round(taxable * 0.12 * 100) / 100; // 12% GST total
            const cgst = Math.round(gst / 2 * 100) / 100;
            const sgst = Math.round(gst / 2 * 100) / 100;

            bills.push({
                pharmacy: pharmacy._id,
                billNumber: `BILL-${Date.now()}-${i}`,
                items,
                summary: {
                    taxableAmount: taxable,
                    cgst,
                    sgst,
                    totalGst: gst,
                    exemptAmount: exempt,
                    totalAmount: total + gst
                },
                paymentMethod: ["UPI", "Cash", "Credit"][Math.floor(Math.random() * 3)],
                billType: Math.random() > 0.5 ? "Prescription" : "Walk-in",
                issuedAt: date
            });
        }

        await PharmacyBill.insertMany(bills);
        console.log(`Successfully seeded ${bills.length} bills.`);
        
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedSales();
