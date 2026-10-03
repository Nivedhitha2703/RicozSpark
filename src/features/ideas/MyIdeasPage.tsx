import {
  AlertCircle,
  ChevronRight,
  Clock3,
  Lightbulb,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'

import { getMyIdeas, type MyIdea } from './my-ideas-api'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function getStatusClasses(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-400'

    case 'UNDER_REVIEW':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-400'

    case 'UNDER_EVALUATION':
      return 'border-purple-500/20 bg-purple-500/10 text-purple-400'

    case 'APPROVED':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'

    case 'REJECTED':
      return 'border-red-500/20 bg-red-500/10 text-red-400'

    case 'CHANGES_REQUESTED':
      return 'border-orange-500/20 bg-orange-500/10 text-orange-400'

    case 'IN_PIPELINE':
      return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400'

    case 'CONVERTED_TO_PROJECT':
      return 'border-green-500/20 bg-green-500/10 text-green-400'

    default:
      return 'border-border bg-surface text-muted'
  }
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(' ')
}

function formatPriority(priority: string) {
  return (
    priority.charAt(0) +
    priority.slice(1).toLowerCase()
  )
}

export function MyIdeasPage() {
  const [ideas, setIdeas] = useState<MyIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadIdeas = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        setError(null)

        const data = await getMyIdeas()
        setIdeas(data)
      } catch (err) {
        console.error(
          'Failed to load my ideas:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load your ideas.',
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    const timer = window.setTimeout(() => {
      if (!cancelled) {
        void loadIdeas()
      }
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [loadIdeas])

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Ideas
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            My Ideas
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Track the ideas you have submitted and
            follow their progress through the
            innovation lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void loadIdeas(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>

          <Link
            to="/ideas/new"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            + Submit Idea
          </Link>
        </div>
      </div>

      {/* Summary */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lightbulb className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Total ideas
                </p>

                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {ideas.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  In progress
                </p>

                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {
                    ideas.filter((idea) =>
                      [
                        'SUBMITTED',
                        'UNDER_REVIEW',
                        'UNDER_EVALUATION',
                        'CHANGES_REQUESTED',
                        'IN_PIPELINE',
                      ].includes(idea.status),
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Lightbulb className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Approved
                </p>

                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {
                    ideas.filter((idea) =>
                      [
                        'APPROVED',
                        'IN_PIPELINE',
                        'CONVERTED_TO_PROJECT',
                      ].includes(idea.status),
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-3 text-sm text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your ideas...
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

            <div>
              <h2 className="font-medium text-foreground">
                Unable to load your ideas
              </h2>

              <p className="mt-1 text-sm text-muted">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void loadIdeas()}
                className="mt-4 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        ideas.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lightbulb className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-foreground">
              You haven't submitted any ideas yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Share your next innovation with the
              organization and track its progress here.
            </p>

            <Link
              to="/ideas/new"
              className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Submit your first idea
            </Link>
          </div>
        )}

      {/* Ideas */}
      {!loading &&
        !error &&
        ideas.length > 0 && (
          <div className="space-y-3">
            {ideas.map((idea) => (
              <Link
                key={idea.id}
                to={`/ideas/${idea.id}`}
                className="group block rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40 hover:bg-surface/80"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-medium text-primary">
                        {idea.idea_code}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          idea.status,
                        )}`}
                      >
                        {formatStatus(idea.status)}
                      </span>

                      <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
                        {formatPriority(idea.priority)}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-semibold text-foreground transition group-hover:text-primary">
                      {idea.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                      {idea.short_description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                      {idea.category && (
                        <span>
                          Category:{' '}
                          <span className="text-foreground">
                            {idea.category.name}
                          </span>
                        </span>
                      )}

                      <span>
                        Submitted:{' '}
                        <span className="text-foreground">
                          {formatDate(
                            idea.submitted_at ??
                              idea.created_at,
                          )}
                        </span>
                      </span>

                      <span>
                        Revision:{' '}
                        <span className="text-foreground">
                          {idea.revision_number}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-muted transition group-hover:text-primary">
                    View idea
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
    </section>
  )
}