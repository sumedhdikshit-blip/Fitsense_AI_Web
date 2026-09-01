import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const ALWAYS_ACTIVE_USER = {
  user_id: 'demo_athlete_01',
  id: 'demo_athlete_01',
  name: 'Demo Athlete',
  username: 'demo',
  email: 'demo@fitsense.ai',
  role: 'admin',
  is_admin: true
};

const ALWAYS_ACTIVE_PROFILE = {
  name: 'Demo Athlete',
  weight_kg: 75.0,
  height_cm: 175,
  age: 25,
  sex: 'male',
  fitness_goal: 'Build Muscle & Athletic Telemetry',
  target_weight_kg: 70.0,
  sleep_hours: 8.0,
  stress_level: 2,
  exercise_freq: 'high',
  diet_quality: 'excellent',
  alcohol_consumption: 'none'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(ALWAYS_ACTIVE_USER);
  const [profile, setProfile] = useState(ALWAYS_ACTIVE_PROFILE);

  const login = async (credentials) => {
    const inputUsername = credentials?.username || 'demo';
    const isAdminUser = inputUsername.toLowerCase() === 'admin';

    const loggedUser = {
      ...ALWAYS_ACTIVE_USER,
      name: credentials?.name || (isAdminUser ? 'Admin User' : 'Demo Athlete'),
      username: inputUsername,
      role: isAdminUser ? 'admin' : 'user',
      is_admin: isAdminUser
    };

    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const newUser = {
      ...ALWAYS_ACTIVE_USER,
      name: userData?.name || 'New Athlete',
      username: userData?.username || 'newuser'
    };
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    // Navigate to login page on click
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || ALWAYS_ACTIVE_USER,
        profile: profile || ALWAYS_ACTIVE_PROFILE,
        loading: false,
        isAuthenticated: true,
        isAdmin: true,
        login,
        register,
        logout,
        refreshUser: () => {}
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
