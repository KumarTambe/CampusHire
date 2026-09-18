import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import {
    Badge, Button, Card, EmptyState, Input, Modal, PageHeader,
    Skeleton, StatusBadge, Tabs, cx
} from '../../components/ui'
import { IconSearch, IconUsers, IconCheck, IconX } from '../../components/icons'
import { formatDate, initials } from '../../lib/format'

export default function AdminUsers() {
    const { user: me } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState('all')
    const [query, setQuery] = useState('')
    const [target, setTarget] = useState(null)   // { user, action }
    const [busy, setBusy] = useState(false)

    const load = () =>
        api.get('/admin/users')
            .then(({ data }) => setUsers(data))
            .catch(err => toast.error(errorMessage(err, 'Could not load users')))
            .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    const counts = useMemo(() => ({
        all: users.length,
        student: users.filter(u => u.role === 'student').length,
        recruiter: users.filter(u => u.role === 'recruiter').length,
        admin: users.filter(u => u.role === 'admin').length,
        inactive: users.filter(u => !u.isActive).length,
    }), [users])

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        return users.filter(u => {
            if (role === 'inactive' ? u.isActive : role !== 'all' && u.role !== role) return false
            if (!q) return true
            return [u.firstName, u.lastName, u.email, u.companyName, u.college, u.branch]
                .filter(Boolean).join(' ').toLowerCase().includes(q)
        })
    }, [users, role, query])

    const run = async () => {
        setBusy(true)
        try {
            await api.put(`/admin/users/${target.user._id}/${target.action}`)
            toast.success(target.action === 'activate' ? 'Account reactivated' : 'Account deactivated')
            setTarget(null)
            await load()
        } catch (err) {
            toast.error(errorMessage(err, 'Could not update that account'))
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <PageHeader
                eyebrow="Placement cell"
                title="Users"
                subtitle="Every account on CampusHire. Deactivating blocks sign-in immediately without deleting any history."
                actions={
                    <div className="relative w-full sm:w-72">
                        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                        <Input className="pl-9" placeholder="Search name, email, company"
                            value={query} onChange={e => setQuery(e.target.value)} />
                    </div>
                }
            />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <Tabs value={role} onChange={setRole} tabs={[
                    { value: 'all', label: 'All', count: counts.all },
                    { value: 'student', label: 'Students', count: counts.student },
                    { value: 'recruiter', label: 'Recruiters', count: counts.recruiter },
                    { value: 'admin', label: 'Admins', count: counts.admin },
                    { value: 'inactive', label: 'Deactivated', count: counts.inactive },
                ]} />
                {!loading && <Badge tone="neutral">{visible.length} shown</Badge>}
            </div>

            {loading ? (
                <div className="space-y-2.5">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
                </div>
            ) : visible.length === 0 ? (
                <EmptyState icon={<IconUsers className="size-6" />} title="No users match"
                    description="Try a different search or filter." />
            ) : (
                <div className="space-y-2.5">
                    {visible.map((u, i) => (
                        <Card key={u._id} className={cx('animate-rise stagger p-4', !u.isActive && 'opacity-70')}
                            style={{ '--i': i }}>
                            <div className="flex flex-wrap items-center gap-4">
                                <span className={cx(
                                    'grid size-10 shrink-0 place-items-center rounded-xl text-[12.5px] font-semibold ring-1 ring-inset ring-slate-200',
                                    u.role === 'admin' ? 'bg-amber-50 text-amber-700'
                                        : u.role === 'recruiter' ? 'bg-violet-50 text-violet-700'
                                            : 'bg-indigo-50 text-indigo-700'
                                )}>
                                    {initials(u)}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-[14px] font-medium text-slate-900">
                                            {u.firstName} {u.lastName}
                                        </p>
                                        <Badge tone={u.role === 'admin' ? 'amber' : u.role === 'recruiter' ? 'violet' : 'indigo'}
                                            className="capitalize">{u.role}</Badge>
                                        {u.role === 'recruiter' && <StatusBadge status={u.verificationStatus} />}
                                        {!u.isActive && <Badge tone="rose" dot>Deactivated</Badge>}
                                    </div>
                                    <p className="mt-1 truncate text-[12.5px] text-slate-500">{u.email}</p>
                                    <p className="mt-0.5 truncate text-[11.5px] text-slate-400">
                                        {u.role === 'student'
                                            ? [u.college, u.branch, u.cgpa != null && `CGPA ${u.cgpa}`, u.graduationYear]
                                                .filter(Boolean).join(' · ') || 'Profile incomplete'
                                            : u.role === 'recruiter'
                                                ? u.companyName || 'No company set'
                                                : 'Placement cell'}
                                        {' · joined '}{formatDate(u.createdAt)}
                                    </p>
                                </div>

                                <div className="shrink-0">
                                    {u._id === me?._id ? (
                                        <Badge tone="neutral">That's you</Badge>
                                    ) : u.isActive ? (
                                        <Button variant="danger" size="sm"
                                            onClick={() => setTarget({ user: u, action: 'deactivate' })}>
                                            <IconX className="size-3.5" /> Deactivate
                                        </Button>
                                    ) : (
                                        <Button variant="success" size="sm"
                                            onClick={() => setTarget({ user: u, action: 'activate' })}>
                                            <IconCheck className="size-3.5" /> Reactivate
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                open={Boolean(target)}
                onClose={() => setTarget(null)}
                title={target?.action === 'activate' ? 'Reactivate this account?' : 'Deactivate this account?'}
                description={target?.action === 'activate'
                    ? `${target?.user.firstName} will be able to sign in again immediately.`
                    : `${target?.user.firstName} will be signed out and blocked from signing in. Their jobs and applications are kept intact.`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button>
                        <Button variant={target?.action === 'activate' ? 'success' : 'danger'}
                            loading={busy} onClick={run}>
                            {target?.action === 'activate' ? 'Reactivate' : 'Deactivate'}
                        </Button>
                    </>
                }
            />
        </>
    )
}
