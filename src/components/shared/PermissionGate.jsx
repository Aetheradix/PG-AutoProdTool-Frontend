import React from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * PermissionGate component to conditionally render children based on user role.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elements to render if permission is granted
 * @param {string[]} props.allowedRoles - List of roles that can see the children
 * @param {React.ReactNode} [props.fallback=null] - Elements to render if permission is denied
 * @param {boolean} [props.showDisabled=false] - If true, renders children as disabled instead of hiding
 */
export const PermissionGate = ({
    children,
    allowedRoles = ['admin'],
    fallback = null,
    showDisabled = false
}) => {
    const { user } = useAuth();
    const hasPermission = user && allowedRoles.includes(user.role);

    if (hasPermission) {
        return <>{children}</>;
    }

    if (showDisabled) {
        return React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { disabled: true });
            }
            return child;
        });
    }

    return <>{fallback}</>;
};

export const AdminGate = (props) => (
    <PermissionGate {...props} allowedRoles={['admin']} />
);

export const UserGate = (props) => (
    <PermissionGate {...props} allowedRoles={['admin', 'user']} />
);
