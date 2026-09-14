import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { Logo } from './Navbar'

export default function Layout() {
    return (
        <div className="flex min-h-svh flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <Outlet />
            </main>
            <footer className="border-t border-white/[0.06] py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
                    <Logo />
                    <p className="text-[12px] text-slate-600">
                        Campus placements, end to end — built for students, recruiters and placement cells.
                    </p>
                </div>
            </footer>
        </div>
    )
}
