import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import {
    Badge, Button, Card, EmptyState, Modal, PageHeader, Skeleton,
    Stat, StatusBadge, Tabs, cx
} from '../../components/ui'
import {
    IconBriefcase, IconPlus, IconUsers, IconEdit, IconTrash,
    IconSend, IconX, IconClock, IconPin, IconChart
} from '../../components/icons'
import { formatDate, relativeDeadline } from '../../lib/format'

export default function RecruiterDashboard() {
    const { user } = useAuth()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [confirm, setConfirm] = useState(null)   // { job, action }
    const [busy, setBusy] = useState(false)

    const load = () =>
        api.get('/jobs/my-jobs')
            .then(({ data }) => setJobs(data))
            .catch(err => toast.error(errorMessage(err, 'Could not load your postings')))
            .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    const counts = useMemo(() => ({
        all: jobs.length,
        draft: jobs.filter(j => j.status === 'draft').length,
        published: jobs.filter(j => j.status === 'published').length,
        closed: jobs.filter(j => j.status === 'closed').length,
        applicants: jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0),
    }), [jobs])

    const visible = filter === 'all' ? jobs : jobs.filter(j => j.status === filter)

    const run = async () => {
        const { job, action } = confirm
        setBusy(true)
        try {
            if (action === 'delete') {
                await api.delete(`/jobs/${job._id}`)
                toast.success('Posting deleted')
            } else {
                await api.put(`/jobs/${job._id}/${action}`)
                toast.success(action === 'publish' ? 'Job is now live' : 'Job closed')
            }
            setConfirm(null)
            await load()
        } catch (err) {
            toast.error(errorMessage(err, 'Could not complete that'))
        } finally {
            setBusy(false)
        }
    }

    const unverified = user?.verificationStatus !== 'verified'

    const COPY = {
        publish: { title: 'Publish this job?', body: 'It becomes visible to every eligible student immediately and starts accepting applications.', cta: 'Publish', variant: 'primary' },
        close: { title: 'Close this job?', body: 'No new applications will be accepted. Existing applicants stay in your pipeline and can still be moved along.', cta: 'Close job', variant: 'danger' },
        delete: { title: 'Delete this job?', body: 'The posting and every application attached to it are permanently removed. This cannot be undone.', cta: 'Delete permanently', variant: 'danger' },
    }[confirm?.action] || {}

    return (
        <>
            <PageHeader
                eyebrow="Recruiter"
                title="Your job postings"
                subtitle={user?.companyName
                    ? `Everything ${user.companyName} has posted on CampusHire.`
                    : 'Create, publish and manage the roles you are hiring for.'}
                actions={
                    <Button as={Link} to="/recruiter/jobs/new" variant="primary" disabled={unverified}>
                        <IconPlus className="size-4" /> Post a job
                    </Button>
                }
            />

            {unverified && (
                <Card className="animate-rise mb-6 border-amber-200 bg-amber-50 p-4">
                    <p className="text-[13.5px] leading-relaxed text-amber-700">
                        {user?.verificationStatus === 'rejected'
                            ? 'The placement cell rejected your recruiter account, so posting is disabled. Contact them to appeal.'
                            : 'Your recruiter account is awaiting verification by the placement cell. You can post jobs as soon as it is approved.'}
                    </p>
                </Card>
            )}

            <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Total postings" value={counts.all} tone="indigo" icon={<IconBriefcase className="size-5" />} />
                <Stat label="Live now" value={counts.published} tone="emerald" hint="Visible to students" icon={<IconSend className="size-5" />} />
                <Stat label="Drafts" value={counts.draft} tone="amber" hint="Not yet published" icon={<IconEdit className="size-5" />} />
                <Stat label="Total applicants" value={counts.applicants} tone="violet" icon={<IconUsers className="size-5" />} />
            </div>

            <Tabs
                className="mb-6 max-w-md"
                value={filter}
                onChange={setFilter}
                tabs={[
                    { value: 'all', label: 'All', count: counts.all },
                    { value: 'published', label: 'Live', count: counts.published },
                    { value: 'draft', label: 'Drafts', count: counts.draft },
                    { value: 'closed', label: 'Closed', count: counts.closed },
                ]}
            />

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
                </div>
            ) : visible.length === 0 ? (
                <EmptyState
                    icon={<IconBriefcase className="size-6" />}
                    title={jobs.length === 0 ? 'No postings yet' : 'Nothing in this view'}
                    description={jobs.length === 0
                        ? 'Create your first role — set the eligibility bar and publish when you are ready.'
                        : 'Switch tabs to see your other postings.'}
                    action={jobs.length === 0 && !unverified && (
                        <Button as={Link} to="/recruiter/jobs/new" variant="primary">
                            <IconPlus className="size-4" /> Post a job
                        </Button>
                    )}
                />
            ) : (
                <div className="space-y-3">
                    {visible.map((job, i) => {
                        const deadline = relativeDeadline(job.applicationDeadline)
                        return (
                            <Card key={job._id} hover className="animate-rise stagger p-5" style={{ '--i': i }}>
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h3 className="text-[15.5px] font-semibold text-slate-900">{job.title}</h3>
                                            <StatusBadge status={job.status} />
                                        </div>
                                        <p className="mt-1.5 line-clamp-1 text-[13px] text-slate-500">{job.description}</p>

                                        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-slate-500">
                                            {job.location && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <IconPin className="size-3.5" />{job.location}
                                                </span>
                                            )}
                                            {job.eligibility?.minCGPA > 0 && (
                                                <span className="tabular-nums">CGPA ≥ {job.eligibility.minCGPA}</span>
                                            )}
                                            {job.eligibility?.allowedBranches?.length > 0 && (
                                                <span>{job.eligibility.allowedBranches.join(' · ')}</span>
                                            )}
                                            {deadline && (
                                                <span className={cx('inline-flex items-center gap-1.5', deadline.urgent && 'text-amber-600')}>
                                                    <IconClock className="size-3.5" />{deadline.label}
                                                </span>
                                            )}
                                            <span className="text-slate-400">Posted {formatDate(job.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-3">
                                        <Link to={`/recruiter/jobs/${job._id}/applicants`}
                                            className="group flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-100">
                                            <IconUsers className="size-4 text-indigo-600" />
                                            <span className="text-[13px] font-semibold tabular-nums text-slate-900">
                                                {job.applicantCount}
                                            </span>
                                            <span className="text-[12px] text-slate-500">
                                                applicant{job.applicantCount === 1 ? '' : 's'}
                                            </span>
                                        </Link>

                                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                                            {job.status === 'draft' && (
                                                <Button variant="primary" size="xs"
                                                    onClick={() => setConfirm({ job, action: 'publish' })}>
                                                    <IconSend className="size-3" /> Publish
                                                </Button>
                                            )}
                                            {job.status === 'published' && (
                                                <Button variant="ghost" size="xs"
                                                    onClick={() => setConfirm({ job, action: 'close' })}>
                                                    <IconX className="size-3" /> Close
                                                </Button>
                                            )}
                                            <Button as={Link} to={`/recruiter/jobs/${job._id}/edit`} variant="ghost" size="xs">
                                                <IconEdit className="size-3" /> Edit
                                            </Button>
                                            <Button variant="danger" size="xs"
                                                onClick={() => setConfirm({ job, action: 'delete' })}>
                                                <IconTrash className="size-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Modal
                open={Boolean(confirm)}
                onClose={() => setConfirm(null)}
                title={COPY.title}
                description={`${COPY.body}${confirm ? `\n` : ''}`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
                        <Button variant={COPY.variant} loading={busy} onClick={run}>{COPY.cta}</Button>
                    </>
                }
            >
                {confirm && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <IconChart className="size-4 text-slate-500" />
                        <div className="min-w-0">
                            <p className="truncate text-[13.5px] font-medium text-slate-900">{confirm.job.title}</p>
                            <p className="text-[12px] text-slate-500">
                                {confirm.job.applicantCount} applicant{confirm.job.applicantCount === 1 ? '' : 's'}
                            </p>
                        </div>
                        <Badge tone="neutral" className="ml-auto capitalize">{confirm.job.status}</Badge>
                    </div>
                )}
            </Modal>
        </>
    )
}
