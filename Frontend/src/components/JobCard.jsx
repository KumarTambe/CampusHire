import { Link } from 'react-router-dom'
import { Badge, Card, StatusBadge } from './ui'
import { IconClock, IconPin } from './icons'
import { companyOf, relativeDeadline } from '../lib/format'

/** The job board tile. Eligibility signals live in the top-right corner. */
export default function JobCard({ job }) {
    const deadline = relativeDeadline(job.applicationDeadline)
    const showEligibility = job.isEligible !== undefined
    const company = companyOf(job)

    return (
        <Link to={`/jobs/${job._id}`} className="group block">
            <Card hover className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-zinc-200 bg-zinc-50 text-[15px] font-semibold text-zinc-700">
                            {company?.[0]?.toUpperCase() || '·'}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-[13px] text-zinc-500">{company}</p>
                            <h3 className="line-clamp-2 text-[15.5px] font-semibold leading-snug text-zinc-900 group-hover:underline group-hover:decoration-zinc-300 group-hover:underline-offset-4">
                                {job.title}
                            </h3>
                        </div>
                    </div>

                    {showEligibility && (
                        job.alreadyApplied
                            ? <StatusBadge status={job.applicationStatus || 'applied'} />
                            : job.isEligible
                                ? <Badge tone="emerald" dot>Eligible</Badge>
                                : <Badge tone="rose" dot>Not eligible</Badge>
                    )}
                    {!showEligibility && job.status && <StatusBadge status={job.status} />}
                </div>

                <p className="mt-3.5 line-clamp-2 text-[13.5px] leading-relaxed text-zinc-600">
                    {job.description}
                </p>

                {job.requiredSkills?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {job.requiredSkills.slice(0, 4).map(skill => (
                            <span key={skill}
                                className="rounded border border-zinc-200 px-1.5 py-0.5 text-[11.5px] text-zinc-600">
                                {skill}
                            </span>
                        ))}
                        {job.requiredSkills.length > 4 && (
                            <span className="px-1 py-0.5 text-[11.5px] text-zinc-400">
                                +{job.requiredSkills.length - 4}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto pt-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-3.5 text-[12.5px] text-zinc-500">
                    {job.location && (
                        <span className="inline-flex items-center gap-1.5">
                            <IconPin className="size-3.5" />{job.location}
                        </span>
                    )}
                    {job.eligibility?.minCGPA > 0 && (
                        <span className="tabular-nums">CGPA ≥ {job.eligibility.minCGPA}</span>
                    )}
                    {deadline && (
                        <span className={`inline-flex items-center gap-1.5 ${deadline.urgent ? 'font-medium text-amber-700' : ''}`}>
                            <IconClock className="size-3.5" />{deadline.label}
                        </span>
                    )}
                </div>
                </div>
            </Card>
        </Link>
    )
}
