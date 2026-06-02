import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await getMe();
      setUser(data.user || data.data || data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await apiLogin({ email, password });
      const data = res.data || res;

      const token = data.accessToken || data.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      const userData = data.user || data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success(`Welcome back, ${userData.name || 'User'}!`);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      const errMsg = error.response?.data?.message || 'Login failed. Verify your credentials.';
      toast.error(errMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const res = await apiRegister({ name, email, password });
      const data = res.data || res;

      const token = data.accessToken || data.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      const userData = data.user || data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success(`Registered successfully! 10 Points credited.`);
      return userData;
    } catch (error) {
      console.error('Registration failed:', error);
      const errMsg = error.response?.data?.message || 'Registration failed. Try again.';
      toast.error(errMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
