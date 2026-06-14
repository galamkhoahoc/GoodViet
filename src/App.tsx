import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ToastContainer } from './components/common/Toast';
import { useSyncStore } from './services/storage/syncManager';
import { autoMigrateOnLoad } from './utils/userDataMigration';

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage').then(m => ({ default: m.AssessmentPage })));
const PathwayPage = lazy(() => import('./pages/PathwayPage').then(m => ({ default: m.PathwayPage })));
// Removed ChatPage import
const ExpertPage = lazy(() => import('./pages/ExpertPage').then(m => ({ default: m.ExpertPage })));
const FindExpertsPage = lazy(() => import('./pages/FindExpertsPage').then(m => ({ default: m.FindExpertsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

function PageLoader() {
  return <LoadingSpinner size="lg" label="Đang tải trang..." fullPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Sync status indicator
function SyncIndicator() {
  const { isOnline, isSyncing, pendingCount } = useSyncStore();

  if (isOnline && pendingCount === 0 && !isSyncing) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 16px',
      borderRadius: 'var(--md-sys-shape-corner-full, 999px)',
      background: !isOnline ? '#191A23' : isSyncing ? '#1565C0' : '#E65100',
      color: 'white',
      fontSize: 13,
      fontWeight: 600,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      animation: 'toast-slide-in 0.3s ease-out',
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: !isOnline ? 'var(--md-sys-color-error)' : isSyncing ? 'var(--md-sys-color-primary)' : '#FF9800',
        animation: isSyncing ? 'pulse-recording 1s ease-in-out infinite' : 'none',
      }} />
      {!isOnline
        ? 'Ngoại tuyến — Ghi âm sẽ được lưu cục bộ'
        : isSyncing
          ? 'Đang đồng bộ ghi âm...'
          : `${pendingCount} ghi âm đang chờ đồng bộ`
      }
    </div>
  );
}

export default function App() {
  const loadFromStorage = useAuthStore(s => s.loadFromStorage);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const initSync = useSyncStore(s => s.init);
  const destroySync = useSyncStore(s => s.destroy);

  useEffect(() => {
    // Run migration before loading user data
    autoMigrateOnLoad();
    loadFromStorage();
  }, [loadFromStorage]);

  // Initialize sync manager when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initSync();
      return () => destroySync();
    }
  }, [isAuthenticated, initSync, destroySync]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="assessment" element={<AssessmentPage />} />
              <Route path="pathway" element={<PathwayPage />} />
              <Route path="chat" element={<ExpertPage />} />
              <Route path="experts" element={<FindExpertsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
        {isAuthenticated && <SyncIndicator />}
      </BrowserRouter>
    </ErrorBoundary>
  );
}
