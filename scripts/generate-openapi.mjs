import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

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
const openapiJsonUrl = `${base}/openapi.json`;

const isCheck = process.argv.includes('--check');

async function generate() {
    console.log(`Fetching OpenAPI spec from ${openapiJsonUrl}...`);
    const response = await fetch(openapiJsonUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }
    const spec = await response.json();

    const outDir = join(ROOT, 'src/api/generated');
    mkdirSync(outDir, { recursive: true });

    const jsonPath = join(outDir, 'openapi.json');
    const oldJson = isCheck ? readFileSync(jsonPath, 'utf8') : null;
    const newJson = JSON.stringify(spec, null, 2);

    if (isCheck) {
        if (oldJson !== newJson) {
            console.error('OpenAPI spec is out of date. Run npm run generate:api');
            process.exit(1);
        }
        console.log('OpenAPI spec is up to date.');
        return;
    }

    writeFileSync(jsonPath, newJson);
    console.log(`Saved OpenAPI spec to ${jsonPath}`);

    console.log('Generating TypeScript types...');
    execSync(`npx openapi-typescript ${jsonPath} -o ${join(outDir, 'openapi.ts')}`, { stdio: 'inherit' });

    console.log('Generating operations...');
    const operations = generateOperations(spec);
    writeFileSync(join(outDir, 'operations.ts'), operations);
    console.log('Generated operations.ts');
}

function generateOperations(spec) {
    const lines = [
        'import { apiFetch } from "../client";',
        'import type { paths, components } from "./openapi";',
        '',
        '// This file is auto-generated. Do not edit manually.',
        ''
    ];

    for (const [path, methods] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
            if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
                const operationId = operation.operationId;
                if (!operationId) continue;

                const name = toCamelCase(operationId);
                const hasPathParams = path.includes('{');
                const pathParams = [];
                if (hasPathParams) {
                    const matches = path.matchAll(/\{([^}]+)\}/g);
                    for (const match of matches) {
                        pathParams.push(match[1]);
                    }
                }

                const hasQueryParams = operation.parameters?.some(p => p.in === 'query');
                const hasBody = !!operation.requestBody;
                
                // Determine parameter type
                let paramsType = '';
                const parts = [];
                if (hasPathParams) {
                    pathParams.forEach(p => parts.push(`${p}: string | number`));
                }
                if (hasQueryParams || hasBody) {
                    // We can use the generated types for this
                    // For now, let's just make it flexible
                    parts.push('options?: any');
                }

                const args = parts.join(', ');
                
                // Construct URL
                let urlStr = path;
                if (hasPathParams) {
                    pathParams.forEach(p => {
                        urlStr = urlStr.replace(`{${p}}`, `\${${p}}`);
                    });
                    urlStr = `\`${urlStr}\``;
                } else {
                    urlStr = `'${urlStr}'`;
                }

                lines.push(`/** ${operation.summary || operationId} */`);
                lines.push(`export async function ${name}(${args}) {`);
                lines.push(`  const fetchOptions: any = { method: '${method.toUpperCase()}' };`);
                if (hasBody) {
                    lines.push(`  if (options?.body) fetchOptions.body = JSON.stringify(options.body);`);
                }
                
                // Handle query params
                if (hasQueryParams) {
                    lines.push(`  let url = ${urlStr};`);
                    lines.push(`  if (options?.query) {`);
                    lines.push(`    const searchParams = new URLSearchParams();`);
                    lines.push(`    for (const [key, value] of Object.entries(options.query)) {`);
                    lines.push(`      if (value !== undefined && value !== null) searchParams.append(key, String(value));`);
                    lines.push(`    }`);
                    lines.push(`    const queryString = searchParams.toString();`);
                    lines.push(`    if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;`);
                    lines.push(`  }`);
                    lines.push(`  return apiFetch<any>(url, fetchOptions);`);
                } else {
                    lines.push(`  return apiFetch<any>(${urlStr}, fetchOptions);`);
                }
                lines.push(`}`);
                lines.push('');
            }
        }
    }

    return lines.join('\n');
}

function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

generate().catch(err => {
    console.error(err);
    process.exit(1);
});
