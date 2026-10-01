import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  History,
  Lightbulb,
  Loader2,
  Target,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'

import {
  getIdeaDetail,
  type IdeaActivity,
  type IdeaDetail,
  type IdeaStatusHistory,
} from './idea-detail-api'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatActivityType(type: string) {
  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>

        <h2 className="text-base font-semibold text-foreground">
          {title}
        </h2>
      </div>

      {children}
    </section>
  )
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: string | number | null
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {value === null || value === ''
          ? 'Not provided'
          : String(value)}
      </p>
    </div>
  )
}

function StatusHistory({
  history,
}: {
  history: IdeaStatusHistory[]
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <History className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Lifecycle History
          </h2>

          <p className="mt-1 text-xs text-muted">
            Track how this idea has progressed through the innovation
            workflow.
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted">
          No lifecycle history is available yet.
        </p>
      ) : (
        <div className="space-y-5">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="relative flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                {index < history.length - 1 && (
                  <div className="mt-2 h-full w-px bg-border" />
                )}
              </div>

              <div className="pb-2">
                <p className="text-sm font-medium text-foreground">
                  {item.from_status
                    ? `${formatStatus(item.from_status)} → ${formatStatus(
                        item.to_status,
                      )}`
                    : formatStatus(item.to_status)}
                </p>

                {item.reason && (
                  <p className="mt-1 text-sm text-muted">
                    {item.reason}
                  </p>
                )}

                <p className="mt-2 text-xs text-muted">
                  {formatDateTime(item.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ActivityFeed({
  activity,
}: {
  activity: IdeaActivity[]
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Clock3 className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Activity
          </h2>

          <p className="mt-1 text-xs text-muted">
            Recent activity recorded for this idea.
          </p>
        </div>
      </div>

      {activity.length === 0 ? (
        <p className="text-sm text-muted">
          No activity has been recorded yet.
        </p>
      ) : (
        <div className="space-y-4">
          {activity.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.description}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {formatActivityType(item.activity_type)}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-muted">
                  {formatDateTime(item.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function IdeaDetailPage() {
  const { ideaId } = useParams<{ ideaId: string }>()

  const [idea, setIdea] = useState<IdeaDetail | null>(null)
  const [statusHistory, setStatusHistory] = useState<IdeaStatusHistory[]>([])
  const [activity, setActivity] = useState<IdeaActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIdea = useCallback(async () => {
    if (!ideaId) {
      setError('No idea was specified.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await getIdeaDetail(ideaId)

      setIdea(data.idea)
      setStatusHistory(data.statusHistory)
      setActivity(data.activity)
    } catch (err) {
      console.error('Failed to load idea detail:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load the idea.',
      )
    } finally {
      setLoading(false)
    }
  }, [ideaId])

  useEffect(() => {
    void loadIdea()
  }, [loadIdea])

  if (loading) {
    return (
      <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading idea...
        </div>
      </section>
    )
  }

  if (error || !idea) {
    return (
      <section className="space-y-6">
        <Link
          to="/ideas/my"
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Ideas
        </Link>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

            <div>
              <h1 className="font-semibold text-foreground">
                Unable to load idea
              </h1>

              <p className="mt-2 text-sm text-muted">
                {error ?? 'The requested idea could not be found.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {/* Back */}
      <Link
        to="/ideas/my"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Ideas
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
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
                {idea.priority.charAt(0) +
                  idea.priority.slice(1).toLowerCase()}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              {idea.title}
            </h1>

            <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
              {idea.short_description}
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted">
              Submitted
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDate(
                idea.submitted_at ?? idea.created_at,
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Category
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {idea.category?.name ?? 'Not assigned'}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Revision
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {idea.revision_number}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Created
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDate(idea.created_at)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Last updated
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDate(idea.updated_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <DetailSection
            icon={<Lightbulb className="h-4 w-4" />}
            title="Idea Context"
          >
            <div className="space-y-6">
              <DetailField
                label="Problem Statement"
                value={idea.problem_statement}
              />

              <DetailField
                label="Proposed Solution"
                value={idea.proposed_solution}
              />
            </div>
          </DetailSection>

          <DetailSection
            icon={<Target className="h-4 w-4" />}
            title="Business Context"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <DetailField
                label="Expected Benefits"
                value={idea.expected_benefits}
              />

              <DetailField
                label="Business Impact"
                value={idea.business_impact}
              />

              <DetailField
                label="Target Users"
                value={idea.target_users}
              />

              <DetailField
                label="Strategic Alignment"
                value={idea.strategic_alignment}
              />
            </div>
          </DetailSection>

          <DetailSection
            icon={<FileText className="h-4 w-4" />}
            title="Implementation"
          >
            <div className="space-y-6">
              <DetailField
                label="Implementation Approach"
                value={idea.implementation_approach}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <DetailField
                  label="Estimated Effort"
                  value={idea.estimated_effort}
                />

                <DetailField
                  label="Estimated Cost"
                  value={
                    idea.estimated_cost === null
                      ? null
                      : `₹${idea.estimated_cost.toLocaleString('en-IN')}`
                  }
                />

                <DetailField
                  label="Dependencies"
                  value={idea.dependencies}
                />

                <DetailField
                  label="Risks"
                  value={idea.risks}
                />
              </div>
            </div>
          </DetailSection>

          {idea.category?.description && (
            <DetailSection
              icon={<Flag className="h-4 w-4" />}
              title="Category"
            >
              <p className="text-sm leading-6 text-muted">
                {idea.category.description}
              </p>
            </DetailSection>
          )}

          <StatusHistory history={statusHistory} />

          <ActivityFeed activity={activity} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="h-4 w-4" />
              </div>

              <h2 className="text-base font-semibold text-foreground">
                Submission Details
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Reference
                </p>

                <p className="mt-1 font-mono text-sm font-medium text-primary">
                  {idea.idea_code}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Status
                </p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatStatus(idea.status)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Priority
                </p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {idea.priority.charAt(0) +
                    idea.priority.slice(1).toLowerCase()}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Revision
                </p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {idea.revision_number}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Submitted
                </p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDateTime(
                    idea.submitted_at ?? idea.created_at,
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-base font-semibold text-foreground">
              Current Stage
            </h2>

            <div className="mt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatStatus(idea.status)}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Current lifecycle status
                  </p>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width:
                      idea.status === 'SUBMITTED'
                        ? '20%'
                        : idea.status === 'UNDER_REVIEW'
                          ? '35%'
                          : idea.status === 'UNDER_EVALUATION'
                            ? '50%'
                            : idea.status === 'APPROVED'
                              ? '70%'
                              : idea.status === 'IN_PIPELINE'
                                ? '85%'
                                : idea.status ===
                                    'CONVERTED_TO_PROJECT'
                                  ? '100%'
                                  : '20%',
                  }}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}