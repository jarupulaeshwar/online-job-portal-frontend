import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BrowseJobs from './pages/BrowseJobs.jsx';
import JobDetails from './pages/JobDetails.jsx';
import Companies from './pages/Companies.jsx';
import NotFound from './pages/NotFound.jsx';
import SeekerDashboard from './pages/seeker/SeekerDashboard.jsx';
import MyProfile from './pages/seeker/MyProfile.jsx';
import ResumeManagement from './pages/seeker/ResumeManagement.jsx';
import SavedJobs from './pages/seeker/SavedJobs.jsx';
import MyApplications from './pages/seeker/MyApplications.jsx';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard.jsx';
import ManageJobs from './pages/recruiter/ManageJobs.jsx';
import JobForm from './pages/recruiter/JobForm.jsx';
import Applicants from './pages/recruiter/Applicants.jsx';
import CompanyProfile from './pages/recruiter/CompanyProfile.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<BrowseJobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/companies" element={<Companies />} />

        <Route element={<ProtectedRoute roles={['JOB_SEEKER']} />}>
          <Route path="/seeker" element={<SeekerDashboard />} />
          <Route path="/seeker/profile" element={<MyProfile />} />
          <Route path="/seeker/resume" element={<ResumeManagement />} />
          <Route path="/seeker/saved" element={<SavedJobs />} />
          <Route path="/seeker/applications" element={<MyApplications />} />
        </Route>

        <Route element={<ProtectedRoute roles={['RECRUITER']} />}>
          <Route path="/recruiter" element={<RecruiterDashboard />} />
          <Route path="/recruiter/jobs" element={<ManageJobs />} />
          <Route path="/recruiter/jobs/new" element={<JobForm />} />
          <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
          <Route path="/recruiter/applicants" element={<Applicants />} />
          <Route path="/recruiter/company" element={<CompanyProfile />} />
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
