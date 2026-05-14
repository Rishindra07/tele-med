const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

const Pharmacy = require("./src/models/Pharmacy");
const PharmacyStock = require("./src/models/PharmacyStock");

const medicineData = [
  {
    medicineName: "Paracetamol",
    genericName: "Acetaminophen",
    strength: "500mg",
    form: "Tablet",
    quantity: 500,
    lowStockThreshold: 50,
    category: "Pain Relief",
    mrp: 50,
  },
  {
    medicineName: "Amoxicillin",
    genericName: "Amoxicillin",
    strength: "250mg",
    form: "Capsule",
    quantity: 200,
    lowStockThreshold: 30,
    category: "Antibiotic",
    mrp: 120,
  },
  {
    medicineName: "Cetirizine",
    genericName: "Cetirizine Hydrochloride",
    strength: "10mg",
    form: "Tablet",
    quantity: 300,
    lowStockThreshold: 40,
    category: "Antihistamine",
    mrp: 45,
  },
  {
    medicineName: "Ibuprofen",
    genericName: "Ibuprofen",
    strength: "400mg",
    form: "Tablet",
    quantity: 400,
    lowStockThreshold: 50,
    category: "Pain Relief",
    mrp: 60,
  },
  {
    medicineName: "Omeprazole",
    genericName: "Omeprazole",
    strength: "20mg",
    form: "Capsule",
    quantity: 150,
    lowStockThreshold: 20,
    category: "Antacid",
    mrp: 90,
  },
  {
    medicineName: "Metformin",
    genericName: "Metformin Hydrochloride",
    strength: "500mg",
    form: "Tablet",
    quantity: 600,
    lowStockThreshold: 100,
    category: "Anti-Diabetic",
    mrp: 75,
  },
  {
    medicineName: "Atorvastatin",
    genericName: "Atorvastatin",
    strength: "10mg",
    form: "Tablet",
    quantity: 250,
    lowStockThreshold: 30,
    category: "Cholesterol",
    mrp: 150,
  },
  {
    medicineName: "Azithromycin",
    genericName: "Azithromycin",
    strength: "500mg",
    form: "Tablet",
    quantity: 100,
    lowStockThreshold: 15,
    category: "Antibiotic",
    mrp: 200,
  },
  {
    medicineName: "Vitamin C",
    genericName: "Ascorbic Acid",
    strength: "500mg",
    form: "Chewable Tablet",
    quantity: 1000,
    lowStockThreshold: 100,
    category: "Supplement",
    mrp: 80,
  },
  {
    medicineName: "Cough Syrup",
    genericName: "Dextromethorphan",
    strength: "100ml",
    form: "Syrup",
    quantity: 120,
    lowStockThreshold: 20,
    category: "Cough & Cold",
    mrp: 110,
  }
];

const seedStock = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    const pharmacies = await Pharmacy.find({});
    
    if (pharmacies.length === 0) {
      console.log("No pharmacies found in the database. Please create a pharmacy first.");
      process.exit();
    }

    console.log(`Found ${pharmacies.length} pharmacies. Seeding stock...`);

    let totalAdded = 0;

    for (let pharmacy of pharmacies) {
      for (let med of medicineData) {
        // Create an expiry date 1 to 2 years in the future
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1 + Math.random());
        
        const batchNumber = `BATCH-${Math.floor(Math.random() * 10000)}`;

        const stockItem = {
          ...med,
          pharmacy: pharmacy._id,
          expiryDate: futureDate,
          batchNumber: batchNumber,
          rackLocation: `Rack-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}` // Rack A to E
        };

        // Upsert to prevent duplicate errors
        await PharmacyStock.findOneAndUpdate(
          { pharmacy: pharmacy._id, medicineName: med.medicineName },
          { $set: stockItem },
          { upsert: true, new: true }
        );
        totalAdded++;
      }
      console.log(`Seeded 10 medicines for Pharmacy: ${pharmacy.pharmacyName || pharmacy._id}`);
    }

    console.log(`Data Seeding Complete! Total stock records processed: ${totalAdded}`);
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedStock();
