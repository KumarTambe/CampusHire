import { Logo } from './Navbar'

/**
 * Centered white card floating on the navy → indigo wash, matching the
 * simple single-column auth layout used across the product.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
    return (
        <div className="navy-wash flex min-h-svh items-center justify-center px-4 py-12">
            <div className="animate-rise w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
                <div className="flex justify-center">
                    <Logo dark />
                </div>

                <div className="mt-7 text-center">
                    <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">
                        {title}
                    </h1>
                    {subtitle && <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{subtitle}</p>}
                </div>

                <div className="mt-7">
                    {children}
                </div>

                {footer && <div className="mt-6 text-center text-[13.5px] text-slate-500">{footer}</div>}
            </div>
        </div>
    )
}
