const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("../src/config/db.js");
const User = require("../src/models/User.js");
const Patient = require("../src/models/Patient.js");
const Doctor = require("../src/models/Doctor.js");
const Pharmacy = require("../src/models/Pharmacy.js");
const PharmacyStock = require("../src/models/PharmacyStock.js");
const Consultation = require("../src/models/Consultation.js");
const Prescription = require("../src/models/Prescription.js");
const HealthRecord = require("../src/models/HealthRecord.js");
const Notification = require("../src/models/Notification.js");
const Complaint = require("../src/models/Complaint.js");
const SymptomLog = require("../src/models/SymptomLog.js");
const SystemLog = require("../src/models/SystemLog.js");
const DoctorAvailability = require("../src/models/DoctorAvailability.js");
const RefreshToken = require("../src/models/RefreshToken.js");

const SEED_PASSWORD = "Test@123";

const userSeeds = [
  {
    key: "admin",
    full_name: "Admin Tester",
    email: "admin.test@seva.local",
    phone: "+919810000001",
    role: "admin",
    is_approved: true
  },
  {
    key: "patientPrimary",
    full_name: "Aarti Patient",
    email: "aarti.patient@seva.local",
    phone: "+919810000002",
    role: "patient",
    is_approved: true
  },
  {
    key: "patientSecondary",
    full_name: "Rohan Patient",
    email: "rohan.patient@seva.local",
    phone: "+919810000003",
    role: "patient",
    is_approved: true
  },
  {
    key: "doctorApproved",
    full_name: "Dr. Meera Sharma",
    email: "meera.doctor@seva.local",
    phone: "+919810000004",
    role: "doctor",
    is_approved: true
  },
  {
    key: "doctorPending",
    full_name: "Dr. Pending Kumar",
    email: "pending.doctor@seva.local",
    phone: "+919810000005",
    role: "doctor",
    is_approved: false
  },
  {
    key: "pharmacyPrimary",
    full_name: "CityCare Pharmacist",
    email: "city.pharmacy@seva.local",
    phone: "+919810000006",
    role: "pharmacist",
    is_approved: true
  },
  {
    key: "pharmacyAlternative",
    full_name: "ReliefMeds Pharmacist",
    email: "relief.pharmacy@seva.local",
    phone: "+919810000007",
    role: "pharmacist",
    is_approved: true
  },
  {
    key: "pharmacyPending",
    full_name: "Pending Pharmacy User",
    email: "pending.pharmacy@seva.local",
    phone: "+919810000008",
    role: "pharmacist",
    is_approved: false
  }
];

const dateAtUtcMidnight = (daysFromToday) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date;
};

const dateAtUtcTime = (daysFromToday, hours, minutes = 0) => {
  const date = dateAtUtcMidnight(daysFromToday);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
};

const ensureUser = async (seed) => {
  let user = await User.findOne({ email: seed.email });

  if (!user) {
    user = new User({
      full_name: seed.full_name,
      email: seed.email,
      phone: seed.phone,
      role: seed.role,
      password_hash: SEED_PASSWORD,
      preferred_language: "EN",
      is_active: true,
      is_approved: seed.is_approved
    });
  } else {
    user.full_name = seed.full_name;
    user.email = seed.email;
    user.phone = seed.phone;
    user.role = seed.role;
    user.password_hash = SEED_PASSWORD;
    user.preferred_language = "EN";
    user.is_active = true;
    user.is_approved = seed.is_approved;
    user.deactivated_at = null;
    user.deactivation_reason = null;
  }

  user.approved_at = seed.is_approved ? new Date() : null;
  await user.save();
  return user;
};

const upsertPatientProfile = async (userId, payload) => {
  await Patient.findOneAndUpdate(
    { user: userId },
    { user: userId, ...payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const upsertDoctorProfile = async (userId, payload) => {
  await Doctor.findOneAndUpdate(
    { user: userId },
    { user: userId, ...payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const upsertPharmacyProfile = async (userId, payload) => {
  await Pharmacy.findOneAndUpdate(
    { user: userId },
    { user: userId, ...payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const rebuildDoctorAvailability = async (doctorId) => {
  await DoctorAvailability.deleteMany({ doctor: doctorId });

  await DoctorAvailability.insertMany([
    {
      doctor: doctorId,
      date: dateAtUtcMidnight(1),
      slots: ["09:00", "10:00", "10:30", "11:00"]
    },
    {
      doctor: doctorId,
      date: dateAtUtcMidnight(2),
      slots: ["09:30", "10:30", "11:30"]
    }
  ]);
};

const rebuildDomainData = async (usersByKey) => {
  const seededUserIds = Object.values(usersByKey).map((user) => user._id);
  const patientIds = [usersByKey.patientPrimary._id, usersByKey.patientSecondary._id];
  const doctorIds = [usersByKey.doctorApproved._id, usersByKey.doctorPending._id];

  await Promise.all([
    RefreshToken.deleteMany({ user_id: { $in: seededUserIds } }),
    Consultation.deleteMany({
      $or: [
        { patient: { $in: patientIds } },
        { doctor: { $in: doctorIds } }
      ]
    }),
    Prescription.deleteMany({
      $or: [
        { patient: { $in: patientIds } },
        { doctor: { $in: doctorIds } }
      ]
    }),
    HealthRecord.deleteMany({ patient: { $in: patientIds } }),
    Notification.deleteMany({ user: { $in: seededUserIds } }),
    SymptomLog.deleteMany({ patient: { $in: patientIds } }),
    Complaint.deleteMany({
      $or: [
        { raisedBy: { $in: seededUserIds } },
        { againstUser: { $in: seededUserIds } },
        { subject: /^Seed:/ }
      ]
    }),
    SystemLog.deleteMany({ ip: "seed-data" })
  ]);
};

const seedProfiles = async (usersByKey) => {
  await upsertPatientProfile(usersByKey.patientPrimary._id, {
    address: "12 MG Road, Bengaluru",
    dob: "1993-08-15",
    gender: "Female",
    bloodGroup: "B+",
    allergies: ["Dust", "Penicillin"],
    chronicDiseases: ["Asthma"],
    medications: ["Salbutamol Inhaler"],
    medical_history_notes: "History of mild asthma. Seasonal allergies.",
    emergency_contact: {
      name: "Rahul Patient",
      relation: "Brother",
      phone: "+919810001001"
    },
    vitals: {
      height_cm: 162,
      weight_kg: 58,
      blood_pressure: { systolic: 118, diastolic: 76 },
      pulse_bpm: 74,
      spo2_percent: 99
    },
    insurance: {
      provider: "Seed Health Insurance",
      policy_number: "SEED-PAT-001"
    },
    settings: {
      reminders: true,
      language: "EN"
    }
  });

  await upsertPatientProfile(usersByKey.patientSecondary._id, {
    address: "44 Residency Road, Bengaluru",
    dob: "1989-01-22",
    gender: "Male",
    bloodGroup: "O+",
    allergies: [],
    chronicDiseases: ["Hypertension"],
    medications: ["Amlodipine"],
    medical_history_notes: "Monitoring blood pressure.",
    emergency_contact: {
      name: "Nisha Patient",
      relation: "Spouse",
      phone: "+919810001002"
    },
    vitals: {
      height_cm: 175,
      weight_kg: 78,
      blood_pressure: { systolic: 132, diastolic: 86 },
      pulse_bpm: 80,
      spo2_percent: 98
    },
    settings: {
      reminders: false,
      language: "EN"
    }
  });

  await upsertDoctorProfile(usersByKey.doctorApproved._id, {
    specialization: "General Physician",
    qualification: "MBBS, MD",
    bio: "Seeded doctor profile for manual QA flows.",
    experience: 9,
    medicalLicense: "DOC-SEED-001",
    hospitalName: "Seva City Hospital",
    consultationFee: 600,
    rating: 4.7,
    consultation_modes: ["video", "chat"],
    languages: ["English", "Hindi"],
    total_consultations: 42,
    is_available_for_booking: true,
    availability: [
      { day: "Monday", slots: ["09:00", "10:00"] },
      { day: "Tuesday", slots: ["10:00", "11:00"] }
    ]
  });

  await upsertDoctorProfile(usersByKey.doctorPending._id, {
    specialization: "Dermatologist",
    qualification: "MBBS, DDVL",
    bio: "Pending approval doctor profile.",
    experience: 4,
    medicalLicense: "DOC-SEED-002",
    hospitalName: "Seva Skin Clinic",
    consultationFee: 700,
    rating: 4.2,
    consultation_modes: ["video"],
    languages: ["English"],
    total_consultations: 0,
    is_available_for_booking: false,
    availability: []
  });

  await upsertPharmacyProfile(usersByKey.pharmacyPrimary._id, {
    pharmacyName: "CityCare Pharmacy",
    licenseNumber: "PHARM-SEED-001",
    location: {
      address: "10 Brigade Road, Bengaluru",
      coordinates: [77.6068, 12.9716]
    },
    openTime: "08:00",
    closeTime: "22:00",
    phone: "+919810002001",
    distanceKm: 2.1,
    isJanAushadhi: true
  });

  await upsertPharmacyProfile(usersByKey.pharmacyAlternative._id, {
    pharmacyName: "ReliefMeds Pharmacy",
    licenseNumber: "PHARM-SEED-002",
    location: {
      address: "22 Indiranagar, Bengaluru",
      coordinates: [77.6408, 12.9784]
    },
    openTime: "09:00",
    closeTime: "21:00",
    phone: "+919810002002",
    distanceKm: 4.8,
    isJanAushadhi: false
  });

  await upsertPharmacyProfile(usersByKey.pharmacyPending._id, {
    pharmacyName: "Pending Pharmacy",
    licenseNumber: "PHARM-SEED-003",
    location: {
      address: "33 Koramangala, Bengaluru"
    },
    openTime: "10:00",
    closeTime: "20:00",
    phone: "+919810002003",
    distanceKm: 6.2,
    isJanAushadhi: false
  });
};

const seedTransactions = async (usersByKey) => {
  const primaryPharmacy = await Pharmacy.findOne({ user: usersByKey.pharmacyPrimary._id });
  const altPharmacy = await Pharmacy.findOne({ user: usersByKey.pharmacyAlternative._id });

  await PharmacyStock.deleteMany({ pharmacy: { $in: [primaryPharmacy._id, altPharmacy._id] } });

  await PharmacyStock.insertMany([
    {
      pharmacy: primaryPharmacy._id,
      medicineName: "Paracetamol 650",
      genericName: "Paracetamol",
      strength: "650 mg",
      form: "Tablet",
      quantity: 40,
      lowStockThreshold: 10
    },
    {
      pharmacy: primaryPharmacy._id,
      medicineName: "Azithromycin 500",
      genericName: "Azithromycin",
      strength: "500 mg",
      form: "Tablet",
      quantity: 8,
      lowStockThreshold: 5
    },
    {
      pharmacy: primaryPharmacy._id,
      medicineName: "Cetirizine",
      genericName: "Cetirizine",
      strength: "10 mg",
      form: "Tablet",
      quantity: 0,
      lowStockThreshold: 5
    },
    {
      pharmacy: altPharmacy._id,
      medicineName: "Cetirizine",
      genericName: "Cetirizine",
      strength: "10 mg",
      form: "Tablet",
      quantity: 24,
      lowStockThreshold: 5
    },
    {
      pharmacy: altPharmacy._id,
      medicineName: "Vitamin C",
      genericName: "Ascorbic Acid",
      strength: "500 mg",
      form: "Tablet",
      quantity: 30,
      lowStockThreshold: 5
    }
  ]);

  const completedConsultation = await Consultation.create({
    patient: usersByKey.patientPrimary._id,
    doctor: usersByKey.doctorApproved._id,
    specialization: "General Physician",
    appointmentDate: dateAtUtcTime(-3, 9, 0),
    timeSlot: "09:00",
    status: "Completed",
    consultationMode: "video",
    reasonForVisit: "Fever and sore throat",
    symptoms: ["Fever", "Sore throat"],
    consultationNotes: "Patient responded well to hydration and rest advice."
  });

  const upcomingConsultation = await Consultation.create({
    patient: usersByKey.patientPrimary._id,
    doctor: usersByKey.doctorApproved._id,
    specialization: "General Physician",
    appointmentDate: dateAtUtcMidnight(1),
    timeSlot: "10:00",
    status: "Scheduled",
    consultationMode: "video",
    reasonForVisit: "Follow-up for cough",
    symptoms: ["Dry cough"]
  });

  const cancelledConsultation = await Consultation.create({
    patient: usersByKey.patientSecondary._id,
    doctor: usersByKey.doctorApproved._id,
    specialization: "General Physician",
    appointmentDate: dateAtUtcMidnight(2),
    timeSlot: "11:30",
    status: "Cancelled",
    consultationMode: "chat",
    reasonForVisit: "Headache",
    cancellationReason: "Patient unavailable"
  });

  const followUpConsultation = await Consultation.create({
    patient: usersByKey.patientSecondary._id,
    doctor: usersByKey.doctorApproved._id,
    specialization: "General Physician",
    appointmentDate: dateAtUtcTime(-1, 16, 0),
    timeSlot: "16:00",
    status: "FollowUp",
    consultationMode: "video",
    reasonForVisit: "Blood pressure review",
    followUpDate: dateAtUtcTime(5, 11, 0),
    consultationNotes: "Continue medication and monitor blood pressure."
  });

  const readyPrescription = await Prescription.create({
    patient: usersByKey.patientPrimary._id,
    doctor: usersByKey.doctorApproved._id,
    consultation: completedConsultation._id,
    diagnosis: "Upper respiratory tract infection",
    medications: [
      {
        name: "Paracetamol 650",
        dosage: "1 tablet",
        frequency: "Twice daily",
        duration: "3 days",
        instructions: "After meals"
      },
      {
        name: "Azithromycin 500",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "3 days",
        instructions: "After breakfast"
      }
    ],
    labTests: ["CBC"],
    notes: "Review if fever persists.",
    validUntil: dateAtUtcTime(10, 23, 59),
    assignedPharmacy: primaryPharmacy._id,
    fulfillmentStatus: "Ready",
    fulfillmentItems: [
      {
        name: "Paracetamol 650",
        requestedQuantity: 1,
        availableQuantity: 40,
        stockStatus: "ready"
      },
      {
        name: "Azithromycin 500",
        requestedQuantity: 1,
        availableQuantity: 8,
        stockStatus: "ready"
      }
    ],
    pharmacyNotes: "Ready for pickup at CityCare Pharmacy.",
    fulfillmentHistory: [
      {
        status: "Ready",
        pharmacy: primaryPharmacy._id,
        note: "Seeded ready prescription"
      }
    ],
    digitalSignature: {
      signedBy: usersByKey.doctorApproved._id,
      signerName: "Dr. Meera Sharma",
      signerRole: "doctor",
      doctorLicense: "DOC-SEED-001",
      signatureHash: "seed-signature-ready",
      signedAt: new Date()
    }
  });

  const partialPrescription = await Prescription.create({
    patient: usersByKey.patientPrimary._id,
    doctor: usersByKey.doctorApproved._id,
    consultation: upcomingConsultation._id,
    diagnosis: "Allergy management",
    medications: [
      {
        name: "Cetirizine",
        dosage: "1 tablet",
        frequency: "At night",
        duration: "5 days",
        instructions: "Take before sleep"
      },
      {
        name: "Paracetamol 650",
        dosage: "1 tablet",
        frequency: "If needed",
        duration: "2 days",
        instructions: "For fever only"
      }
    ],
    notes: "Seeded partial prescription.",
    validUntil: dateAtUtcTime(7, 23, 59),
    assignedPharmacy: primaryPharmacy._id,
    fulfillmentStatus: "Partially Available",
    fulfillmentItems: [
      {
        name: "Cetirizine",
        requestedQuantity: 1,
        availableQuantity: 0,
        stockStatus: "unavailable"
      },
      {
        name: "Paracetamol 650",
        requestedQuantity: 1,
        availableQuantity: 40,
        stockStatus: "ready"
      }
    ],
    pharmacyNotes: "One medicine unavailable at primary pharmacy.",
    fulfillmentHistory: [
      {
        status: "Partially Available",
        pharmacy: primaryPharmacy._id,
        note: "Seeded partial fulfillment"
      }
    ],
    digitalSignature: {
      signedBy: usersByKey.doctorApproved._id,
      signerName: "Dr. Meera Sharma",
      signerRole: "doctor",
      doctorLicense: "DOC-SEED-001",
      signatureHash: "seed-signature-partial",
      signedAt: new Date()
    }
  });

  const completedPrescription = await Prescription.create({
    patient: usersByKey.patientSecondary._id,
    doctor: usersByKey.doctorApproved._id,
    consultation: followUpConsultation._id,
    diagnosis: "Blood pressure follow-up",
    medications: [
      {
        name: "Vitamin C",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "7 days",
        instructions: "After breakfast"
      }
    ],
    notes: "Completed pickup flow sample.",
    validUntil: dateAtUtcTime(5, 23, 59),
    assignedPharmacy: altPharmacy._id,
    fulfillmentStatus: "Completed",
    fulfillmentItems: [
      {
        name: "Vitamin C",
        requestedQuantity: 1,
        availableQuantity: 30,
        stockStatus: "ready"
      }
    ],
    pharmacyNotes: "Collected by patient.",
    fulfillmentHistory: [
      {
        status: "Ready",
        pharmacy: altPharmacy._id,
        note: "Ready before pickup"
      },
      {
        status: "Completed",
        pharmacy: altPharmacy._id,
        note: "Seeded completed pickup"
      }
    ],
    completedAt: dateAtUtcTime(-1, 17, 0),
    digitalSignature: {
      signedBy: usersByKey.doctorApproved._id,
      signerName: "Dr. Meera Sharma",
      signerRole: "doctor",
      doctorLicense: "DOC-SEED-001",
      signatureHash: "seed-signature-complete",
      signedAt: new Date()
    }
  });

  const pendingPrescription = await Prescription.create({
    patient: usersByKey.patientSecondary._id,
    doctor: usersByKey.doctorApproved._id,
    diagnosis: "Routine fever management",
    medications: [
      {
        name: "Paracetamol 650",
        dosage: "1 tablet",
        frequency: "Twice daily",
        duration: "2 days",
        instructions: "After meals"
      }
    ],
    notes: "Unassigned pending prescription for queue testing.",
    validUntil: dateAtUtcTime(4, 23, 59),
    fulfillmentStatus: "Pending",
    digitalSignature: {
      signedBy: usersByKey.doctorApproved._id,
      signerName: "Dr. Meera Sharma",
      signerRole: "doctor",
      doctorLicense: "DOC-SEED-001",
      signatureHash: "seed-signature-pending",
      signedAt: new Date()
    }
  });

  await HealthRecord.insertMany([
    {
      patient: usersByKey.patientPrimary._id,
      doctor: usersByKey.doctorApproved._id,
      consultation: completedConsultation._id,
      prescription: readyPrescription._id,
      type: "prescription",
      title: `Prescription ${readyPrescription.prescriptionId}`,
      consultationSummary: "Fever and sore throat consultation",
      diagnosis: readyPrescription.diagnosis,
      prescriptionDetails: readyPrescription.medications,
      labTests: readyPrescription.labTests,
      doctorInfo: {
        userId: usersByKey.doctorApproved._id,
        name: "Dr. Meera Sharma",
        email: "meera.doctor@seva.local",
        specialization: "General Physician",
        medicalLicense: "DOC-SEED-001"
      },
      source: "generated",
      date: completedConsultation.appointmentDate,
      lastSyncedAt: new Date()
    },
    {
      patient: usersByKey.patientPrimary._id,
      type: "lab_report",
      title: "Seed Lab Report",
      description: "Routine blood test result uploaded for QA testing.",
      fileUrl: "https://example.com/seed-lab-report.pdf",
      source: "uploaded",
      isOfflineAvailable: true,
      date: dateAtUtcTime(-2, 10, 0),
      lastSyncedAt: new Date()
    },
    {
      patient: usersByKey.patientSecondary._id,
      doctor: usersByKey.doctorApproved._id,
      consultation: followUpConsultation._id,
      prescription: completedPrescription._id,
      type: "consultation_note",
      title: "Seed Follow-up Note",
      consultationSummary: "Blood pressure follow-up discussion.",
      diagnosis: completedPrescription.diagnosis,
      description: "Continue medication and monitor home readings.",
      source: "generated",
      date: followUpConsultation.appointmentDate,
      lastSyncedAt: new Date()
    }
  ]);

  await Notification.insertMany([
    {
      user: usersByKey.patientPrimary._id,
      title: "Appointment Reminder",
      message: "Seeded reminder for tomorrow's 10:00 consultation.",
      type: "appointment",
      data: { consultationId: upcomingConsultation._id }
    },
    {
      user: usersByKey.patientPrimary._id,
      title: "Prescription Partially Available",
      message: "Cetirizine is unavailable at CityCare Pharmacy.",
      type: "pharmacy",
      data: { prescriptionId: partialPrescription._id }
    },
    {
      user: usersByKey.doctorApproved._id,
      title: "New Complaint Submitted",
      message: "A seeded complaint is ready for admin review.",
      type: "system"
    }
  ]);

  await Complaint.insertMany([
    {
      raisedBy: usersByKey.patientPrimary._id,
      againstUser: usersByKey.doctorApproved._id,
      category: "consultation",
      subject: "Seed: Delay in consultation start",
      description: "Patient reported a short delay before the doctor joined.",
      status: "Open"
    },
    {
      raisedBy: usersByKey.patientSecondary._id,
      againstUser: usersByKey.pharmacyPrimary._id,
      category: "pharmacy",
      subject: "Seed: Medicine unavailable",
      description: "Primary pharmacy could not fulfill all medicines.",
      status: "Resolved",
      resolutionNotes: "Alternative pharmacy suggested by admin.",
      resolvedBy: usersByKey.admin._id,
      resolvedAt: new Date()
    }
  ]);

  await SymptomLog.insertMany([
    {
      patient: usersByKey.patientPrimary._id,
      symptoms: ["fever", "cough"],
      duration: "2 days",
      severity: "medium",
      predictedConditions: ["Flu", "Common Cold"],
      ai_result: {
        summary: "Likely viral infection.",
        triage: "Home care unless worsening.",
        recommendations: ["Hydrate", "Rest"]
      },
      advice: "Monitor temperature and hydrate well.",
      aiSource: "local"
    },
    {
      patient: usersByKey.patientSecondary._id,
      symptoms: ["headache"],
      duration: "1 day",
      severity: "low",
      predictedConditions: ["Tension Headache"],
      ai_result: {
        summary: "Low-risk headache symptoms.",
        triage: "Self-care",
        recommendations: ["Hydrate", "Sleep"]
      },
      advice: "Rest and reduce screen time.",
      aiSource: "cloud"
    }
  ]);

  await SystemLog.insertMany([
    {
      method: "GET",
      path: "/api/admin/analytics",
      statusCode: 200,
      durationMs: 82,
      level: "info",
      userId: usersByKey.admin._id,
      role: "admin",
      ip: "seed-data"
    },
    {
      method: "POST",
      path: "/api/appointments/book",
      statusCode: 201,
      durationMs: 146,
      level: "info",
      userId: usersByKey.patientPrimary._id,
      role: "patient",
      ip: "seed-data"
    },
    {
      method: "PATCH",
      path: "/api/pharmacy/prescriptions/fake/fulfill",
      statusCode: 500,
      durationMs: 221,
      level: "error",
      userId: usersByKey.pharmacyPrimary._id,
      role: "pharmacist",
      ip: "seed-data"
    }
  ]);

  return {
    completedConsultation,
    upcomingConsultation,
    cancelledConsultation,
    followUpConsultation,
    readyPrescription,
    partialPrescription,
    completedPrescription,
    pendingPrescription,
    primaryPharmacy,
    altPharmacy
  };
};

const main = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured in backend/.env");
  }

  await connectDB(process.env.MONGO_URI);

  try {
    const usersByKey = {};

    for (const userSeed of userSeeds) {
      usersByKey[userSeed.key] = await ensureUser(userSeed);
    }

    await rebuildDomainData(usersByKey);
    await seedProfiles(usersByKey);
    await rebuildDoctorAvailability(usersByKey.doctorApproved._id);
    const seededData = await seedTransactions(usersByKey);

    console.log("");
    console.log("Seed data ready.");
    console.log(`Password for all seeded accounts: ${SEED_PASSWORD}`);
    console.log("");
    console.table(
      userSeeds.map((seed) => ({
        role: seed.role,
        approved: seed.is_approved ? "yes" : "no",
        email: seed.email
      }))
    );
    console.log("");
    console.table([
      {
        item: "Upcoming appointment date",
        value: seededData.upcomingConsultation.appointmentDate.toISOString().slice(0, 10)
      },
      {
        item: "Bookable slot for same date",
        value: "10:30"
      },
      {
        item: "Ready prescription id",
        value: seededData.readyPrescription.prescriptionId
      },
      {
        item: "Partial prescription id",
        value: seededData.partialPrescription.prescriptionId
      },
      {
        item: "Completed prescription id",
        value: seededData.completedPrescription.prescriptionId
      }
    ]);
  } finally {
    await mongoose.connection.close();
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  });
