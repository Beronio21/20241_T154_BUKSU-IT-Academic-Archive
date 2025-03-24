import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from "@react-oauth/google";

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
import NotFound from './NotFound';

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

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
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
  );
}

export default App;
