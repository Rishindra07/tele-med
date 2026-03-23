const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const PatientProfile = require('./models/PatientProfile');
const DoctorProfile = require('./models/DoctorProfile');
const PharmacyProfile = require('./models/PharmacyProfile');
const Consultation = require('./models/Consultation');
const MedicalRecord = require('./models/MedicalRecord');
const SymptomLog = require('./models/SymptomLog');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tele-med');
    console.log('Connected.');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      PatientProfile.deleteMany({}),
      DoctorProfile.deleteMany({}),
      PharmacyProfile.deleteMany({}),
      Consultation.deleteMany({}),
      MedicalRecord.deleteMany({}),
      SymptomLog.deleteMany({})
    ]);
    console.log('Cleared.');

    // Create Admin
    console.log('Creating Admin...');
    const admin = await User.create({
      full_name: 'System Admin',
      email: 'admin@telemed.com',
      password_hash: 'admin123',
      role: 'admin'
    });

    // Create Patients
    console.log('Creating Patients...');
    const patients = [];
    const patientNames = ['Rohan Sharma', 'Anita Desai', 'Vikram Singh', 'Priya Patel', 'Sunil Kumar'];
    for (let i = 0; i < patientNames.length; i++) {
        const user = await User.create({
            full_name: patientNames[i],
            email: `patient${i+1}@example.com`,
            password_hash: 'password123',
            role: 'patient',
            phone: `+91981400000${i}`
        });
        const profile = await PatientProfile.create({
            user: user._id,
            address: `${10+i}, Health Street, New Delhi`,
            dob: '1990-01-01',
            gender: i % 2 === 0 ? 'Male' : 'Female',
            bloodGroup: ['O+', 'A+', 'B+', 'AB+'][i % 4],
            settings: { notifications: { email: true, push: true } }
        });
        patients.push({ user, profile });
    }

    // Create Doctors
    console.log('Creating Doctors...');
    const doctors = [];
    const doctorData = [
        { name: 'Dr. Sameer Gupta', spec: 'Cardiologist', qual: 'MBBS, MD (Cardiology)', fee: 800 },
        { name: 'Dr. Anjali Verma', spec: 'Dermatologist', qual: 'MBBS, DDVL', fee: 500 },
        { name: 'Dr. Rajesh Khanna', spec: 'General Physician', qual: 'MBBS, MD', fee: 400 },
        { name: 'Dr. Meera Reddy', spec: 'Pediatrician', qual: 'MBBS, DCH', fee: 600 },
        { name: 'Dr. Amit Shah', spec: 'Neurologist', qual: 'MBBS, DM (Neurology)', fee: 1000 },
        { name: 'Dr. Kavita Joshi', spec: 'Gynaecologist', qual: 'MBBS, MS (OBG)', fee: 700 },
        { name: 'Dr. Suresh Raina', spec: 'Orthopedic', qual: 'MBBS, MS (Ortho)', fee: 750 },
        { name: 'Dr. Neha Kakkar', spec: 'Psychiatrist', qual: 'MBBS, DPM', fee: 900 }
    ];

    for (let i = 0; i < doctorData.length; i++) {
        const d = doctorData[i];
        const user = await User.create({
            full_name: d.name,
            email: `doctor${i+1}@example.com`,
            password_hash: 'password123',
            role: 'doctor',
            phone: `+91991200000${i}`
        });
        const profile = await DoctorProfile.create({
            user: user._id,
            specialization: d.spec,
            qualification: d.qual,
            experience: 5 + i,
            medicalLicense: `REG-12345${i}`,
            hospitalName: 'City General Hospital',
            consultationFee: d.fee,
            rating: 4.5,
            bio: `Experienced ${d.spec} with over ${5+i} years of practice.`,
            availability: [
                { day: 'Monday', slots: ['09:00', '10:00', '11:00'] },
                { day: 'Wednesday', slots: ['14:00', '15:00', '16:00'] },
                { day: 'Friday', slots: ['10:00', '11:00', '12:00'] }
            ]
        });
        doctors.push({ user, profile });
    }

    // Create Pharmacies
    console.log('Creating Pharmacies...');
    const pharmacyNames = ['Apollo Pharmacy', 'MedPlus', 'Wellness Forever', 'Local Chemist'];
    for (let i = 0; i < pharmacyNames.length; i++) {
        const user = await User.create({
            full_name: pharmacyNames[i],
            email: `pharmacy${i+1}@example.com`,
            password_hash: 'password123',
            role: 'pharmacist',
            phone: `+91881100000${i}`
        });
        await PharmacyProfile.create({
            user: user._id,
            pharmacyName: pharmacyNames[i],
            licenseNumber: `PHARM-LIC-990${i}`,
            location: `${5+i}, Pharma Road, Sector ${10+i}`,
            openTime: '09:00',
            closeTime: '21:00'
        });
    }

    // Create Appointments
    console.log('Creating Appointments...');
    for (let i = 0; i < 10; i++) {
        const patient = patients[i % patients.length].user;
        const doctor = doctors[i % doctors.length];
        await Consultation.create({
            patient: patient._id,
            doctor: doctor.user._id,
            specialization: doctor.profile.specialization,
            appointmentDate: new Date(Date.now() + (i-3) * 24 * 60 * 60 * 1000), // mix of past and future
            timeSlot: '10:00',
            status: i < 3 ? 'Completed' : i < 5 ? 'Cancelled' : 'Scheduled'
        });
    }

    // Create Medical Records
    console.log('Creating Medical Records...');
    for (let i = 0; i < patients.length; i++) {
        const p = patients[i].user;
        await MedicalRecord.create({
            patient: p._id,
            title: 'General Health Checkup',
            type: 'note',
            description: 'Patient is healthy. Minor seasonal allergies noted.',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        });
        await MedicalRecord.create({
            patient: p._id,
            title: 'Fever Prescription',
            type: 'prescription',
            description: 'Paracetamol 500mg, twice a day for 3 days.',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        });
    }

    // Create Symptom Logs
    console.log('Creating Symptom Logs...');
    for (let i = 0; i < patients.length; i++) {
        const p = patients[i].user;
        await SymptomLog.create({
            patient: p._id,
            symptoms: ['Fever', 'Cough', 'Fatigue'],
            analysis: 'Possible viral infection. Rest and fluids recommended.',
            advice: 'Consult a general physician if fever persists for more than 3 days.'
        });
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
