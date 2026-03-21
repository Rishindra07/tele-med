import { useState } from 'react'
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Register from './pages/auth/Register.jsx';
import Login from './pages/auth/Login.jsx'
import VerifyOtp from './pages/auth/VerifyOtp.jsx';

import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import SymptomChecker from "./pages/patient/SymptomChecker.jsx";
import PatientAppointments from "./pages/patient/PatientAppointments.jsx";
import ConsultationScreen from "./pages/patient/ConsultationScreen.jsx";
import HealthRecords from "./pages/patient/HealthRecords.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import DoctorAppointments from "./pages/doctor/DoctorAppointments.jsx";
import PrescriptionForm from "./pages/doctor/PrescriptionForm.jsx";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

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
      <Route path='/patient/consultation' element={
        <ProtectedRoute>
          <RoleRoute role="patient">
            <ConsultationScreen/>
          </RoleRoute>
        </ProtectedRoute>
      }/>
      <Route path='/patient/records' element={
        <ProtectedRoute>
          <RoleRoute role="patient">
            <HealthRecords/>
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

        <Route path="/pharmacy" element={
          <ProtectedRoute>
            <RoleRoute role="pharmacist">
              <PharmacyDashboard />
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

    </Routes>
    </BrowserRouter>
  )
}

export default App
