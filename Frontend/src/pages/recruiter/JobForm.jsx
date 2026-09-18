import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import {
    Button, Card, Field, Input, PageHeader, PageLoader, Select, Textarea, Badge, cx
} from '../../components/ui'
import { IconArrowLeft, IconCheck, IconSend } from '../../components/icons'
import { BRANCHES, GRAD_YEARS } from '../../lib/format'

const EMPTY = {
    title: '', description: '', requiredSkills: '', applicationDeadline: '',
    location: '', jobType: 'full-time', salary: '',
    minCGPA: '', allowedBranches: [], graduationYear: '',
}

export default function JobForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const editing = Boolean(id)
    const [form, setForm] = useState(EMPTY)
    const [loading, setLoading] = useState(editing)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState('draft')

    useEffect(() => {
        if (!editing) return
        let alive = true
        api.get(`/jobs/${id}`)
            .then(({ data }) => {
                if (!alive) return
                setStatus(data.status)
                setForm({
                    title: data.title || '',
                    description: data.description || '',
                    requiredSkills: (data.requiredSkills || []).join(', '),
                    // <input type="date"> needs a bare yyyy-mm-dd
                    applicationDeadline: data.applicationDeadline
                        ? new Date(data.applicationDeadline).toISOString().slice(0, 10) : '',
                    location: data.location || '',
                    jobType: data.jobType || 'full-time',
                    salary: data.salary || '',
                    minCGPA: data.eligibility?.minCGPA ?? '',
                    allowedBranches: data.eligibility?.allowedBranches || [],
                    graduationYear: data.eligibility?.graduationYear ?? '',
                })
            })
            .catch(err => {
                toast.error(errorMessage(err, 'Could not load this job'))
                navigate('/recruiter/dashboard')
            })
            .finally(() => alive && setLoading(false))
        return () => { alive = false }
    }, [id, editing, navigate])

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    const toggleBranch = (branch) => setForm(f => ({
        ...f,
        allowedBranches: f.allowedBranches.includes(branch)
            ? f.allowedBranches.filter(b => b !== branch)
            : [...f.allowedBranches, branch],
    }))

    const submit = async (publishAfter = false) => {
        setSaving(true)
        const payload = {
            title: form.title,
            description: form.description,
            requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
            applicationDeadline: form.applicationDeadline || undefined,
            location: form.location || undefined,
            jobType: form.jobType,
            salary: form.salary || undefined,
            eligibility: {
                minCGPA: form.minCGPA === '' ? 0 : Number(form.minCGPA),
                allowedBranches: form.allowedBranches,
                graduationYear: form.graduationYear === '' ? undefined : Number(form.graduationYear),
            },
        }

        try {
            const jobId = editing
                ? (await api.put(`/jobs/${id}`, payload)).data._id
                : (await api.post('/jobs', payload)).data._id

            if (publishAfter) {
                await api.put(`/jobs/${jobId}/publish`)
                toast.success('Job published — students can see it now')
            } else {
                toast.success(editing ? 'Changes saved' : 'Draft saved')
            }
            navigate('/recruiter/dashboard')
        } catch (err) {
            toast.error(errorMessage(err, 'Could not save this job'))
        } finally {
            setSaving(false)
        }
    }

    const onSubmit = (e) => { e.preventDefault(); submit(false) }

    if (loading) return <PageLoader label="Loading job" />

    const openToAll = form.allowedBranches.length === 0 && !form.minCGPA && !form.graduationYear

    return (
        <>
            <Button variant="subtle" size="sm" onClick={() => navigate('/recruiter/dashboard')} className="mb-6 -ml-2">
                <IconArrowLeft className="size-4" /> Back to postings
            </Button>

            <PageHeader
                eyebrow={editing ? 'Edit posting' : 'New posting'}
                title={editing ? form.title || 'Edit job' : 'Post a new role'}
                subtitle="Set the eligibility bar precisely — students who do not meet it can never apply."
            />

            <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                    <Card className="animate-rise p-6 sm:p-7">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            The role
                        </h2>
                        <div className="mt-4 space-y-4">
                            <Field label="Job title" required>
                                <Input required value={form.title} onChange={set('title')}
                                    placeholder="Software Engineer — Platform" />
                            </Field>
                            <Field label="Description" required
                                hint="What the person will actually do, and what makes the team worth joining.">
                                <Textarea required rows={8} value={form.description} onChange={set('description')}
                                    placeholder="Describe the role, the team and what a strong candidate looks like." />
                            </Field>
                            <Field label="Required skills" hint="Comma separated — matching skills are highlighted for students.">
                                <Input value={form.requiredSkills} onChange={set('requiredSkills')}
                                    placeholder="React, Node.js, MongoDB" />
                            </Field>
                        </div>
                    </Card>

                    <Card className="animate-rise p-6 sm:p-7" style={{ animationDelay: '60ms' }}>
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Eligibility criteria
                        </h2>
                        <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">
                            Leave a field blank to place no restriction on it.
                        </p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <Field label="Minimum CGPA" hint="Out of 10. Blank or 0 means no minimum.">
                                <Input type="number" step="0.1" min="0" max="10"
                                    value={form.minCGPA} onChange={set('minCGPA')} placeholder="7.5" />
                            </Field>
                            <Field label="Graduation year" hint="Restrict to a single batch.">
                                <Select value={form.graduationYear} onChange={set('graduationYear')}>
                                    <option value="">Any batch</option>
                                    {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </Select>
                            </Field>
                        </div>

                        <Field label="Allowed branches" className="mt-4"
                            hint="Select none to open the role to every branch.">
                            <div className="flex flex-wrap gap-2 pt-1">
                                {BRANCHES.map(branch => {
                                    const on = form.allowedBranches.includes(branch)
                                    return (
                                        <button
                                            key={branch}
                                            type="button"
                                            onClick={() => toggleBranch(branch)}
                                            className={cx(
                                                'rounded-lg px-3 py-1.5 text-[12.5px] ring-1 ring-inset transition-all duration-200',
                                                on
                                                    ? 'bg-indigo-50 text-indigo-700 ring-indigo-300'
                                                    : 'bg-slate-50 text-slate-500 ring-slate-200 hover:bg-slate-100 hover:text-slate-700'
                                            )}
                                        >
                                            {branch}
                                        </button>
                                    )
                                })}
                            </div>
                        </Field>
                    </Card>

                    <Card className="animate-rise p-6 sm:p-7" style={{ animationDelay: '100ms' }}>
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Logistics
                        </h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <Field label="Location">
                                <Input value={form.location} onChange={set('location')} placeholder="Bengaluru, India / Remote" />
                            </Field>
                            <Field label="Job type">
                                <Select value={form.jobType} onChange={set('jobType')}>
                                    <option value="full-time">Full time</option>
                                    <option value="internship">Internship</option>
                                    <option value="part-time">Part time</option>
                                    <option value="contract">Contract</option>
                                </Select>
                            </Field>
                            <Field label="Compensation" hint="Shown as written.">
                                <Input value={form.salary} onChange={set('salary')} placeholder="₹18–24 LPA" />
                            </Field>
                            <Field label="Application deadline">
                                <Input type="date" value={form.applicationDeadline}
                                    onChange={set('applicationDeadline')}
                                    min={new Date().toISOString().slice(0, 10)} />
                            </Field>
                        </div>
                    </Card>
                </div>

                {/* ------------------------------------------------- summary */}
                <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                    <Card className="animate-rise p-6" style={{ animationDelay: '80ms' }}>
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Who can apply
                        </h2>
                        {openToAll ? (
                            <p className="mt-3.5 text-[13.5px] leading-relaxed text-slate-500">
                                Every student on CampusHire. Add criteria on the left to narrow it.
                            </p>
                        ) : (
                            <ul className="mt-4 space-y-2.5 text-[13px]">
                                {form.minCGPA > 0 && (
                                    <li className="flex justify-between gap-3">
                                        <span className="text-slate-500">CGPA</span>
                                        <span className="tabular-nums text-slate-700">≥ {form.minCGPA}</span>
                                    </li>
                                )}
                                {form.graduationYear && (
                                    <li className="flex justify-between gap-3">
                                        <span className="text-slate-500">Batch</span>
                                        <span className="tabular-nums text-slate-700">{form.graduationYear}</span>
                                    </li>
                                )}
                                {form.allowedBranches.length > 0 && (
                                    <li>
                                        <span className="text-slate-500">Branches</span>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {form.allowedBranches.map(b => (
                                                <Badge key={b} tone="indigo">{b}</Badge>
                                            ))}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        )}

                        <div className="hairline my-6" />

                        <div className="space-y-2.5">
                            <Button type="submit" variant="ghost" size="lg" className="w-full" loading={saving}>
                                <IconCheck className="size-4" />
                                {editing ? 'Save changes' : 'Save as draft'}
                            </Button>
                            {(!editing || status === 'draft') && (
                                <Button type="button" variant="primary" size="lg" className="w-full"
                                    loading={saving} onClick={() => submit(true)}>
                                    <IconSend className="size-4" /> Save & publish
                                </Button>
                            )}
                        </div>
                        <p className="mt-3.5 text-center text-[11.5px] leading-relaxed text-slate-400">
                            Drafts stay private to you. Publishing makes the role visible to every eligible student.
                        </p>
                    </Card>

                    {editing && (
                        <Card className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
                            <div className="flex items-center justify-between">
                                <span className="text-[12.5px] text-slate-500">Current status</span>
                                <Badge tone={status === 'published' ? 'emerald' : status === 'closed' ? 'rose' : 'slate'}
                                    dot className="capitalize">{status}</Badge>
                            </div>
                            <Link to={`/recruiter/jobs/${id}/applicants`}
                                className="mt-4 block text-[13px] text-indigo-600 underline-offset-4 hover:underline">
                                View applicants →
                            </Link>
                        </Card>
                    )}
                </div>
            </form>
        </>
    )
}
