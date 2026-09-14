import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import {
    Badge, Card, EmptyState, Input, PageHeader, Skeleton, StatusBadge, Tabs
} from '../../components/ui'
import { IconBriefcase, IconSearch, IconUsers, IconClock, IconPin } from '../../components/icons'
import { companyOf, formatDate, relativeDeadline } from '../../lib/format'

export default function AdminJobs() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('all')
    const [query, setQuery] = useState('')

    useEffect(() => {
        api.get('/admin/jobs')
            .then(({ data }) => setJobs(data))
            .catch(err => toast.error(errorMessage(err, 'Could not load jobs')))
            .finally(() => setLoading(false))
    }, [])

    const counts = useMemo(() => ({
        all: jobs.length,
        draft: jobs.filter(j => j.status === 'draft').length,
        published: jobs.filter(j => j.status === 'published').length,
        closed: jobs.filter(j => j.status === 'closed').length,
    }), [jobs])

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        return jobs.filter(j => {
            if (tab !== 'all' && j.status !== tab) return false
            if (!q) return true
            return [j.title, j.description, j.location, j.postedBy?.companyName, j.postedBy?.email]
                .filter(Boolean).join(' ').toLowerCase().includes(q)
        })
    }, [jobs, tab, query])

    return (
        <>
            <PageHeader
                eyebrow="Placement cell"
                title="All jobs"
                subtitle="Every posting on CampusHire, including drafts that students cannot see."
                actions={
                    <div className="relative w-full sm:w-72">
                        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                        <Input className="pl-9" placeholder="Search title, company"
                            value={query} onChange={e => setQuery(e.target.value)} />
                    </div>
                }
            />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <Tabs value={tab} onChange={setTab} tabs={[
                    { value: 'all', label: 'All', count: counts.all },
                    { value: 'published', label: 'Live', count: counts.published },
                    { value: 'draft', label: 'Drafts', count: counts.draft },
                    { value: 'closed', label: 'Closed', count: counts.closed },
                ]} />
                {!loading && <Badge tone="neutral">{visible.length} shown</Badge>}
            </div>

            {loading ? (
                <div className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
            ) : visible.length === 0 ? (
                <EmptyState icon={<IconBriefcase className="size-6" />} title="No jobs match"
                    description="Try a different search term or switch tabs." />
            ) : (
                <div className="space-y-2.5">
                    {visible.map((job, i) => {
                        const deadline = relativeDeadline(job.applicationDeadline)
                        return (
                            <Card key={job._id} hover className="animate-rise stagger p-5" style={{ '--i': i }}>
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            {job.status === 'published' ? (
                                                <Link to={`/jobs/${job._id}`}
                                                    className="text-[15px] font-semibold text-white transition-colors hover:text-indigo-200">
                                                    {job.title}
                                                </Link>
                                            ) : (
                                                <span className="text-[15px] font-semibold text-white">{job.title}</span>
                                            )}
                                            <StatusBadge status={job.status} />
                                        </div>
                                        <p className="mt-1 text-[12.5px] text-slate-500">
                                            {companyOf(job)}
                                            {job.postedBy?.email && <span className="text-slate-600"> · {job.postedBy.email}</span>}
                                        </p>
                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-slate-600">
                                            {job.location && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <IconPin className="size-3.5" />{job.location}
                                                </span>
                                            )}
                                            {job.eligibility?.minCGPA > 0 && <span>CGPA ≥ {job.eligibility.minCGPA}</span>}
                                            {job.eligibility?.allowedBranches?.length > 0 &&
                                                <span>{job.eligibility.allowedBranches.join(' · ')}</span>}
                                            {job.eligibility?.graduationYear && <span>Batch {job.eligibility.graduationYear}</span>}
                                            {deadline && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <IconClock className="size-3.5" />{deadline.label}
                                                </span>
                                            )}
                                            <span>Posted {formatDate(job.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2 rounded-xl bg-white/[0.04] px-3.5 py-2 ring-1 ring-inset ring-white/8">
                                        <IconUsers className="size-4 text-indigo-300" />
                                        <span className="text-[13px] font-semibold tabular-nums text-white">
                                            {job.applicantCount}
                                        </span>
                                        <span className="text-[12px] text-slate-500">
                                            applicant{job.applicantCount === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </>
    )
}
