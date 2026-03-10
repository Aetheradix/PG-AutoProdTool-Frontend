import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLoginMutation, useSignupMutation } from '@/store/api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginMutation] = useLoginMutation();
  const [signupMutation] = useSignupMutation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
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
      localStorage.setItem('user', JSON.stringify(userData));
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
    localStorage.removeItem('user');
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
}
  return context;
};
