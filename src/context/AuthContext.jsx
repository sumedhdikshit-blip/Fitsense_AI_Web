import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, profileApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const userResponse = await authApi.getMe();
    const profileResponse = await profileApi.getProfile();
    setUser(userResponse.data);
    setProfile(profileResponse.data);
    return userResponse.data;
  };

  useEffect(() => {
    refreshUser().catch(() => {
      setUser(null);
      setProfile(null);
    }).finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    await refreshUser();
    return response.data.user || response.data;
  };

  const register = async (data) => {
    const response = await authApi.register(data);
    await refreshUser();
    return response.data.user || response.data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.is_admin), login, register, logout,
      refreshUser: async () => {
        const currentUser = await refreshUser();
        return currentUser;
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
