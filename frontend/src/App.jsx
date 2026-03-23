import { useState } from 'react'
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Register from './pages/auth/Register.jsx';
import Login from './pages/auth/Login.jsx'
import VerifyOtp from './pages/auth/VerifyOtp.jsx';
import PendingApproval from './pages/auth/PendingApproval.jsx';

import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import SymptomChecker from "./pages/patient/SymptomChecker.jsx";
import PatientAppointments from "./pages/patient/PatientAppointments.jsx";
import PatientHealthRecords from "./pages/patient/PatientHealthRecords.jsx";
import PatientPharmacies from "./pages/patient/PatientPharmacies.jsx";
import PatientProfile from "./pages/patient/PatientProfile.jsx";
import PatientSettings from "./pages/patient/PatientSettings.jsx";
import ConsultationScreen from "./pages/patient/ConsultationScreen.jsx";
import HealthRecords from "./pages/patient/HealthRecords.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import DoctorAppointments from "./pages/doctor/DoctorAppointments.jsx";
import PrescriptionForm from "./pages/doctor/PrescriptionForm.jsx";
import DoctorPatients from "./pages/doctor/DoctorPatients.jsx";
import DoctorProfile from "./pages/doctor/DoctorProfile.jsx";
import DoctorSettings from "./pages/doctor/DoctorSettings.jsx";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard.jsx";
import PharmacyPrescriptions from "./pages/pharmacy/PharmacyPrescriptions.jsx";
import PharmacyInventory from "./pages/pharmacy/PharmacyInventory.jsx";
import PharmacySales from "./pages/pharmacy/PharmacySales.jsx";
import PharmacyExpiry from "./pages/pharmacy/PharmacyExpiry.jsx";
import PharmacySuppliers from "./pages/pharmacy/PharmacySuppliers.jsx";
import PharmacyProfile from "./pages/pharmacy/PharmacyProfile.jsx";
import PharmacySettings from "./pages/pharmacy/PharmacySettings.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminPatients from "./pages/admin/AdminPatients.jsx";
import AdminDoctors from "./pages/admin/AdminDoctors.jsx";
import AdminPharmacies from "./pages/admin/AdminPharmacies.jsx";
import AdminConsultations from "./pages/admin/AdminConsultations.jsx";
import AdminRecords from "./pages/admin/AdminRecords.jsx";
import AdminFinancials from "./pages/admin/AdminFinancials.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminSystemHealth from "./pages/admin/AdminSystemHealth.jsx";
import AdminUserManagement from "./pages/admin/AdminUserManagement.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

function App() {

  return (
    <BrowserRouter>
    <Routes>
      {/* Public Pages */}
      <Route path='/' element={<LandingPage/>}/>
      
      {/* Auth */}
      <Route path='/register' element={<Register/>}/>
      <Route path='/verify' element={<VerifyOtp/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/pending-approval' element={
        <ProtectedRoute>
          <PendingApproval />
        </ProtectedRoute>
      }/>

      {/* Dashboards */}
      <Route path='/patient' element={
        <ProtectedRoute>
          <RoleRoute role="patient">
            <PatientDashboard/>
          </RoleRoute>
        </ProtectedRoute>
      }/>
      <Route path='/patient/appointments' element={
        <ProtectedRoute>
          <RoleRoute role="patient">
            <PatientAppointments/>
          </RoleRoute>
        </ProtectedRoute>
      }/>
      <Route path='/patient/records' element={
        <ProtectedRoute>
          <RoleRoute role="patient">
            <PatientHealthRecords/>
          </RoleRoute>
        </ProtectedRoute>
      }/>
      <Route path='/patient/pharmacies' element={
        <ProtectedRoute>
          <RoleRoute role="patient">
            <PatientPharmacies/>
          </RoleRoute>
        </ProtectedRoute>
      }/>
      <Route path='/patient/profile' element={
        <ProtectedRoute>
          <RoleRoute role="patient">
            <PatientProfile/>
          </RoleRoute>
        </ProtectedRoute>
      }/>
      <Route path='/patient/settings' element={
        <ProtectedRoute>
          <RoleRoute role="patient">
            <PatientSettings/>
            </RoleRoute>
        </ProtectedRoute>
      }/>
      
      <Route path='/patient/consultation' element={
        <ProtectedRoute>
          <RoleRoute role="patient">
            <ConsultationScreen/>
          </RoleRoute>
        </ProtectedRoute>
      }/>
      
     

      {/* Symptom Checker Page for Patient */}
      <Route path="/symptom-checker" element={<SymptomChecker />} />

      <Route path="/doctor" element={
          <ProtectedRoute>
            <RoleRoute role="doctor">
              <DoctorDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }/>
      <Route path="/doctor/appointments" element={
          <ProtectedRoute>
            <RoleRoute role="doctor">
              <DoctorAppointments />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/doctor/prescription" element={
          <ProtectedRoute>
            <RoleRoute role="doctor">
              <PrescriptionForm />
            </RoleRoute>
          </ProtectedRoute>
        }/>

        <Route path="/doctor/patients" element={
          <ProtectedRoute>
            <RoleRoute role="doctor">
              <DoctorPatients />
            </RoleRoute>
          </ProtectedRoute>
        }/>

        <Route path="/doctor/profile" element={
          <ProtectedRoute>
            <RoleRoute role="doctor">
              <DoctorProfile />
            </RoleRoute>
          </ProtectedRoute>
        }/>

        <Route path="/doctor/settings" element={
          <ProtectedRoute>
            <RoleRoute role="doctor">
              <DoctorSettings />
            </RoleRoute>
          </ProtectedRoute>
        }/>

        <Route path="/pharmacy" element={
          <ProtectedRoute>
            <RoleRoute role="pharmacist">
              <PharmacyDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/pharmacy/prescriptions" element={
          <ProtectedRoute>
            <RoleRoute role="pharmacist">
              <PharmacyPrescriptions />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/pharmacy/inventory" element={
          <ProtectedRoute>
            <RoleRoute role="pharmacist">
              <PharmacyInventory />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/pharmacy/sales" element={
          <ProtectedRoute>
            <RoleRoute role="pharmacist">
              <PharmacySales />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/pharmacy/expiry" element={
          <ProtectedRoute>
            <RoleRoute role="pharmacist">
              <PharmacyExpiry />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/pharmacy/suppliers" element={
          <ProtectedRoute>
            <RoleRoute role="pharmacist">
              <PharmacySuppliers />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/pharmacy/profile" element={
          <ProtectedRoute>
            <RoleRoute role="pharmacist">
              <PharmacyProfile />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/pharmacy/settings" element={
          <ProtectedRoute>
            <RoleRoute role="pharmacist">
              <PharmacySettings />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/analytics" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminAnalytics />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/patients" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminPatients />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/doctors" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminDoctors />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/pharmacies" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminPharmacies />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/consultations" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminConsultations />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/records" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminRecords />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/financials" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminFinancials />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/reports" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminReports />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/health" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminSystemHealth />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminUserManagement />
            </RoleRoute>
          </ProtectedRoute>
        }/>
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminSettings />
            </RoleRoute>
          </ProtectedRoute>
        }/>

    </Routes>
    </BrowserRouter>
  )
}

export default App
