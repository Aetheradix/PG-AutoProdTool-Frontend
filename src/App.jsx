import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppFeature from "./features";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { ConfigProvider, Spin } from 'antd';

const Login = lazy(() => import("./features/auth/login/LoginPage"));
const Signup = lazy(() => import("./features/auth/signup/SignupPage"));
const UserManagement = lazy(() => import("./features/admin/UserManagementPage"));
const ProtectedApp = () => {
  const { isAuthenticated, user } = useAuth();


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<AppFeature />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => {
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
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" tip="Loading..." />
              </div>
            }
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <ProtectedApp />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
