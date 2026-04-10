import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 👉 KEEP THIS
const API = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('awt_token') || null);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED useEffect
  useEffect(() => {
    if (token) {
      axios.defaults.baseURL = API; // ✅ ADD THIS LINE
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // 👉 NO CHANGE
  const fetchMe = async () => {
    try {
      const { data } = await axios.get(`/api/auth/me`); // ✅ REMOVE ${API}
      setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // 👉 NO CHANGE (just remove ${API})
  const login = async (email, password) => {
    const { data } = await axios.post(`/api/auth/login`, { email, password }); // ✅ FIX
    localStorage.setItem('awt_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // 👉 NO CHANGE (just remove ${API})
  const register = async (name, email, password) => {
    const { data } = await axios.post(`/api/auth/register`, { name, email, password }); // ✅ FIX
    localStorage.setItem('awt_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('awt_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);