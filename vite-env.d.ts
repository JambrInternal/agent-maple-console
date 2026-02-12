/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_AWS_REGION?: string;
  readonly VITE_COGNITO_USER_POOL_ID?: string;
  readonly VITE_COGNITO_APP_CLIENT_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_DEBUG_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __APP_CONFIG__?: {
    API_URL?: string;
    AWS_REGION?: string;
    COGNITO_USER_POOL_ID?: string;
    COGNITO_APP_CLIENT_ID?: string;
    SENTRY_DSN?: string;
  };
}
