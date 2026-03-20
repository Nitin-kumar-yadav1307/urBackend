import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('devToken') || null);
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('devUser');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    // 1. Move logout here (before useEffect)
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('devToken');
        localStorage.removeItem('devUser');
    };

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('devToken', authToken);
        localStorage.setItem('devUser', JSON.stringify(userData));
    };

    const value = { user, token, login, logout, isAuthenticated: !!token };


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);