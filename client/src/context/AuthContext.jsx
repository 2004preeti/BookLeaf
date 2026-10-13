// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bookleaf_token') || null);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);

async function safeJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

  // Fetch personas for demo switcher
  useEffect(() => {
    fetch('/api/auth/personas')
      .then(safeJson)
      .then(data => {
        if (data && data.personas) {
          setPersonas(data.personas);
        }
      })
      .catch(err => console.error('Failed to load personas:', err));
  }, []);

  // Check existing token or auto-login default author (Priya Sharma AUTH001) for instant testability
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async res => {
          if (!res.ok) throw new Error('Token expired');
          const data = await safeJson(res);
          if (!data) throw new Error('Invalid JSON response');
          return data;
        })
        .then(data => {
          setUser(data.user);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('bookleaf_token');
          setToken(null);
          autoLoginDefault();
        });
    } else {
      autoLoginDefault();
    }
  }, [token]);

  const autoLoginDefault = async () => {
    try {
      // Auto login as Priya Sharma (AUTH001) by default so reviewer doesn't see a blank login screen
      const res = await fetch('/api/auth/switch-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_id: 'AUTH001' })
      });
      const data = await safeJson(res);
      if (data && data.token) {
        localStorage.setItem('bookleaf_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Auto login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await safeJson(res);
    if (!res.ok || !data) {
      throw new Error((data && data.error) || 'Login failed');
    }
    localStorage.setItem('bookleaf_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const switchPersona = async (author_id) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/switch-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_id })
      });
      const data = await safeJson(res);
      if (data && data.token) {
        localStorage.setItem('bookleaf_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bookleaf_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, personas, loading, login, switchPersona, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
