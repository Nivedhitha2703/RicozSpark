import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from './notification-api'

function formatNotificationTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()

  const difference = now.getTime() - date.getTime()
  const minutes = Math.floor(difference / (1000 * 60))
  const hours = Math.floor(difference / (1000 * 60 * 60))
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'IDEA_SUBMITTED':
      return <Sparkles className="h-5 w-5" />

    default:
      return <Bell className="h-5 w-5" />
  }
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadNotifications() {
    try {
      setError('')
      setLoading(true)

      const data = await getNotifications()
      setNotifications(data)
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load notifications.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadNotifications()
  }, [])

  async function handleMarkAsRead(notificationId: string) {
    try {
      setActionLoading(notificationId)

      await markNotificationAsRead(notificationId)

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification,
        ),
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update notification.',
      )
    } finally {
      setActionLoading(null)
    }
  }

  async function handleMarkAllAsRead() {
    try {
      setActionLoading('all')

      await markAllNotificationsAsRead()

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update notifications.',
      )
    } finally {
      setActionLoading(null)
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Communication
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Notifications
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted">
            Stay updated on your ideas, reviews, decisions, and other
            innovation activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={actionLoading === 'all'}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading === 'all' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}

            Mark all as read
          </button>
        )}
      </div>

      {/* Summary */}
      {!loading && !error && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-medium">
              {notifications.length === 0
                ? 'No notifications'
                : `${notifications.length} notification${
                    notifications.length === 1 ? '' : 's'
                  }`}
            </p>

            <p className="text-xs text-muted">
              {unreadCount === 0
                ? 'You are all caught up.'
                : `${unreadCount} unread`}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading notifications...
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && notifications.length === 0 && (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </div>

          <h2 className="mt-4 text-base font-semibold">
            You're all caught up
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted">
            Notifications about your ideas, reviews, and innovation
            activity will appear here.
          </p>
        </div>
      )}

      {/* Notification list */}
      {!loading && notifications.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const unread = !notification.is_read
              const isMarking =
                actionLoading === notification.id

              return (
                <div
                  key={notification.id}
                  className={`flex gap-4 px-5 py-5 transition ${
                    unread
                      ? 'bg-primary/[0.035]'
                      : 'bg-surface'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      unread
                        ? 'bg-primary/10 text-primary'
                        : 'bg-background text-muted'
                    }`}
                  >
                    {getNotificationIcon(
                      notification.notification_type,
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-2">
                        <h2
                          className={`text-sm ${
                            unread
                              ? 'font-semibold text-foreground'
                              : 'font-medium text-foreground'
                          }`}
                        >
                          {notification.title}
                        </h2>

                        {unread && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                            New
                          </span>
                        )}
                      </div>

                      <span className="shrink-0 text-xs text-muted">
                        {formatNotificationTime(
                          notification.created_at,
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-muted">
                      {notification.message}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {notification.link && (
                        <Link
                          to={notification.link}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:opacity-80"
                        >
                          View details
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}

                      {unread && (
                        <button
                          type="button"
                          onClick={() =>
                            handleMarkAsRead(notification.id)
                          }
                          disabled={isMarking}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isMarking ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}

                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}