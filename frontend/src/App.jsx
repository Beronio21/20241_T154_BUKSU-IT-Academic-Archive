import './App.css'
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLogin from './GoogleLogin';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import NotFound from './NotFound';
import StudentRegister from './components/StudentRegister';

function App() {
	return (
		<GoogleOAuthProvider clientId="1063044950961-ri426uf77m8u3gjoerju6qi581vle799.apps.googleusercontent.com">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<GoogleLogin />} />
					<Route path="/login" element={<GoogleLogin />} />
					<Route path="/student-dashboard" element={<StudentDashboard />} />
					<Route path="/teacher-dashboard" element={<TeacherDashboard />} />
					<Route path="/admin-dashboard" element={<AdminDashboard />} />
					<Route path="/student-register" element={<StudentRegister />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</BrowserRouter>
		</GoogleOAuthProvider>
	);
}

export default App;
