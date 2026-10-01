import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FolderKanban,
  Lightbulb,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const stages = [
  {
    number: '01',
    title: 'Capture',
    description: 'Submit and discover organizational ideas.',
    icon: Lightbulb,
  },
  {
    number: '02',
    title: 'Evaluate',
    description: 'Assess ideas using structured criteria.',
    icon: BarChart3,
  },
  {
    number: '03',
    title: 'Execute',
    description: 'Turn approved ideas into projects.',
    icon: FolderKanban,
  },
  {
    number: '04',
    title: 'Measure',
    description: 'Track outcomes and organizational impact.',
    icon: CheckCircle2,
  },
]

const metrics = [
  {
    label: 'Ideas Submitted',
    description: 'Ideas captured by your organization',
  },
  {
    label: 'Under Review',
    description: 'Ideas currently awaiting assessment',
  },
  {
    label: 'Active Projects',
    description: 'Approved ideas currently in execution',
  },
  {
    label: 'Measured Impact',
    description: 'Recorded organizational outcomes',
  },
]

export function DashboardPage() {
  const { profile } = useAuth()

  const displayName =
    profile?.full_name?.trim() || 'there'

  return (
    <div>
      {/* Hero */}
      <section className="mb-8">
        <p className="mb-2 text-sm font-medium text-primary">
          RICOZSPARK
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Good to see you, {displayName}.
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Turn organizational ideas into measurable impact.
          Capture, evaluate, execute, and measure innovation
          across your organization.
        </p>
      </section>

      {/* Metrics */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-border bg-surface p-5 shadow-card"
          >
            <p className="text-sm text-muted">
              {metric.label}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              —
            </p>

            <p className="mt-2 text-xs leading-5 text-muted">
              {metric.description}
            </p>
          </div>
        ))}
      </section>

      {/* Main dashboard content */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Innovation lifecycle */}
        <div className="rounded-xl border border-border bg-surface p-6 lg:col-span-2">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Innovation lifecycle
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              From idea to organizational impact
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Follow ideas through the complete innovation
              journey.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map((stage) => {
              const Icon = stage.icon

              return (
                <div
                  key={stage.title}
                  className="rounded-lg border border-border bg-background p-4 transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {stage.number}
                    </span>

                    <Icon className="h-4 w-4 text-primary" />
                  </div>

                  <p className="mt-5 font-medium">
                    {stage.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    {stage.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Submit idea CTA */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Start your innovation journey
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Submit an idea, collaborate with colleagues, and
            help turn promising opportunities into measurable
            business outcomes.
          </p>

          <Link
            to="/ideas/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Submit an Idea
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
