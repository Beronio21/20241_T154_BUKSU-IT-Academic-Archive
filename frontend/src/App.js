import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TeacherDashboard from './components/thesis-submissions';
import ViewSubmittedThesis from './components/ViewSubmittedThesis';
import SubmitThesis from './components/SubmitThesis';
import TeacherNotification from './components/TeacherNotification';
// ... other imports ...

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher-dashboard/view-submitted-thesis" element={<ViewSubmittedThesis />} />
                <Route path="/teacher-dashboard/submit-thesis" element={<SubmitThesis />} />
                <Route path="/teacher-dashboard/notifications" element={<TeacherNotification />} />
                {/* Add other routes as needed */}
            </Routes>
        </Router>
    );
}

export default App; 