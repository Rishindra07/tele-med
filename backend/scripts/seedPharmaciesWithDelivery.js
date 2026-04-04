const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Pharmacy = require('../src/models/Pharmacy');
const connectDB = require('../src/config/db');

dotenv.config({ path: './.env' });

const pharmaciesToSeed = [
  {
    full_name: "Rajesh Kumar (Apollo Village)",
    email: "apollo_village@example.com",
    phone: "+919876543210",
    pharmacyName: "Apollo Village Pharmacy",
    address: "Main Road, Rampur Village, UP",
    deliveryAvailable: true,
    location: { lat: 26.8467, lng: 80.9462 } // Near Lucknow
  },
  {
    full_name: "Anita Devi (Seva Medicos)",
    email: "seva_medicos@example.com",
    phone: "+919876543211",
    pharmacyName: "Seva Rural Medicos",
    address: "Near Panchayat Ghar, Bishnupur, WB",
    deliveryAvailable: true,
    location: { lat: 23.0678, lng: 87.3160 } // West Bengal
  },
  {
    full_name: "Suresh Prabhu (Village Health)",
    email: "village_health@example.com",
    phone: "+919876543212",
    pharmacyName: "Village Health Point",
    address: "Market Square, Hunsur, Karnataka",
    deliveryAvailable: true,
    location: { lat: 12.3106, lng: 76.2847 } // Karnataka
  },
  {
    full_name: "Gopal Yadav (Jan Aushadhi Rural)",
    email: "jan_rural@example.com",
    phone: "+919876543213",
    pharmacyName: "Jan Aushadhi Rural Kendra",
    address: "Bus Stand Road, Madhepura, Bihar",
    deliveryAvailable: false, // One without delivery for comparison
    location: { lat: 25.9263, lng: 86.7905 },
    isJanAushadhi: true
  }
];

const seedPharmacies = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('Seeding pharmacies...');

    for (const data of pharmaciesToSeed) {
      // Check if user exists
      let user = await User.findOne({ email: data.email });
      
      if (!user) {
        user = await User.create({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          password_hash: "password123", // Default password
          role: "pharmacist",
          is_active: true,
          is_approved: true
        });
        console.log(`Created user: ${user.email}`);
      }

      // Check if pharmacy exists
      let pharmacy = await Pharmacy.findOne({ user: user._id });
      
      const pharmacyData = {
        user: user._id,
        pharmacyName: data.pharmacyName,
        ownerName: user.full_name,
        licenseNumber: `LIC-${Math.floor(Math.random() * 1000000)}`,
        address: data.address,
        deliveryAvailable: data.deliveryAvailable,
        location: data.location,
        isJanAushadhi: data.isJanAushadhi || false,
        phone: data.phone,
        email: data.email,
        visibleToPatients: true,
        pharmacyId: `PHARM-${Math.floor(Math.random() * 10000)}`
      };

      if (!pharmacy) {
        pharmacy = await Pharmacy.create(pharmacyData);
        console.log(`Created pharmacy: ${pharmacy.pharmacyName}`);
      } else {
        await Pharmacy.findByIdAndUpdate(pharmacy._id, pharmacyData);
        console.log(`Updated pharmacy: ${pharmacy.pharmacyName}`);
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedPharmacies();
