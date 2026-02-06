# Certly API (Stage)

## Snapshot
- **OpenAPI spec**: `docs/architecture/certly-openapi.json`
- **Extended console spec**: `docs/architecture/api.yaml` (stage snapshot + console gaps)
- **Swagger UI**: https://api.stage.certly.jambr.ca/docs
- **Base URL**: https://api.stage.certly.jambr.ca/stage
- **Last reviewed**: February 4, 2026
- **Console gap analysis**: see `docs/architecture/CERTLY_CONSOLE_API.md`

## Auth
- **Scheme**: `Authorization: Bearer <JWT>`
- **Token source**: AWS Cognito (via Amplify)
- **Project context**: optional `x-tenant-id` header (Certly tenant ID)

## User Sync
- **Endpoint**: `POST /user/sync`
- **Purpose**: ensure the authenticated Cognito user exists in the API database
- **Body**: none
- **Header**: `x-tenant-id` not required

## Console Config
- `VITE_API_URL` defaults to `https://api.stage.certly.jambr.ca/stage`
- Mocks have been removed; the console always targets the live API.

## Update Snapshot
```bash
curl -sSL https://api.stage.certly.jambr.ca/stage/openapi.json \
  -o docs/architecture/certly-openapi.json
```
