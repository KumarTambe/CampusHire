import { Logo } from './Navbar'
import { IconCheck } from './icons'

const STEPS = [
    { label: 'Applied', note: 'Eligibility checked against your profile', done: true },
    { label: 'Shortlisted', note: 'Recruiter reviewed your snapshot', done: true },
    { label: 'Interview', note: 'Scheduled by the recruiter', current: true },
    { label: 'Selected', note: 'Offer recorded in the audit trail' },
]

/**
 * Two-column auth layout: the form on the left, and on large screens a quiet
 * panel showing what an application looks like once it is moving.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
    return (
        <div className="grid min-h-svh grid-cols-1 bg-paper lg:grid-cols-[1fr_minmax(0,560px)]">
            <div className="flex flex-col px-4 py-8 sm:px-10">
                <Logo />

                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
                    <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900">{title}</h1>
                    {subtitle && <p className="mt-2 text-[14.5px] leading-relaxed text-zinc-600">{subtitle}</p>}

                    <div className="mt-8">{children}</div>

                    {footer && <div className="mt-6 text-[13.5px] text-zinc-600">{footer}</div>}
                </div>
            </div>

            <aside className="hidden border-l border-zinc-200 bg-zinc-100 lg:flex lg:flex-col lg:justify-center lg:px-14">
                <p className="max-w-sm text-[22px] font-semibold leading-snug tracking-tight text-zinc-900">
                    Every application, one clear timeline.
                </p>
                <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-zinc-600">
                    Status changes are enforced in order and written to an audit log — so you always
                    know where you stand.
                </p>

                <div className="surface mt-10 max-w-sm rounded-lg p-5">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                        <div>
                            <p className="text-[14px] font-medium text-zinc-900">Software Engineer</p>
                            <p className="text-[12.5px] text-zinc-500">Example application</p>
                        </div>
                        <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[12px] font-medium text-brand-700">Interview</span>
                    </div>
                    <ol className="mt-4 space-y-3.5">
                        {STEPS.map(step => (
                            <li key={step.label} className="flex gap-3">
                                <span className={
                                    step.done ? 'mt-0.5 grid size-4 place-items-center rounded-full bg-ink text-white'
                                        : step.current ? 'mt-0.5 size-4 rounded-full border-[5px] border-brand-600 bg-white'
                                            : 'mt-0.5 size-4 rounded-full border border-zinc-300 bg-white'
                                }>
                                    {step.done && <IconCheck className="size-2.5" />}
                                </span>
                                <div>
                                    <p className={step.done || step.current ? 'text-[13px] font-medium text-zinc-900' : 'text-[13px] text-zinc-500'}>
                                        {step.label}
                                    </p>
                                    <p className="text-[12px] text-zinc-500">{step.note}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </aside>
        </div>
    )
}
