# Certly API (Stage)

## Snapshot
- **OpenAPI spec**: `docs/architecture/certly-openapi.json`
- **Swagger UI**: https://api.stage.certly.jambr.ca/docs
- **Base URL**: https://api.stage.certly.jambr.ca/stage

## Auth
- **Scheme**: `Authorization: Bearer <JWT>`
- **Token source**: AWS Cognito (via Amplify)
- **Organization context**: optional `x-tenant-id` header (Organization ID)

## User Sync
- **Endpoint**: `POST /user/sync`
- **Purpose**: ensure the authenticated Cognito user exists in the API database
- **Body**: none
- **Header**: `x-tenant-id` not required

## Console Config
- `VITE_API_URL` defaults to `https://api.stage.certly.jambr.ca/stage`
- `VITE_USE_MOCKS=false` uses the live API instead of fixtures

## Update Snapshot
```bash
curl -sSL https://api.stage.certly.jambr.ca/stage/openapi.json \
  -o docs/architecture/certly-openapi.json
```
