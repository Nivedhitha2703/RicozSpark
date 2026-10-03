import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '../../features/auth/ProtectedRoute'
import { LoginPage } from '../../features/auth/LoginPage'
import { SignupPage } from '../../features/auth/SignupPage'

import { DashboardPage } from '../../features/dashboard/DashboardPage'

import { SubmitIdeaPage } from '../../features/ideas/SubmitIdeaPage'
import { MyIdeasPage } from '../../features/ideas/MyIdeasPage'
import { IdeaDetailPage } from '../../features/ideas/IdeaDetailPage'
import { IdeaDiscoveryPage } from '../../features/ideas/IdeaDiscoveryPage'
import { IdeaCommunityPage } from '../../features/ideas/IdeaCommunityPage'

function ComingSoonPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="text-2xl">✦</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          {title}
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 inline-flex rounded-full border border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          This RicozSpark module is under development.
        </div>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/signup"
        element={<SignupPage />}
      />

      {/* =====================================================
          PROTECTED APPLICATION ROUTES
      ===================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<Outlet />}>

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/"
            element={<DashboardPage />}
          />

          {/* =================================================
              IDEAS
          ================================================= */}

          <Route
            path="/ideas"
            element={<IdeaDiscoveryPage />}
          />

          <Route
            path="/ideas/new"
            element={<SubmitIdeaPage />}
          />

          <Route
            path="/ideas/trending"
            element={
              <ComingSoonPage
                title="Trending Ideas"
                description="Explore ideas gaining attention across the organization based on community activity and engagement."
              />
            }
          />

          <Route
            path="/ideas/recent"
            element={
              <ComingSoonPage
                title="Recent Ideas"
                description="View the latest ideas submitted by employees across the organization."
              />
            }
          />

          <Route
            path="/ideas/my"
            element={<MyIdeasPage />}
          />

          {/* =================================================
              IDEA COMMUNITY
              IMPORTANT:
              This route must appear before the generic
              /ideas/:ideaId route.
          ================================================= */}

          <Route
            path="/ideas/:ideaId/community"
            element={<IdeaCommunityPage />}
          />

          {/* =================================================
              IDEA DETAIL
          ================================================= */}

          <Route
            path="/ideas/:ideaId"
            element={<IdeaDetailPage />}
          />

          {/* =================================================
              INNOVATION
          ================================================= */}

          <Route
            path="/review"
            element={
              <ComingSoonPage
                title="Review Queue"
                description="Review submitted ideas, request additional information, assign reviewers, and move ideas into structured evaluation."
              />
            }
          />

          <Route
            path="/evaluation"
            element={
              <ComingSoonPage
                title="Evaluation"
                description="Evaluate ideas using configurable weighted criteria such as business impact, feasibility, innovation, strategic alignment, and cost efficiency."
              />
            }
          />

          <Route
            path="/pipeline"
            element={
              <ComingSoonPage
                title="Innovation Pipeline"
                description="Track ideas from submission and evaluation through approval, planning, and project execution."
              />
            }
          />

          <Route
            path="/projects"
            element={
              <ComingSoonPage
                title="Projects"
                description="Manage approved innovation initiatives with teams, tasks, milestones, risks, files, and project activity."
              />
            }
          />

          {/* =================================================
              INSIGHTS
          ================================================= */}

          <Route
            path="/analytics"
            element={
              <ComingSoonPage
                title="Analytics"
                description="Measure innovation activity, participation, pipeline movement, evaluation performance, and organizational trends using real platform data."
              />
            }
          />

          <Route
            path="/outcomes"
            element={
              <ComingSoonPage
                title="Outcomes"
                description="Track measurable results such as revenue generated, cost reduction, time saved, productivity improvement, quality, and customer satisfaction."
              />
            }
          />

          {/* =================================================
              COMMUNICATION
          ================================================= */}

          <Route
            path="/notifications"
            element={
              <ComingSoonPage
                title="Notifications"
                description="Stay informed about idea submissions, reviews, comments, decisions, assignments, project updates, and other RicozSpark activity."
              />
            }
          />

          {/* =================================================
              PROFILE & SETTINGS
          ================================================= */}

          <Route
            path="/profile"
            element={
              <ComingSoonPage
                title="Profile"
                description="Manage your RicozSpark profile, department information, role, and account preferences."
              />
            }
          />

          <Route
            path="/settings"
            element={
              <ComingSoonPage
                title="Settings"
                description="Manage application preferences and account settings."
              />
            }
          />

        </Route>
      </Route>

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export { AppRoutes }