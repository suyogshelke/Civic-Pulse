import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from './utils/constants';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import TrackComplaint from './pages/public/TrackComplaint';
import NotFound from './pages/public/NotFound';

// Citizen pages
import CitizenDashboard from './pages/citizen/Dashboard';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import CitizenComplaintDetail from './pages/citizen/ComplaintDetail';
import CitizenProfile from './pages/citizen/Profile';

// Officer pages
import OfficerDashboard from './pages/officer/Dashboard';
import OfficerComplaints from './pages/officer/AssignedComplaints';
import OfficerComplaintDetail from './pages/officer/ComplaintWorkspace';
import OfficerProfile from './pages/officer/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminAnalytics from './pages/admin/Analytics';
import AdminComplaints from './pages/admin/AllComplaints';
import AdminComplaintDetail from './pages/admin/ComplaintDetail';
import AdminReports from './pages/admin/Reports';
import AdminDepartments from './pages/admin/Departments';
import AdminOfficers from './pages/admin/Officers';
import AdminCitizens from './pages/admin/Citizens';
import AdminSettings from './pages/admin/Settings';
import AdminProfile from './pages/admin/Profile';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track" element={<TrackComplaint />} />
      </Route>

      {/* Citizen portal */}
      <Route element={<ProtectedRoute allow={[ROLES.CITIZEN]} />}>
        <Route element={<AppLayout />}>
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/submit" element={<SubmitComplaint />} />
          <Route path="/citizen/complaints" element={<MyComplaints />} />
          <Route path="/citizen/complaints/:id" element={<CitizenComplaintDetail />} />
          <Route path="/citizen/profile" element={<CitizenProfile />} />
        </Route>
      </Route>

      {/* Officer portal */}
      <Route element={<ProtectedRoute allow={[ROLES.OFFICER]} />}>
        <Route element={<AppLayout />}>
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />
          <Route path="/officer/complaints" element={<OfficerComplaints />} />
          <Route path="/officer/complaints/:id" element={<OfficerComplaintDetail />} />
          <Route path="/officer/profile" element={<OfficerProfile />} />
        </Route>
      </Route>

      {/* Admin portal */}
      <Route element={<ProtectedRoute allow={[ROLES.ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/complaints/:id" element={<AdminComplaintDetail />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/officers" element={<AdminOfficers />} />
          <Route path="/admin/citizens" element={<AdminCitizens />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
