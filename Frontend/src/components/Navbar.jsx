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
        <Link to="/" className={cx('flex items-center gap-2', className)}>
            <span className="grid size-7 place-items-center rounded-md bg-ink">
                <IconBriefcase className="size-4 text-white" />
            </span>
            <span className="text-[15.5px] font-semibold tracking-tight text-zinc-900">
                CampusHire
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
        'relative flex h-14 items-center gap-1.5 px-2.5 text-[13.5px] font-medium',
        'transition-colors duration-150',
        isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
    )

    return (
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
            <nav className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                <Logo />

                {/* desktop links */}
                <div className="ml-6 hidden items-center gap-1 lg:flex">
                    {links.map(({ to, label }) => (
                        <NavLink key={to} to={to} end className={linkClass}>
                            {({ isActive }) => (
                                <>
                                    <span>{label}</span>
                                    {to === '/notifications' && unread > 0 && (
                                        <span className="grid min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10.5px] font-semibold text-white tabular-nums">
                                            {unread > 9 ? '9+' : unread}
                                        </span>
                                    )}
                                    {isActive && (
                                        <span className="absolute inset-x-2.5 -bottom-px h-[2px] bg-ink" />
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
                                    <p className="text-[13px] font-medium text-zinc-900">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-[11.5px] capitalize text-zinc-500">
                                        {user.role === 'recruiter' && user.companyName
                                            ? user.companyName : user.role}
                                    </p>
                                </div>
                                <span className="grid size-8 place-items-center rounded-full bg-zinc-100 text-[12px] font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-200">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                            </div>
                            <Button variant="subtle" size="sm" onClick={handleLogout}
                                className="hidden sm:inline-flex" title="Sign out" aria-label="Sign out">
                                <IconLogout className="size-4" />
                            </Button>
                        </>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Button as={Link} to="/login" variant="subtle" size="sm">
                                Sign in
                            </Button>
                            <Button as={Link} to="/register" variant="primary" size="sm">Get started</Button>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setOpen(v => !v)}
                        className="grid size-9 place-items-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
                        aria-label="Toggle navigation"
                        aria-expanded={open}
                    >
                        {open ? <IconX className="size-5" /> : <IconMenu className="size-5" />}
                    </button>
                </div>
            </nav>

            {/* mobile drawer */}
            {open && (
                <div className="animate-fade border-t border-zinc-200 bg-white px-4 pb-5 pt-3 lg:hidden">
                    {user ? (
                        <>
                            <div className="mb-3 flex items-center gap-3 border-b border-zinc-200 pb-3">
                                <span className="grid size-9 place-items-center rounded-full bg-zinc-100 text-[12.5px] font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-200">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-zinc-900">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="truncate text-[12px] text-zinc-500">{user.email}</p>
                                </div>
                            </div>
                            <div className="grid gap-1">
                                {links.map(({ to, label, icon: Icon }) => (
                                    <NavLink key={to} to={to} end onClick={closeDrawer} className={({ isActive }) => cx(
                                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                                        isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'
                                    )}>
                                        <Icon className="size-[17px]" />
                                        {label}
                                        {to === '/notifications' && unread > 0 && (
                                            <span className="ml-auto grid min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10.5px] font-semibold text-white">
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
                            <Button as={Link} to="/login" variant="ghost" onClick={closeDrawer}>
                                Sign in
                            </Button>
                            <Button as={Link} to="/register" variant="primary" onClick={closeDrawer}>Create an account</Button>
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}
