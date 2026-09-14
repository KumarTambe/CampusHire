import { cx } from './ui'
import { PIPELINE } from '../lib/format'

/**
 * Horizontal progress rail for an application.
 * Terminal negative states (rejected / withdrawn) do not sit on the rail,
 * so they are rendered as a single muted note instead.
 */
export default function Pipeline({ status, className, viewer = 'student' }) {
    if (status === 'rejected' || status === 'withdrawn') {
        const tone = status === 'rejected' ? 'text-rose-300' : 'text-slate-400'
        return (
            <div className={cx('flex items-center gap-2 text-[12.5px]', tone, className)}>
                <span className={cx('size-1.5 rounded-full', status === 'rejected' ? 'bg-rose-400' : 'bg-slate-500')} />
                {status === 'rejected'
                    ? 'Not moving forward'
                    : viewer === 'student' ? 'Withdrawn by you' : 'Withdrawn by the student'}
            </div>
        )
    }

    const current = PIPELINE.indexOf(status)

    return (
        <div className={cx('flex items-center gap-1.5', className)}>
            {PIPELINE.map((step, i) => {
                const done = i <= current
                return (
                    <div key={step} className="flex flex-1 items-center gap-1.5">
                        <div className="min-w-0 flex-1">
                            <div className={cx(
                                'h-1 rounded-full transition-colors duration-500',
                                done
                                    ? i === PIPELINE.length - 1
                                        ? 'bg-emerald-400'
                                        : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                                    : 'bg-white/8'
                            )} />
                            <p className={cx(
                                'mt-1.5 truncate text-[10.5px] capitalize',
                                i === current ? 'font-medium text-slate-200' : done ? 'text-slate-500' : 'text-slate-600'
                            )}>
                                {step}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
