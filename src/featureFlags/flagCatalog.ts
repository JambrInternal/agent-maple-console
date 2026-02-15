export type DeploymentEnv = 'dev' | 'beta' | 'prod'

export type FeatureFlagKey =
    | 'ff_billing_page'
    | 'ff_usage_page'
    | 'ff_org_settings_page'
    | 'ff_threads_page'
    | 'ff_issues_page'
    | 'ff_tools_skills_page'
    | 'ff_insights_page'
    | 'ff_sms_page'
    | 'ff_email_page'
    | 'ff_personality_editor'
    | 'ff_knowledge_cloud_actions'

export type FeatureFlagGateType = 'route' | 'action'

export interface FeatureFlagDefinition {
    key: FeatureFlagKey
    gateType: FeatureFlagGateType
    description: string
}

export const FEATURE_FLAG_CATALOG: Record<FeatureFlagKey, FeatureFlagDefinition> = {
    ff_billing_page: {
        key: 'ff_billing_page',
        gateType: 'route',
        description: 'Controls access to the Organization Billing page (currently beta/coming-soon UI).',
    },
    ff_usage_page: {
        key: 'ff_usage_page',
        gateType: 'route',
        description: 'Controls access to the Organization Usage page (currently beta/coming-soon UI).',
    },
    ff_org_settings_page: {
        key: 'ff_org_settings_page',
        gateType: 'route',
        description: 'Controls access to the Organization Settings page (currently beta/coming-soon UI).',
    },
    ff_threads_page: {
        key: 'ff_threads_page',
        gateType: 'route',
        description: 'Controls access to the Project Threads page (currently beta/coming-soon UI).',
    },
    ff_issues_page: {
        key: 'ff_issues_page',
        gateType: 'route',
        description: 'Controls access to the Project Issues page (currently beta/coming-soon UI).',
    },
    ff_tools_skills_page: {
        key: 'ff_tools_skills_page',
        gateType: 'route',
        description: 'Controls access to the Project Skills & Tools page (currently beta/coming-soon UI).',
    },
    ff_insights_page: {
        key: 'ff_insights_page',
        gateType: 'route',
        description: 'Controls access to the Project Insights page (currently beta/coming-soon UI).',
    },
    ff_sms_page: {
        key: 'ff_sms_page',
        gateType: 'route',
        description: 'Controls access to the Project SMS page (currently beta/coming-soon UI).',
    },
    ff_email_page: {
        key: 'ff_email_page',
        gateType: 'route',
        description: 'Controls access to the Project Email page (currently beta/coming-soon UI).',
    },
    ff_personality_editor: {
        key: 'ff_personality_editor',
        gateType: 'route',
        description: 'Controls access to the Project Personality editor route and save actions.',
    },
    ff_knowledge_cloud_actions: {
        key: 'ff_knowledge_cloud_actions',
        gateType: 'action',
        description: 'Controls Knowledge cloud connect/reconnect OAuth and sync actions.',
    },
}

export const FEATURE_FLAG_KEYS = Object.keys(FEATURE_FLAG_CATALOG) as FeatureFlagKey[]

export const isFeatureFlagKey = (value: string): value is FeatureFlagKey => {
    return Object.prototype.hasOwnProperty.call(FEATURE_FLAG_CATALOG, value)
}

export const getFeatureFlagDefinition = (key: FeatureFlagKey): FeatureFlagDefinition => {
    return FEATURE_FLAG_CATALOG[key]
}
