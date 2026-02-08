export const ADMIN_MODE_KEY = 'am_admin_mode';

export const setAdminMode = (enabled: boolean): void => {
    if (enabled) {
        localStorage.setItem(ADMIN_MODE_KEY, 'true');
    } else {
        localStorage.setItem(ADMIN_MODE_KEY, 'false');
    }
};

export const getAdminMode = (): boolean => localStorage.getItem(ADMIN_MODE_KEY) === 'true';

export const clearAdminMode = (): void => {
    localStorage.removeItem(ADMIN_MODE_KEY);
};
