/**
 * Allowed application status transitions.
 *
 * Each key is the current status; the value lists the statuses it may move to
 * and which role is permitted to make that move. Anything not listed here is
 * rejected, which keeps the pipeline (applied → shortlisted → interview →
 * selected) strictly forward-only apart from rejection and withdrawal.
 */
const TRANSITIONS = {
    applied: {
        shortlisted: ['recruiter', 'admin'],
        rejected: ['recruiter', 'admin'],
        withdrawn: ['student'],
    },
    shortlisted: {
        interview: ['recruiter', 'admin'],
        rejected: ['recruiter', 'admin'],
        withdrawn: ['student', 'recruiter', 'admin'],
    },
    interview: {
        selected: ['recruiter', 'admin'],
        rejected: ['recruiter', 'admin'],
    },
    // terminal states
    selected: {},
    rejected: {},
    withdrawn: {},
}

export function canTransition(from, to, role) {
    const allowedRoles = TRANSITIONS[from]?.[to]
    if (!allowedRoles) {
        return { ok: false, message: `Cannot move an application from "${from}" to "${to}"` }
    }
    if (!allowedRoles.includes(role)) {
        return { ok: false, message: `A ${role} is not allowed to make this status change` }
    }
    return { ok: true }
}

export function nextStatuses(from, role) {
    const map = TRANSITIONS[from] || {}
    return Object.keys(map).filter(to => map[to].includes(role))
}
