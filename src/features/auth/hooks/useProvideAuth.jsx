import { useState, useEffect } from 'react';
import { useLoginMutation, useSignupMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { resetTabs } from '@/store/slices/uiSlice';

export const useProvideAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginMutation] = useLoginMutation();
  const [signupMutation] = useSignupMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Check JWT token expiration
        if (parsed?.access_token) {
          const parts = parsed.access_token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload?.exp && payload.exp * 1000 < Date.now()) {
              console.warn('Stored session token has expired');
              sessionStorage.removeItem('user');
              setUser(null);
              setLoading(false);
              return;
            }
          }
        }
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse user from sessionStorage', e);
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      sessionStorage.removeItem('user');
      dispatch(resetTabs());
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [dispatch]);


  const login = async (credentials) => {
    try {
      const result = await loginMutation(credentials).unwrap();

      const userData = {
        username: result.username || credentials.username,
        name: credentials.full_name || result.full_name || credentials.username,
        email: result.email || credentials.email,
        role: result.role,
        access_token: result.access_token
      };

      setUser(userData);
      sessionStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      await signupMutation(userData).unwrap();
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    dispatch(resetTabs());
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  return {
    user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    signup,
    logout,
    updateUser,
  };
};
