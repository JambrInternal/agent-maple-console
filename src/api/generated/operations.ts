import { apiFetch } from "../client";
import type { paths, components } from "./openapi";

// This file is auto-generated. Do not edit manually.

/** Test Static */
export async function testStaticTestStaticGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/test-static', fetchOptions);
}

/** Upload File */
export async function uploadFileDatasourcesUploadPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/datasources/upload', fetchOptions);
}

/** Sync Google Drive */
export async function syncGoogleDriveDatasourcesSyncGoogleDrivePost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/datasources/sync-google-drive', fetchOptions);
}

/** List Datasources */
export async function listDatasourcesDatasourcesGet(options?: any) {
  const fetchOptions: any = { method: 'GET' };
  let url = '/datasources';
  if (options?.query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return apiFetch<any>(url, fetchOptions);
}

/** Get Sharepoint Config */
export async function getSharepointConfigDatasourcesSharepointConfigGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/datasources/sharepoint-config', fetchOptions);
}

/** Get Google Drive Config */
export async function getGoogleDriveConfigDatasourcesGoogleDriveConfigGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/datasources/google-drive-config', fetchOptions);
}

/** Get Datasource */
export async function getDatasourceDatasources_DatasourceId_Get(datasource_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/datasources/${datasource_id}`, fetchOptions);
}

/** Delete Datasource */
export async function deleteDatasourceDatasources_DatasourceId_Delete(datasource_id: string | number) {
  const fetchOptions: any = { method: 'DELETE' };
  return apiFetch<any>(`/datasources/${datasource_id}`, fetchOptions);
}

/** Reprocess Datasource */
export async function reprocessDatasourceDatasources_DatasourceId_ReprocessPost(datasource_id: string | number) {
  const fetchOptions: any = { method: 'POST' };
  return apiFetch<any>(`/datasources/${datasource_id}/reprocess`, fetchOptions);
}

/** Get Download Url */
export async function getDownloadUrlDatasources_DatasourceId_DownloadUrlGet(datasource_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/datasources/${datasource_id}/download-url`, fetchOptions);
}

/** Google Drive Webhook */
export async function googleDriveWebhookDatasourcesGoogleDriveWebhookPost() {
  const fetchOptions: any = { method: 'POST' };
  return apiFetch<any>('/datasources/google-drive-webhook', fetchOptions);
}

/** Sync Sharepoint */
export async function syncSharepointDatasourcesSyncSharepointPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/datasources/sync-sharepoint', fetchOptions);
}

/** Sharepoint Webhook */
export async function sharepointWebhookDatasourcesSharepointWebhookPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  let url = '/datasources/sharepoint-webhook';
  if (options?.query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return apiFetch<any>(url, fetchOptions);
}

/** List File Chunks */
export async function listFileChunksFileChunksGet(options?: any) {
  const fetchOptions: any = { method: 'GET' };
  let url = '/file-chunks';
  if (options?.query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return apiFetch<any>(url, fetchOptions);
}

/** Reprocess Chunk */
export async function reprocessChunkFileChunks_ChunkId_ReprocessPost(chunk_id: string | number) {
  const fetchOptions: any = { method: 'POST' };
  return apiFetch<any>(`/file-chunks/${chunk_id}/reprocess`, fetchOptions);
}

/** Reprocess Chunks Batch */
export async function reprocessChunksBatchFileChunksReprocessBatchPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/file-chunks/reprocess-batch', fetchOptions);
}

/** Delete Chunks Batch */
export async function deleteChunksBatchFileChunksDeleteBatchPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/file-chunks/delete-batch', fetchOptions);
}

/** Get Template Audio Conversations */
export async function getTemplateAudioConversationsAudioConversations_TemplateId_Get(template_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/audio-conversations/${template_id}`, fetchOptions);
}

/** Get Audio Conversation By Session */
export async function getAudioConversationBySessionAudioConversationsSession_SessionId_Get(session_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/audio-conversations/session/${session_id}`, fetchOptions);
}

/** Delete Audio Conversation */
export async function deleteAudioConversationAudioConversationsSession_SessionId_Delete(session_id: string | number) {
  const fetchOptions: any = { method: 'DELETE' };
  return apiFetch<any>(`/audio-conversations/session/${session_id}`, fetchOptions);
}

/** Get Audio Download Url */
export async function getAudioDownloadUrlAudioConversationsSession_SessionId_DownloadUrlGet(session_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'GET' };
  let url = `/audio-conversations/session/${session_id}/download-url`;
  if (options?.query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return apiFetch<any>(url, fetchOptions);
}

/** Get User Audio Conversations */
export async function getUserAudioConversationsAudioConversationsUser_UserId_Get(user_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/audio-conversations/user/${user_id}`, fetchOptions);
}

/** Get User Template Audio Conversations */
export async function getUserTemplateAudioConversationsAudioConversationsUser_UserId_Template_TemplateId_Get(user_id: string | number, template_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/audio-conversations/user/${user_id}/template/${template_id}`, fetchOptions);
}

/** Get Twilio Conversation By User */
export async function getTwilioConversationByUserAudioConversationsUser_UserId_TwilioGet(user_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/audio-conversations/user/${user_id}/twilio`, fetchOptions);
}

/** Get Evaluation Report By Session Id */
export async function getEvaluationReportBySessionIdEvaluationReportsSession_SessionId_Get(session_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/evaluation-reports/session/${session_id}`, fetchOptions);
}

/** Delete Evaluation Report */
export async function deleteEvaluationReportEvaluationReportsSession_SessionId_Delete(session_id: string | number) {
  const fetchOptions: any = { method: 'DELETE' };
  return apiFetch<any>(`/evaluation-reports/session/${session_id}`, fetchOptions);
}

/** Webhook */
export async function webhookOpenaiWebhookPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/openai_webhook', fetchOptions);
}

/** Create Call Session */
export async function createCallSessionChatCallSessionPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  let url = '/chat/call_session';
  if (options?.query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return apiFetch<any>(url, fetchOptions);
}

/** Create Conversation Parameter Template */
export async function createConversationParameterTemplateChatConversationParameterTemplatesPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/chat/conversation_parameter_templates', fetchOptions);
}

/** List Conversation Parameter Templates */
export async function listConversationParameterTemplatesChatConversationParameterTemplatesGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/chat/conversation_parameter_templates', fetchOptions);
}

/** Get Conversation Parameter Template */
export async function getConversationParameterTemplateChatConversationParameterTemplates_TemplateId_Get(template_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/chat/conversation_parameter_templates/${template_id}`, fetchOptions);
}

/** Update Conversation Parameter Template */
export async function updateConversationParameterTemplateChatConversationParameterTemplates_TemplateId_Put(template_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'PUT' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/chat/conversation_parameter_templates/${template_id}`, fetchOptions);
}

/** Patch Conversation Parameter Template */
export async function patchConversationParameterTemplateChatConversationParameterTemplates_TemplateId_Patch(template_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'PATCH' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/chat/conversation_parameter_templates/${template_id}`, fetchOptions);
}

/** Delete Conversation Parameter Template */
export async function deleteConversationParameterTemplateChatConversationParameterTemplates_TemplateId_Delete(template_id: string | number) {
  const fetchOptions: any = { method: 'DELETE' };
  return apiFetch<any>(`/chat/conversation_parameter_templates/${template_id}`, fetchOptions);
}

/** Add Tenant User */
export async function addTenantUserTenantsUsersPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/tenants/users', fetchOptions);
}

/** List Tenant Users */
export async function listTenantUsersTenantsUsersGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/tenants/users', fetchOptions);
}

/** Remove Tenant User */
export async function removeTenantUserTenantsUsers_UserId_Delete(user_id: string | number) {
  const fetchOptions: any = { method: 'DELETE' };
  return apiFetch<any>(`/tenants/users/${user_id}`, fetchOptions);
}

/** Update User */
export async function updateUserTenantsUsers_UserId_Patch(user_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'PATCH' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/tenants/users/${user_id}`, fetchOptions);
}

/** Grant Permissions */
export async function grantPermissionsTenantsUsers_UserId_PermissionsPost(user_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/tenants/users/${user_id}/permissions`, fetchOptions);
}

/** Revoke Permissions */
export async function revokePermissionsTenantsUsers_UserId_PermissionsDelete(user_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'DELETE' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/tenants/users/${user_id}/permissions`, fetchOptions);
}

/** Send Invitation */
export async function sendInvitationTenantsSendInvitationPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/tenants/send-invitation', fetchOptions);
}

/** Create And Invite User */
export async function createAndInviteUserTenantsCreateAndInviteUserPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/tenants/create-and-invite-user', fetchOptions);
}

/** Oauth2 Authorize */
export async function oauth2AuthorizeOauth2AuthorizePost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/oauth2/authorize', fetchOptions);
}

/** Oauth2 Callback */
export async function oauth2CallbackOauth2CallbackPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/oauth2/callback', fetchOptions);
}

/** List Oauth Tokens */
export async function listOauthTokensOauth2TokensGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/oauth2/tokens', fetchOptions);
}

/** Get Oauth Token */
export async function getOauthTokenOauth2Tokens_Provider_Get(provider: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/oauth2/tokens/${provider}`, fetchOptions);
}

/** Oauth2 Unauthorize */
export async function oauth2UnauthorizeOauth2Unauthorize_Provider_Delete(provider: string | number) {
  const fetchOptions: any = { method: 'DELETE' };
  return apiFetch<any>(`/oauth2/unauthorize/${provider}`, fetchOptions);
}

/** Sync User */
export async function syncUserUserSyncPost() {
  const fetchOptions: any = { method: 'POST' };
  return apiFetch<any>('/user/sync', fetchOptions);
}

/** Get User Tenants */
export async function getUserTenantsUserTenantsGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/user/tenants', fetchOptions);
}

/** Create Tenant With Instructor Permission */
export async function createTenantWithInstructorPermissionUserTenantsPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/user/tenants', fetchOptions);
}

/** Accept Invitation */
export async function acceptInvitationUserAcceptInvitationPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/user/accept-invitation', fetchOptions);
}

/** List Tenants */
export async function listTenantsAdminTenantsGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/admin/tenants', fetchOptions);
}

/** Create Tenant */
export async function createTenantAdminTenantsPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/admin/tenants', fetchOptions);
}

/** Get Tenant */
export async function getTenantAdminTenants_TenantId_Get(tenant_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/admin/tenants/${tenant_id}`, fetchOptions);
}

/** Update Tenant */
export async function updateTenantAdminTenants_TenantId_Patch(tenant_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'PATCH' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/admin/tenants/${tenant_id}`, fetchOptions);
}

/** Disable Tenant */
export async function disableTenantAdminTenants_TenantId_DisablePost(tenant_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/admin/tenants/${tenant_id}/disable`, fetchOptions);
}

/** Add Tenant User */
export async function addTenantUserAdminTenants_TenantId_UsersPost(tenant_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/admin/tenants/${tenant_id}/users`, fetchOptions);
}

/** List Tenant Users */
export async function listTenantUsersAdminTenants_TenantId_UsersGet(tenant_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/admin/tenants/${tenant_id}/users`, fetchOptions);
}

/** Remove Tenant User */
export async function removeTenantUserAdminTenants_TenantId_Users_UserId_Delete(tenant_id: string | number, user_id: string | number) {
  const fetchOptions: any = { method: 'DELETE' };
  return apiFetch<any>(`/admin/tenants/${tenant_id}/users/${user_id}`, fetchOptions);
}

/** Grant Permissions */
export async function grantPermissionsAdminTenants_TenantId_Users_UserId_PermissionsPost(tenant_id: string | number, user_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/admin/tenants/${tenant_id}/users/${user_id}/permissions`, fetchOptions);
}

/** Revoke Permissions */
export async function revokePermissionsAdminTenants_TenantId_Users_UserId_PermissionsDelete(tenant_id: string | number, user_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'DELETE' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/admin/tenants/${tenant_id}/users/${user_id}/permissions`, fetchOptions);
}

/** List Projects For Tenant */
export async function listProjectsForTenantProjectsTenant_TenantId_Get(tenant_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/projects/tenant/${tenant_id}`, fetchOptions);
}

/** List Projects For Current Tenant */
export async function listProjectsForCurrentTenantProjects_Get() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/projects/', fetchOptions);
}

/** Create Project For Tenant */
export async function createProjectForTenantProjects_Post(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>('/projects/', fetchOptions);
}

/** Get Project */
export async function getProjectProjects_ProjectId_Get(project_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/projects/${project_id}`, fetchOptions);
}

/** Update Project */
export async function updateProjectProjects_ProjectId_Patch(project_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'PATCH' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/projects/${project_id}`, fetchOptions);
}

/** List Threads For Project */
export async function listThreadsForProjectProjects_ProjectId_ThreadsGet(project_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'GET' };
  let url = `/projects/${project_id}/threads`;
  if (options?.query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return apiFetch<any>(url, fetchOptions);
}

/** List Issues For Project */
export async function listIssuesForProjectProjects_ProjectId_IssuesGet(project_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'GET' };
  let url = `/projects/${project_id}/issues`;
  if (options?.query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return apiFetch<any>(url, fetchOptions);
}

/** Create Issue For Project */
export async function createIssueForProjectProjects_ProjectId_IssuesPost(project_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'POST' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/projects/${project_id}/issues`, fetchOptions);
}

/** Get Thread */
export async function getThreadThreads_ThreadId_Get(thread_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/threads/${thread_id}`, fetchOptions);
}

/** Update Thread */
export async function updateThreadThreads_ThreadId_Patch(thread_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'PATCH' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/threads/${thread_id}`, fetchOptions);
}

/** Get Issue */
export async function getIssueIssues_IssueId_Get(issue_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/issues/${issue_id}`, fetchOptions);
}

/** Update Issue */
export async function updateIssueIssues_IssueId_Patch(issue_id: string | number, options?: any) {
  const fetchOptions: any = { method: 'PATCH' };
  if (options?.body) fetchOptions.body = JSON.stringify(options.body);
  return apiFetch<any>(`/issues/${issue_id}`, fetchOptions);
}

/** Root */
export async function rootRealtimeChatGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/realtime_chat', fetchOptions);
}

/** Twilio Assistant */
export async function twilioAssistantRealtimeChatTwilioAssistant_TenantId_Get(tenant_id: string | number) {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>(`/realtime_chat/twilio-assistant/${tenant_id}`, fetchOptions);
}

/** Twilio Assistant */
export async function twilioAssistantRealtimeChatTwilioAssistant_TenantId_Post(tenant_id: string | number) {
  const fetchOptions: any = { method: 'POST' };
  return apiFetch<any>(`/realtime_chat/twilio-assistant/${tenant_id}`, fetchOptions);
}

/** Incoming Call */
export async function incomingCallRealtimeChatIncomingCallGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/realtime_chat/incoming-call', fetchOptions);
}

/** Incoming Call */
export async function incomingCallRealtimeChatIncomingCallPost() {
  const fetchOptions: any = { method: 'POST' };
  return apiFetch<any>('/realtime_chat/incoming-call', fetchOptions);
}

/** Incoming Call Gather */
export async function incomingCallGatherRealtimeChatIncomingCallGatherGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/realtime_chat/incoming-call/gather', fetchOptions);
}

/** Incoming Call Gather */
export async function incomingCallGatherRealtimeChatIncomingCallGatherPost() {
  const fetchOptions: any = { method: 'POST' };
  return apiFetch<any>('/realtime_chat/incoming-call/gather', fetchOptions);
}

/** Transfer Status Callback */
export async function transferStatusCallbackRealtimeChatTransferStatusCallbackGet(options?: any) {
  const fetchOptions: any = { method: 'GET' };
  let url = '/realtime_chat/transfer-status-callback';
  if (options?.query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return apiFetch<any>(url, fetchOptions);
}

/** Transfer Status Callback */
export async function transferStatusCallbackRealtimeChatTransferStatusCallbackPost(options?: any) {
  const fetchOptions: any = { method: 'POST' };
  let url = '/realtime_chat/transfer-status-callback';
  if (options?.query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return apiFetch<any>(url, fetchOptions);
}

/** Sms Webhook */
export async function smsWebhookRealtimeChatSmsWebhookPost() {
  const fetchOptions: any = { method: 'POST' };
  return apiFetch<any>('/realtime_chat/sms-webhook', fetchOptions);
}

/** Trigger Error */
export async function triggerErrorDebugTriggerErrorGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/debug/trigger-error', fetchOptions);
}

/** Trigger Warning */
export async function triggerWarningDebugTriggerWarningGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/debug/trigger-warning', fetchOptions);
}

/** Trigger Exception */
export async function triggerExceptionDebugTriggerExceptionGet() {
  const fetchOptions: any = { method: 'GET' };
  return apiFetch<any>('/debug/trigger-exception', fetchOptions);
}
