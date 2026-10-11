import { useEffect } from 'react'

export const cx = (...parts) => parts.filter(Boolean).join(' ')

/* ------------------------------------------------------------------ Button */

const VARIANTS = {
    // ink-black carries primary actions; cobalt is kept for links and selection
    primary:
        'bg-ink text-white font-medium hover:bg-zinc-700 active:bg-zinc-800',
    accent:
        'bg-ink text-white font-medium hover:bg-zinc-700 active:bg-zinc-800',
    ghost:
        'bg-white text-zinc-800 font-medium border border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400',
    outline:
        'bg-transparent text-zinc-700 font-medium border border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900',
    danger:
        'bg-white text-rose-700 font-medium border border-rose-200 hover:bg-rose-50 hover:border-rose-300',
    success:
        'bg-white text-emerald-700 font-medium border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300',
    subtle:
        'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
}

const SIZES = {
    xs: 'h-7 px-2.5 text-xs rounded-md gap-1',
    sm: 'h-8 px-3 text-[13px] rounded-md gap-1.5',
    md: 'h-10 px-4 text-sm rounded-lg gap-2',
    lg: 'h-11 px-5 text-[15px] rounded-lg gap-2',
}

export function Button({
    as: Tag = 'button', variant = 'accent', size = 'md',
    loading = false, disabled, className, children, ...props
}) {
    return (
        <Tag
            className={cx(
                'inline-flex items-center justify-center whitespace-nowrap select-none',
                'transition-colors duration-150',
                'disabled:opacity-40 disabled:pointer-events-none',
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
        <div className={cx('surface rounded-lg', hover && 'surface-hover', className)} {...props}>
            {children}
        </div>
    )
}

/* ------------------------------------------------------------------- Badge */

const TONES = {
    neutral: 'bg-zinc-100 text-zinc-700',
    indigo: 'bg-brand-50 text-brand-700',
    violet: 'bg-amber-50 text-amber-800',
    amber: 'bg-amber-50 text-amber-800',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
    slate: 'bg-zinc-100 text-zinc-500',
}

export function Badge({ tone = 'neutral', dot = false, className, children }) {
    return (
        <span className={cx(
            'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5',
            'text-[12px] font-medium',
            TONES[tone] || TONES.neutral, className
        )}>
            {dot && <span className="size-1.5 rounded-full bg-current" />}
            {children}
        </span>
    )
}

/** Shared colour language for every status shown anywhere in the product. */
export const STATUS_TONE = {
    applied: 'neutral',
    shortlisted: 'sky',
    interview: 'indigo',
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
    'w-full rounded-lg bg-white border border-zinc-300 px-3 text-sm text-zinc-900 ' +
    'transition-colors duration-150 placeholder:text-zinc-400 ' +
    'hover:border-zinc-400 focus:border-brand-600 ' +
    'focus:ring-3 focus:ring-brand-600/15 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-400'

export function Field({ label, hint, error, required, children, className }) {
    return (
        <label className={cx('block', className)}>
            {label && (
                <span className="mb-1.5 flex items-center gap-1 text-[13px] font-medium text-zinc-800">
                    {label}
                    {required && <span className="text-zinc-400">*</span>}
                </span>
            )}
            {children}
            {hint && !error && <span className="mt-1.5 block text-[12px] text-zinc-500">{hint}</span>}
            {error && <span className="mt-1.5 block text-[12px] text-rose-600">{error}</span>}
        </label>
    )
}

export const Input = ({ className, ...props }) => (
    <input className={cx(fieldBase, 'h-10', className)} {...props} />
)

export const Textarea = ({ className, rows = 5, ...props }) => (
    <textarea rows={rows} className={cx(fieldBase, 'py-2.5 leading-relaxed resize-y', className)} {...props} />
)

export const Select = ({ className, children, ...props }) => (
    <select className={cx(fieldBase, 'h-10 appearance-none cursor-pointer pr-9',
        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'%2371717a\'%3E%3Cpath d=\'M4.5 6.5 8 10l3.5-3.5\' stroke=\'%2371717a\' stroke-width=\'1.6\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")]',
        'bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat', className)} {...props}>
        {children}
    </select>
)

/* -------------------------------------------------------------- Page chrome */

export function PageHeader({ eyebrow, title, subtitle, actions, className }) {
    return (
        <div className={cx('mb-8 flex flex-col gap-5 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between', className)}>
            <div className="min-w-0">
                {eyebrow && <p className="mb-1.5 text-[13px] text-zinc-500">{eyebrow}</p>}
                <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900 sm:text-[30px]">
                    {title}
                </h1>
                {subtitle && <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-zinc-600">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    )
}

export function EmptyState({ icon, title, description, action, className }) {
    return (
        <div className={cx('flex flex-col items-center rounded-lg border border-dashed border-zinc-300 px-6 py-14 text-center', className)}>
            {icon && <div className="mb-4 text-zinc-400">{icon}</div>}
            <h3 className="text-[15px] font-semibold text-zinc-900">{title}</h3>
            {description && <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-zinc-500">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    )
}

export function Skeleton({ className }) {
    return <div className={cx('skeleton rounded-lg', className)} />
}

/** Full-height loading state used while a page's first fetch is in flight. */
export function PageLoader({ label = 'Loading' }) {
    return (
        <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 animate-fade">
            <Spinner className="size-6 text-zinc-400" />
            <p className="text-[13px] text-zinc-500">{label}…</p>
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
                className="absolute inset-0 bg-zinc-900/40 animate-fade"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                className="surface animate-fade relative w-full max-w-lg rounded-lg p-6 shadow-xl"
            >
                {title && <h2 className="text-[17px] font-semibold text-zinc-900">{title}</h2>}
                {description && <p className="mt-1.5 text-[13.5px] leading-relaxed text-zinc-500">{description}</p>}
                {children && <div className="mt-5">{children}</div>}
                {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------- Misc */

/** Number-first stat tile; stats stay neutral so status colours keep their meaning. */
export function Stat({ label, value, hint, icon }) {
    return (
        <Card className="p-5">
            <div className="flex items-center justify-between gap-3 text-zinc-500">
                <p className="text-[13px]">{label}</p>
                {icon && <span className="shrink-0 [&>svg]:!size-4">{icon}</span>}
            </div>
            <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight text-zinc-900 tabular-nums">
                {value}
            </p>
            {hint && <p className="mt-2 text-[12.5px] text-zinc-500">{hint}</p>}
        </Card>
    )
}

export const Divider = ({ className }) => <div className={cx('hairline my-6', className)} />

export function Tabs({ tabs, value, onChange, className }) {
    return (
        <div className={cx('flex min-w-0 max-w-full gap-5 overflow-x-auto border-b border-zinc-200',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                    className={cx(
                        '-mb-px shrink-0 border-b-2 pb-2.5 pt-1 text-[13.5px] font-medium transition-colors duration-150',
                        value === tab.value
                            ? 'border-ink text-zinc-900'
                            : 'border-transparent text-zinc-500 hover:text-zinc-800'
                    )}
                >
                    {tab.label}
                    {tab.count != null && (
                        <span className="ml-1.5 rounded bg-zinc-100 px-1.5 py-px text-[11px] tabular-nums text-zinc-600">
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}
