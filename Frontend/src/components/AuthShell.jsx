import { Link } from 'react-router-dom'
import { Logo } from './Navbar'
import { IconCheck } from './icons'

/**
 * Split layout shared by login and register: the form on the left,
 * a quiet editorial panel on the right that disappears below lg.
 */
export default function AuthShell({ title, subtitle, children, footer, highlights }) {
    return (
        <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
            <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-14">
                <Logo />
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
                    <div className="animate-rise">
                        <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
                            {title}
                        </h1>
                        {subtitle && <p className="mt-2.5 text-[14.5px] leading-relaxed text-slate-400">{subtitle}</p>}
                    </div>
                    <div className="animate-rise mt-8" style={{ animationDelay: '80ms' }}>
                        {children}
                    </div>
                    {footer && <div className="mt-7 text-center text-[13.5px] text-slate-500">{footer}</div>}
                </div>
            </div>

            <aside className="relative hidden overflow-hidden border-l border-white/[0.07] lg:block">
                <div className="pointer-events-none absolute -right-24 top-1/4 size-[34rem] rounded-full bg-violet-600/14 blur-[100px] animate-drift" />
                <div className="pointer-events-none absolute -left-20 bottom-0 size-[26rem] rounded-full bg-indigo-600/12 blur-[90px]" />

                <div className="relative flex h-full flex-col justify-center px-14 py-16">
                    <p className="font-display text-[34px] italic leading-[1.25] text-slate-200">
                        “The placement cycle, finally in
                        <span className="text-gradient not-italic font-sans font-semibold"> one honest place</span>.”
                    </p>
                    <div className="hairline my-9" />
                    <ul className="space-y-4">
                        {(highlights || []).map(item => (
                            <li key={item} className="flex gap-3 text-[14px] leading-relaxed text-slate-400">
                                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/12 text-emerald-400 ring-1 ring-inset ring-emerald-400/25">
                                    <IconCheck className="size-3" />
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-12 text-[12px] text-slate-600">
                        Need a hand? <Link to="/" className="text-slate-400 underline-offset-4 hover:underline">Back to home</Link>
                    </p>
                </div>
            </aside>
        </div>
    )
}
