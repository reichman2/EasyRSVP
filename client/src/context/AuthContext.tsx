import { createContext, ReactNode, useContext, useState } from 'react';


interface AuthContextType {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
    const login = (token: string) => {
        localStorage.setItem('authToken', token);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
};


export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return ctx;
}