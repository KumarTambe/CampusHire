import { useEffect } from 'react'

export const cx = (...parts) => parts.filter(Boolean).join(' ')

/* ------------------------------------------------------------------ Button */

const VARIANTS = {
    // amber — reserved for the single primary action on a screen
    primary:
        'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-semibold ' +
        'shadow-[0_8px_24px_-10px_rgba(245,158,11,0.75)] hover:from-amber-200 hover:to-amber-400 ' +
        'hover:shadow-[0_12px_30px_-10px_rgba(245,158,11,0.9)] active:translate-y-px',
    accent:
        'bg-gradient-to-b from-indigo-500 to-violet-600 text-white font-medium ' +
        'shadow-[0_8px_24px_-12px_rgba(99,102,241,0.9)] hover:from-indigo-400 hover:to-violet-500 ' +
        'active:translate-y-px',
    ghost:
        'bg-white/[0.04] text-slate-200 border border-white/10 hover:bg-white/[0.08] ' +
        'hover:border-white/20 active:translate-y-px',
    outline:
        'bg-transparent text-slate-300 border border-white/12 hover:bg-white/[0.05] hover:text-white',
    danger:
        'bg-rose-500/12 text-rose-300 border border-rose-500/28 hover:bg-rose-500/20 hover:text-rose-200',
    success:
        'bg-emerald-500/12 text-emerald-300 border border-emerald-500/28 hover:bg-emerald-500/20',
    subtle:
        'bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.05]',
}

const SIZES = {
    xs: 'h-7 px-2.5 text-xs rounded-lg gap-1',
    sm: 'h-9 px-3.5 text-[13px] rounded-lg gap-1.5',
    md: 'h-11 px-5 text-sm rounded-xl gap-2',
    lg: 'h-12 px-6 text-[15px] rounded-xl gap-2',
}

export function Button({
    as: Tag = 'button', variant = 'accent', size = 'md',
    loading = false, disabled, className, children, ...props
}) {
    return (
        <Tag
            className={cx(
                'inline-flex items-center justify-center whitespace-nowrap select-none',
                'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                'disabled:opacity-45 disabled:pointer-events-none',
                VARIANTS[variant], SIZES[size], className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Spinner className="size-3.5" />}
            {children}
        </Tag>
    )
}

export function Spinner({ className = 'size-4' }) {
    return (
        <svg className={cx('animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.22" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    )
}

/* -------------------------------------------------------------------- Card */

export function Card({ className, hover = false, children, ...props }) {
    return (
        <div className={cx('surface rounded-2xl', hover && 'surface-hover', className)} {...props}>
            {children}
        </div>
    )
}

/* ------------------------------------------------------------------- Badge */

const TONES = {
    neutral: 'bg-white/[0.06] text-slate-300 ring-white/12',
    indigo: 'bg-indigo-500/12 text-indigo-300 ring-indigo-400/25',
    violet: 'bg-violet-500/12 text-violet-300 ring-violet-400/25',
    amber: 'bg-amber-500/12 text-amber-300 ring-amber-400/25',
    emerald: 'bg-emerald-500/12 text-emerald-300 ring-emerald-400/25',
    rose: 'bg-rose-500/12 text-rose-300 ring-rose-400/25',
    sky: 'bg-sky-500/12 text-sky-300 ring-sky-400/25',
    slate: 'bg-slate-500/12 text-slate-400 ring-slate-400/20',
}

export function Badge({ tone = 'neutral', dot = false, className, children }) {
    return (
        <span className={cx(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
            'text-[11px] font-medium tracking-wide ring-1 ring-inset',
            TONES[tone] || TONES.neutral, className
        )}>
            {dot && <span className="size-1.5 rounded-full bg-current" />}
            {children}
        </span>
    )
}

/** Shared colour language for every status shown anywhere in the product. */
export const STATUS_TONE = {
    applied: 'sky',
    shortlisted: 'indigo',
    interview: 'violet',
    selected: 'emerald',
    rejected: 'rose',
    withdrawn: 'slate',
    draft: 'slate',
    published: 'emerald',
    closed: 'rose',
    pending: 'amber',
    verified: 'emerald',
}

export const StatusBadge = ({ status, className }) => (
    <Badge tone={STATUS_TONE[status] || 'neutral'} dot className={cx('capitalize', className)}>
        {status}
    </Badge>
)

/* ------------------------------------------------------------- Form fields */

const fieldBase =
    'w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 text-sm text-slate-100 ' +
    'transition-all duration-200 placeholder:text-slate-600 ' +
    'hover:border-white/18 focus:border-indigo-400/60 focus:bg-white/[0.06] ' +
    'focus:ring-4 focus:ring-indigo-500/10 focus:outline-none disabled:opacity-50'

export function Field({ label, hint, error, required, children, className }) {
    return (
        <label className={cx('block', className)}>
            {label && (
                <span className="mb-1.5 flex items-center gap-1 text-[12.5px] font-medium text-slate-300">
                    {label}
                    {required && <span className="text-amber-400/90">*</span>}
                </span>
            )}
            {children}
            {hint && !error && <span className="mt-1.5 block text-[11.5px] text-slate-500">{hint}</span>}
            {error && <span className="mt-1.5 block text-[11.5px] text-rose-400">{error}</span>}
        </label>
    )
}

export const Input = ({ className, ...props }) => (
    <input className={cx(fieldBase, 'h-11', className)} {...props} />
)

export const Textarea = ({ className, rows = 5, ...props }) => (
    <textarea rows={rows} className={cx(fieldBase, 'py-3 leading-relaxed resize-y', className)} {...props} />
)

export const Select = ({ className, children, ...props }) => (
    <select className={cx(fieldBase, 'h-11 appearance-none cursor-pointer pr-9',
        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'%2394a3b8\'%3E%3Cpath d=\'M4.5 6.5 8 10l3.5-3.5\' stroke=\'%2394a3b8\' stroke-width=\'1.6\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")]',
        'bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat', className)} {...props}>
        {children}
    </select>
)

/* -------------------------------------------------------------- Page chrome */

export function PageHeader({ eyebrow, title, subtitle, actions, className }) {
    return (
        <div className={cx('mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between', className)}>
            <div className="animate-rise min-w-0">
                {eyebrow && (
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-400/80">
                        {eyebrow}
                    </p>
                )}
                <h1 className="text-[27px] sm:text-[33px] font-semibold tracking-[-0.02em] text-white">
                    {title}
                </h1>
                {subtitle && <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-slate-400">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
        </div>
    )
}

export function EmptyState({ icon, title, description, action, className }) {
    return (
        <Card className={cx('flex flex-col items-center px-6 py-16 text-center animate-fade', className)}>
            {icon && (
                <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-b from-indigo-500/15 to-violet-500/5 text-indigo-300 ring-1 ring-inset ring-white/10">
                    {icon}
                </div>
            )}
            <h3 className="text-[15px] font-semibold text-slate-200">{title}</h3>
            {description && <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-slate-500">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </Card>
    )
}

export function Skeleton({ className }) {
    return <div className={cx('skeleton rounded-xl', className)} />
}

/** Full-height loading state used while a page's first fetch is in flight. */
export function PageLoader({ label = 'Loading' }) {
    return (
        <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 animate-fade">
            <div className="relative grid size-12 place-items-center">
                <span className="absolute inset-0 rounded-full animate-pulse-ring" />
                <Spinner className="size-7 text-indigo-400" />
            </div>
            <p className="text-[13px] tracking-wide text-slate-500">{label}…</p>
        </div>
    )
}

/* ------------------------------------------------------------------- Modal */

export function Modal({ open, onClose, title, description, children, footer }) {
    useEffect(() => {
        if (!open) return
        const onKey = (e) => e.key === 'Escape' && onClose?.()
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
            <div
                className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm animate-fade"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                className="surface animate-rise relative w-full max-w-lg rounded-2xl p-6 sm:p-7"
            >
                {title && <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>}
                {description && <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-400">{description}</p>}
                {children && <div className="mt-5">{children}</div>}
                {footer && <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">{footer}</div>}
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------- Misc */

export function Stat({ label, value, hint, tone = 'indigo', icon }) {
    const glow = {
        indigo: 'from-indigo-500/18', violet: 'from-violet-500/18',
        amber: 'from-amber-500/18', emerald: 'from-emerald-500/18',
        rose: 'from-rose-500/18', sky: 'from-sky-500/18',
    }[tone]

    return (
        <Card hover className="relative overflow-hidden p-5">
            <div className={cx('pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-gradient-to-b to-transparent blur-2xl', glow)} />
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
                    <p className="mt-2 text-[30px] font-semibold leading-none tracking-tight text-white tabular-nums">
                        {value}
                    </p>
                    {hint && <p className="mt-2 text-[12px] text-slate-500">{hint}</p>}
                </div>
                {icon && <div className="shrink-0 text-slate-600">{icon}</div>}
            </div>
        </Card>
    )
}

export const Divider = ({ className }) => <div className={cx('hairline my-6', className)} />

export function Tabs({ tabs, value, onChange, className }) {
    return (
        <div className={cx(
            'flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-xl bg-white/[0.03] p-1',
            'ring-1 ring-inset ring-white/8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            className
        )}>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                    className={cx(
                        'relative shrink-0 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200',
                        value === tab.value
                            ? 'bg-white/[0.09] text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                    )}
                >
                    {tab.label}
                    {tab.count != null && (
                        <span className={cx('ml-1.5 text-[11px] tabular-nums',
                            value === tab.value ? 'text-indigo-300' : 'text-slate-600')}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}
