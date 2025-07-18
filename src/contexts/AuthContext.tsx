import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials, SignupCredentials } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock database - In production, this would be replaced with actual API calls
const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    department: 'IT',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '2',
    name: 'John Employee',
    email: 'john@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'Sales',
    createdAt: new Date('2024-01-02'),
    lastLogin: new Date(),
  },
  {
    id: '3',
    name: 'Security Guard',
    email: 'guard@company.com',
    password: 'guard123',
    role: 'guard',
    department: 'Security',
    createdAt: new Date('2024-01-03'),
    lastLogin: new Date(),
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = localStorage.getItem('vms_user');
    const savedToken = localStorage.getItem('vms_token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('vms_user');
        localStorage.removeItem('vms_token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock database
      const foundUser = mockUsers.find(
        u => u.email === credentials.email && 
             u.password === credentials.password && 
             u.role === credentials.role
      );
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        const updatedUser = {
          ...userWithoutPassword,
          lastLogin: new Date(),
        };
        
        setUser(updatedUser);
        
        // Store in localStorage (in production, use secure HTTP-only cookies)
        localStorage.setItem('vms_user', JSON.stringify(updatedUser));
        localStorage.setItem('vms_token', `token_${foundUser.id}_${Date.now()}`);
        
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === credentials.email);
      if (existingUser) {
        setIsLoading(false);
        return false;
      }
      
      // Create new user
      const newUser: User & { password: string } = {
        id: Date.now().toString(),
        name: credentials.name,
        email: credentials.email,
        password: credentials.password, // In production, this would be hashed
        role: credentials.role,
        department: credentials.department || 'General',
        createdAt: new Date(),
        lastLogin: new Date(),
      };
      
      // Add to mock database
      mockUsers.push(newUser);
      
      // Auto-login after signup
      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      
      // Store in localStorage
      localStorage.setItem('vms_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('vms_token', `token_${newUser.id}_${Date.now()}`);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vms_user');
    localStorage.removeItem('vms_token');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};