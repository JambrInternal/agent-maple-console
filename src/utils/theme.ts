export type ThemeMode = 'dark' | 'light';

const THEME_KEY = 'am_theme';

export const getThemeForAdminMode = (isSuperAdmin: boolean): ThemeMode => {
    return isSuperAdmin ? 'light' : 'dark';
};

export const setTheme = (theme: ThemeMode): void => {
    if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = theme;
    }
    localStorage.setItem(THEME_KEY, theme);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('am-theme-change', { detail: { theme } }));
    }
};

export const applyThemeForAdminMode = (isSuperAdmin: boolean): ThemeMode => {
    const theme = getThemeForAdminMode(isSuperAdmin);
    setTheme(theme);
    return theme;
};

export const getStoredTheme = (): ThemeMode | null => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    return null;
};

export const applyStoredTheme = (): void => {
    const stored = getStoredTheme();
    if (stored && typeof document !== 'undefined') {
        document.documentElement.dataset.theme = stored;
    }
};

export const clearTheme = (): void => {
    localStorage.removeItem(THEME_KEY);
    if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = 'dark';
    }
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('am-theme-change', { detail: { theme: 'dark' } }));
    }
};
