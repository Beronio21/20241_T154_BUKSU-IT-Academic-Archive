import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// Auth Components
import GoogleLogin from './Auth/Login/Login';
import StudentRegister from './Auth/Student/StudentRegister';
import TeacherRegister from './Auth/Teacher/TeacherRegister';
import AdminRegister from './Auth/AdminRegister';
import AdminRegister2 from './Auth/AdminRegister2';

// Dashboard Components
import StudentDashboard from './pages/Student-Dashboard/StudentDashboard';
import TeacherDashboard from './pages/Teacher-Dashboard/TeacherDashboard';
import AdminDashboard from './pages/Admin-Dashboard/AdminDashboard';
import Contact from './pages/Contact';

// Other Components
import NotFound from './NotFound';
import TrashArchives from './components/TrashArchives';
import CapstoneManagement2 from './components/CapstoneManagement2';
import UserManagement2 from './UserManagement/UserManagement2';
import StudentRecords2 from './Records/StudentRecords2';
import TeacherRecords2 from './Records/TeacherRecords2';

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
            <Route path="/admin-register-2" element={<AdminRegister2 />} />

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
            <Route 
              path="/admin-dashboard/trash-archives" 
              element={
                <ProtectedRoute 
                  element={<TrashArchives />} 
                  allowedRole="admin"
                />
              } 
            />
            <Route 
              path="/admin-dashboard/capstone-management-2" 
              element={
                <ProtectedRoute 
                  element={<CapstoneManagement2 />} 
                  allowedRole="admin"
                />
              } 
            />
            <Route 
              path="/admin-dashboard/user-management-2" 
              element={
                <ProtectedRoute 
                  element={<UserManagement2 />} 
                  allowedRole="admin"
                />
              } 
            />
            <Route 
              path="/admin-dashboard/student-records-2" 
              element={
                <ProtectedRoute 
                  element={<StudentRecords2 />} 
                  allowedRole="admin"
                />
              } 
            />
            <Route 
              path="/admin-dashboard/teacher-records-2" 
              element={
                <ProtectedRoute 
                  element={<TeacherRecords2 />} 
                  allowedRole="admin"
                />
              } 
            />
            <Route 
              path="/admin-dashboard/admin-register-2" 
              element={
                <ProtectedRoute 
                  element={<AdminRegister2 />} 
                  allowedRole="admin"
                />
              } 
            />
            <Route path="/contact" element={<Contact />} />

            {/* Catch-all Routes - Redirect to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </SessionContextProvider>
  );
}

export default App;
