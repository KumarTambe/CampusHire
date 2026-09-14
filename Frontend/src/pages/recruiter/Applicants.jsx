import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import Pipeline from '../../components/Pipeline'
import {
    Button, Card, EmptyState, Field, Modal, PageHeader, PageLoader,
    StatusBadge, Tabs, Textarea, cx
} from '../../components/ui'
import {
    IconArrowLeft, IconUsers, IconMail, IconLink, IconCheck, IconX, IconSend
} from '../../components/icons'
import { formatDate, initials, timeAgo, RECRUITER_NEXT, APPLICATION_STATUSES } from '../../lib/format'

const ACTION_LABEL = {
    shortlisted: { label: 'Shortlist', variant: 'accent', icon: IconCheck },
    interview: { label: 'Move to interview', variant: 'accent', icon: IconSend },
    selected: { label: 'Select', variant: 'success', icon: IconCheck },
    rejected: { label: 'Reject', variant: 'danger', icon: IconX },
}

export default function Applicants() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [job, setJob] = useState(null)
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [pending, setPending] = useState(null)   // { application, status }
    const [reason, setReason] = useState('')
    const [busy, setBusy] = useState(false)

    const load = useCallback(() =>
        api.get(`/applications/job/${id}`)
            .then(({ data }) => { setJob(data.job); setApplications(data.applications) })
            .catch(err => {
                toast.error(errorMessage(err, 'Could not load applicants'))
                navigate('/recruiter/dashboard')
            })
            .finally(() => setLoading(false)), [id, navigate])

    useEffect(() => { load() }, [load])

    const counts = useMemo(() => {
        const base = { all: applications.length }
        for (const s of APPLICATION_STATUSES) {
            base[s] = applications.filter(a => a.status === s).length
        }
        return base
    }, [applications])

    const visible = filter === 'all' ? applications : applications.filter(a => a.status === filter)

    const changeStatus = async () => {
        setBusy(true)
        try {
            await api.put(`/applications/${pending.application._id}/status`, {
                status: pending.status,
                reason: reason.trim() || undefined,
            })
            toast.success(`Moved to ${pending.status}`)
            setPending(null)
            setReason('')
            await load()
        } catch (err) {
            toast.error(errorMessage(err, 'Could not update the application'))
        } finally {
            setBusy(false)
        }
    }

    if (loading) return <PageLoader label="Loading applicants" />

    return (
        <>
            <Button variant="subtle" size="sm" onClick={() => navigate('/recruiter/dashboard')} className="mb-6 -ml-2">
                <IconArrowLeft className="size-4" /> Back to postings
            </Button>

            <PageHeader
                eyebrow="Applicants"
                title={job?.title || 'Applicants'}
                subtitle="Academic details below are the snapshot taken when the student applied, not their current profile."
                actions={
                    <>
                        {job && <StatusBadge status={job.status} />}
                        <Button as={Link} to={`/recruiter/jobs/${id}/edit`} variant="ghost" size="sm">
                            Edit posting
                        </Button>
                    </>
                }
            />

            <Tabs
                className="mb-6"
                value={filter}
                onChange={setFilter}
                tabs={[
                    { value: 'all', label: 'All', count: counts.all },
                    ...APPLICATION_STATUSES
                        .filter(s => counts[s] > 0 || ['applied', 'shortlisted', 'interview'].includes(s))
                        .map(s => ({ value: s, label: s[0].toUpperCase() + s.slice(1), count: counts[s] })),
                ]}
            />

            {visible.length === 0 ? (
                <EmptyState
                    icon={<IconUsers className="size-6" />}
                    title={applications.length === 0 ? 'No applicants yet' : 'Nobody in this stage'}
                    description={applications.length === 0
                        ? job?.status === 'draft'
                            ? 'This posting is still a draft — publish it for students to see and apply.'
                            : 'Eligible students will show up here as soon as they apply.'
                        : 'Switch tabs to see applicants in other stages.'}
                />
            ) : (
                <div className="space-y-3">
                    {visible.map((app, i) => {
                        const student = app.student || {}
                        const next = RECRUITER_NEXT[app.status] || []
                        const snap = app.eligibilitySnapshot || {}

                        return (
                            <Card key={app._id} className="animate-rise stagger p-5" style={{ '--i': i }}>
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex min-w-0 gap-4">
                                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/22 to-violet-500/8 text-[13px] font-semibold text-indigo-200 ring-1 ring-inset ring-white/10">
                                            {initials(student)}
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="text-[15px] font-semibold text-white">
                                                {student.firstName} {student.lastName}
                                            </h3>
                                            <a href={`mailto:${student.email}`}
                                                className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline">
                                                <IconMail className="size-3.5" /> {student.email}
                                            </a>
                                            <p className="mt-1 text-[11.5px] text-slate-600">
                                                Applied {timeAgo(app.createdAt)} · {formatDate(app.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge status={app.status} />
                                </div>

                                {/* snapshot strip */}
                                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                    {[
                                        ['CGPA', snap.cgpa ?? student.cgpa ?? '—'],
                                        ['Branch', snap.branch || student.branch || '—'],
                                        ['Batch', snap.graduationYear ?? student.graduationYear ?? '—'],
                                        ['College', student.college || '—'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5">
                                            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600">{k}</p>
                                            <p className="mt-1 truncate text-[13.5px] font-medium text-slate-200">{v}</p>
                                        </div>
                                    ))}
                                </div>

                                {student.skills?.length > 0 && (
                                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                                        {student.skills.map(skill => {
                                            const wanted = job?.requiredSkills?.some(
                                                r => r.toLowerCase() === skill.toLowerCase())
                                            return (
                                                <span key={skill} className={cx(
                                                    'rounded-md px-2 py-1 text-[11px] ring-1 ring-inset',
                                                    wanted
                                                        ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/22'
                                                        : 'bg-white/[0.04] text-slate-400 ring-white/8'
                                                )}>
                                                    {skill}
                                                </span>
                                            )
                                        })}
                                    </div>
                                )}

                                <Pipeline status={app.status} viewer="recruiter" className="mt-5" />

                                <div className="mt-5 flex flex-wrap items-center gap-2">
                                    {student.resumeUrl && (
                                        <Button as="a" href={student.resumeUrl} target="_blank" rel="noreferrer noopener"
                                            variant="outline" size="sm">
                                            <IconLink className="size-3.5" /> Resume
                                        </Button>
                                    )}
                                    <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                                        {next.length === 0 ? (
                                            <span className="text-[12px] text-slate-600">
                                                No further action available
                                            </span>
                                        ) : next.map(status => {
                                            const meta = ACTION_LABEL[status]
                                            const Icon = meta.icon
                                            return (
                                                <Button key={status} variant={meta.variant} size="sm"
                                                    onClick={() => { setPending({ application: app, status }); setReason('') }}>
                                                    <Icon className="size-3.5" /> {meta.label}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Modal
                open={Boolean(pending)}
                onClose={() => setPending(null)}
                title={pending ? `${ACTION_LABEL[pending.status]?.label} ${pending.application.student?.firstName}?` : ''}
                description={pending
                    ? `Their application moves from "${pending.application.status}" to "${pending.status}". The student is notified and the change is written to the audit trail.`
                    : ''}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
                        <Button variant={pending ? ACTION_LABEL[pending.status]?.variant : 'accent'}
                            loading={busy} onClick={changeStatus}>
                            Confirm
                        </Button>
                    </>
                }
            >
                <Field label="Note for the student" hint="Optional — included in their notification and the audit log.">
                    <Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
                        placeholder="Strong systems fundamentals — inviting to the technical round." />
                </Field>
            </Modal>
        </>
    )
}
