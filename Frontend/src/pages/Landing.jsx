import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Navbar'
import { HOME_FOR } from '../components/ProtectedRoute'
import { Button, PageLoader, cx } from '../components/ui'
import { IconArrowRight, IconClock, IconPin, IconSearch } from '../components/icons'

// sample rows for the product preview in the hero
const PREVIEW = [
    { company: 'Nimbus Labs', title: 'Software Engineer — Platform', location: 'Bengaluru', deadline: '6 days left', state: 'Eligible' },
    { company: 'Quanta Systems', title: 'Machine Learning Engineer', location: 'Pune', deadline: '3 days left', state: 'Applied' },
    { company: 'Nimbus Labs', title: 'Frontend Engineer Intern', location: 'Remote', deadline: '12 days left', state: 'Eligible' },
    { company: 'Fernway Analytics', title: 'Data Analyst', location: 'Hyderabad', deadline: 'Closes today', state: 'Not eligible' },
]

const STATE_STYLE = {
    Eligible: 'bg-emerald-50 text-emerald-700',
    Applied: 'bg-zinc-100 text-zinc-700',
    'Not eligible': 'bg-rose-50 text-rose-700',
}

const FEATURES = [
    {
        title: 'Eligibility, decided for you',
        body: 'Every posting is checked against your CGPA, branch and batch the moment it loads. No guessing, no wasted applications.',
    },
    {
        title: 'A pipeline that cannot skip',
        body: 'Applied, shortlisted, interview, selected. Transitions are enforced server-side and every change is written to an audit trail.',
    },
    {
        title: 'Recruiters, verified first',
        body: 'The placement cell verifies each company before a single job goes live, so students only ever see vetted opportunities.',
    },
]

const ROLES = [
    {
        title: 'Students',
        points: ['Browse jobs matched to your profile', 'Track every application in one place', 'Get notified the moment status changes'],
    },
    {
        title: 'Recruiters',
        points: ['Post roles with precise eligibility rules', 'Review applicants with frozen profile snapshots', 'Move candidates through the pipeline'],
    },
    {
        title: 'Placement cells',
        points: ['Verify recruiters before they post', 'Oversee every job and application', 'Read the full audit trail, always'],
    },
]

export default function Landing() {
    const { user, loading } = useAuth()

    if (loading) return <PageLoader label="Loading CampusHire" />
    if (user) return <Navigate to={HOME_FOR[user.role] || '/dashboard'} replace />

    return (
        <div className="min-h-svh bg-paper">
            <header className="border-b border-zinc-200 bg-white">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Logo />
                    <div className="flex items-center gap-1.5">
                        <Button as={Link} to="/login" variant="subtle" size="sm">Sign in</Button>
                        <Button as={Link} to="/register" variant="primary" size="sm">Get started</Button>
                    </div>
                </div>
            </header>

            {/* ---------------------------------------------------------- hero */}
            <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-8">
                <div>
                    <p className="text-[13.5px] font-medium text-brand-700">Campus placement portal</p>
                    <h1 className="mt-4 max-w-xl text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-900 sm:text-[56px]">
                        Placement season, without the spreadsheets.
                    </h1>
                    <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-zinc-600">
                        CampusHire runs the whole placement cycle in one place — eligibility
                        checks, applications, interview pipelines and the audit trail behind
                        every decision.
                    </p>
                    <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
                        <Button as={Link} to="/register" variant="primary" size="lg">
                            Create an account <IconArrowRight className="size-4" />
                        </Button>
                        <Button as={Link} to="/login" variant="ghost" size="lg">
                            Sign in
                        </Button>
                    </div>
                </div>

                {/* product preview */}
                <div className="surface overflow-hidden rounded-lg shadow-[0_24px_48px_-24px_rgba(24,24,27,0.18)]">
                    <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3">
                        <div className="flex h-8 flex-1 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 text-[12.5px] text-zinc-400">
                            <IconSearch className="size-3.5" /> Search roles, skills, companies
                        </div>
                    </div>
                    <div className="flex gap-5 border-b border-zinc-200 px-4 text-[12.5px] font-medium">
                        <span className="-mb-px border-b-2 border-ink py-2.5 text-zinc-900">All jobs</span>
                        <span className="py-2.5 text-zinc-500">Eligible</span>
                        <span className="py-2.5 text-zinc-500">Applied</span>
                    </div>
                    <ul className="divide-y divide-zinc-100">
                        {PREVIEW.map(job => (
                            <li key={job.title} className="flex items-center gap-3 px-4 py-3.5">
                                <span className="grid size-9 shrink-0 place-items-center rounded-md border border-zinc-200 bg-zinc-50 text-[13px] font-semibold text-zinc-700">
                                    {job.company[0]}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13.5px] font-medium text-zinc-900">{job.title}</p>
                                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[12px] text-zinc-500">
                                        <span>{job.company}</span>
                                        <span className="inline-flex items-center gap-1"><IconPin className="size-3" />{job.location}</span>
                                        <span className="hidden items-center gap-1 sm:inline-flex"><IconClock className="size-3" />{job.deadline}</span>
                                    </p>
                                </div>
                                <span className={cx('shrink-0 rounded-md px-2 py-0.5 text-[11.5px] font-medium', STATE_STYLE[job.state])}>
                                    {job.state}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ------------------------------------------------------ features */}
            <section className="border-t border-zinc-200 bg-white">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:px-8">
                    <div>
                        <h2 className="max-w-sm text-[28px] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-[34px]">
                            Built around how placements actually run.
                        </h2>
                    </div>
                    <ol className="divide-y divide-zinc-200 border-y border-zinc-200">
                        {FEATURES.map(({ title, body }, i) => (
                            <li key={title} className="grid gap-2 py-6 sm:grid-cols-[3rem_1fr]">
                                <span className="font-mono text-[13px] text-zinc-400">0{i + 1}</span>
                                <div>
                                    <h3 className="text-[16px] font-semibold text-zinc-900">{title}</h3>
                                    <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed text-zinc-600">{body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* --------------------------------------------------------- roles */}
            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <h2 className="text-[28px] font-semibold tracking-tight text-zinc-900 sm:text-[34px]">
                    Three roles, each with its own view.
                </h2>
                <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-zinc-200">
                    {ROLES.map(({ title, points }) => (
                        <div key={title} className="md:px-8 md:first:pl-0 md:last:pr-0">
                            <h3 className="text-[16px] font-semibold text-zinc-900">{title}</h3>
                            <ul className="mt-4 space-y-2.5">
                                {points.map(p => (
                                    <li key={p} className="flex gap-2.5 text-[14px] leading-relaxed text-zinc-600">
                                        <span className="mt-[9px] h-px w-3 shrink-0 bg-zinc-400" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* ----------------------------------------------------------- cta */}
            <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 rounded-lg bg-ink px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
                    <div>
                        <h2 className="text-[24px] font-semibold tracking-tight text-white">
                            Set up your profile once.
                        </h2>
                        <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-zinc-400">
                            CampusHire handles eligibility, applications and everything that follows.
                        </p>
                    </div>
                    <Button as={Link} to="/register" size="lg" className="!bg-white !text-zinc-900 hover:!bg-zinc-200">
                        Get started <IconArrowRight className="size-4" />
                    </Button>
                </div>
            </section>

            <footer className="border-t border-zinc-200 py-6">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
                    <Logo />
                    <p className="text-[12.5px] text-zinc-500">
                        Built for students, recruiters and placement cells.
                    </p>
                </div>
            </footer>
        </div>
    )
}
