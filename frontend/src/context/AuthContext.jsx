// frontend/src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import API from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // When token changes, set axios header
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // call this after successful login
  const login = async (loginResponse) => {
    // loginResponse may be { token, user } OR { token } and we need to fetch user
    const respToken = loginResponse.token || loginResponse;
    setToken(respToken);
    API.defaults.headers.common.Authorization = `Bearer ${respToken}`;

    if (loginResponse.user) {
      setUser(loginResponse.user);
      return;
    }

    // try to fetch profile if only token returned
    try {
      setLoading(true);
      const res = await API.get("/auth/me"); // backend may provide /auth/me
      setUser(res.data.user || res.data);
    } catch (err) {
      console.warn("Could not fetch user after login:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    delete API.defaults.headers.common.Authorization;
  };

  // initialize axios auth header if token present
  useEffect(() => {
    if (token) API.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
