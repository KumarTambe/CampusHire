import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../lib/api'
import AuthShell from '../components/AuthShell'
import { HOME_FOR } from '../components/ProtectedRoute'
import { Button, Field, Input, Select, PageLoader } from '../components/ui'
import { IconArrowRight } from '../components/icons'

export default function Login() {
    const { user, loading, login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [form, setForm] = useState({ email: '', password: '', role: 'student' })
    const [submitting, setSubmitting] = useState(false)

    if (loading) return <PageLoader label="Checking your session" />
    if (user) return <Navigate to={HOME_FOR[user.role] || '/dashboard'} replace />

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    const onSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const signedIn = await login({ email: form.email, password: form.password })

            // the role selector is a convenience, not an authority — the server decides
            if (signedIn.role !== form.role) {
                toast(`Signed in as a ${signedIn.role}.`, { icon: 'ℹ️' })
            } else {
                toast.success(`Welcome back, ${signedIn.firstName}`)
            }
            navigate(location.state?.from || HOME_FOR[signedIn.role] || '/dashboard', { replace: true })
        } catch (err) {
            toast.error(errorMessage(err, 'Could not sign you in'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthShell
            title="Welcome Back"
            subtitle="Login to continue your career journey."
            footer={<>New here? <Link to="/register" className="font-semibold text-brand-600 underline-offset-4 hover:underline">Create an account</Link></>}
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <Field label="I am a" required>
                    <Select value={form.role} onChange={set('role')}>
                        <option value="student">Student</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Placement cell / Admin</option>
                    </Select>
                </Field>

                <Field label="Email address" required>
                    <Input type="email" required autoComplete="email" placeholder="you@college.edu"
                        value={form.email} onChange={set('email')} />
                </Field>

                <Field label="Password" required>
                    <Input type="password" required autoComplete="current-password" placeholder="••••••••"
                        value={form.password} onChange={set('password')} />
                </Field>

                <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
                    {submitting ? 'Signing in' : <>Sign in <IconArrowRight className="size-4" /></>}
                </Button>
            </form>
        </AuthShell>
    )
}
