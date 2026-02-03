# Backend Architecture & PRD

## 1. Executive Summary
This document outlines the backend architecture required to support the **Agent Maple Console**. The console serves as a unified interface for managing AI agents, tenants, data sources, and communications (Voice/SMS).

The current backend (Certly API) provides robust support for multi-tenancy, file embedding (RAG), and voice sessions. This plan identifies the necessary integrations and future services required to support the full vision of the console, including real-time updates and unified messaging.

## 2. High-Level Architecture

The system follows a microservices-oriented architecture (or modular monolith) secured by **AWS Cognito**.

```mermaid
graph TD
    Client[Agent Maple Console\n(React SPA)]
    
    subgraph "Infrastructure"
        Auth[AWS Cognito\n(Identity & Access)]
        Gateway[API Gateway / Load Balancer]
        S3[AWS S3\n(File Storage)]
        SQS[AWS SQS\n(Async Processing)]
    end
    
    subgraph "Backend Services"
        CoreAPI[**Core Agent Service**\n(FastAPI / Python)\n- Tenants & Users\n- Datasources (RAG)\n- Audio Sessions]
        
        Realtime[**Realtime Service**\n(WebSocket / SSE)\n- Live Call Status\n- Processing Updates]
        
        CommService[**Communication Service**\n(Twilio Wrapper)\n- SMS History\n- Call Logs]
    end
    
    Client -->|HTTPS / Bearer Token| Gateway
    Client -->|WSS| Realtime
    
    Gateway --> CoreAPI
    Gateway --> CommService
    
    CoreAPI --> Auth
    CoreAPI --> S3
    CoreAPI --> SQS
```

## 3. Core Services Analysis

### 3.1. Identity & Access (Existing)
*   **Provider**: AWS Cognito
*   **Status**: **Implemented**
*   **Frontend integration**: The console must implement an OIDC flow (using Amplify or generic OIDC client) to obtain JWT Bearer tokens.
*   **Endpoints**:
    *   `/user/sync`: Syncs Cognito user to local DB.
    *   `/user/tenants`: Lists accessible tenants.
    *   `/tenants/send-invitation`: Manages user onboarding.

### 3.2. Agent Core & RAG (Existing)
*   **Status**: **Implemented**
*   **Responsibilities**: Managing knowledge base and agent behavior.
*   **Key Features**:
    *   **Data Sources**: Direct upload (`/datasources/upload`) and Cloud Sync (Google Drive/SharePoint).
    *   **Conversation Templates**: Defining agent persona and rules (`/chat/conversation_parameter_templates`).
    *   **Tenancy**: Multi-tenant isolation at the schema/logic level.

### 3.3. Communication Service (Partially Implemented)
*   **Status**: **Mixed**
*   **Voice**: Implemented via `/audio-conversations` and Twilio webhooks (`/realtime_chat`).
*   **SMS**: **Gaps Identified**.
    *   *Current State*: Webhook exists (`/realtime_chat/sms-webhook`), but it auto-replies "Coming Soon".
    *   *Requirement*: Need an endpoint to fetch **SMS History** for the SMS page and an endpoint to **Send SMS** from the console.
    *   *Proposed Endpoints*:
        *   `GET /communications/sms/history?user_id=...`
        *   `POST /communications/sms/send`

### 3.4. Analytics & Reporting (Partially Implemented)
*   **Status**: **Partial**
*   **Existing**: `/evaluation-reports` provides scores for sessions.
*   **Missing**: Aggregated dashboard metrics (e.g., "Total Calls this Month", "Average Sentinel Score").
*   **Requirement**: New endpoints for the `Insights` dashboard.

## 4. Feature Requirements & Gaps

| Feature Module | Backend Support | Status | Action Required |
| :--- | :--- | :--- | :--- |
| **Contacts** | `/tenants/users` | ✅ Ready | None. |
| **Phone** | `/audio-conversations` | ✅ Ready | Integration required for playback. |
| **SMS** | `/realtime_chat/sms-webhook` | ⚠️ Partial | Need **History** and **Send** APIs. |
| **Email** | None | ❌ Missing | Scope for future `Communication Service` expansion. |
| **Calendar** | None | ❌ Missing | Scope for future integration (Google/Outlook). |
| **Data Sources** | `/datasources/*` | ✅ Ready | Robust RAG pipeline exists. |
| **Issues** | None | ❌ Missing | Need a simple CRUD for issue tracking if not using external tool (Jira). |

## 5. Implementation Roadmap

### Phase 1: Foundation (Current)
- [x] **Auth Integration**: Connect Console to AWS Cognito.
- [x] **Tenant Management**: List/Switch tenants.
- [x] **Data Sources**: File upload and handling.
- [x] **Contacts**: User management.

### Phase 2: Communications (Next)
- [ ] **SMS API**: Implement persistence for SMS messages to support the UI chat interface.
- [ ] **Audio Playback**: Secure generation of presigned URLs (`/audio-conversations/.../download-url`) for playing back call recordings in the browser.

### Phase 3: Real-time Feedback
- [ ] **WebSocket Server**: Implement a service to push updates to the frontend:
    - "File Processing Complete" (Data Sources)
    - "New Incoming Call" (Phone)
    - "New SMS" (SMS)

### Phase 4: Analytics
- [ ] **Aggregated Stats**: Create endpoints that aggregate `evaluation-reports` into time-series data for the Insights dashboard.
