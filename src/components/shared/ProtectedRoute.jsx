import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spin } from 'antd';

/**
 * ProtectedRoute component to handle authentication and role-based authorization.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {string[]} [props.allowedRoles] - List of roles allowed to access this route
 * @param {string} [props.redirectTo='/login'] - Where to redirect if not authenticated
 * @param {string} [props.unauthorizedRedirect='/'] - Where to redirect if authenticated but not authorized
 */
const ProtectedRoute = ({ 
    children, 
    allowedRoles, 
    redirectTo = '/login',
    unauthorizedRedirect = '/' 
}) => {
    const { isAuthenticated, user, isLoading, isAdmin } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" tip="Verifying access..." />
            </div>
        );
    }

    // Check authentication
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role-based authorization if roles are specified
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        console.warn(`User ${user?.username} with role ${user?.role} attempted to access unauthorized route: ${location.pathname}`);
        return <Navigate to={unauthorizedRedirect} replace />;
    }

    return children;
};

export default ProtectedRoute;
