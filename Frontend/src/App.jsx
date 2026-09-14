import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'

import StudentDashboard from './pages/student/Dashboard'
import JobDetail from './pages/student/JobDetail'
import MyApplications from './pages/student/MyApplications'

import RecruiterDashboard from './pages/recruiter/Dashboard'
import JobForm from './pages/recruiter/JobForm'
import Applicants from './pages/recruiter/Applicants'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminRecruiters from './pages/admin/Recruiters'
import AdminJobs from './pages/admin/Jobs'
import AdminApplications from './pages/admin/Applications'

const toastOptions = {
    duration: 3800,
    style: {
        background: 'rgba(15, 21, 42, 0.92)',
        color: '#e2e8f0',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '12px',
        fontSize: '13.5px',
        padding: '11px 15px',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 20px 45px -22px rgba(2,6,23,1)',
        maxWidth: '26rem',
    },
    success: { iconTheme: { primary: '#34d399', secondary: '#04060f' } },
    error: { iconTheme: { primary: '#fb7185', secondary: '#04060f' }, duration: 5000 },
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-right" toastOptions={toastOptions} gutter={10} />

                <Routes>
                    {/* public */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* everything below shares the navbar + footer chrome */}
                    <Route element={<Layout />}>
                        {/* any signed-in role */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/notifications" element={<Notifications />} />
                        </Route>

                        {/* students */}
                        <Route element={<ProtectedRoute roles={['student']} />}>
                            <Route path="/dashboard" element={<StudentDashboard />} />
                            <Route path="/my-applications" element={<MyApplications />} />
                        </Route>

                        {/* job detail is readable by students, recruiters and admins */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/jobs/:id" element={<JobDetail />} />
                        </Route>

                        {/* recruiters */}
                        <Route element={<ProtectedRoute roles={['recruiter']} />}>
                            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                            <Route path="/recruiter/jobs/new" element={<JobForm />} />
                            <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
                            <Route path="/recruiter/jobs/:id/applicants" element={<Applicants />} />
                        </Route>

                        {/* placement cell */}
                        <Route element={<ProtectedRoute roles={['admin']} />}>
                            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/users" element={<AdminUsers />} />
                            <Route path="/admin/recruiters" element={<AdminRecruiters />} />
                            <Route path="/admin/jobs" element={<AdminJobs />} />
                            <Route path="/admin/applications" element={<AdminApplications />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
