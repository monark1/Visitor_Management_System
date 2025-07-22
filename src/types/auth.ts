export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'guard';
  department?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  role: 'admin' | 'employee' | 'guard';
  department?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}