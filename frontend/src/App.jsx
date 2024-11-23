import './App.css'
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLogin from './GoogleLogin';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import NotFound from './NotFound';
import StudentRegister from './components/StudentRegister';
import TeacherRegister from './components/TeacherRegister';
import AdminRegister from './components/AdminRegister';
import reportWebVitals from './components/reportWebVitals';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

const supabase = createClient(
  "https://knhjeoyqyyjcbozxqcew.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaGplb3lxeXlqY2JvenhxY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzMjgzNzcsImV4cCI6MjA0NzkwNDM3N30.SqCDArQsjm7doWyFswm4BtRZdP4HISFI1jvgkSwoRsU" 
);

function App() {
	return (
		<SessionContextProvider supabaseClient={supabase}>
			<GoogleOAuthProvider clientId="1063044950961-ri426uf77m8u3gjoerju6qi581vle799.apps.googleusercontent.com">
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<GoogleLogin />} />
						<Route path="/login" element={<GoogleLogin />} />
						<Route path="/student-dashboard" element={<StudentDashboard />} />
						<Route path="/teacher-dashboard" element={<TeacherDashboard />} />
						<Route path="/admin-dashboard" element={<AdminDashboard />} />
						<Route path="/student-register" element={<StudentRegister />} />
						<Route path="/teacher-register" element={<TeacherRegister />} />
						<Route path="/admin-register" element={<AdminRegister />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</GoogleOAuthProvider>
		</SessionContextProvider>
	);
}

export default App;
