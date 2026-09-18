import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from '../services/api';

export type UserRole = 'admin' | 'tecnico' | 'visualizador';

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  role_label: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  // Helpers de permissão
  isAdmin: boolean;
  isTecnico: boolean;
  isVisualizador: boolean;
  canCreate: boolean;    // admin + tecnico
  canEdit: boolean;      // admin + tecnico
  canDelete: boolean;    // somente admin
  canManageUsers: boolean; // somente admin
  canManageModelos: boolean; // somente admin
}

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  visualizador: 'Visualizador',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega sessão salva no localStorage ao inicializar
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as AuthUser;
        setToken(savedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const data = await authAPI.login(email, senha);
    const authUser: AuthUser = {
      id: data.usuario.id,
      nome: data.usuario.nome,
      email: data.usuario.email,
      role: data.usuario.role as UserRole,
      role_label: data.usuario.role_label || ROLE_LABELS[data.usuario.role] || data.usuario.role,
    };

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    setToken(data.token);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isTecnico = user?.role === 'tecnico';
  const isVisualizador = user?.role === 'visualizador';

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    isAdmin,
    isTecnico,
    isVisualizador,
    canCreate: isAdmin || isTecnico,
    canEdit: isAdmin || isTecnico,
    canDelete: isAdmin,
    canManageUsers: isAdmin,
    canManageModelos: isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
