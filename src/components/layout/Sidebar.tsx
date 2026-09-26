import {
  BarChart3,
  Bell,
  Bookmark,
  FolderKanban,
  Gauge,
  Lightbulb,
  ListChecks,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

const navigation = [
  {
    label: 'DASHBOARD',
    items: [{ label: 'Dashboard', icon: Gauge }],
  },
  {
    label: 'IDEAS',
    items: [
      { label: 'Discover', icon: Lightbulb },
      { label: 'Trending', icon: TrendingUp },
      { label: 'Recent', icon: ListChecks },
      { label: 'My Ideas', icon: Bookmark },
    ],
  },
  {
    label: 'INNOVATION',
    items: [
      { label: 'Review Queue', icon: ListChecks },
      { label: 'Evaluation', icon: BarChart3 },
      { label: 'Pipeline', icon: TrendingUp },
      { label: 'Projects', icon: FolderKanban },
    ],
  },
  {
    label: 'INSIGHTS',
    items: [
      { label: 'Analytics', icon: BarChart3 },
      { label: 'Outcomes', icon: TrendingUp },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center border-b border-border px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-wide">
              RicozSpark
            </p>

            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
              Innovation
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-muted">
              {section.label}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.label}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted transition hover:bg-background hover:text-foreground"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-background hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          Notifications
        </button>

        <button
          type="button"
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-background hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          Profile
        </button>

        <button
          type="button"
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-background hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  )
}