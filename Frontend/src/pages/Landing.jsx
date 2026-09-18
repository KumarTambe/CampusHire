import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Navbar'
import { HOME_FOR } from '../components/ProtectedRoute'
import { Button, Card, PageLoader } from '../components/ui'
import {
    IconArrowRight, IconBriefcase, IconCheck, IconGrad,
    IconShield, IconSpark, IconUsers, IconChart, IconHistory
} from '../components/icons'

const TRENDING = [
    { title: 'Software Engineer — Platform', meta: 'Nimbus Labs • Bengaluru', tag: 'Full time' },
    { title: 'Frontend Engineer Intern', meta: 'Nimbus Labs • Remote', tag: 'Internship' },
    { title: 'Machine Learning Engineer', meta: 'Quanta Systems • Pune', tag: 'Full time' },
]

const FEATURES = [
    {
        icon: IconSpark,
        title: 'Eligibility, decided for you',
        body: 'Every posting is checked against your CGPA, branch and batch the moment it loads. No guessing, no wasted applications.',
    },
    {
        icon: IconHistory,
        title: 'A pipeline that cannot skip',
        body: 'Applied, shortlisted, interview, selected. Transitions are enforced server-side and every change is written to an audit trail.',
    },
    {
        icon: IconShield,
        title: 'Recruiters, verified first',
        body: 'The placement cell verifies each company before a single job goes live, so students only ever see vetted opportunities.',
    },
]

const ROLES = [
    {
        icon: IconGrad,
        title: 'Students',
        points: ['Browse jobs matched to your profile', 'Track every application in one place', 'Get notified the moment status changes'],
    },
    {
        icon: IconBriefcase,
        title: 'Recruiters',
        points: ['Post roles with precise eligibility rules', 'Review applicants with frozen profile snapshots', 'Move candidates through the pipeline'],
    },
    {
        icon: IconUsers,
        title: 'Placement cells',
        points: ['Verify recruiters before they post', 'Oversee every job and application', 'Read the full audit trail, always'],
    },
]

export default function Landing() {
    const { user, loading } = useAuth()

    if (loading) return <PageLoader label="Loading CampusHire" />
    if (user) return <Navigate to={HOME_FOR[user.role] || '/dashboard'} replace />

    return (
        <div className="min-h-svh bg-slate-50">
            {/* --------------------------------------------------- navy hero */}
            <div className="navy-wash">
                <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Logo />
                    <div className="flex items-center gap-2">
                        <Button as={Link} to="/login" variant="ghost" size="sm"
                            className="!border-white/15 !bg-transparent !text-white hover:!bg-white/10">
                            Sign in
                        </Button>
                        <Button as={Link} to="/register" variant="primary" size="sm">Get started</Button>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-28 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pb-32">
                    <div>
                        <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12px] font-medium text-slate-200">
                            🚀 Placement season, organised
                        </span>

                        <h1 className="animate-rise mt-6 text-[38px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[52px]"
                            style={{ animationDelay: '60ms' }}>
                            Find your next
                            <br />
                            <span className="text-brand-300">opportunity.</span>
                        </h1>

                        <p className="animate-rise mt-5 max-w-lg text-[15.5px] leading-relaxed text-slate-300"
                            style={{ animationDelay: '120ms' }}>
                            CampusHire runs the whole placement cycle in one place — eligibility
                            checks, applications, interview pipelines and the audit trail behind
                            every decision.
                        </p>

                        <div className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '180ms' }}>
                            <Button as={Link} to="/register" variant="primary" size="lg">
                                Explore jobs <IconArrowRight className="size-4" />
                            </Button>
                            <Button as={Link} to="/login" size="lg"
                                className="!border !border-white/20 !bg-transparent !text-white hover:!bg-white/10">
                                I already have an account
                            </Button>
                        </div>
                    </div>

                    {/* trending card */}
                    <div className="animate-rise" style={{ animationDelay: '100ms' }}>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                            <p className="mb-4 text-[13px] font-semibold text-white">🔥 Trending opportunities</p>
                            <div className="space-y-2.5">
                                {TRENDING.map(job => (
                                    <div key={job.title} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-[13.5px] font-bold text-slate-900">{job.title}</p>
                                            <p className="truncate text-[12px] text-slate-500">{job.meta}</p>
                                        </div>
                                        <Badge>{job.tag}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* stats bar — overlaps the hero/light boundary */}
            <div className="mx-auto -mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
                <Card className="grid grid-cols-3 divide-x divide-slate-100 p-6 sm:p-8">
                    {[['4', 'Live roles'], ['3', 'Verified recruiters'], ['100%', 'Eligibility checked']].map(([n, l]) => (
                        <div key={l} className="text-center">
                            <p className="text-[28px] font-extrabold text-brand-600 sm:text-[34px]">{n}</p>
                            <p className="mt-1 text-[12.5px] text-slate-500">{l}</p>
                        </div>
                    ))}
                </Card>
            </div>

            {/* ------------------------------------------------------ features */}
            <section className="mx-auto max-w-7xl px-4 pb-4 pt-20 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-[28px] font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
                        Everything you need to start
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-[14.5px] text-slate-500">
                        A simple platform designed for students, recruiters and placement cells.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {FEATURES.map(({ icon: Icon, title, body }, i) => (
                        <Card key={title} hover className="animate-rise stagger p-6" style={{ '--i': i }}>
                            <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                                <Icon className="size-5" />
                            </span>
                            <h3 className="mt-5 text-[15.5px] font-bold text-slate-900">{title}</h3>
                            <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-500">{body}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* --------------------------------------------------------- roles */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-[28px] font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
                        Three roles, one portal
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-[14.5px] text-slate-500">
                        Everyone sees exactly what they need — and nothing they should not.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {ROLES.map(({ icon: Icon, title, points }, i) => (
                        <Card key={title} hover className="animate-rise stagger p-6" style={{ '--i': i }}>
                            <Icon className="size-6 text-brand-600" />
                            <h3 className="mt-4 text-[17px] font-bold text-slate-900">{title}</h3>
                            <ul className="mt-4 space-y-2.5">
                                {points.map(p => (
                                    <li key={p} className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-500">
                                        <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ----------------------------------------------------------- cta */}
            <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                <div className="navy-wash rounded-3xl px-6 py-14 text-center sm:px-12">
                    <IconChart className="mx-auto size-7 text-brand-300" />
                    <h2 className="mt-5 text-[26px] font-extrabold tracking-tight text-white sm:text-[32px]">
                        Ready to find your opportunity?
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-slate-300">
                        Set up your profile once. CampusHire handles eligibility, applications and
                        everything that follows.
                    </p>
                    <Button as={Link} to="/register" size="lg" className="mt-8 !bg-white !text-brand-700 hover:!bg-slate-100">
                        Explore opportunities <IconArrowRight className="size-4" />
                    </Button>
                </div>
            </section>

            <footer className="bg-navy-900 py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
                    <Logo />
                    <p className="text-[12px] text-slate-400">
                        Built for students, recruiters and placement cells.
                    </p>
                </div>
            </footer>
        </div>
    )
}

function Badge({ children }) {
    return (
        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
            {children}
        </span>
    )
}
