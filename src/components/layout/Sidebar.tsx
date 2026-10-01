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
import { NavLink } from 'react-router-dom'

const navigation = [
  {
    label: 'DASHBOARD',
    items: [
      {
        label: 'Dashboard',
        icon: Gauge,
        path: '/',
      },
    ],
  },
  {
    label: 'IDEAS',
    items: [
      {
        label: 'Discover',
        icon: Lightbulb,
        path: '/ideas',
      },
      {
        label: 'Trending',
        icon: TrendingUp,
        path: '/ideas/trending',
      },
      {
        label: 'Recent',
        icon: ListChecks,
        path: '/ideas/recent',
      },
      {
        label: 'My Ideas',
        icon: Bookmark,
        path: '/ideas/my',
      },
    ],
  },
  {
    label: 'INNOVATION',
    items: [
      {
        label: 'Review Queue',
        icon: ListChecks,
        path: '/review',
      },
      {
        label: 'Evaluation',
        icon: BarChart3,
        path: '/evaluation',
      },
      {
        label: 'Pipeline',
        icon: TrendingUp,
        path: '/pipeline',
      },
      {
        label: 'Projects',
        icon: FolderKanban,
        path: '/projects',
      },
    ],
  },
  {
    label: 'INSIGHTS',
    items: [
      {
        label: 'Analytics',
        icon: BarChart3,
        path: '/analytics',
      },
      {
        label: 'Outcomes',
        icon: TrendingUp,
        path: '/outcomes',
      },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface">
      {/* Brand */}
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

      {/* Main navigation */}
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
                  <NavLink
                    key={item.label}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      [
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted hover:bg-background hover:text-foreground',
                      ].join(' ')
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />

                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-border p-3">
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            [
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:bg-background hover:text-foreground',
            ].join(' ')
          }
        >
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            [
              'mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:bg-background hover:text-foreground',
            ].join(' ')
          }
        >
          <Users className="h-4 w-4" />
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              'mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:bg-background hover:text-foreground',
            ].join(' ')
          }
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}