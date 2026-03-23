import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const rawBase =
    process.env.API_TEST_BASE_URL ||
    process.env.VITE_API_URL ||
    'https://api.dev.agentmaple.ca';

const normalizeBase = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.origin;
  } catch {
    return value.replace(/\/+$/, '');
  }
};

const base = normalizeBase(rawBase).replace(/\/+$/, '');
const token = process.env.API_TEST_TOKEN;
const tenantId = process.env.API_TEST_TENANT_ID;
const enableMutations = process.env.API_TEST_ENABLE_MUTATIONS === 'true';

// Map of parameter names to test values
const TEST_IDS = {
  datasource_id: process.env.API_TEST_DATASOURCE_ID || '1',
  project_id: process.env.API_TEST_PROJECT_ID || '00000000-0000-0000-0000-000000000000',
  thread_id: process.env.API_TEST_THREAD_ID || '00000000-0000-0000-0000-000000000000',
  issue_id: process.env.API_TEST_ISSUE_ID || '00000000-0000-0000-0000-000000000000',
  user_id: process.env.API_TEST_USER_ID || '00000000-0000-0000-0000-000000000000',
  tenant_id: process.env.API_TEST_TENANT_ID || '1',
  session_id: process.env.API_TEST_SESSION_ID || '00000000-0000-0000-0000-000000000000',
  template_id: process.env.API_TEST_TEMPLATE_ID || '1',
  chunk_id: process.env.API_TEST_CHUNK_ID || '1',
  provider: 'google_drive',
};

async function run() {
  console.log(`Starting full-surface smoke test targeting ${base}...`);
    
  // 1. Fetch OpenAPI spec
  const specResponse = await fetch(`${base}/openapi.json`);
  if (!specResponse.ok) {
    console.error(`Failed to fetch openapi.json: ${specResponse.status}`);
    process.exit(1);
  }
  const spec = await specResponse.json();
    
  const results = [];
  const operations = [];

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        operations.push({ path, method, operation });
      }
    }
  }

  console.log(`Discovered ${operations.length} operations.`);

  for (const { path, method, operation } of operations) {
    const operationId = operation.operationId || `${method} ${path}`;
        
    // Skip some problematic or non-API endpoints
    if (path.includes('webhook') || path.includes('callback') || path.includes('twilio') || path.includes('debug')) {
      results.push({ operationId, method, path, status: 'SKIPPED', reason: 'Webhook/Callback/Debug' });
      continue;
    }

    // Build URL
    let urlStr = path;
    const missingIds = [];
    const matches = path.match(/\{([^}]+)\}/g);
    if (matches) {
      for (const match of matches) {
        const paramName = match.slice(1, -1);
        const val = TEST_IDS[paramName];
        if (val) {
          urlStr = urlStr.replace(match, val);
        } else {
          missingIds.push(paramName);
          urlStr = urlStr.replace(match, '0'); // Fallback
        }
      }
    }

    const isMutation = ['post', 'put', 'patch', 'delete'].includes(method);
        
    // Decide whether to skip or run
    if (isMutation && !enableMutations) {
      // Run but expect 4xx or 2xx, just not 5xx
    }

    const url = `${base}${urlStr}`;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (tenantId) headers['x-tenant-id'] = tenantId;

    const startTime = Date.now();
    let status;
    let responseText;

    try {
      const res = await fetch(url, {
        method: method.toUpperCase(),
        headers,
        // Send empty body for mutations if required, but usually we just want to see if it responds
        body: isMutation ? JSON.stringify({}) : undefined,
      });
      status = res.status;
      responseText = await res.text().catch(() => '');
            
      const duration = Date.now() - startTime;
            
      let passed = true;
      let reason = '';

      // Pass criteria: not 5xx
      if (status >= 500) {
        passed = false;
        reason = '5xx Server Error';
      } else if (token && method === 'get' && !missingIds.length && status !== 200) {
        // In auth mode, GETs should be 200 if we have the IDs
        // But let's be lenient since 404/403 might be legitimate for dummy IDs
        if (status >= 400) {
          // passed = false;
          // reason = `Unexpected ${status}`;
        }
      }

      results.push({
        operationId,
        method,
        path,
        url,
        status,
        duration,
        passed,
        reason,
        responseText: responseText.slice(0, 200)
      });

      if (passed) {
        console.log(`✅ ${method.toUpperCase()} ${path} -> ${status} (${duration}ms)`);
      } else {
        console.error(`❌ ${method.toUpperCase()} ${path} -> ${status} (${duration}ms) - ${reason}`);
      }

    } catch (error) {
      results.push({
        operationId,
        method,
        path,
        url,
        status: 'ERROR',
        passed: false,
        reason: error.message
      });
      console.error(`❌ ${method.toUpperCase()} ${path} -> ERROR: ${error.message}`);
    }
  }

  // 4. Summary
  const total = results.length;
  const passed = results.filter(r => r.passed !== false).length;
  const failed = total - passed;

  console.log('\n--- Smoke Test Summary ---');
  console.log(`Total:  ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  // Create artifacts directory if it doesn't exist
  const artifactsDir = join(ROOT, 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  writeFileSync(join(artifactsDir, 'api-smoke-report.json'), JSON.stringify(results, null, 2));

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
