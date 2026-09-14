import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import {
    Badge, Button, Card, EmptyState, Input, PageHeader, Skeleton, StatusBadge, Tabs
} from '../../components/ui'
import { IconFile, IconSearch, IconHistory } from '../../components/icons'
import { APPLICATION_STATUSES, formatDateTime, timeAgo } from '../../lib/format'

export default function AdminApplications() {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('all')
    const [query, setQuery] = useState('')
    const [expanded, setExpanded] = useState(null)

    useEffect(() => {
        api.get('/admin/applications')
            .then(({ data }) => setApplications(data))
            .catch(err => toast.error(errorMessage(err, 'Could not load applications')))
            .finally(() => setLoading(false))
    }, [])

    const counts = useMemo(() => {
        const base = { all: applications.length }
        for (const s of APPLICATION_STATUSES) base[s] = applications.filter(a => a.status === s).length
        return base
    }, [applications])

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        return applications.filter(a => {
            if (tab !== 'all' && a.status !== tab) return false
            if (!q) return true
            return [
                a.student?.firstName, a.student?.lastName, a.student?.email,
                a.job?.title, a.job?.postedBy?.companyName,
            ].filter(Boolean).join(' ').toLowerCase().includes(q)
        })
    }, [applications, tab, query])

    return (
        <>
            <PageHeader
                eyebrow="Placement cell"
                title="All applications"
                subtitle="Every application across the portal, each with the complete audit trail of who changed what, and why."
                actions={
                    <div className="relative w-full sm:w-72">
                        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                        <Input className="pl-9" placeholder="Search student, role, company"
                            value={query} onChange={e => setQuery(e.target.value)} />
                    </div>
                }
            />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <Tabs value={tab} onChange={setTab} tabs={[
                    { value: 'all', label: 'All', count: counts.all },
                    ...APPLICATION_STATUSES.map(s => ({
                        value: s, label: s[0].toUpperCase() + s.slice(1), count: counts[s],
                    })),
                ]} />
                {!loading && <Badge tone="neutral">{visible.length} shown</Badge>}
            </div>

            {loading ? (
                <div className="space-y-2.5">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
            ) : visible.length === 0 ? (
                <EmptyState icon={<IconFile className="size-6" />} title="No applications match"
                    description="Try a different search term or switch tabs." />
            ) : (
                <div className="space-y-2.5">
                    {visible.map((app, i) => {
                        const open = expanded === app._id
                        const snap = app.eligibilitySnapshot || {}
                        return (
                            <Card key={app._id} className="animate-rise stagger overflow-hidden" style={{ '--i': i }}>
                                <div className="p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-[14.5px] font-medium text-white">
                                                {app.student?.firstName} {app.student?.lastName}
                                                <span className="text-slate-500"> → </span>
                                                <span className="text-slate-200">{app.job?.title || 'Deleted role'}</span>
                                            </p>
                                            <p className="mt-1 text-[12.5px] text-slate-500">
                                                {app.job?.postedBy?.companyName || '—'}
                                                <span className="text-slate-600"> · {app.student?.email}</span>
                                            </p>
                                            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-slate-600">
                                                <span className="tabular-nums">CGPA {snap.cgpa ?? '—'}</span>
                                                <span>{snap.branch || '—'}</span>
                                                <span className="tabular-nums">Batch {snap.graduationYear ?? '—'}</span>
                                                <span>Applied {timeAgo(app.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2.5">
                                            <StatusBadge status={app.status} />
                                            <Button variant="subtle" size="xs"
                                                onClick={() => setExpanded(open ? null : app._id)}>
                                                <IconHistory className="size-3.5" />
                                                {open ? 'Hide' : `Trail (${app.history?.length || 0})`}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {open && (
                                    <div className="animate-fade border-t border-white/[0.07] bg-white/[0.015] p-5">
                                        {(app.history || []).length === 0 ? (
                                            <p className="text-[12.5px] text-slate-500">
                                                No status changes yet — the application is still at “{app.status}”.
                                            </p>
                                        ) : (
                                            <ol className="relative space-y-4 pl-5">
                                                <span className="absolute left-[3px] top-2 bottom-2 w-px bg-white/10" />
                                                {app.history.map(log => (
                                                    <li key={log._id} className="relative">
                                                        <span className="absolute -left-5 top-1.5 size-[7px] rounded-full bg-indigo-400 ring-4 ring-indigo-400/12" />
                                                        <p className="text-[13px] text-slate-300">
                                                            <span className="capitalize">{log.oldStatus}</span>
                                                            {' → '}
                                                            <span className="font-medium capitalize text-white">{log.newStatus}</span>
                                                            {log.changedBy && (
                                                                <span className="text-slate-500">
                                                                    {' by '}{log.changedBy.firstName} {log.changedBy.lastName}
                                                                    {' ('}{log.changedByRole}{')'}
                                                                </span>
                                                            )}
                                                        </p>
                                                        {log.reason && (
                                                            <p className="mt-1 text-[12.5px] italic text-slate-400">“{log.reason}”</p>
                                                        )}
                                                        <p className="mt-0.5 font-mono text-[11px] text-slate-600">
                                                            {formatDateTime(log.createdAt)}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ol>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            )}
        </>
    )
}
