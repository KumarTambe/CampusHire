import { cx } from './ui'
import { PIPELINE } from '../lib/format'

/**
 * Horizontal progress rail for an application.
 * Terminal negative states (rejected / withdrawn) do not sit on the rail,
 * so they are rendered as a single muted note instead.
 */
export default function Pipeline({ status, className, viewer = 'student' }) {
    if (status === 'rejected' || status === 'withdrawn') {
        const tone = status === 'rejected' ? 'text-rose-600' : 'text-zinc-500'
        return (
            <div className={cx('flex items-center gap-2 text-[12.5px]', tone, className)}>
                <span className={cx('size-1.5 rounded-full', status === 'rejected' ? 'bg-rose-400' : 'bg-zinc-500')} />
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
                                'h-1 rounded-full',
                                done
                                    ? i === PIPELINE.length - 1
                                        ? 'bg-emerald-500'
                                        : 'bg-ink'
                                    : 'bg-zinc-200'
                            )} />
                            <p className={cx(
                                'mt-1.5 truncate text-[11px] capitalize',
                                i === current ? 'font-medium text-zinc-900' : done ? 'text-zinc-500' : 'text-zinc-400'
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
