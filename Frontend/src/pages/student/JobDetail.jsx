import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import {
    Badge, Button, Card, PageLoader, StatusBadge, EmptyState, Modal, cx
} from '../../components/ui'
import {
    IconArrowLeft, IconBuilding, IconCheck, IconClock, IconLink,
    IconPin, IconSend, IconX, IconBriefcase, IconLock
} from '../../components/icons'
import { companyOf, formatDate, relativeDeadline } from '../../lib/format'

const Criterion = ({ met, label }) => (
    <li className="flex items-start gap-2.5 text-[13.5px] leading-relaxed">
        <span className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full ring-1 ring-inset ${met
            ? 'bg-emerald-500/12 text-emerald-400 ring-emerald-400/25'
            : 'bg-rose-500/12 text-rose-400 ring-rose-400/25'}`}>
            {met ? <IconCheck className="size-2.5" /> : <IconX className="size-2.5" />}
        </span>
        <span className={met ? 'text-slate-300' : 'text-slate-400'}>{label}</span>
    </li>
)

/**
 * Keyed on the job id so navigating between two jobs remounts the view —
 * that keeps the fetch effect free of any synchronous state reset.
 */
export default function JobDetail() {
    const { id } = useParams()
    return <JobDetailView key={id} id={id} />
}

function JobDetailView({ id }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [confirm, setConfirm] = useState(false)

    useEffect(() => {
        let alive = true
        api.get(`/jobs/${id}`)
            .then(({ data }) => alive && setJob(data))
            .catch(err => {
                toast.error(errorMessage(err, 'Could not load this job'))
                if (alive) setJob(null)
            })
            .finally(() => alive && setLoading(false))
        return () => { alive = false }
    }, [id])

    const apply = async () => {
        setApplying(true)
        try {
            await api.post(`/applications/${id}`)
            toast.success('Application submitted')
            setConfirm(false)
            const { data } = await api.get(`/jobs/${id}`)
            setJob(data)
        } catch (err) {
            toast.error(errorMessage(err, 'Could not submit your application'))
        } finally {
            setApplying(false)
        }
    }

    if (loading) return <PageLoader label="Loading role" />
    if (!job) return (
        <EmptyState
            icon={<IconBriefcase className="size-6" />}
            title="Job not found"
            description="This posting may have been removed, or it is not published yet."
            action={<Button variant="ghost" onClick={() => navigate(-1)}>Go back</Button>}
        />
    )

    const isStudent = user?.role === 'student'
    const deadline = relativeDeadline(job.applicationDeadline)
    const e = job.eligibility || {}

    // each criterion is evaluated locally purely for display — the server decides for real
    const criteria = []
    if (e.minCGPA > 0) criteria.push({
        met: user?.cgpa != null && user.cgpa >= e.minCGPA,
        label: `Minimum CGPA of ${e.minCGPA}${user?.cgpa != null ? ` — yours is ${user.cgpa}` : ' — not set on your profile'}`,
    })
    if (e.allowedBranches?.length) criteria.push({
        met: !!user?.branch && e.allowedBranches.map(b => b.toLowerCase()).includes(user.branch.toLowerCase()),
        label: `Open to ${e.allowedBranches.join(', ')}${user?.branch ? ` — you are ${user.branch}` : ''}`,
    })
    if (e.graduationYear) criteria.push({
        met: Number(user?.graduationYear) === Number(e.graduationYear),
        label: `Batch of ${e.graduationYear}${user?.graduationYear ? ` — you graduate in ${user.graduationYear}` : ''}`,
    })

    const blocked = job.alreadyApplied || !job.isEligible || job.deadlinePassed || job.status !== 'published'
    const blockedReason =
        job.alreadyApplied ? 'You have already applied to this role'
            : job.deadlinePassed ? 'The application deadline has passed'
                : job.status !== 'published' ? 'This role is not open for applications'
                    : !job.isEligible ? 'You do not meet the eligibility criteria'
                        : null

    return (
        <>
            <Button variant="subtle" size="sm" onClick={() => navigate(-1)} className="mb-6 -ml-2">
                <IconArrowLeft className="size-4" /> Back
            </Button>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* ------------------------------------------------------ main */}
                <div className="space-y-5">
                    <Card className="animate-rise p-6 sm:p-7">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-4">
                                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/8 text-indigo-300 ring-1 ring-inset ring-white/10">
                                    <IconBuilding className="size-5" />
                                </span>
                                <div className="min-w-0">
                                    <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[28px]">
                                        {job.title}
                                    </h1>
                                    <p className="mt-1.5 text-[14px] text-slate-400">{companyOf(job)}</p>
                                </div>
                            </div>
                            {isStudent && (
                                job.alreadyApplied
                                    ? <StatusBadge status={job.applicationStatus || 'applied'} />
                                    : <Badge tone={job.isEligible ? 'emerald' : 'rose'} dot>
                                        {job.isEligible ? 'You are eligible' : 'Not eligible'}
                                    </Badge>
                            )}
                            {!isStudent && job.status && <StatusBadge status={job.status} />}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-slate-500">
                            {job.location && <span className="inline-flex items-center gap-1.5"><IconPin className="size-3.5" />{job.location}</span>}
                            {job.jobType && <span className="capitalize">{job.jobType.replace('-', ' ')}</span>}
                            {job.salary && <span className="text-slate-400">{job.salary}</span>}
                            {deadline && (
                                <span className={`inline-flex items-center gap-1.5 ${deadline.urgent ? 'text-amber-400/90' : ''}`}>
                                    <IconClock className="size-3.5" />
                                    {deadline.label} · closes {formatDate(job.applicationDeadline)}
                                </span>
                            )}
                        </div>

                        <div className="hairline my-6" />

                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            About the role
                        </h2>
                        <p className="mt-3 whitespace-pre-line text-[14.5px] leading-[1.75] text-slate-300">
                            {job.description}
                        </p>

                        {job.requiredSkills?.length > 0 && (
                            <>
                                <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Skills they are looking for
                                </h2>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {job.requiredSkills.map(skill => {
                                        const has = user?.skills?.some(s => s.toLowerCase() === skill.toLowerCase())
                                        return (
                                            <span key={skill} className={`rounded-lg px-2.5 py-1.5 text-[12px] ring-1 ring-inset ${has
                                                ? 'bg-indigo-500/12 text-indigo-300 ring-indigo-400/25'
                                                : 'bg-white/[0.04] text-slate-400 ring-white/8'}`}>
                                                {skill}
                                            </span>
                                        )
                                    })}
                                </div>
                                {isStudent && (
                                    <p className="mt-2.5 text-[11.5px] text-slate-600">
                                        Highlighted skills are ones already on your profile.
                                    </p>
                                )}
                            </>
                        )}
                    </Card>

                    {job.postedBy?.companyDescription && (
                        <Card className="animate-rise p-6" style={{ animationDelay: '60ms' }}>
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                About {companyOf(job)}
                            </h2>
                            <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
                                {job.postedBy.companyDescription}
                            </p>
                            {job.postedBy.companyWebsite && (
                                <a href={job.postedBy.companyWebsite} target="_blank" rel="noreferrer noopener"
                                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-indigo-300 underline-offset-4 hover:underline">
                                    <IconLink className="size-3.5" /> {job.postedBy.companyWebsite}
                                </a>
                            )}
                        </Card>
                    )}
                </div>

                {/* --------------------------------------------------- sidebar */}
                <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                    <Card className="animate-rise p-6" style={{ animationDelay: '80ms' }}>
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Eligibility
                        </h2>

                        {criteria.length === 0 ? (
                            <p className="mt-3.5 text-[13.5px] leading-relaxed text-slate-400">
                                This role is open to every student — no CGPA, branch or batch restrictions.
                            </p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {criteria.map(c => <Criterion key={c.label} {...c} />)}
                            </ul>
                        )}

                        {isStudent && (
                            <>
                                <div className="hairline my-6" />
                                {blocked ? (
                                    <>
                                        <Button variant="ghost" size="lg" className="w-full" disabled>
                                            <IconLock className="size-4" />
                                            {job.alreadyApplied ? 'Already applied' : 'Cannot apply'}
                                        </Button>
                                        <p className="mt-3 text-center text-[12.5px] leading-relaxed text-slate-500">
                                            {blockedReason}
                                        </p>
                                        {job.alreadyApplied && (
                                            <Link to="/my-applications"
                                                className="mt-3 block text-center text-[13px] text-indigo-300 underline-offset-4 hover:underline">
                                                Track this application →
                                            </Link>
                                        )}
                                        {!job.isEligible && !job.alreadyApplied && job.ineligibilityReasons?.length > 0 && (
                                            <ul className="mt-4 space-y-1.5 rounded-xl border border-rose-500/15 bg-rose-500/[0.05] p-3.5">
                                                {job.ineligibilityReasons.map(r => (
                                                    <li key={r} className="text-[12.5px] leading-relaxed text-rose-200/80">• {r}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Button variant="primary" size="lg" className="w-full"
                                            onClick={() => setConfirm(true)}>
                                            <IconSend className="size-4" /> Apply now
                                        </Button>
                                        <p className="mt-3 text-center text-[12px] text-slate-500">
                                            Your CGPA, branch and batch are recorded with the application.
                                        </p>
                                    </>
                                )}
                            </>
                        )}
                    </Card>

                    <Card className="animate-rise p-6" style={{ animationDelay: '120ms' }}>
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            At a glance
                        </h2>
                        <dl className="mt-4 space-y-3 text-[13px]">
                            {[
                                ['Posted', formatDate(job.createdAt), false],
                                ['Deadline', formatDate(job.applicationDeadline), false],
                                ['Type', job.jobType ? job.jobType.replace('-', ' ') : '—', true],
                                ['Compensation', job.salary || '—', false],
                            ].map(([k, v, cap]) => (
                                <div key={k} className="flex items-baseline justify-between gap-4">
                                    <dt className="text-slate-500">{k}</dt>
                                    <dd className={cx('text-right text-slate-300', cap && 'capitalize')}>{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </Card>
                </div>
            </div>

            <Modal
                open={confirm}
                onClose={() => setConfirm(false)}
                title={`Apply to ${job.title}?`}
                description={`${companyOf(job)} will see your name, contact details and the academic snapshot below. This cannot be edited afterwards — you can only withdraw.`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button>
                        <Button variant="primary" loading={applying} onClick={apply}>
                            {applying ? 'Submitting' : 'Confirm application'}
                        </Button>
                    </>
                }
            >
                <div className="grid grid-cols-3 gap-3">
                    {[['CGPA', user?.cgpa ?? '—'], ['Branch', user?.branch || '—'], ['Batch', user?.graduationYear || '—']]
                        .map(([k, v]) => (
                            <div key={k} className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5 text-center">
                                <p className="text-[10.5px] uppercase tracking-[0.14em] text-slate-500">{k}</p>
                                <p className="mt-1.5 text-[16px] font-semibold text-white">{v}</p>
                            </div>
                        ))}
                </div>
            </Modal>
        </>
    )
}
