import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Navbar'
import { HOME_FOR } from '../components/ProtectedRoute'
import { Button, Card, PageLoader } from '../components/ui'
import {
    IconArrowRight, IconBriefcase, IconCheck, IconGrad,
    IconShield, IconSpark, IconUsers, IconChart, IconHistory
} from '../components/icons'

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
        icon: IconGrad, tone: 'from-indigo-500/18',
        title: 'Students',
        points: ['Browse jobs matched to your profile', 'Track every application in one place', 'Get notified the moment status changes'],
    },
    {
        icon: IconBriefcase, tone: 'from-violet-500/18',
        title: 'Recruiters',
        points: ['Post roles with precise eligibility rules', 'Review applicants with frozen profile snapshots', 'Move candidates through the pipeline'],
    },
    {
        icon: IconUsers, tone: 'from-amber-500/18',
        title: 'Placement cells',
        points: ['Verify recruiters before they post', 'Oversee every job and application', 'Read the full audit trail, always'],
    },
]

export default function Landing() {
    const { user, loading } = useAuth()

    if (loading) return <PageLoader label="Loading CampusHire" />
    if (user) return <Navigate to={HOME_FOR[user.role] || '/dashboard'} replace />

    return (
        <div className="min-h-svh">
            <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Logo />
                <div className="flex items-center gap-2">
                    <Button as={Link} to="/login" variant="subtle" size="sm">Sign in</Button>
                    <Button as={Link} to="/register" variant="primary" size="sm">Get started</Button>
                </div>
            </header>

            {/* ---------------------------------------------------------- hero */}
            <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
                <div className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[42rem] -translate-x-1/2 rounded-full bg-indigo-600/12 blur-[110px] animate-drift" />

                <div className="mx-auto max-w-3xl text-center">
                    <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-slate-300 backdrop-blur">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        Placement season, organised
                    </span>

                    <h1 className="animate-rise mt-7 text-[42px] font-semibold leading-[1.06] tracking-[-0.035em] text-white sm:text-[62px]"
                        style={{ animationDelay: '60ms' }}>
                        Where campus talent
                        <br />
                        <span className="font-display text-gradient italic font-normal">meets its offer.</span>
                    </h1>

                    <p className="animate-rise mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed text-slate-400 sm:text-[17px]"
                        style={{ animationDelay: '120ms' }}>
                        CampusHire runs the whole placement cycle in one place — eligibility checks,
                        applications, interview pipelines and the audit trail behind every decision.
                    </p>

                    <div className="animate-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
                        style={{ animationDelay: '180ms' }}>
                        <Button as={Link} to="/register" variant="primary" size="lg" className="w-full sm:w-auto">
                            Create your account <IconArrowRight className="size-4" />
                        </Button>
                        <Button as={Link} to="/login" variant="ghost" size="lg" className="w-full sm:w-auto">
                            I already have one
                        </Button>
                    </div>
                </div>

                {/* pipeline rail */}
                <div className="animate-rise mx-auto mt-20 max-w-4xl" style={{ animationDelay: '260ms' }}>
                    <Card className="p-6 sm:p-8">
                        <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                            The hiring pipeline, enforced end to end
                        </p>
                        <ol className="grid gap-3 sm:grid-cols-4">
                            {['Applied', 'Shortlisted', 'Interview', 'Selected'].map((step, i) => (
                                <li key={step} className="relative">
                                    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5">
                                        <p className="font-mono text-[11px] text-indigo-400/80">0{i + 1}</p>
                                        <p className="mt-1 text-[13.5px] font-medium text-slate-200">{step}</p>
                                    </div>
                                    {i < 3 && (
                                        <IconArrowRight className="absolute -right-3 top-1/2 hidden size-4 -translate-y-1/2 text-slate-700 sm:block" />
                                    )}
                                </li>
                            ))}
                        </ol>
                    </Card>
                </div>
            </section>

            {/* ------------------------------------------------------ features */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-4 md:grid-cols-3">
                    {FEATURES.map(({ icon: Icon, title, body }, i) => (
                        <Card key={title} hover className="animate-rise stagger p-6" style={{ '--i': i }}>
                            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-b from-indigo-500/18 to-transparent text-indigo-300 ring-1 ring-inset ring-white/10">
                                <Icon className="size-5" />
                            </span>
                            <h3 className="mt-5 text-[15.5px] font-semibold text-white">{title}</h3>
                            <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-400">{body}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* --------------------------------------------------------- roles */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-[30px] font-semibold tracking-[-0.025em] text-white sm:text-[36px]">
                        Three roles, <span className="font-display italic font-normal text-indigo-300">one portal</span>
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-[14.5px] text-slate-400">
                        Everyone sees exactly what they need — and nothing they should not.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {ROLES.map(({ icon: Icon, title, points, tone }, i) => (
                        <Card key={title} hover className="animate-rise stagger relative overflow-hidden p-6" style={{ '--i': i }}>
                            <div className={`pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-gradient-to-b ${tone} to-transparent blur-2xl`} />
                            <div className="relative">
                                <Icon className="size-6 text-slate-300" />
                                <h3 className="mt-4 text-[17px] font-semibold text-white">{title}</h3>
                                <ul className="mt-4 space-y-2.5">
                                    {points.map(p => (
                                        <li key={p} className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-400">
                                            <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-400/80" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ----------------------------------------------------------- cta */}
            <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                <Card className="relative overflow-hidden px-6 py-14 text-center sm:px-12">
                    <div className="pointer-events-none absolute inset-x-0 -bottom-24 h-56 bg-gradient-to-t from-amber-500/10 to-transparent blur-2xl" />
                    <div className="relative">
                        <IconChart className="mx-auto size-7 text-amber-400/80" />
                        <h2 className="mt-5 text-[28px] font-semibold tracking-[-0.025em] text-white sm:text-[34px]">
                            Start your placement season right
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-slate-400">
                            Set up your profile once. CampusHire handles eligibility, applications and
                            everything that follows.
                        </p>
                        <Button as={Link} to="/register" variant="primary" size="lg" className="mt-8">
                            Get started free <IconArrowRight className="size-4" />
                        </Button>
                    </div>
                </Card>
            </section>

            <footer className="border-t border-white/[0.06] py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
                    <Logo />
                    <p className="text-[12px] text-slate-600">
                        Built for students, recruiters and placement cells.
                    </p>
                </div>
            </footer>
        </div>
    )
}
