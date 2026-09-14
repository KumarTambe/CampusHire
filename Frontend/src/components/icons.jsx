/* A small hand-rolled icon set — stroke based, 1.6px, 24px grid. */
const Svg = ({ children, className = 'size-5', ...props }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        {children}
    </svg>
)

export const IconBriefcase = (p) => <Svg {...p}><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" /><path d="M3 12h18" /></Svg>
export const IconCompass = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m15 9-2 4.2-4 1.8 2-4.2z" /></Svg>
export const IconFile = (p) => <Svg {...p}><path d="M14 3v4.5a1 1 0 0 0 1 1h4.5" /><path d="M19.5 9.5V19a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2H14z" /><path d="M8.5 13.5h7M8.5 17h4.5" /></Svg>
export const IconBell = (p) => <Svg {...p}><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z" /><path d="M13.7 19.5a2 2 0 0 1-3.4 0" /></Svg>
export const IconUser = (p) => <Svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" /></Svg>
export const IconUsers = (p) => <Svg {...p}><circle cx="9.5" cy="8.5" r="3.2" /><path d="M3.5 19.5a6 6 0 0 1 12 0" /><path d="M16.5 6.2a3.2 3.2 0 0 1 0 6M18 19.5a6 6 0 0 0-2.2-4.6" /></Svg>
export const IconShield = (p) => <Svg {...p}><path d="M12 3.2 5 6v5.4c0 4 2.9 7.6 7 9.4 4.1-1.8 7-5.4 7-9.4V6z" /><path d="m9.3 12 1.9 1.9 3.6-3.8" /></Svg>
export const IconGauge = (p) => <Svg {...p}><path d="M4 17a9 9 0 1 1 16 0" /><path d="m12 14 3.5-3.8" /><circle cx="12" cy="15" r="1.4" /></Svg>
export const IconPlus = (p) => <Svg {...p}><path d="M12 5.5v13M5.5 12h13" /></Svg>
export const IconCheck = (p) => <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7" /></Svg>
export const IconX = (p) => <Svg {...p}><path d="m6.5 6.5 11 11M17.5 6.5l-11 11" /></Svg>
export const IconArrowRight = (p) => <Svg {...p}><path d="M5 12h13M13 6.5 18.5 12 13 17.5" /></Svg>
export const IconArrowLeft = (p) => <Svg {...p}><path d="M19 12H6M11 6.5 5.5 12 11 17.5" /></Svg>
export const IconSearch = (p) => <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></Svg>
export const IconClock = (p) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></Svg>
export const IconPin = (p) => <Svg {...p}><path d="M12 21s6.5-5.6 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10.6" r="2.3" /></Svg>
export const IconSpark = (p) => <Svg {...p}><path d="M12 3.5 13.7 9l5.8 1.8-5.8 1.9L12 18.5 10.3 12.7 4.5 10.8 10.3 9z" /></Svg>
export const IconLogout = (p) => <Svg {...p}><path d="M14.5 4.5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3" /><path d="M10 8.5 13.5 12 10 15.5M13 12H4.5" /></Svg>
export const IconMenu = (p) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>
export const IconEdit = (p) => <Svg {...p}><path d="M4.5 19.5h4L19 9a2.1 2.1 0 0 0-3-3L5.5 16.5z" /><path d="M14.5 7.5 17.5 10.5" /></Svg>
export const IconTrash = (p) => <Svg {...p}><path d="M4.5 7h15M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" /><path d="M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12" /></Svg>
export const IconSend = (p) => <Svg {...p}><path d="M20 4 3.5 10.5l6.7 2.4L13 20z" /><path d="m10.2 12.9 3.4-3.4" /></Svg>
export const IconGrad = (p) => <Svg {...p}><path d="M12 4.5 22 9l-10 4.5L2 9z" /><path d="M6.5 11v4.6c0 1.9 2.5 3.4 5.5 3.4s5.5-1.5 5.5-3.4V11" /></Svg>
export const IconChart = (p) => <Svg {...p}><path d="M4.5 19.5h15" /><path d="M7.5 19.5v-6M12 19.5V6M16.5 19.5v-9" /></Svg>
export const IconLink = (p) => <Svg {...p}><path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.54 3.54 0 0 0-5-5L11.7 7.3" /><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0L6 13a3.54 3.54 0 0 0 5 5l1.3-1.3" /></Svg>
export const IconInbox = (p) => <Svg {...p}><path d="M4 13.5 6 5.5h12l2 8v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M4 13.5h4l1 2.5h6l1-2.5h4" /></Svg>
export const IconFilter = (p) => <Svg {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Svg>
export const IconHistory = (p) => <Svg {...p}><path d="M4 12a8 8 0 1 0 2.5-5.8" /><path d="M4 4v3.5h3.5" /><path d="M12 8v4.2l2.8 1.6" /></Svg>
export const IconLock = (p) => <Svg {...p}><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></Svg>
export const IconMail = (p) => <Svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m4 7 8 5.5L20 7" /></Svg>
export const IconBuilding = (p) => <Svg {...p}><path d="M4 20.5V5.5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 14 5.5v15" /><path d="M14 10h4.5A1.5 1.5 0 0 1 20 11.5v9" /><path d="M3 20.5h18M7 8h4M7 12h4M7 16h4" /></Svg>
