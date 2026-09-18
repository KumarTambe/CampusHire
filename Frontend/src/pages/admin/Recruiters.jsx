import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import {
    Button, Card, EmptyState, Modal, PageHeader, Skeleton, StatusBadge, Tabs
} from '../../components/ui'
import { IconShield, IconCheck, IconX, IconLink, IconMail, IconBuilding } from '../../components/icons'
import { formatDate, initials } from '../../lib/format'

export default function AdminRecruiters() {
    const [recruiters, setRecruiters] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('pending')
    const [target, setTarget] = useState(null)   // { recruiter, action }
    const [busy, setBusy] = useState(false)

    // pulled from /admin/users so the verified and rejected tabs work too
    const load = () =>
        api.get('/admin/users', { params: { role: 'recruiter' } })
            .then(({ data }) => setRecruiters(data))
            .catch(err => toast.error(errorMessage(err, 'Could not load recruiters')))
            .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    const counts = useMemo(() => ({
        pending: recruiters.filter(r => r.verificationStatus === 'pending').length,
        verified: recruiters.filter(r => r.verificationStatus === 'verified').length,
        rejected: recruiters.filter(r => r.verificationStatus === 'rejected').length,
    }), [recruiters])

    const visible = recruiters.filter(r => r.verificationStatus === tab)

    const run = async () => {
        setBusy(true)
        try {
            await api.put(`/admin/recruiters/${target.recruiter._id}/${target.action}`)
            toast.success(target.action === 'verify' ? 'Recruiter verified' : 'Recruiter rejected')
            setTarget(null)
            await load()
        } catch (err) {
            toast.error(errorMessage(err, 'Could not update this recruiter'))
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <PageHeader
                eyebrow="Placement cell"
                title="Recruiter verification"
                subtitle="A recruiter cannot publish a single job until you verify their company here."
            />

            <Tabs
                className="mb-6 max-w-sm"
                value={tab}
                onChange={setTab}
                tabs={[
                    { value: 'pending', label: 'Pending', count: counts.pending },
                    { value: 'verified', label: 'Verified', count: counts.verified },
                    { value: 'rejected', label: 'Rejected', count: counts.rejected },
                ]}
            />

            {loading ? (
                <div className="grid gap-3 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
                </div>
            ) : visible.length === 0 ? (
                <EmptyState
                    icon={<IconShield className="size-6" />}
                    title={tab === 'pending' ? 'Nothing waiting on you' : `No ${tab} recruiters`}
                    description={tab === 'pending'
                        ? 'Every recruiter who has signed up has already been reviewed.'
                        : `No recruiter accounts are currently ${tab}.`}
                />
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {visible.map((r, i) => (
                        <Card key={r._id} hover className="animate-rise stagger p-5" style={{ '--i': i }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 gap-3.5">
                                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-[13px] font-bold text-violet-700 ring-1 ring-inset ring-violet-100">
                                        {initials(r)}
                                    </span>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-[15px] font-semibold text-slate-900">
                                            {r.companyName || `${r.firstName} ${r.lastName}`}
                                        </h3>
                                        <p className="mt-0.5 truncate text-[12.5px] text-slate-500">
                                            {r.firstName} {r.lastName}
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge status={r.verificationStatus} />
                            </div>

                            {r.companyDescription && (
                                <p className="mt-4 line-clamp-3 text-[13px] leading-relaxed text-slate-500">
                                    {r.companyDescription}
                                </p>
                            )}

                            <div className="mt-4 space-y-1.5 text-[12.5px]">
                                <a href={`mailto:${r.email}`}
                                    className="flex items-center gap-2 text-slate-500 underline-offset-4 hover:text-slate-400 hover:underline">
                                    <IconMail className="size-3.5 shrink-0" />
                                    <span className="truncate">{r.email}</span>
                                </a>
                                {r.companyWebsite && (
                                    <a href={r.companyWebsite} target="_blank" rel="noreferrer noopener"
                                        className="flex items-center gap-2 text-indigo-600 underline-offset-4 hover:underline">
                                        <IconLink className="size-3.5 shrink-0" />
                                        <span className="truncate">{r.companyWebsite}</span>
                                    </a>
                                )}
                                <p className="flex items-center gap-2 text-slate-400">
                                    <IconBuilding className="size-3.5 shrink-0" />
                                    Signed up {formatDate(r.createdAt)}
                                </p>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {r.verificationStatus !== 'verified' && (
                                    <Button variant="success" size="sm" className="flex-1"
                                        onClick={() => setTarget({ recruiter: r, action: 'verify' })}>
                                        <IconCheck className="size-3.5" /> Verify
                                    </Button>
                                )}
                                {r.verificationStatus !== 'rejected' && (
                                    <Button variant="danger" size="sm" className="flex-1"
                                        onClick={() => setTarget({ recruiter: r, action: 'reject' })}>
                                        <IconX className="size-3.5" /> Reject
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                open={Boolean(target)}
                onClose={() => setTarget(null)}
                title={target?.action === 'verify' ? 'Verify this recruiter?' : 'Reject this recruiter?'}
                description={target?.action === 'verify'
                    ? `${target?.recruiter.companyName || target?.recruiter.firstName} will be able to post and publish jobs immediately. They are notified of the decision.`
                    : `${target?.recruiter.companyName || target?.recruiter.firstName} will be blocked from posting jobs and notified of the decision.`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button>
                        <Button variant={target?.action === 'verify' ? 'success' : 'danger'}
                            loading={busy} onClick={run}>
                            {target?.action === 'verify' ? 'Verify' : 'Reject'}
                        </Button>
                    </>
                }
            />
        </>
    )
}
