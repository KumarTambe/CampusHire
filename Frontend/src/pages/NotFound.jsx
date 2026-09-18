import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HOME_FOR } from '../components/ProtectedRoute'
import { Button } from '../components/ui'
import { IconArrowRight } from '../components/icons'

export default function NotFound() {
    const { user } = useAuth()
    const home = user ? HOME_FOR[user.role] || '/' : '/'

    return (
        <div className="flex min-h-[65vh] flex-col items-center justify-center text-center animate-rise">
            <p className="font-mono text-[13px] tracking-[0.3em] text-brand-600/70">404</p>
            <h1 className="mt-5 text-[34px] font-semibold tracking-[-0.03em] text-slate-900 sm:text-[42px]">
                This page doesn't exist
            </h1>
            <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-slate-500">
                The link may be stale, or the posting behind it was removed.
            </p>
            <Button as={Link} to={home} variant="primary" size="lg" className="mt-8">
                Back to {user ? 'your dashboard' : 'home'} <IconArrowRight className="size-4" />
            </Button>
        </div>
    )
}
