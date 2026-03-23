import type { KnowledgeSource } from '../types'
import { toIsoString, toIsoStringOrNull, toKnowledgeStatus, toKnowledgeType, toStringId } from './shared'
import type { ApiDatasource } from './types'

export function mapDatasourceResponse(datasource: ApiDatasource): KnowledgeSource {
  return {
    id: toStringId(datasource.id),
    projectId: toStringId(datasource.tenant_id),
    name: datasource.file_name || 'Untitled Source',
    type: toKnowledgeType(datasource.source, datasource.content_type),
    status: toKnowledgeStatus(datasource.embedding_status),
    documentCount: 0,
    lastSyncAt: toIsoStringOrNull(datasource.updated_at),
    createdAt: toIsoString(datasource.created_at),
  }
}
