import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppFeature from "./pages";
import AppLayout from "./layouts/AppLayout";
import { ConfigProvider, Spin } from 'antd';

const Login = lazy(() => import("./features/auth/login/LoginPage").then(module => ({ default: module.LoginPage })));

const ProtectedApp = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <AppFeature />
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
              <Route path="/*" element={<ProtectedApp />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
