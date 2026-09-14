/**
 * Eligibility engine.
 *
 * A student is eligible for a job when every criterion the recruiter *set*
 * passes. Criteria that were left empty are treated as "no restriction",
 * which is why each rule is guarded by a presence check.
 *
 * Returns { isEligible, reasons } — reasons lists every failed rule so the
 * UI can explain exactly why a student cannot apply.
 */
export function checkEligibility(student, job) {
    const reasons = []
    const e = job.eligibility || {}

    // 1. Minimum CGPA
    if (e.minCGPA != null && e.minCGPA > 0) {
        if (student.cgpa == null) {
            reasons.push(`Add your CGPA to your profile (minimum ${e.minCGPA} required)`)
        } else if (student.cgpa < e.minCGPA) {
            reasons.push(`CGPA ${student.cgpa} is below the required ${e.minCGPA}`)
        }
    }

    // 2. Allowed branches (case-insensitive so "CSE" matches "cse")
    if (Array.isArray(e.allowedBranches) && e.allowedBranches.length > 0) {
        const allowed = e.allowedBranches.map(b => String(b).trim().toLowerCase())
        const branch = student.branch ? student.branch.trim().toLowerCase() : null
        if (!branch) {
            reasons.push('Add your branch to your profile')
        } else if (!allowed.includes(branch)) {
            reasons.push(`Open to ${e.allowedBranches.join(', ')} only`)
        }
    }

    // 3. Graduation year
    if (e.graduationYear != null) {
        if (student.graduationYear == null) {
            reasons.push('Add your graduation year to your profile')
        } else if (Number(student.graduationYear) !== Number(e.graduationYear)) {
            reasons.push(`Only for the batch of ${e.graduationYear}`)
        }
    }

    return { isEligible: reasons.length === 0, reasons }
}

/** Deadline check kept separate from eligibility — it is a job state, not a student trait. */
export function isDeadlinePassed(job) {
    if (!job.applicationDeadline) return false
    return new Date(job.applicationDeadline).getTime() < Date.now()
}
