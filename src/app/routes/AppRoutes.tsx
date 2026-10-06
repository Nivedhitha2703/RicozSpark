import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '../../features/auth/ProtectedRoute'
import { LoginPage } from '../../features/auth/LoginPage'
import { SignupPage } from '../../features/auth/SignupPage'
import { ForgotPasswordPage } from '../../features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../../features/auth/ResetPasswordPage'

import { DashboardPage } from '../../features/dashboard/DashboardPage'

import { IdeaDiscoveryPage } from '../../features/ideas/IdeaDiscoveryPage'
import { SubmitIdeaPage } from '../../features/ideas/SubmitIdeaPage'
import { IdeaDetailPage } from '../../features/ideas/IdeaDetailPage'
import { MyIdeasPage } from '../../features/ideas/MyIdeasPage'
import { IdeaCommunityPage } from '../../features/ideas/IdeaCommunityPage'

import { ReviewQueuePage } from '../../features/review/ReviewQueuePage'

import { EvaluationQueuePage } from '../../features/evaluation/EvaluationQueuePage'
import { EvaluationWorkspacePage } from '../../features/evaluation/EvaluationWorkspacePage'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <p className="text-sm font-medium text-primary">
        RicozSpark
      </p>

      <h1 className="mt-2 text-2xl font-semibold">
        {title}
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        This module is currently under development.
      </p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {/* =========================
          PUBLIC ROUTES
          ========================= */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/signup"
        element={<SignupPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      {/* =========================
          PROTECTED ROUTES
          ========================= */}

      <Route element={<ProtectedRoute />}>
        {/* Dashboard */}

        <Route
          path="/"
          element={<DashboardPage />}
        />

        {/* =========================
            IDEAS
            ========================= */}

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
          element={<IdeaDiscoveryPage />}
        />

        <Route
          path="/ideas/recent"
          element={<IdeaDiscoveryPage />}
        />

        <Route
          path="/ideas/my"
          element={<MyIdeasPage />}
        />

        {/* IMPORTANT:
            Community route comes before :ideaId
        */}

        <Route
          path="/ideas/:ideaId/community"
          element={<IdeaCommunityPage />}
        />

        <Route
          path="/ideas/:ideaId"
          element={<IdeaDetailPage />}
        />

        {/* =========================
            INNOVATION
            ========================= */}

        <Route
          path="/review"
          element={<ReviewQueuePage />}
        />

        {/* Evaluation Queue */}

        <Route
          path="/evaluation"
          element={<EvaluationQueuePage />}
        />

        {/* Evaluation Workspace */}

        <Route
          path="/evaluation/:ideaId"
          element={<EvaluationWorkspacePage />}
        />

        {/* Innovation Pipeline */}

        <Route
          path="/pipeline"
          element={
            <PlaceholderPage title="Innovation Pipeline" />
          }
        />

        {/* Projects */}

        <Route
          path="/projects"
          element={
            <PlaceholderPage title="Projects" />
          }
        />

        {/* =========================
            INSIGHTS
            ========================= */}

        <Route
          path="/analytics"
          element={
            <PlaceholderPage title="Analytics" />
          }
        />

        <Route
          path="/outcomes"
          element={
            <PlaceholderPage title="Outcomes & Impact" />
          }
        />

        {/* =========================
            COMMUNICATION
            ========================= */}

        <Route
          path="/notifications"
          element={
            <PlaceholderPage title="Notifications" />
          }
        />

        {/* =========================
            USER
            ========================= */}

        <Route
          path="/profile"
          element={
            <PlaceholderPage title="Profile" />
          }
        />

        <Route
          path="/settings"
          element={
            <PlaceholderPage title="Settings" />
          }
        />
      </Route>

      {/* =========================
          FALLBACK
          ========================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}