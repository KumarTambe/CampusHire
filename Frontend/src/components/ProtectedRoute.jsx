import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from './ui'

/** Where each role lands when it hits a route it is not allowed to see. */
export const HOME_FOR = {
    student: '/dashboard',
    recruiter: '/recruiter/dashboard',
    admin: '/admin/dashboard',
}

export default function ProtectedRoute({ roles }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    // wait for the token → user rehydration before deciding anything
    if (loading) return <PageLoader label="Checking your session" />

    if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

    if (roles && !roles.includes(user.role)) {
        return <Navigate to={HOME_FOR[user.role] || '/'} replace />
    }

    return <Outlet />
}
