import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// Auth Components
import GoogleLogin from './components/Login';
import StudentRegister from './Auth/StudentRegister';
import TeacherRegister from './Auth/TeacherRegister';
import AdminRegister from './Auth/AdminRegister';

// Dashboard Components
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Other Components
import NotFound from './NotFound';

// Protected Route Component
const ProtectedRoute = ({ element: Element, allowedRole }) => {
  const checkAuth = () => {
    const userInfo = localStorage.getItem('user-info');
    if (!userInfo) return false;
    
    const userData = JSON.parse(userInfo);
    return userData?.role === allowedRole;
  };

  return checkAuth() ? Element : <Navigate to="/" replace />;
};

// Supabase Configuration
const supabaseConfig = {
  url: "https://knhjeoyqyyjcbozxqcew.supabase.co",
  apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaGplb3lxeXlqY2JvenhxY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzMjgzNzcsImV4cCI6MjA0NzkwNDM3N30.SqCDArQsjm7doWyFswm4BtRZdP4HISFI1jvgkSwoRsU"
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.apiKey);

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = "1063044950961-ri426uf77m8u3gjoerju6qi581vle799.apps.googleusercontent.com";

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

            {/* Catch-all Routes - Redirect to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </SessionContextProvider>
  );
}

export default App;
