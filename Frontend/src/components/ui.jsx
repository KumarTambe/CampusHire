import { useEffect } from 'react'

export const cx = (...parts) => parts.filter(Boolean).join(' ')

/* ------------------------------------------------------------------ Button */

const VARIANTS = {
    // solid indigo — the one brand color, carries every primary action
    primary:
        'bg-brand-600 text-white font-semibold shadow-sm hover:bg-brand-700 active:bg-brand-700',
    accent:
        'bg-brand-600 text-white font-medium shadow-sm hover:bg-brand-700 active:bg-brand-700',
    ghost:
        'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    outline:
        'bg-transparent text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900',
    danger:
        'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100',
    success:
        'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100',
    subtle:
        'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100',
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
    neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
    indigo: 'bg-brand-50 text-brand-700 ring-brand-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    sky: 'bg-sky-50 text-sky-700 ring-sky-100',
    slate: 'bg-slate-100 text-slate-500 ring-slate-200',
}

export function Badge({ tone = 'neutral', dot = false, className, children }) {
    return (
        <span className={cx(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
            'text-[11px] font-semibold tracking-wide ring-1 ring-inset',
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
    'w-full rounded-xl bg-white border border-slate-200 px-3.5 text-sm text-slate-900 ' +
    'transition-all duration-200 placeholder:text-slate-400 ' +
    'hover:border-slate-300 focus:border-brand-500 ' +
    'focus:ring-4 focus:ring-brand-500/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400'

export function Field({ label, hint, error, required, children, className }) {
    return (
        <label className={cx('block', className)}>
            {label && (
                <span className="mb-1.5 flex items-center gap-1 text-[12.5px] font-semibold text-slate-700">
                    {label}
                    {required && <span className="text-brand-600">*</span>}
                </span>
            )}
            {children}
            {hint && !error && <span className="mt-1.5 block text-[11.5px] text-slate-500">{hint}</span>}
            {error && <span className="mt-1.5 block text-[11.5px] text-rose-600">{error}</span>}
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
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">
                        {eyebrow}
                    </p>
                )}
                <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight text-slate-900">
                    {title}
                </h1>
                {subtitle && <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-slate-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
        </div>
    )
}

export function EmptyState({ icon, title, description, action, className }) {
    return (
        <Card className={cx('flex flex-col items-center px-6 py-16 text-center animate-fade', className)}>
            {icon && (
                <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                    {icon}
                </div>
            )}
            <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
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
            <Spinner className="size-7 text-brand-600" />
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
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                className="surface animate-rise relative w-full max-w-lg rounded-2xl p-6 sm:p-7"
            >
                {title && <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>}
                {description && <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{description}</p>}
                {children && <div className="mt-5">{children}</div>}
                {footer && <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">{footer}</div>}
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------- Misc */

export function Stat({ label, value, hint, tone = 'indigo', icon }) {
    const chip = {
        indigo: 'bg-brand-50 text-brand-600', violet: 'bg-violet-50 text-violet-600',
        amber: 'bg-amber-50 text-amber-600', emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600', sky: 'bg-sky-50 text-sky-600',
    }[tone]

    return (
        <Card hover className="p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                    <p className="mt-2 text-[30px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
                        {value}
                    </p>
                    {hint && <p className="mt-2 text-[12px] text-slate-500">{hint}</p>}
                </div>
                {icon && <div className={cx('shrink-0 grid size-10 place-items-center rounded-xl', chip)}>{icon}</div>}
            </div>
        </Card>
    )
}

export const Divider = ({ className }) => <div className={cx('hairline my-6', className)} />

export function Tabs({ tabs, value, onChange, className }) {
    return (
        <div className={cx('flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                    className={cx(
                        'relative shrink-0 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200',
                        value === tab.value
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                    )}
                >
                    {tab.label}
                    {tab.count != null && (
                        <span className={cx('ml-1.5 text-[11px] tabular-nums',
                            value === tab.value ? 'text-brand-600' : 'text-slate-400')}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}
