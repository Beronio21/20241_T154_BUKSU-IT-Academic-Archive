import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// Auth Components
import GoogleLogin from './Auth/Login/Login';
import StudentRegister from './Auth/Student-Register/StudentRegister';
import TeacherRegister from './Auth/Teacher-Register/TeacherRegister';
import AdminRegister from './Auth/Admin-Register/AdminRegister';

// Dashboard Components
import StudentDashboard from './pages/Student-Dashboard/StudentDashboard';
import TeacherDashboard from './pages/Teacher-Dashboard/TeacherDashboard';
import AdminDashboard from './pages/Admin-Dashboard/AdminDashboard'; 

// Profile Component
import StudentProfile from './Profile/Student-Profile/StudentProfile';

// Other Components
import NotFound from './NotFound';
import SubmitThesis from './components/SubmitThesis';
import ViewSubmittedThesis from './components/ViewSubmittedThesis';

// Protected Route Component
const ProtectedRoute = ({ element: Element, allowedRole }) => {
  const userInfo = localStorage.getItem('user-info');
  if (!userInfo) {
    return <Navigate to="/" replace />;
  }
  
  try {
    const userData = JSON.parse(userInfo);
    if (userData?.role !== allowedRole) {
      return <Navigate to="/" replace />;
    }
    return Element;
  } catch {
    return <Navigate to="/" replace />;
  }
};

// Supabase Configuration
const supabaseConfig = {
  url: "https://knhjeoyqyyjcbozxqcew.supabase.co",
  apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaGplb3lxeXlqY2JvenhxY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzMjgzNzcsImV4cCI6MjA0NzkwNDM3N30.SqCDArQsjm7doWyFswm4BtRZdP4HISFI1jvgkSwoRsU"
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.apiKey);

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = "736065879191-hhi3tmfi3ftr54m6r37ilftckkbcojsb.apps.googleusercontent.com";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Routes>
            {/* Login is the default route */}
            <Route path="/" element={<GoogleLogin />} />
            
            {/* Registration Routes */}
            <Route path="/student-register" element={<StudentRegister />} />
            <Route path="/teacher-register" element={<TeacherRegister />} />
            <Route path="/admin-register" element={<AdminRegister />} />

            {/* Protected Dashboard Routes */}
            <Route 
              path="/student-dashboard/*" 
              element={
                <ProtectedRoute 
                  element={<StudentDashboard />} 
                  allowedRole="student"
                />
              } 
            />
            <Route 
              path="/teacher-dashboard/*" 
              element={
                <ProtectedRoute 
                  element={<TeacherDashboard />} 
                  allowedRole="teacher"
                />
              } 
            />
            <Route 
              path="/admin-dashboard/*" 
              element={
                <ProtectedRoute 
                  element={<AdminDashboard />} 
                  allowedRole="admin"
                />
              } 
            />

            {/* Student Profile Route */}
            <Route 
              path="/student-profile" 
              element={
                <ProtectedRoute 
                  element={<StudentProfile />} 
                  allowedRole="student"
                />
              } 
            />

            {/* Submit Thesis Route */}
            <Route 
              path="/submit-thesis" 
              element={
                <ProtectedRoute 
                  element={<SubmitThesis />} 
                  allowedRole="student"
                />
              } 
            />

            {/* View Submitted Thesis Route */}
            <Route 
              path="/view-thesis" 
              element={
                <ProtectedRoute 
                  element={<ViewSubmittedThesis />} 
                  allowedRole="student"
                />
              } 
            />

            {/* Catch-all Routes - Redirect to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </SessionContextProvider>
  );
}

export default App;
