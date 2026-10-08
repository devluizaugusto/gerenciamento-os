import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
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
  updateCurrentUser: (data: Partial<Pick<AuthUser, 'nome' | 'email'>>) => void;
  isAdmin: boolean;
  isTecnico: boolean;
  isVisualizador: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageModelos: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  visualizador: 'Visualizador',
};

// 30 minutos sem atividade encerram a sessão.
const IDLE_LIMIT_MS = 30 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'auth_last_activity';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastActivityWriteRef = useRef(0);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  // Carrega a sessão da aba. A sessão fica no sessionStorage para não
  // permanecer depois que a aba/janela for encerrada.
  useEffect(() => {
    const savedToken = sessionStorage.getItem('auth_token');
    const savedUser = sessionStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as AuthUser;
        setToken(savedToken);
        setUser(parsedUser);

        // Sessões criadas antes desta versão podem não possuir o relógio.
        // Nesse caso, iniciamos o controle agora.
        if (!sessionStorage.getItem(LAST_ACTIVITY_KEY)) {
          sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
        }
      } catch {
        clearSession();
      }
    }

    setIsLoading(false);
  }, [clearSession]);

  // Qualquer 401 emitido pelo interceptor do Axios também encerra o estado
  // React imediatamente. Isso evita ficar na tela principal com "401" até F5.
  useEffect(() => {
    const handleAuthExpired = () => {
      clearSession();
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [clearSession]);

  const login = useCallback(async (email: string, senha: string) => {
    const data = await authAPI.login(email, senha);
    const authUser: AuthUser = {
      id: data.usuario.id,
      nome: data.usuario.nome,
      email: data.usuario.email,
      role: data.usuario.role as UserRole,
      role_label: data.usuario.role_label || ROLE_LABELS[data.usuario.role] || data.usuario.role,
    };

    sessionStorage.setItem('auth_token', data.token);
    sessionStorage.setItem('auth_user', JSON.stringify(authUser));
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    lastActivityWriteRef.current = Date.now();

    setToken(data.token);
    setUser(authUser);
  }, []);

  const updateCurrentUser = useCallback((data: Partial<Pick<AuthUser, 'nome' | 'email'>>) => {
    setUser(current => {
      if (!current) return current;
      const updated = { ...current, ...data };
      sessionStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Controla inatividade de forma independente de setTimeout:
  // - registra a última atividade real do usuário;
  // - verifica periodicamente;
  // - verifica imediatamente quando a aba/janela volta do segundo plano;
  // - funciona mesmo depois de suspensão/hibernação do notebook.
  useEffect(() => {
    if (!user || !token) return;

    const checkIdleSession = () => {
      const raw = sessionStorage.getItem(LAST_ACTIVITY_KEY);
      const lastActivity = raw ? Number(raw) : Date.now();

      if (!Number.isFinite(lastActivity)) {
        sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
        return;
      }

      if (Date.now() - lastActivity >= IDLE_LIMIT_MS) {
        clearSession();
        return;
      }
    };

    const registerActivity = () => {
      const now = Date.now();
      const raw = sessionStorage.getItem(LAST_ACTIVITY_KEY);
      const lastActivity = raw ? Number(raw) : now;

      // Se a aba voltou depois do limite, não renova a sessão antes de expirá-la.
      if (Number.isFinite(lastActivity) && now - lastActivity >= IDLE_LIMIT_MS) {
        clearSession();
        return;
      }

      // Não grava no sessionStorage a cada movimento do mouse.
      if (now - lastActivityWriteRef.current >= 10_000) {
        sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now));
        lastActivityWriteRef.current = now;
      }
    };

    const handleResume = () => {
      checkIdleSession();
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'click',
      'keydown',
      'mousemove',
      'scroll',
      'touchstart',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, registerActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('focus', handleResume);
    window.addEventListener('pageshow', handleResume);

    // Verificação frequente, sem depender de um único timeout de 30 minutos.
    const intervalId = window.setInterval(checkIdleSession, 15_000);

    checkIdleSession();

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, registerActivity);
      });
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('focus', handleResume);
      window.removeEventListener('pageshow', handleResume);
      window.clearInterval(intervalId);
    };
  }, [user, token, clearSession]);

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
    updateCurrentUser,
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
