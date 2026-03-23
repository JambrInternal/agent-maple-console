import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAppConfig } from './runtimeConfig';

type TestWindow = Window & { __APP_CONFIG__?: unknown };
type MutableEnv = Record<string, string | undefined>;

const getTestWindow = (): TestWindow => window as TestWindow;
const getMutableEnv = (): MutableEnv => import.meta.env as unknown as MutableEnv;
const clearRuntimeConfig = (): void => {
  delete getTestWindow().__APP_CONFIG__;
};
const assignRuntimeConfig = (value: unknown): void => {
  getTestWindow().__APP_CONFIG__ = value;
};
const clearEnv = (): void => {
  const env = getMutableEnv();
  Object.keys(env).forEach((key) => {
    delete env[key];
  });
};
const restoreEnvFromSnapshot = (snapshot: MutableEnv): void => {
  clearEnv();
  const env = getMutableEnv();
  Object.entries(snapshot).forEach(([key, value]) => {
    if (typeof value === 'undefined') {
      delete env[key];
    } else {
      env[key] = value;
    }
  });
};
const setEnvValue = (key: string, value: string | undefined): void => {
  const env = getMutableEnv();
  if (typeof value === 'undefined') {
    delete env[key];
  } else {
    env[key] = value;
  }
};

describe('getAppConfig', () => {
  const originalEnv = { ...getMutableEnv() };

  beforeEach(() => {
    clearRuntimeConfig();
    clearEnv();
  });

  afterEach(() => {
    restoreEnvFromSnapshot(originalEnv);
  });

  describe('precedence logic', () => {
    it('uses runtime config over import.meta.env and defaults', () => {
      assignRuntimeConfig({
        API_URL: 'https://runtime.example.com',
      });
      setEnvValue('VITE_API_URL', 'https://vite.example.com');

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://runtime.example.com');
    });

    it('uses import.meta.env when runtime config is not available', () => {
      setEnvValue('VITE_API_URL', 'https://vite.example.com');
      setEnvValue('VITE_AWS_REGION', 'eu-west-1');

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://vite.example.com');
      expect(config.AWS_REGION).toBe('eu-west-1');
    });

    it('uses defaults when neither runtime nor import.meta.env are available', () => {
      const config = getAppConfig();

      expect(config.API_URL).toBe('https://api.dev.agentmaple.ca');
      expect(config.AWS_REGION).toBe('us-east-1');
      expect(config.COGNITO_USER_POOL_ID).toBe('us-east-1_dDp9djoZz');
      expect(config.COGNITO_APP_CLIENT_ID).toBe('2j77g0duot54vs8461u4tbbenp');
      expect(config.SENTRY_DSN).toBe('');
      expect(config.POSTHOG_KEY).toBe('');
      expect(config.POSTHOG_HOST).toBe('https://us.i.posthog.com');
      expect(config.POSTHOG_ENABLED).toBe('true');
      expect(config.APP_ENV).toBe('');
      expect(config.POSTHOG_TARGETING_MODE).toBe('auto');
    });

    it('uses import.meta.env when runtime config value is empty string', () => {
      assignRuntimeConfig({
        API_URL: '',
      });
      setEnvValue('VITE_API_URL', 'https://vite.example.com');

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://vite.example.com');
    });

    it('uses import.meta.env when runtime config value is whitespace-only', () => {
      assignRuntimeConfig({
        API_URL: '   ',
      });
      setEnvValue('VITE_API_URL', 'https://vite.example.com');

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://vite.example.com');
    });

    it('uses defaults when all values are empty strings', () => {
      assignRuntimeConfig({
        API_URL: '',
      });
      setEnvValue('VITE_API_URL', '');

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://api.dev.agentmaple.ca');
    });

    it('trims whitespace from runtime config values', () => {
      assignRuntimeConfig({
        API_URL: '  https://runtime.example.com  ',
      });

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://runtime.example.com');
    });
  });

  describe('blank string handling', () => {
    it('treats empty string as invalid and falls through to next value', () => {
      assignRuntimeConfig({
        API_URL: '',
        AWS_REGION: '',
      });
      setEnvValue('VITE_API_URL', 'https://vite.example.com');
      setEnvValue('VITE_AWS_REGION', '');

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://vite.example.com');
      expect(config.AWS_REGION).toBe('us-east-1');
    });

    it('treats null and undefined as invalid', () => {
      assignRuntimeConfig({
        API_URL: null,
        AWS_REGION: undefined,
      });
      setEnvValue('VITE_API_URL', 'https://vite.example.com');

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://vite.example.com');
      expect(config.AWS_REGION).toBe('us-east-1');
    });

    it('treats non-string values as invalid', () => {
      assignRuntimeConfig({
        API_URL: 123,
        AWS_REGION: { value: 'test' },
      });
      setEnvValue('VITE_API_URL', 'https://vite.example.com');

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://vite.example.com');
      expect(config.AWS_REGION).toBe('us-east-1');
    });
  });

  describe('edge cases', () => {
    it('handles missing window.__APP_CONFIG__', () => {
      const config = getAppConfig();

      expect(config).toBeDefined();
      expect(config.API_URL).toBe('https://api.dev.agentmaple.ca');
    });

    it('handles window.__APP_CONFIG__ being null', () => {
      assignRuntimeConfig(null);

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://api.dev.agentmaple.ca');
    });

    it('handles window.__APP_CONFIG__ not being an object', () => {
      assignRuntimeConfig('not an object');

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://api.dev.agentmaple.ca');
    });

    it('returns all required config fields', () => {
      const config = getAppConfig();

      expect(config).toHaveProperty('API_URL');
      expect(config).toHaveProperty('AWS_REGION');
      expect(config).toHaveProperty('COGNITO_USER_POOL_ID');
      expect(config).toHaveProperty('COGNITO_APP_CLIENT_ID');
      expect(config).toHaveProperty('SENTRY_DSN');
      expect(config).toHaveProperty('GIT_COMMIT');
      expect(config).toHaveProperty('POSTHOG_KEY');
      expect(config).toHaveProperty('POSTHOG_HOST');
      expect(config).toHaveProperty('POSTHOG_ENABLED');
      expect(config).toHaveProperty('APP_ENV');
      expect(config).toHaveProperty('POSTHOG_TARGETING_MODE');
    });
  });

  describe('production runtime config', () => {
    it('correctly resolves all fields from runtime config in production scenario', () => {
      assignRuntimeConfig({
        API_URL: 'https://api.prod.example.com',
        AWS_REGION: 'us-west-2',
        COGNITO_USER_POOL_ID: 'us-west-2_prodPoolId',
        COGNITO_APP_CLIENT_ID: 'prodClientId123',
        SENTRY_DSN: 'https://sentry.prod.example.com',
        POSTHOG_KEY: 'phc_prod_123',
        POSTHOG_HOST: 'https://us.i.posthog.com',
        POSTHOG_ENABLED: 'true',
        APP_ENV: 'prod',
        POSTHOG_TARGETING_MODE: 'group_and_person',
      });

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://api.prod.example.com');
      expect(config.AWS_REGION).toBe('us-west-2');
      expect(config.COGNITO_USER_POOL_ID).toBe('us-west-2_prodPoolId');
      expect(config.COGNITO_APP_CLIENT_ID).toBe('prodClientId123');
      expect(config.SENTRY_DSN).toBe('https://sentry.prod.example.com');
      expect(config.POSTHOG_KEY).toBe('phc_prod_123');
      expect(config.POSTHOG_HOST).toBe('https://us.i.posthog.com');
      expect(config.POSTHOG_ENABLED).toBe('true');
      expect(config.APP_ENV).toBe('prod');
      expect(config.POSTHOG_TARGETING_MODE).toBe('group_and_person');
    });

    it('allows mixed sources (some runtime, some env, some defaults)', () => {
      assignRuntimeConfig({
        API_URL: 'https://api.prod.example.com',
      });
      setEnvValue('VITE_AWS_REGION', 'eu-central-1');

      const config = getAppConfig();

      expect(config.API_URL).toBe('https://api.prod.example.com');
      expect(config.AWS_REGION).toBe('eu-central-1');
      expect(config.COGNITO_USER_POOL_ID).toBe('us-east-1_dDp9djoZz');
      expect(config.POSTHOG_HOST).toBe('https://us.i.posthog.com');
      expect(config.POSTHOG_ENABLED).toBe('true');
      expect(config.POSTHOG_TARGETING_MODE).toBe('auto');
    });

    it('prefers runtime git commit over build-time env commit', () => {
      assignRuntimeConfig({
        GIT_COMMIT: 'runtime123',
      });
      setEnvValue('VITE_GIT_COMMIT', 'env456');

      const config = getAppConfig();

      expect(config.GIT_COMMIT).toBe('runtime123');
    });

    it('uses build-time env git commit when runtime commit is missing', () => {
      setEnvValue('VITE_GIT_COMMIT', 'env456');

      const config = getAppConfig();

      expect(config.GIT_COMMIT).toBe('env456');
    });
  });
});
