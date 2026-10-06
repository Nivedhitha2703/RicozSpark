import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useAuth } from '../auth/useAuth'
import {
  assignReview,
  getReviewQueue,
  saveReview,
  type ReviewInput,
  type ReviewQueueItem,
  type ReviewRecommendation,
} from './review-api'

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function statusClasses(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-300'
    case 'UNDER_REVIEW':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-300'
    case 'UNDER_EVALUATION':
      return 'border-violet-500/20 bg-violet-500/10 text-violet-300'
    case 'CHANGES_REQUESTED':
      return 'border-orange-500/20 bg-orange-500/10 text-orange-300'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

function reviewStatusClasses(status: string | null) {
  switch (status) {
    case 'IN_REVIEW':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-300'
    case 'COMPLETED':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

function recommendationLabel(
  recommendation: ReviewRecommendation | null,
) {
  switch (recommendation) {
    case 'MOVE_TO_EVALUATION':
      return 'Move to Evaluation'
    case 'REQUEST_CHANGES':
      return 'Request Changes'
    case 'REJECT':
      return 'Reject'
    case 'NEEDS_INFORMATION':
      return 'Needs Information'
    default:
      return 'No recommendation'
  }
}

function ReviewModal({
  item,
  onClose,
  onSaved,
}: {
  item: ReviewQueueItem
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const { user } = useAuth()

  const [notes, setNotes] = useState(item.reviewNotes ?? '')
  const [requestedInformation, setRequestedInformation] = useState(
    item.requestedInformation ?? '',
  )
  const [recommendation, setRecommendation] =
    useState<ReviewRecommendation | ''>(
      item.recommendation ?? '',
    )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!user) {
      setError('Your session has expired. Please sign in again.')
      return
    }

    if (!recommendation) {
      setError('Please select a recommendation.')
      return
    }

    if (!notes.trim()) {
      setError('Please add review notes before completing the review.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (!item.reviewId) {
        await assignReview(item.ideaId, user.id)
      }

      let reviewId = item.reviewId

      if (!reviewId) {
        const refreshed = await getReviewQueue()
        const createdReview = refreshed.find(
          (review) => review.ideaId === item.ideaId,
        )

        reviewId = createdReview?.reviewId ?? null
      }

      if (!reviewId) {
        throw new Error('Unable to create the review record.')
      }

      const input: ReviewInput = {
        ideaId: item.ideaId,
        recommendation,
        reviewNotes: notes,
        requestedInformation,
      }

      await saveReview(reviewId, input)
      await onSaved()
      onClose()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save the review.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
              Review idea
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.ideaCode}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close review"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="text-sm font-medium">Problem / idea summary</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.shortDescription}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border px-2.5 py-1">
                {item.categoryName}
              </span>

              <span
                className={`rounded-full border px-2.5 py-1 ${statusClasses(item.status)}`}
              >
                {formatStatus(item.status)}
              </span>

              <span className="rounded-full border border-border px-2.5 py-1">
                Submitted {formatDate(item.createdAt)}
              </span>
            </div>
          </div>

          {error && (
            <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">
              Recommendation
            </label>

            <select
              value={recommendation}
              onChange={(event) =>
                setRecommendation(
                  event.target.value as ReviewRecommendation | '',
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select recommendation</option>
              <option value="MOVE_TO_EVALUATION">
                Move to Evaluation
              </option>
              <option value="REQUEST_CHANGES">
                Request Changes
              </option>
              <option value="REJECT">Reject</option>
              <option value="NEEDS_INFORMATION">
                Needs Information
              </option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Review notes
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              placeholder="Record your assessment, strengths, concerns, and reasoning..."
              className="mt-2 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Requested information
              <span className="ml-2 font-normal text-muted-foreground">
                Optional
              </span>
            </label>

            <textarea
              value={requestedInformation}
              onChange={(event) =>
                setRequestedInformation(event.target.value)
              }
              rows={4}
              placeholder="Mention any additional information the submitter should provide..."
              className="mt-2 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Complete Review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReviewQueuePage() {
  const { role, user, loading: authLoading } = useAuth()

  const [items, setItems] = useState<ReviewQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] =
    useState<ReviewQueueItem | null>(null)
  const [actionBusy, setActionBusy] = useState<string | null>(null)

  const canReview =
    role === 'REVIEWER' ||
    role === 'MANAGER' ||
    role === 'ADMIN'

  const loadQueue = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getReviewQueue()
      setItems(data)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load the review queue.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const timer = window.setTimeout(() => {
      if (!cancelled) {
        void loadQueue()
      }
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [loadQueue])

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return items
    }

    return items.filter((item) =>
      [
        item.ideaCode,
        item.title,
        item.shortDescription,
        item.categoryName,
        item.submitterName,
        item.reviewerName ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [items, search])

  const handleAssignToMe = async (item: ReviewQueueItem) => {
    if (!user) {
      return
    }

    setActionBusy(item.ideaId)
    setError(null)

    try {
      await assignReview(item.ideaId, user.id)
      await loadQueue()
    } catch (assignError) {
      setError(
        assignError instanceof Error
          ? assignError.message
          : 'Unable to assign the review.',
      )
    } finally {
      setActionBusy(null)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  if (!canReview) {
    return (
      <div className="mx-auto max-w-2xl py-16">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />

          <h1 className="mt-4 text-2xl font-semibold">
            Reviewer access required
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            The Review Queue is available to Reviewers, Managers,
            and Administrators. Your current account does not have
            one of these roles.
          </p>
        </div>
      </div>
    )
  }

  const pendingCount = items.filter(
    (item) => !item.reviewId,
  ).length

  const inReviewCount = items.filter(
    (item) => item.reviewStatus === 'IN_REVIEW',
  ).length

  const completedCount = items.filter(
    (item) => item.reviewStatus === 'COMPLETED',
  ).length

  return (
    <>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            Innovation
          </p>

          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Review Queue
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Review submitted ideas, capture your assessment, and
                recommend the next stage in the innovation lifecycle.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadQueue()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Awaiting review
              </span>
              <Clock3 className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                In review
              </span>
              <MessageSquareText className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {inReviewCount}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Completed
              </span>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {completedCount}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => void loadQueue()}
              className="font-semibold underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">Ideas requiring attention</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {filteredItems.length} idea
                {filteredItems.length === 1 ? '' : 's'} shown
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search ideas..."
                className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />

              <h3 className="mt-4 font-semibold">
                No ideas require review
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Submitted ideas will appear here when they enter the
                review workflow.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredItems.map((item) => (
                <div
                  key={item.ideaId}
                  className="p-5 transition hover:bg-muted/20"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-primary">
                          {item.ideaCode}
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs ${statusClasses(item.status)}`}
                        >
                          {formatStatus(item.status)}
                        </span>

                        {item.reviewStatus && (
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs ${reviewStatusClasses(item.reviewStatus)}`}
                          >
                            {formatStatus(item.reviewStatus)}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {item.shortDescription}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span>{item.categoryName}</span>

                        <span className="flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5" />
                          {item.submitterName}
                        </span>

                        <span>
                          Submitted {formatDate(item.createdAt)}
                        </span>

                        {item.reviewerName && (
                          <span>
                            Reviewer: {item.reviewerName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                      {!item.reviewerId && (
                        <button
                          type="button"
                          onClick={() => void handleAssignToMe(item)}
                          disabled={actionBusy === item.ideaId}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionBusy === item.ideaId && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Assign to me
                        </button>
                      )}

                      {item.reviewerId === user?.id ||
                      role === 'MANAGER' ||
                      role === 'ADMIN' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          {item.reviewStatus === 'COMPLETED'
                            ? 'View Review'
                            : 'Review Idea'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {item.recommendation && (
                    <div className="mt-4 rounded-xl border border-border bg-background/40 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Recommendation
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {recommendationLabel(item.recommendation)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedItem && (
        <ReviewModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSaved={loadQueue}
        />
      )}
    </>
  )
}