import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// Auth Components
import GoogleLogin from './Auth/Login-Page/Login';
import StudentRegister from './Auth/StudentRegister';
import TeacherRegister from './Auth/TeacherRegister';
import AdminRegister from './Auth/AdminRegister';

// Dashboard Components
import StudentDashboard from './pages/Student-Dashboard/StudentDashboard';
import TeacherDashboard from './pages/Teacher-Dashboard/TeacherDashboard';
import AdminDashboard from './pages/Admin-Dashboard/AdminDashboard';

// Other Components
import NotFound from './components/NotFound/NotFound';
import ProtectedRoute from '../src/ProtectedRoute';

// Supabase Configuration (Using Environment Variables)
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, 
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Routes>
            {/* Login is the default route */}
            <Route path="/" element={<GoogleLogin />} />
            
            <Route path="/student-register" element={<StudentRegister />} />
            <Route path="/teacher-register" element={<TeacherRegister />} />
            <Route path="/admin-register" element={<AdminRegister />} />

            {/* Protected Dashboard Routes */}
            <Route 
              path="/student-dashboard/*" 
              element={<ProtectedRoute element={<StudentDashboard />} allowedRole="student" />} 
            />
            <Route 
              path="/teacher-dashboard/*" 
              element={<ProtectedRoute element={<TeacherDashboard />} allowedRole="teacher" />} 
            />
            <Route 
              path="/admin-dashboard/*" 
              element={<ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />} 
            />

            {/* Catch-all 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </SessionContextProvider>
  );
}

export default App;
