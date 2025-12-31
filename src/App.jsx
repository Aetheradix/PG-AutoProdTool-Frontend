import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/features/auth/login/LoginPage';
import { SignupPage } from '@/features/auth/signup/SignupPage';
import { ProductionDashboard } from '@/features/production/dashboard/ProductionDashboard';
import MainLayout from '@/layouts/MainLayout';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ConfigProvider, Spin } from 'antd';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 12,
          fontFamily: 'Inter, system-ui, sans-serif',
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f8fafc',
          colorTextHeading: '#0f172a',
          colorText: '#1e293b',
        },
        components: {
          Button: {
            borderRadius: 12,
            controlHeight: 40,
            fontWeight: 600,
          },
          Input: {
            borderRadius: 12,
            controlHeight: 45,
          },
          Card: {
            borderRadius: 24,
            boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          },
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route: Signup */}
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignupPage />
                </PublicOnlyRoute>
              }
            />

            {/* Public Route: Login */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />

            {/* Protected Routes: Dashboard */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProductionDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;
