import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import Pipeline from '../../components/Pipeline'
import {
    Button, Card, EmptyState, Modal, PageHeader, Skeleton, StatusBadge, Tabs
} from '../../components/ui'
import { IconFile, IconHistory, IconArrowRight, IconX } from '../../components/icons'
import { companyOf, formatDateTime, timeAgo } from '../../lib/format'

export default function MyApplications() {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('active')
    const [expanded, setExpanded] = useState(null)
    const [withdrawing, setWithdrawing] = useState(null)
    const [busy, setBusy] = useState(false)

    const load = () =>
        api.get('/applications/my-applications')
            .then(({ data }) => setApplications(data))
            .catch(err => toast.error(errorMessage(err, 'Could not load your applications')))
            .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    const counts = useMemo(() => ({
        active: applications.filter(a => ['applied', 'shortlisted', 'interview'].includes(a.status)).length,
        selected: applications.filter(a => a.status === 'selected').length,
        closed: applications.filter(a => ['rejected', 'withdrawn'].includes(a.status)).length,
        all: applications.length,
    }), [applications])

    const visible = useMemo(() => applications.filter(a => {
        if (filter === 'active') return ['applied', 'shortlisted', 'interview'].includes(a.status)
        if (filter === 'selected') return a.status === 'selected'
        if (filter === 'closed') return ['rejected', 'withdrawn'].includes(a.status)
        return true
    }), [applications, filter])

    const withdraw = async () => {
        setBusy(true)
        try {
            await api.put(`/applications/${withdrawing._id}/withdraw`)
            toast.success('Application withdrawn')
            setWithdrawing(null)
            await load()
        } catch (err) {
            toast.error(errorMessage(err, 'Could not withdraw'))
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <PageHeader
                eyebrow="Your pipeline"
                title="My applications"
                subtitle="Every role you have applied to, with its current stage and the full history behind it."
            />

            <Tabs
                className="mb-6 max-w-md"
                value={filter}
                onChange={setFilter}
                tabs={[
                    { value: 'active', label: 'In progress', count: counts.active },
                    { value: 'selected', label: 'Selected', count: counts.selected },
                    { value: 'closed', label: 'Closed', count: counts.closed },
                    { value: 'all', label: 'All', count: counts.all },
                ]}
            />

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
                </div>
            ) : visible.length === 0 ? (
                <EmptyState
                    icon={<IconFile className="size-6" />}
                    title={applications.length === 0 ? 'No applications yet' : 'Nothing in this view'}
                    description={applications.length === 0
                        ? 'Browse the job board and apply to the roles you are eligible for.'
                        : 'Switch tabs to see your other applications.'}
                    action={applications.length === 0 && (
                        <Button as={Link} to="/dashboard" variant="primary">
                            Browse jobs <IconArrowRight className="size-4" />
                        </Button>
                    )}
                />
            ) : (
                <div className="space-y-3">
                    {visible.map((app, i) => {
                        const open = expanded === app._id
                        const canWithdraw = ['applied', 'shortlisted'].includes(app.status)
                        return (
                            <Card key={app._id} className="animate-rise stagger overflow-hidden" style={{ '--i': i }}>
                                <div className="p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <Link to={`/jobs/${app.job?._id}`}
                                                className="text-[15.5px] font-semibold text-slate-900 transition-colors hover:text-indigo-700">
                                                {app.job?.title || 'Role removed'}
                                            </Link>
                                            <p className="mt-1 text-[12.5px] text-slate-500">
                                                {app.job ? companyOf(app.job) : '—'} · applied {timeAgo(app.createdAt)}
                                            </p>
                                        </div>
                                        <StatusBadge status={app.status} />
                                    </div>

                                    <Pipeline status={app.status} className="mt-6" />

                                    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-500">
                                        <span>Snapshot at apply time:</span>
                                        <span className="tabular-nums text-slate-500">
                                            CGPA {app.eligibilitySnapshot?.cgpa ?? '—'}
                                        </span>
                                        <span className="text-slate-500">{app.eligibilitySnapshot?.branch || '—'}</span>
                                        <span className="tabular-nums text-slate-500">
                                            Batch {app.eligibilitySnapshot?.graduationYear ?? '—'}
                                        </span>

                                        <div className="ml-auto flex items-center gap-2">
                                            <Button variant="subtle" size="xs"
                                                onClick={() => setExpanded(open ? null : app._id)}>
                                                <IconHistory className="size-3.5" />
                                                {open ? 'Hide history' : `History (${app.history?.length || 0})`}
                                            </Button>
                                            {canWithdraw && (
                                                <Button variant="danger" size="xs" onClick={() => setWithdrawing(app)}>
                                                    <IconX className="size-3" /> Withdraw
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {open && (
                                    <div className="animate-fade border-t border-white/[0.07] bg-white/[0.015] p-5">
                                        <ol className="relative space-y-4 pl-5">
                                            <span className="absolute left-[3px] top-2 bottom-2 w-px bg-white/10" />
                                            <li className="relative">
                                                <span className="absolute -left-5 top-1.5 size-[7px] rounded-full bg-sky-400 ring-4 ring-sky-400/12" />
                                                <p className="text-[13px] text-slate-400">
                                                    Application submitted
                                                </p>
                                                <p className="mt-0.5 text-[11.5px] text-slate-400">
                                                    {formatDateTime(app.createdAt)}
                                                </p>
                                            </li>
                                            {(app.history || []).map(log => (
                                                <li key={log._id} className="relative">
                                                    <span className="absolute -left-5 top-1.5 size-[7px] rounded-full bg-brand-500 ring-4 ring-indigo-400/12" />
                                                    <p className="text-[13px] text-slate-400">
                                                        <span className="capitalize">{log.oldStatus}</span>
                                                        {' → '}
                                                        <span className="font-medium capitalize text-slate-900">{log.newStatus}</span>
                                                        <span className="text-slate-500"> by the {log.changedByRole}</span>
                                                    </p>
                                                    {log.reason && (
                                                        <p className="mt-1 text-[12.5px] italic text-slate-500">“{log.reason}”</p>
                                                    )}
                                                    <p className="mt-0.5 text-[11.5px] text-slate-400">
                                                        {formatDateTime(log.createdAt)}
                                                    </p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            )}

            <Modal
                open={Boolean(withdrawing)}
                onClose={() => setWithdrawing(null)}
                title="Withdraw this application?"
                description={`Your application for "${withdrawing?.job?.title}" will be closed and the recruiter notified. You cannot re-apply to this role afterwards.`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setWithdrawing(null)}>Keep it</Button>
                        <Button variant="danger" loading={busy} onClick={withdraw}>
                            {busy ? 'Withdrawing' : 'Yes, withdraw'}
                        </Button>
                    </>
                }
            />
        </>
    )
}
