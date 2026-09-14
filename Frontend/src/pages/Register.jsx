import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../lib/api'
import AuthShell from '../components/AuthShell'
import { HOME_FOR } from '../components/ProtectedRoute'
import { Button, Field, Input, Select, Textarea, PageLoader, cx } from '../components/ui'
import { IconArrowRight, IconGrad, IconBriefcase } from '../components/icons'
import { BRANCHES, GRAD_YEARS } from '../lib/format'

const HIGHLIGHTS = [
    'Students: see only the roles you actually qualify for',
    'Recruiters: post once, review applicants with frozen snapshots',
    'Your profile drives every eligibility decision',
]

const ROLE_CARDS = [
    { value: 'student', label: 'Student', blurb: 'Find and apply to roles', icon: IconGrad },
    { value: 'recruiter', label: 'Recruiter', blurb: 'Hire from campus', icon: IconBriefcase },
]

export default function Register() {
    const { user, loading, register } = useAuth()
    const navigate = useNavigate()
    const [role, setRole] = useState('student')
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '',
        cgpa: '', branch: '', graduationYear: '', college: '', skills: '', resumeUrl: '',
        companyName: '', companyWebsite: '', companyDescription: '',
    })

    if (loading) return <PageLoader label="Checking your session" />
    if (user) return <Navigate to={HOME_FOR[user.role] || '/dashboard'} replace />

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    const onSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        // send only the fields that belong to the chosen role
        const base = {
            firstName: form.firstName, lastName: form.lastName,
            email: form.email, password: form.password, role,
        }
        const payload = role === 'student'
            ? {
                ...base,
                cgpa: form.cgpa ? Number(form.cgpa) : undefined,
                branch: form.branch || undefined,
                graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
                college: form.college || undefined,
                resumeUrl: form.resumeUrl || undefined,
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
            }
            : {
                ...base,
                companyName: form.companyName || undefined,
                companyWebsite: form.companyWebsite || undefined,
                companyDescription: form.companyDescription || undefined,
            }

        try {
            const created = await register(payload)
            toast.success(
                role === 'recruiter'
                    ? 'Account created — the placement cell will verify you shortly'
                    : `Welcome to CampusHire, ${created.firstName}`
            )
            navigate(HOME_FOR[created.role], { replace: true })
        } catch (err) {
            toast.error(errorMessage(err, 'Could not create your account'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthShell
            title="Create your account"
            subtitle="Tell us who you are — we will tailor the portal around it."
            highlights={HIGHLIGHTS}
            footer={<>Already registered? <Link to="/login" className="font-medium text-indigo-300 underline-offset-4 hover:underline">Sign in</Link></>}
        >
            <form onSubmit={onSubmit} className="space-y-5">
                {/* role picker */}
                <div className="grid grid-cols-2 gap-2.5">
                    {ROLE_CARDS.map(({ value, label, blurb, icon: Icon }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setRole(value)}
                            className={cx(
                                'rounded-xl border p-3.5 text-left transition-all duration-200',
                                role === value
                                    ? 'border-indigo-400/50 bg-indigo-500/10 shadow-[0_0_0_3px_rgba(99,102,241,0.09)]'
                                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                            )}
                        >
                            <Icon className={cx('size-5', role === value ? 'text-indigo-300' : 'text-slate-500')} />
                            <p className="mt-2.5 text-[13.5px] font-medium text-white">{label}</p>
                            <p className="mt-0.5 text-[11.5px] text-slate-500">{blurb}</p>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="First name" required>
                        <Input required placeholder="Ishaan" value={form.firstName} onChange={set('firstName')} />
                    </Field>
                    <Field label="Last name" required>
                        <Input required placeholder="Gupta" value={form.lastName} onChange={set('lastName')} />
                    </Field>
                </div>

                <Field label="Email address" required>
                    <Input type="email" required autoComplete="email"
                        placeholder={role === 'student' ? 'you@college.edu' : 'you@company.com'}
                        value={form.email} onChange={set('email')} />
                </Field>

                <Field label="Password" required hint="At least 6 characters.">
                    <Input type="password" required minLength={6} autoComplete="new-password"
                        placeholder="••••••••" value={form.password} onChange={set('password')} />
                </Field>

                <div className="hairline" />

                {role === 'student' ? (
                    <div className="animate-fade space-y-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Academic profile
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="CGPA" hint="Out of 10">
                                <Input type="number" step="0.01" min="0" max="10" placeholder="8.6"
                                    value={form.cgpa} onChange={set('cgpa')} />
                            </Field>
                            <Field label="Branch">
                                <Select value={form.branch} onChange={set('branch')}>
                                    <option value="">Select</option>
                                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                </Select>
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Graduation year">
                                <Select value={form.graduationYear} onChange={set('graduationYear')}>
                                    <option value="">Select</option>
                                    {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </Select>
                            </Field>
                            <Field label="College">
                                <Input placeholder="IIT Bombay" value={form.college} onChange={set('college')} />
                            </Field>
                        </div>
                        <Field label="Skills" hint="Comma separated — React, Node.js, Python">
                            <Input placeholder="React, Node.js, MongoDB" value={form.skills} onChange={set('skills')} />
                        </Field>
                    </div>
                ) : (
                    <div className="animate-fade space-y-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Company details
                        </p>
                        <Field label="Company name">
                            <Input placeholder="Nimbus Labs" value={form.companyName} onChange={set('companyName')} />
                        </Field>
                        <Field label="Website">
                            <Input type="url" placeholder="https://nimbus.dev"
                                value={form.companyWebsite} onChange={set('companyWebsite')} />
                        </Field>
                        <Field label="About the company" hint="Shown to students on every posting.">
                            <Textarea rows={3} placeholder="What your company does, in a sentence or two."
                                value={form.companyDescription} onChange={set('companyDescription')} />
                        </Field>
                        <p className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-3.5 py-3 text-[12.5px] leading-relaxed text-amber-200/90">
                            Recruiter accounts are reviewed by the placement cell before you can publish a job.
                        </p>
                    </div>
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
                    {submitting ? 'Creating account' : <>Create account <IconArrowRight className="size-4" /></>}
                </Button>
            </form>
        </AuthShell>
    )
}
