import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import { Card, PageHeader, Skeleton, Stat, cx } from '../../components/ui'
import {
    IconUsers, IconBriefcase, IconFile, IconShield, IconGrad,
    IconArrowRight, IconChart
} from '../../components/icons'
import { APPLICATION_STATUSES } from '../../lib/format'

const BAR_COLOR = {
    applied: 'bg-sky-400', shortlisted: 'bg-indigo-400', interview: 'bg-violet-400',
    selected: 'bg-emerald-400', rejected: 'bg-rose-400', withdrawn: 'bg-slate-500',
}

const SHORTCUTS = [
    { to: '/admin/recruiters', label: 'Verify recruiters', body: 'Approve or reject companies waiting to post', icon: IconShield },
    { to: '/admin/users', label: 'Manage users', body: 'Deactivate or restore any account', icon: IconUsers },
    { to: '/admin/jobs', label: 'All jobs', body: 'Every posting, draft through closed', icon: IconBriefcase },
    { to: '/admin/applications', label: 'All applications', body: 'Full pipeline with audit trails', icon: IconFile },
]

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/admin/stats')
            .then(({ data }) => setStats(data))
            .catch(err => toast.error(errorMessage(err, 'Could not load the overview')))
            .finally(() => setLoading(false))
    }, [])

    const byStatus = stats?.applicationsByStatus || {}
    // bars are a share of every application, so widths compare honestly
    const total = Math.max(1, stats?.applications || 0)

    return (
        <>
            <PageHeader
                eyebrow="Placement cell"
                title="Overview"
                subtitle="The state of the placement cycle across every student, recruiter and role."
            />

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Stat label="Students" value={stats.students} tone="indigo" icon={<IconGrad className="size-5" />} />
                        <Stat label="Recruiters" value={stats.recruiters} tone="violet"
                            hint={stats.pendingRecruiters > 0 ? `${stats.pendingRecruiters} awaiting verification` : 'All verified'}
                            icon={<IconUsers className="size-5" />} />
                        <Stat label="Jobs posted" value={stats.jobs} tone="sky"
                            hint={`${stats.publishedJobs} live`} icon={<IconBriefcase className="size-5" />} />
                        <Stat label="Applications" value={stats.applications} tone="amber"
                            hint={`${stats.selected} offers made`} icon={<IconFile className="size-5" />} />
                    </div>

                    {stats.pendingRecruiters > 0 && (
                        <Link to="/admin/recruiters" className="mt-5 block">
                            <Card hover className="animate-rise flex items-center gap-4 border-amber-400/22 bg-amber-400/[0.05] p-5">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-400/12 text-amber-300 ring-1 ring-inset ring-amber-400/25">
                                    <IconShield className="size-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[14px] font-medium text-amber-100">
                                        {stats.pendingRecruiters} recruiter{stats.pendingRecruiters === 1 ? '' : 's'} awaiting verification
                                    </p>
                                    <p className="mt-0.5 text-[12.5px] text-amber-200/70">
                                        They cannot post a single job until you review them.
                                    </p>
                                </div>
                                <IconArrowRight className="ml-auto size-4 shrink-0 text-amber-300" />
                            </Card>
                        </Link>
                    )}

                    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <Card className="animate-rise p-6">
                            <div className="flex items-center gap-2.5">
                                <IconChart className="size-4 text-slate-500" />
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Applications by stage
                                </h2>
                            </div>

                            {stats.applications === 0 ? (
                                <p className="mt-5 text-[13.5px] text-slate-500">
                                    No applications have been submitted yet.
                                </p>
                            ) : (
                                <div className="mt-6 space-y-4">
                                    {APPLICATION_STATUSES.map(status => {
                                        const count = byStatus[status] || 0
                                        const pct = Math.round((count / total) * 100)
                                        return (
                                            <div key={status}>
                                                <div className="flex items-baseline justify-between gap-3">
                                                    <span className="text-[13px] capitalize text-slate-300">{status}</span>
                                                    <span className="text-[13px] font-semibold tabular-nums text-white">{count}</span>
                                                </div>
                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                                    <div
                                                        className={cx('h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]', BAR_COLOR[status])}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </Card>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            {SHORTCUTS.map(({ to, label, body, icon: Icon }, i) => (
                                <Link key={to} to={to} className="group block">
                                    <Card hover className="animate-rise stagger flex items-center gap-3.5 p-4" style={{ '--i': i }}>
                                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-slate-400 ring-1 ring-inset ring-white/8 transition-colors group-hover:text-indigo-300">
                                            <Icon className="size-[17px]" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-[13.5px] font-medium text-slate-100">{label}</p>
                                            <p className="truncate text-[11.5px] text-slate-500">{body}</p>
                                        </div>
                                        <IconArrowRight className="ml-auto size-4 shrink-0 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-400" />
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
