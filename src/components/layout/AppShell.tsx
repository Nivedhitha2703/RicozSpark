import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="min-h-screen pl-64">
        <Topbar />

        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-primary">
                RICOZSPARK
              </p>

              <h1 className="text-3xl font-semibold tracking-tight">
                Turn ideas into measurable impact.
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-muted">
                Capture, evaluate, execute, and measure innovation across
                your organization.
              </p>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Ideas Submitted"
                value="—"
                description="Connect your workspace to view live data"
              />

              <MetricCard
                label="Under Review"
                value="—"
                description="Pending review activity"
              />

              <MetricCard
                label="Active Projects"
                value="—"
                description="Projects currently in execution"
              />

              <MetricCard
                label="Measured Impact"
                value="—"
                description="Recorded organizational outcomes"
              />
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface p-6 lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">
                    Innovation Journey
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    Follow ideas from initial submission through measurable
                    organizational impact.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {['Capture', 'Evaluate', 'Execute', 'Measure'].map(
                    (stage, index) => (
                      <div
                        key={stage}
                        className="rounded-lg border border-border bg-background p-4"
                      >
                        <span className="text-xs text-muted">
                          0{index + 1}
                        </span>

                        <p className="mt-3 font-medium">{stage}</p>

                        <p className="mt-1 text-xs text-muted">
                          No live data yet
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-6">
                <h2 className="text-lg font-semibold">Getting Started</h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Your innovation workspace is being prepared. Connect
                  Supabase and configure your organization to begin managing
                  ideas.
                </p>

                <button className="mt-6 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                  Submit an Idea
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

type MetricCardProps = {
  label: string
  value: string
  description: string
}

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <p className="text-sm text-muted">{label}</p>

      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>

      <p className="mt-2 text-xs leading-5 text-muted">{description}</p>
    </div>
  )
}