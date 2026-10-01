import { Navigate, Route, Routes } from 'react-router-dom'

import { PagePlaceholder } from '../../components/layout/PagePlaceholder'
import { LoginPage } from '../../features/auth/LoginPage'
import { ProtectedRoute } from '../../features/auth/ProtectedRoute'
import { SignupPage } from '../../features/auth/SignupPage'
import { DashboardPage } from '../../features/dashboard/DashboardPage'
import { IdeaDetailPage } from '../../features/ideas/IdeaDetailPage'
import { MyIdeasPage } from '../../features/ideas/MyIdeasPage'
import { SubmitIdeaPage } from '../../features/ideas/SubmitIdeaPage'
import { NotificationsPage } from '../../features/notifications/NotificationsPage'

function DiscoverPage() {
  return (
    <PagePlaceholder
      title="Discover Ideas"
      description="Explore ideas submitted across the organization."
    />
  )
}

function TrendingPage() {
  return (
    <PagePlaceholder
      title="Trending Ideas"
      description="Explore ideas gaining attention across the organization."
    />
  )
}

function RecentPage() {
  return (
    <PagePlaceholder
      title="Recent Ideas"
      description="View the latest ideas submitted to RicozSpark."
    />
  )
}

function ReviewPage() {
  return (
    <PagePlaceholder
      title="Review Queue"
      description="Review and manage ideas assigned to you."
    />
  )
}

function EvaluationPage() {
  return (
    <PagePlaceholder
      title="Evaluation"
      description="Evaluate ideas using the organization's evaluation criteria."
    />
  )
}

function PipelinePage() {
  return (
    <PagePlaceholder
      title="Innovation Pipeline"
      description="Track ideas moving through the innovation lifecycle."
    />
  )
}

function ProjectsPage() {
  return (
    <PagePlaceholder
      title="Projects"
      description="Manage projects created from approved ideas."
    />
  )
}

function AnalyticsPage() {
  return (
    <PagePlaceholder
      title="Analytics"
      description="View innovation performance and organizational insights."
    />
  )
}

function OutcomesPage() {
  return (
    <PagePlaceholder
      title="Outcomes"
      description="Measure the business outcomes and impact of innovation."
    />
  )
}

function ProfilePage() {
  return (
    <PagePlaceholder
      title="Profile"
      description="Manage your RicozSpark profile."
    />
  )
}

function SettingsPage() {
  return (
    <PagePlaceholder
      title="Settings"
      description="Manage your RicozSpark preferences and settings."
    />
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected application routes */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard */}
        <Route path="/" element={<DashboardPage />} />

        {/* Ideas */}
        <Route path="/ideas" element={<DiscoverPage />} />
        <Route path="/ideas/new" element={<SubmitIdeaPage />} />
        <Route path="/ideas/trending" element={<TrendingPage />} />
        <Route path="/ideas/recent" element={<RecentPage />} />
        <Route path="/ideas/my" element={<MyIdeasPage />} />

        {/* Dynamic idea detail */}
        <Route path="/ideas/:ideaId" element={<IdeaDetailPage />} />

        {/* Innovation */}
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/evaluation" element={<EvaluationPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/projects" element={<ProjectsPage />} />

        {/* Insights */}
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/outcomes" element={<OutcomesPage />} />

        {/* Communication */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* User */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}