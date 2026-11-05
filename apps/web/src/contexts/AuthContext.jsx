import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [loading, setLoading] = useState(true);
  const [activeBrokerId, setActiveBrokerId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (pb.authStore.isValid) {
          const authData = await pb.collection('users').authRefresh();
          setCurrentUser(authData.record);
          setIsAuthenticated(true);
        } else {
          // Aseguramos estado limpio si no hay sesión válida
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        pb.authStore.clear();
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password);
    setCurrentUser(authData.record);
    setIsAuthenticated(true);
    return authData;
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, loading, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};