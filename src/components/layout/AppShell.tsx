import { AppRoutes } from '../../app/routes/AppRoutes'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen pl-64">
        {/* Top Navigation */}
        <Topbar />

        {/* Dynamic Page Content */}
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            <AppRoutes />
          </div>
        </main>
      </div>
    </div>
  )
}