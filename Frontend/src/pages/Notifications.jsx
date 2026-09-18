import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../lib/api'
import { Badge, Button, Card, EmptyState, PageHeader, Skeleton, cx } from '../components/ui'
import { IconBell, IconCheck } from '../components/icons'
import { timeAgo, formatDateTime } from '../lib/format'

export default function Notifications() {
    const [items, setItems] = useState([])
    const [unread, setUnread] = useState(0)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)

    const load = () =>
        api.get('/users/notifications')
            .then(({ data }) => { setItems(data.notifications); setUnread(data.unread) })
            .catch(err => toast.error(errorMessage(err, 'Could not load notifications')))
            .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    const markOne = async (id) => {
        // optimistic — the badge should not lag behind the click
        setItems(list => list.map(n => n._id === id ? { ...n, read: true } : n))
        setUnread(u => Math.max(0, u - 1))
        try {
            await api.put(`/users/notifications/${id}/read`)
        } catch (err) {
            toast.error(errorMessage(err, 'Could not mark as read'))
            load()
        }
    }

    const markAll = async () => {
        setBusy(true)
        try {
            await api.put('/users/notifications/read-all')
            setItems(list => list.map(n => ({ ...n, read: true })))
            setUnread(0)
            toast.success('All caught up')
        } catch (err) {
            toast.error(errorMessage(err, 'Could not mark all as read'))
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <PageHeader
                eyebrow="Activity"
                title="Notifications"
                subtitle="Status changes, new applicants and account updates land here."
                actions={
                    <div className="flex items-center gap-2.5">
                        {unread > 0 && <Badge tone="amber" dot>{unread} unread</Badge>}
                        <Button variant="ghost" size="sm" onClick={markAll}
                            loading={busy} disabled={unread === 0}>
                            <IconCheck className="size-4" /> Mark all read
                        </Button>
                    </div>
                }
            />

            {loading ? (
                <div className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
                </div>
            ) : items.length === 0 ? (
                <EmptyState
                    icon={<IconBell className="size-6" />}
                    title="Nothing yet"
                    description="You will hear from us the moment something moves — a new applicant, a shortlist, an interview call."
                />
            ) : (
                <div className="space-y-2.5">
                    {items.map((n, i) => (
                        <Card
                            key={n._id}
                            className={cx(
                                'animate-rise stagger flex items-start gap-4 p-4 transition-colors',
                                !n.read && 'border-brand-200 bg-brand-50'
                            )}
                            style={{ '--i': i }}
                        >
                            <span className={cx(
                                'mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset',
                                n.read
                                    ? 'bg-slate-50 text-slate-500 ring-slate-200'
                                    : 'bg-indigo-50 text-indigo-600 ring-indigo-200'
                            )}>
                                <IconBell className="size-[17px]" />
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className={cx('text-[13.5px] leading-relaxed',
                                    n.read ? 'text-slate-500' : 'text-slate-700')}>
                                    {n.message}
                                </p>
                                <p className="mt-1 text-[11.5px] text-slate-400" title={formatDateTime(n.createdAt)}>
                                    {timeAgo(n.createdAt)}
                                </p>
                            </div>

                            {!n.read && (
                                <Button variant="subtle" size="xs" onClick={() => markOne(n._id)}
                                    className="shrink-0" title="Mark as read">
                                    <IconCheck className="size-3.5" />
                                </Button>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </>
    )
}
