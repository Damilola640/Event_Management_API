import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  
  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }, [token]);

    const setToken = (t: string | null) => {
      setTokenState(t);
    const logout = () => {
      setTokenState(null);
    
    return (
      <AuthContext.Provider value={{ token, setToken, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };

export const useAuth = (): AuthContextType => {
  const c = useContext(AuthContext);
  if (!c) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return c;
    }; 