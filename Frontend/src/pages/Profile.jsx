import { useState } from 'react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
    Badge, Button, Card, Field, Input, PageHeader, Select, Textarea, StatusBadge
} from '../components/ui'
import { IconCheck, IconMail, IconLink, IconUser } from '../components/icons'
import { BRANCHES, GRAD_YEARS, formatDate, initials } from '../lib/format'

export default function Profile() {
    const { user } = useAuth()
    // keyed on the account so a different signed-in user always gets a fresh form
    return user ? <ProfileForm key={user._id} user={user} /> : null
}

function ProfileForm({ user }) {
    const { setUser } = useAuth()
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState(() => ({
        firstName: user.firstName || '', lastName: user.lastName || '',
        cgpa: user.cgpa ?? '', branch: user.branch || '',
        graduationYear: user.graduationYear ?? '', college: user.college || '',
        skills: (user.skills || []).join(', '), resumeUrl: user.resumeUrl || '',
        companyName: user.companyName || '', companyWebsite: user.companyWebsite || '',
        companyDescription: user.companyDescription || '',
    }))

    const isStudent = user.role === 'student'
    const isRecruiter = user.role === 'recruiter'
    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    const onSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        const payload = isStudent
            ? {
                firstName: form.firstName, lastName: form.lastName,
                cgpa: form.cgpa === '' ? undefined : Number(form.cgpa),
                branch: form.branch, college: form.college, resumeUrl: form.resumeUrl,
                graduationYear: form.graduationYear === '' ? undefined : Number(form.graduationYear),
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
            }
            : {
                firstName: form.firstName, lastName: form.lastName,
                companyName: form.companyName, companyWebsite: form.companyWebsite,
                companyDescription: form.companyDescription,
            }

        try {
            const { data } = await api.put('/users/profile', payload)
            setUser(data)
            toast.success('Profile saved')
        } catch (err) {
            toast.error(errorMessage(err, 'Could not save your profile'))
        } finally {
            setSaving(false)
        }
    }

    // profile completeness — a nudge, since eligibility depends on these fields
    const required = isStudent
        ? ['cgpa', 'branch', 'graduationYear', 'college']
        : ['companyName', 'companyWebsite', 'companyDescription']
    const filled = required.filter(k => form[k] !== '' && form[k] != null).length
    const percent = Math.round((filled / required.length) * 100)

    return (
        <>
            <PageHeader
                eyebrow="Account"
                title={isRecruiter ? 'Company profile' : 'Your profile'}
                subtitle={isStudent
                    ? 'These fields drive every eligibility check on the job board — keep them accurate.'
                    : isRecruiter
                        ? 'Students see this on every role you post.'
                        : 'Your placement cell account.'}
            />

            <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                {/* ------------------------------------------------- identity */}
                <div className="space-y-5">
                    <Card className="animate-rise p-6 text-center">
                        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-[19px] font-bold text-brand-700 ring-1 ring-inset ring-brand-100">
                            {initials(user)}
                        </span>
                        <h2 className="mt-4 text-[17px] font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                        </h2>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-slate-500">
                            <IconMail className="size-3.5" /> {user.email}
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <Badge tone="indigo" className="capitalize">{user.role}</Badge>
                            {isRecruiter && <StatusBadge status={user.verificationStatus} />}
                            {user.isActive
                                ? <Badge tone="emerald" dot>Active</Badge>
                                : <Badge tone="rose" dot>Deactivated</Badge>}
                        </div>
                        <p className="mt-5 text-[11.5px] text-slate-400">
                            Member since {formatDate(user.createdAt)}
                        </p>
                    </Card>

                    {!(user.role === 'admin') && (
                        <Card className="animate-rise p-5" style={{ animationDelay: '60ms' }}>
                            <div className="flex items-baseline justify-between">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Profile strength
                                </p>
                                <p className="text-[13px] font-semibold tabular-nums text-slate-900">{percent}%</p>
                            </div>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                                <div
                                    className="h-full rounded-full bg-brand-600 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
                                {percent === 100
                                    ? 'Everything we need is here.'
                                    : isStudent
                                        ? 'Missing fields make otherwise-open roles read as ineligible.'
                                        : 'A complete company profile earns more applications.'}
                            </p>
                        </Card>
                    )}

                    {isRecruiter && user.verificationStatus !== 'verified' && (
                        <Card className={`animate-rise p-5 ${user.verificationStatus === 'rejected'
                            ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}
                            style={{ animationDelay: '100ms' }}>
                            <p className={`text-[13px] leading-relaxed ${user.verificationStatus === 'rejected'
                                ? 'text-rose-700' : 'text-amber-700'}`}>
                                {user.verificationStatus === 'rejected'
                                    ? 'The placement cell rejected this account. Reach out to them to appeal.'
                                    : 'Awaiting verification by the placement cell. You can draft jobs once verified.'}
                            </p>
                        </Card>
                    )}
                </div>

                {/* ----------------------------------------------------- form */}
                <Card className="animate-rise p-6 sm:p-7" style={{ animationDelay: '80ms' }}>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Basic details
                            </h2>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <Field label="First name" required>
                                    <Input required value={form.firstName} onChange={set('firstName')} />
                                </Field>
                                <Field label="Last name" required>
                                    <Input required value={form.lastName} onChange={set('lastName')} />
                                </Field>
                            </div>
                            <Field label="Email" className="mt-4" hint="Your email is your login and cannot be changed here.">
                                <Input value={user.email} disabled />
                            </Field>
                        </div>

                        {isStudent && (
                            <>
                                <div className="hairline" />
                                <div>
                                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        Academics
                                    </h2>
                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <Field label="CGPA" hint="Out of 10">
                                            <Input type="number" step="0.01" min="0" max="10"
                                                value={form.cgpa} onChange={set('cgpa')} placeholder="8.6" />
                                        </Field>
                                        <Field label="Branch">
                                            <Select value={form.branch} onChange={set('branch')}>
                                                <option value="">Select branch</option>
                                                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                            </Select>
                                        </Field>
                                        <Field label="Graduation year">
                                            <Select value={form.graduationYear} onChange={set('graduationYear')}>
                                                <option value="">Select year</option>
                                                {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </Select>
                                        </Field>
                                        <Field label="College">
                                            <Input value={form.college} onChange={set('college')} placeholder="IIT Bombay" />
                                        </Field>
                                    </div>
                                </div>

                                <div className="hairline" />
                                <div>
                                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        Skills & resume
                                    </h2>
                                    <Field label="Skills" className="mt-4" hint="Comma separated. Matching skills are highlighted on job pages.">
                                        <Input value={form.skills} onChange={set('skills')}
                                            placeholder="React, Node.js, MongoDB, Python" />
                                    </Field>
                                    {form.skills.trim() && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                                <span key={s} className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] text-indigo-600 ring-1 ring-inset ring-indigo-200">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <Field label="Resume link" className="mt-4" hint="A public Drive or Dropbox link recruiters can open.">
                                        <Input type="url" value={form.resumeUrl} onChange={set('resumeUrl')}
                                            placeholder="https://drive.google.com/..." />
                                    </Field>
                                </div>
                            </>
                        )}

                        {isRecruiter && (
                            <>
                                <div className="hairline" />
                                <div>
                                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        Company
                                    </h2>
                                    <Field label="Company name" className="mt-4">
                                        <Input value={form.companyName} onChange={set('companyName')} placeholder="Nimbus Labs" />
                                    </Field>
                                    <Field label="Website" className="mt-4">
                                        <Input type="url" value={form.companyWebsite} onChange={set('companyWebsite')}
                                            placeholder="https://nimbus.dev" />
                                    </Field>
                                    <Field label="About" className="mt-4" hint="Shown to students on every posting.">
                                        <Textarea rows={5} value={form.companyDescription} onChange={set('companyDescription')}
                                            placeholder="What your company does, who you hire, what students can expect." />
                                    </Field>
                                    {form.companyWebsite && (
                                        <a href={form.companyWebsite} target="_blank" rel="noreferrer noopener"
                                            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-indigo-600 underline-offset-4 hover:underline">
                                            <IconLink className="size-3.5" /> Preview link
                                        </a>
                                    )}
                                </div>
                            </>
                        )}

                        {user.role === 'admin' && (
                            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[13px] leading-relaxed text-slate-500">
                                <IconUser className="mr-2 inline size-4 text-slate-500" />
                                Admin accounts carry no additional profile fields.
                            </p>
                        )}

                        <div className="hairline" />
                        <div className="flex justify-end">
                            <Button type="submit" variant="primary" loading={saving}>
                                {saving ? 'Saving' : <><IconCheck className="size-4" /> Save changes</>}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </>
    )
}
