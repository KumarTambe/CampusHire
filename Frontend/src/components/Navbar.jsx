import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { Button, cx } from './ui'
import {
    IconBell, IconBriefcase, IconChart, IconCompass, IconFile, IconGauge,
    IconLogout, IconMenu, IconShield, IconUser, IconUsers, IconX, IconGrad
} from './icons'

/** Navigation is derived from the role — each role sees only its own surface. */
const LINKS = {
    student: [
        { to: '/dashboard', label: 'Browse jobs', icon: IconCompass },
        { to: '/my-applications', label: 'Applications', icon: IconFile },
        { to: '/notifications', label: 'Notifications', icon: IconBell },
        { to: '/profile', label: 'Profile', icon: IconUser },
    ],
    recruiter: [
        { to: '/recruiter/dashboard', label: 'My postings', icon: IconBriefcase },
        { to: '/recruiter/jobs/new', label: 'Post a job', icon: IconGrad },
        { to: '/notifications', label: 'Notifications', icon: IconBell },
        { to: '/profile', label: 'Company', icon: IconUser },
    ],
    admin: [
        { to: '/admin/dashboard', label: 'Overview', icon: IconGauge },
        { to: '/admin/users', label: 'Users', icon: IconUsers },
        { to: '/admin/recruiters', label: 'Recruiters', icon: IconShield },
        { to: '/admin/jobs', label: 'Jobs', icon: IconBriefcase },
        { to: '/admin/applications', label: 'Applications', icon: IconChart },
    ],
}

export function Logo({ className }) {
    return (
        <Link to="/" className={cx('group flex items-center gap-2.5', className)}>
            <span className="relative grid size-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-amber-400 shadow-[0_6px_18px_-8px_rgba(129,140,248,0.9)]">
                <IconGrad className="size-[18px] text-slate-950" />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                Campus<span className="text-indigo-300">Hire</span>
            </span>
        </Link>
    )
}

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [open, setOpen] = useState(false)
    const [unread, setUnread] = useState(0)

    const links = user ? LINKS[user.role] || [] : []
    const closeDrawer = () => setOpen(false)

    // poll the unread badge; cheap and keeps the bell honest across tabs
    useEffect(() => {
        if (!user) return
        let alive = true
        const load = () => api.get('/users/notifications')
            .then(({ data }) => alive && setUnread(data.unread))
            .catch(() => { })
        load()
        const id = setInterval(load, 45000)
        return () => { alive = false; clearInterval(id) }
    }, [user, location.pathname])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const linkClass = ({ isActive }) => cx(
        'relative flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-medium',
        'transition-colors duration-200',
        isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
    )

    return (
        <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-slate-950/72 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                <Logo />

                {/* desktop links */}
                <div className="ml-4 hidden items-center gap-0.5 lg:flex">
                    {links.map(({ to, label, icon: Icon }) => (
                        <NavLink key={to} to={to} end className={linkClass}>
                            {({ isActive }) => (
                                <>
                                    <Icon className="size-[16px]" />
                                    <span>{label}</span>
                                    {to === '/notifications' && unread > 0 && (
                                        <span className="ml-0.5 grid min-w-[17px] place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-950 tabular-nums">
                                            {unread > 9 ? '9+' : unread}
                                        </span>
                                    )}
                                    {isActive && (
                                        <span className="absolute inset-x-2.5 -bottom-[13px] h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-2.5">
                    {user ? (
                        <>
                            <div className="hidden items-center gap-2.5 sm:flex">
                                <div className="text-right leading-tight">
                                    <p className="text-[13px] font-medium text-slate-200">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-[11px] capitalize text-slate-500">
                                        {user.role === 'recruiter' && user.companyName
                                            ? user.companyName : user.role}
                                    </p>
                                </div>
                                <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500/25 to-violet-500/15 text-[12.5px] font-semibold text-indigo-200 ring-1 ring-inset ring-white/10">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                            </div>
                            <Button variant="subtle" size="sm" onClick={handleLogout}
                                className="hidden sm:inline-flex" title="Sign out">
                                <IconLogout className="size-4" />
                            </Button>
                        </>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Button as={Link} to="/login" variant="ghost" size="sm">Sign in</Button>
                            <Button as={Link} to="/register" variant="primary" size="sm">Get started</Button>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setOpen(v => !v)}
                        className="grid size-9 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/[0.06] lg:hidden"
                        aria-label="Toggle navigation"
                        aria-expanded={open}
                    >
                        {open ? <IconX className="size-5" /> : <IconMenu className="size-5" />}
                    </button>
                </div>
            </nav>

            {/* mobile drawer */}
            {open && (
                <div className="animate-fade border-t border-white/[0.07] bg-slate-950/95 px-4 pb-5 pt-3 lg:hidden">
                    {user ? (
                        <>
                            <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
                                <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500/25 to-violet-500/15 text-[13px] font-semibold text-indigo-200 ring-1 ring-inset ring-white/10">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-100">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="truncate text-[11.5px] text-slate-500">{user.email}</p>
                                </div>
                            </div>
                            <div className="grid gap-1">
                                {links.map(({ to, label, icon: Icon }) => (
                                    <NavLink key={to} to={to} end onClick={closeDrawer} className={({ isActive }) => cx(
                                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                                        isActive ? 'bg-white/[0.07] text-white' : 'text-slate-400 hover:bg-white/[0.04]'
                                    )}>
                                        <Icon className="size-[17px]" />
                                        {label}
                                        {to === '/notifications' && unread > 0 && (
                                            <span className="ml-auto grid min-w-[18px] place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-950">
                                                {unread}
                                            </span>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                            <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={handleLogout}>
                                <IconLogout className="size-4" /> Sign out
                            </Button>
                        </>
                    ) : (
                        <div className="grid gap-2">
                            <Button as={Link} to="/login" variant="ghost" onClick={closeDrawer}>Sign in</Button>
                            <Button as={Link} to="/register" variant="primary" onClick={closeDrawer}>Create an account</Button>
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}
