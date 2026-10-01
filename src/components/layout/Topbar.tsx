import { Bell, HelpCircle, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

          <input
            type="search"
            placeholder="Search ideas, projects, people..."
            aria-label="Search ideas, projects, and people"
            className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary"
          />
        </div>
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
        </Link>

        {/* Help */}
        <Link
          to="/settings"
          aria-label="Help"
          className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-foreground"
        >
          <HelpCircle className="h-5 w-5" />
        </Link>

        {/* Submit Idea */}
        <Link
          to="/ideas/new"
          className="ml-2 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          + Submit Idea
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          aria-label="Open profile"
          className="ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-sm font-medium transition hover:border-primary hover:text-primary"
        >
          N
        </Link>
      </div>
    </header>
  )
}