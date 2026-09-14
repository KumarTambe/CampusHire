import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import JobCard from '../../components/JobCard'
import { Card, EmptyState, Input, PageHeader, Skeleton, Tabs, Badge } from '../../components/ui'
import { IconCompass, IconSearch } from '../../components/icons'
import { Link } from 'react-router-dom'

const FILTERS = [
    { value: 'all', label: 'All roles' },
    { value: 'eligible', label: 'Eligible' },
    { value: 'applied', label: 'Applied' },
    { value: 'ineligible', label: 'Not eligible' },
]

export default function StudentDashboard() {
    const { user } = useAuth()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        let alive = true
        api.get('/jobs')
            .then(({ data }) => alive && setJobs(data))
            .catch(err => toast.error(errorMessage(err, 'Could not load jobs')))
            .finally(() => alive && setLoading(false))
        return () => { alive = false }
    }, [])

    const counts = useMemo(() => ({
        all: jobs.length,
        eligible: jobs.filter(j => j.isEligible && !j.alreadyApplied).length,
        applied: jobs.filter(j => j.alreadyApplied).length,
        ineligible: jobs.filter(j => !j.isEligible).length,
    }), [jobs])

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        return jobs.filter(job => {
            if (filter === 'eligible' && (!job.isEligible || job.alreadyApplied)) return false
            if (filter === 'applied' && !job.alreadyApplied) return false
            if (filter === 'ineligible' && job.isEligible) return false
            if (!q) return true
            return [job.title, job.description, job.location, job.postedBy?.companyName,
            ...(job.requiredSkills || [])]
                .filter(Boolean).join(' ').toLowerCase().includes(q)
        })
    }, [jobs, filter, query])

    // an incomplete profile silently breaks eligibility, so surface it up top
    const missing = ['cgpa', 'branch', 'graduationYear']
        .filter(k => user?.[k] === undefined || user?.[k] === null || user?.[k] === '')

    return (
        <>
            <PageHeader
                eyebrow="Job board"
                title={`Hello, ${user?.firstName}`}
                subtitle="Every posting below is checked against your CGPA, branch and graduation year before it reaches you."
                actions={
                    <div className="relative w-full sm:w-72">
                        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                        <Input className="pl-9" placeholder="Search roles, skills, companies"
                            value={query} onChange={e => setQuery(e.target.value)} />
                    </div>
                }
            />

            {missing.length > 0 && (
                <Card className="animate-rise mb-6 flex flex-col gap-3 border-amber-400/20 bg-amber-400/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13.5px] leading-relaxed text-amber-200/90">
                        Your profile is missing <strong className="font-semibold">{missing.join(', ')}</strong>.
                        Jobs that filter on those fields will show as ineligible until you add them.
                    </p>
                    <Link to="/profile"
                        className="shrink-0 text-[13px] font-medium text-amber-300 underline-offset-4 hover:underline">
                        Complete profile →
                    </Link>
                </Card>
            )}

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <Tabs tabs={FILTERS.map(f => ({ ...f, count: counts[f.value] }))} value={filter} onChange={setFilter} />
                {!loading && <Badge tone="neutral">{visible.length} shown</Badge>}
            </div>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
                </div>
            ) : visible.length === 0 ? (
                <EmptyState
                    icon={<IconCompass className="size-6" />}
                    title={jobs.length === 0 ? 'No published jobs yet' : 'Nothing matches that filter'}
                    description={jobs.length === 0
                        ? 'Recruiters have not published any roles yet. Check back shortly.'
                        : 'Try a different search term or switch filters.'}
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
                </div>
            )}
        </>
    )
}
