import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import WorkspaceOverviewPage from '../pages/WorkspaceOverviewPage';
import InboxPage from '../pages/InboxPage';
import RulesPage from '../pages/RulesPage';
import FlowsPage from '../pages/FlowsPage';
import LeadsPage from '../pages/LeadsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import BillingPage from '../pages/BillingPage';
import SettingsPage from '../pages/SettingsPage';
import KnowledgePage from '../pages/KnowledgePage';
import AuditLogsPage from '../pages/AuditLogsPage';
import NotFoundPage from '../pages/NotFoundPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/w/:workspaceId"
        element={
          <ProtectedRoute>
            <WorkspaceOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/w/:workspaceId/inbox"
        element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/w/:workspaceId/rules"
        element={
          <ProtectedRoute>
            <RulesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/w/:workspaceId/flows"
        element={
          <ProtectedRoute>
            <FlowsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/w/:workspaceId/leads"
        element={
          <ProtectedRoute>
            <LeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/w/:workspaceId/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/w/:workspaceId/knowledge"
        element={
          <ProtectedRoute>
            <KnowledgePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/w/:workspaceId/audit"
        element={
          <ProtectedRoute>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
