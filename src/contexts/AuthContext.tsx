import React, { createContext, useCallback, useContext, useState } from 'react';
import api from '../services/api';

interface ILoginFormData {
  email: string;
  password: string;
}

interface AuthState {
  token: string;
}

interface AuthContextData {
  token: string;
  signIn(credentials: ILoginFormData): Promise<void>;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('Naver:token');

    if (token) {
      api.defaults.headers.authorization = `Bearer ${token}`;

      return { token };
    }

    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('users/login', {
      email,
      password,
    });

    const { token } = response.data;

    localStorage.setItem('Naver:token', token);

    api.defaults.headers.authorization = `Bearer ${token}`;

    setData({ token });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('Naver:token');

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider value={{ token: data.token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
