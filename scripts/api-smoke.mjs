const rawBase =
    process.env.API_TEST_BASE_URL ||
    process.env.VITE_API_URL ||
    'https://api.dev.agentmaple.ca';

const normalizeBase = (value) => {
  try {
    const parsed = new URL(value);
    if (parsed.pathname && parsed.pathname !== '/' && parsed.pathname !== '') {
      return parsed.origin;
    }
    return parsed.origin;
  } catch {
    return value.replace(/\/+$/, '');
  }
};

const base = normalizeBase(rawBase).replace(/\/+$/, '');
const endpoints = [`${base}/openapi.json`, `${base}/docs`];

const fetchWithTimeout = async (url, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
};

const run = async () => {
  const results = [];
  for (const url of endpoints) {
    try {
      const response = await fetchWithTimeout(url);
      results.push({ url, status: response.status });
      if (response.ok) {
        console.log(`API smoke: ${url} -> ${response.status}`);
        process.exit(0);
      }
    } catch (error) {
      results.push({ url, error: error?.message || String(error) });
    }
  }

  console.error('API smoke test failed.');
  console.error(`Base URL: ${base}`);
  console.error('Results:');
  for (const result of results) {
    if (result.error) {
      console.error(`- ${result.url}: ${result.error}`);
    } else {
      console.error(`- ${result.url}: HTTP ${result.status}`);
    }
  }
  process.exit(1);
};

run();
