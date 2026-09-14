export const formatDate = (value, opts = {}) => {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', ...opts,
    })
}

export const formatDateTime = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
    })
}

/** "3 days left" / "Closed 2 days ago" — relative to now, coarse units only. */
export const relativeDeadline = (value) => {
    if (!value) return null
    const diff = new Date(value).getTime() - Date.now()
    const days = Math.ceil(diff / 864e5)
    if (days < 0) return { label: 'Deadline passed', urgent: true, past: true }
    if (days === 0) return { label: 'Closes today', urgent: true }
    if (days === 1) return { label: '1 day left', urgent: true }
    if (days <= 5) return { label: `${days} days left`, urgent: true }
    return { label: `${days} days left`, urgent: false }
}

export const timeAgo = (value) => {
    const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
    const units = [
        ['year', 31536000], ['month', 2592000], ['week', 604800],
        ['day', 86400], ['hour', 3600], ['minute', 60],
    ]
    for (const [unit, secs] of units) {
        const count = Math.floor(seconds / secs)
        if (count >= 1) return `${count} ${unit}${count > 1 ? 's' : ''} ago`
    }
    return 'just now'
}

export const initials = (user) =>
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()

export const companyOf = (job) =>
    job?.postedBy?.companyName
    || [job?.postedBy?.firstName, job?.postedBy?.lastName].filter(Boolean).join(' ')
    || 'A recruiter'

export const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CHEM', 'AERO', 'BIOTECH', 'MBA', 'Other']

export const GRAD_YEARS = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() + i - 2)

export const APPLICATION_STATUSES =
    ['applied', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn']

/** Mirrors the server's transition table so buttons only offer legal moves. */
export const RECRUITER_NEXT = {
    applied: ['shortlisted', 'rejected'],
    shortlisted: ['interview', 'rejected'],
    interview: ['selected', 'rejected'],
    selected: [], rejected: [], withdrawn: [],
}

export const PIPELINE = ['applied', 'shortlisted', 'interview', 'selected']
