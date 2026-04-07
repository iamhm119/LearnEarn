import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { verifyToken } from "../services/api";

const AuthContext = createContext(null);

// Apply stored theme to document root
const applyTheme = (themeId) => {
  const root = document.documentElement;
  root.classList.remove("theme-dark", "theme-neon");
  if (themeId === "theme-dark") root.classList.add("theme-dark");
  else if (themeId === "theme-neon") root.classList.add("theme-neon");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) { setLoading(false); return; }
    try {
      const res = await verifyToken();
      setUser(res.data.user);
      // Apply active theme on page load
      applyTheme(res.data.user?.activeTheme);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = (userData, authToken) => {
    localStorage.setItem("token", authToken);
    setToken(authToken);
    setUser(userData);
    applyTheme(userData?.activeTheme);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    applyTheme(null); // reset theme on logout
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      // Reactively apply theme when store updates it
      if ("activeTheme" in updates) applyTheme(updates.activeTheme);
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
