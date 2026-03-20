import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authService from '../services/auth';
import '../services/authEvents';
import appQueryClient from '../queryClient';
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

const AUTH_QUERY_KEY = ['auth', 'current-user'] as const;
const AUTH_STORAGE_KEYS = new Set(['am_auth_token', 'am_auth_token_exp']);

const fetchCurrentUser = async (): Promise<User | null> => {
    try {
        return await authService.getCurrentUser();
    } catch (error) {
        logger.error('Auth initialization failed:', error);
        return null;
    }
};

let hasRegisteredAuthStorageListener = false;

const registerAuthStorageListener = () => {
    if (hasRegisteredAuthStorageListener || typeof window === 'undefined') {
        return;
    }

    window.addEventListener('storage', (event) => {
        if (event.storageArea !== localStorage) {
            return;
        }

        if (event.key !== null && !AUTH_STORAGE_KEYS.has(event.key)) {
            return;
        }

        void appQueryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    });

    hasRegisteredAuthStorageListener = true;
};

registerAuthStorageListener();

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const currentUserQuery = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: fetchCurrentUser,
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
    });

    const loginMutation = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) => authService.login(email, password),
        onSuccess: (user) => {
            queryClient.setQueryData(AUTH_QUERY_KEY, user);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: authService.logout,
        onSuccess: () => {
            queryClient.setQueryData(AUTH_QUERY_KEY, null);
        },
    });

    const login = async (email: string, password: string) => {
        return loginMutation.mutateAsync({ email, password });
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();
    };

    const syncCurrentUser = async () => {
        const currentUser = await queryClient.fetchQuery({
            queryKey: AUTH_QUERY_KEY,
            queryFn: fetchCurrentUser,
            staleTime: 0,
        });

        queryClient.setQueryData(AUTH_QUERY_KEY, currentUser);

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
                user: currentUserQuery.data ?? null,
                loading: currentUserQuery.isPending,
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
