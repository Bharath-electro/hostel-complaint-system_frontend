import { createContext, useContext, useState } from 'react';
import api from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const save = ({ token, user }) => {
    if (token) localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => save((await api.post('/auth/login', { email, password })).data);
  const register = async (form) => save((await api.post('/auth/register', form)).data);
  const updateProfile = async (form) => save({ user: (await api.put('/auth/profile', form)).data });
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
