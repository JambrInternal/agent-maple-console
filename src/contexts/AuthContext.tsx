import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';
import type { User } from '../api/types';
import type { RegisterProfile } from '../api/auth';
import logger from '../utils/verboseLogger';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (email: string, password: string, profile?: RegisterProfile) => ReturnType<typeof authService.register>;
    confirmRegistration: (email: string, confirmationCode: string) => Promise<void>;
    forgotPassword: (email: string) => ReturnType<typeof authService.forgotPassword>;
    confirmForgotPassword: (email: string, confirmationCode: string, newPassword: string) => Promise<void>;
    resendConfirmationCode: (email: string) => ReturnType<typeof authService.resendConfirmationCode>;
    logout: () => Promise<void>;
    syncCurrentUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Setup Amplify auth event listeners for token hydration/clearing
        import('../services/authEvents').then(({ setupAuthEventListeners }) => {
            setupAuthEventListeners();
        });
        const initAuth = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                logger.error('Auth initialization failed:', error);
            } finally {
                setLoading(false);
            }
        };
        initAuth();

        // Multi-tab token consistency: listen for storage events
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'am_auth_token' || e.key === 'am_auth_token_exp') {
                // Rehydrate user if token changes in another tab
                initAuth();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const login = async (email: string, password: string) => {
        const loggedInUser = await authService.login(email, password);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const syncCurrentUser = async () => {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        return currentUser;
    };

    const register = async (email: string, password: string, profile?: RegisterProfile) => {
        return authService.register(email, password, profile);
    };

    const confirmRegistration = async (email: string, confirmationCode: string) => {
        await authService.confirmRegistration(email, confirmationCode);
    };

    const forgotPassword = async (email: string) => {
        return authService.forgotPassword(email);
    };

    const resendConfirmationCode = async (email: string) => {
        return authService.resendConfirmationCode(email);
    };

    const confirmForgotPassword = async (email: string, confirmationCode: string, newPassword: string) => {
        await authService.confirmForgotPassword(email, confirmationCode, newPassword);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                confirmRegistration,
                forgotPassword,
                resendConfirmationCode,
                confirmForgotPassword,
                logout,
                syncCurrentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
