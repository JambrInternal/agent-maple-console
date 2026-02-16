interface RuntimeConfig {
    API_URL?: string;
    AWS_REGION?: string;
    COGNITO_USER_POOL_ID?: string;
    COGNITO_APP_CLIENT_ID?: string;
    SENTRY_DSN?: string;
    GIT_COMMIT?: string;
    POSTHOG_KEY?: string;
    POSTHOG_HOST?: string;
    POSTHOG_ENABLED?: string;
    APP_ENV?: string;
    POSTHOG_TARGETING_MODE?: string;
}

interface AppConfig {
    API_URL: string;
    AWS_REGION: string;
    COGNITO_USER_POOL_ID: string;
    COGNITO_APP_CLIENT_ID: string;
    SENTRY_DSN: string;
    GIT_COMMIT: string;
    POSTHOG_KEY: string;
    POSTHOG_HOST: string;
    POSTHOG_ENABLED: string;
    APP_ENV: string;
    POSTHOG_TARGETING_MODE: string;
}

declare global {
    interface Window {
        __APP_CONFIG__?: RuntimeConfig;
    }
}

const clean = (value: unknown): string => {
    if (typeof value !== 'string') return '';
    return value.trim();
};

const readRuntimeConfig = (): RuntimeConfig => {
    if (typeof window === 'undefined') {
        return {};
    }

    const config = window.__APP_CONFIG__;
    if (!config || typeof config !== 'object') {
        return {};
    }

    return config;
};

const resolveValue = (...values: unknown[]): string => {
    for (const value of values) {
        const resolved = clean(value);
        if (resolved !== '') {
            return resolved;
        }
    }
    return '';
};

export const getAppConfig = (): AppConfig => {
    const runtime = readRuntimeConfig();
    return {
        API_URL: resolveValue(runtime.API_URL, import.meta.env.VITE_API_URL, 'https://api.dev.agentmaple.ca'),
        AWS_REGION: resolveValue(runtime.AWS_REGION, import.meta.env.VITE_AWS_REGION, 'us-east-1'),
        COGNITO_USER_POOL_ID: resolveValue(
            runtime.COGNITO_USER_POOL_ID,
            import.meta.env.VITE_COGNITO_USER_POOL_ID,
            'us-east-1_dDp9djoZz'
        ),
        COGNITO_APP_CLIENT_ID: resolveValue(
            runtime.COGNITO_APP_CLIENT_ID,
            import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
            '2j77g0duot54vs8461u4tbbenp'
        ),
        SENTRY_DSN: resolveValue(runtime.SENTRY_DSN, import.meta.env.VITE_SENTRY_DSN, ''),
        GIT_COMMIT: resolveValue(runtime.GIT_COMMIT, import.meta.env.VITE_GIT_COMMIT, ''),
        POSTHOG_KEY: resolveValue(runtime.POSTHOG_KEY, import.meta.env.VITE_POSTHOG_KEY, ''),
        POSTHOG_HOST: resolveValue(
            runtime.POSTHOG_HOST,
            import.meta.env.VITE_POSTHOG_HOST,
            'https://us.i.posthog.com'
        ),
        POSTHOG_ENABLED: resolveValue(
            runtime.POSTHOG_ENABLED,
            import.meta.env.VITE_POSTHOG_ENABLED,
            'true'
        ),
        APP_ENV: resolveValue(runtime.APP_ENV, ''),
        POSTHOG_TARGETING_MODE: resolveValue(
            runtime.POSTHOG_TARGETING_MODE,
            import.meta.env.VITE_POSTHOG_TARGETING_MODE,
            'auto'
        ),
    };
};
