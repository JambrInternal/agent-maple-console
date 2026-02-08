export type ThemeMode = 'dark' | 'light';

const THEME_KEY = 'am_theme';

export const setTheme = (theme: ThemeMode): void => {
    if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = theme;
    }
    localStorage.setItem(THEME_KEY, theme);
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
};
