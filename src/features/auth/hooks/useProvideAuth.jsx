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
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

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
