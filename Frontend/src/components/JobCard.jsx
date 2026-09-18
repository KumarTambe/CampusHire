import { Link } from 'react-router-dom'
import { Badge, Card, StatusBadge } from './ui'
import { IconClock, IconPin, IconArrowRight, IconBuilding } from './icons'
import { companyOf, relativeDeadline } from '../lib/format'

/** The job board tile. Eligibility signals live in the top-right corner. */
export default function JobCard({ job, index = 0 }) {
    const deadline = relativeDeadline(job.applicationDeadline)
    const showEligibility = job.isEligible !== undefined

    return (
        <Link to={`/jobs/${job._id}`} className="group block">
            <Card hover className="animate-rise stagger flex h-full flex-col p-5" style={{ '--i': index }}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                            <IconBuilding className="size-[18px]" />
                        </span>
                        <div className="min-w-0">
                            <h3 className="line-clamp-2 text-[15.5px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-indigo-700">
                                {job.title}
                            </h3>
                            <p className="truncate text-[12.5px] text-slate-500">{companyOf(job)}</p>
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

                <p className="mt-4 line-clamp-2 text-[13.5px] leading-relaxed text-slate-500">
                    {job.description}
                </p>

                {job.requiredSkills?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {job.requiredSkills.slice(0, 4).map(skill => (
                            <span key={skill}
                                className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500 ring-1 ring-inset ring-slate-200">
                                {skill}
                            </span>
                        ))}
                        {job.requiredSkills.length > 4 && (
                            <span className="px-1 py-1 text-[11px] text-slate-400">
                                +{job.requiredSkills.length - 4}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-[12px] text-slate-500">
                    {job.location && (
                        <span className="inline-flex items-center gap-1.5">
                            <IconPin className="size-3.5" />{job.location}
                        </span>
                    )}
                    {job.eligibility?.minCGPA > 0 && (
                        <span className="tabular-nums">CGPA ≥ {job.eligibility.minCGPA}</span>
                    )}
                    {deadline && (
                        <span className={`inline-flex items-center gap-1.5 ${deadline.urgent ? 'text-amber-600' : ''}`}>
                            <IconClock className="size-3.5" />{deadline.label}
                        </span>
                    )}
                    <span className="ml-auto inline-flex items-center gap-1 text-brand-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
                        View <IconArrowRight className="size-3.5" />
                    </span>
                </div>
            </Card>
        </Link>
    )
}
