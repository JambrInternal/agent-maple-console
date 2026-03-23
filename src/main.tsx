import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import '@aws-amplify/ui-react/styles.css'
import './index.css'
import { I18n } from 'aws-amplify/utils'
import { configureAmplify } from './amplify-config'
import { applyStoredTheme } from './utils/theme'
import AppProviders from './app/AppProviders'

configureAmplify();
I18n.putVocabularies({
    en: {
        'Sign in': 'Sign In',
        'Enter your Password': 'Password',
        'Enter your Email': 'Email Address',
    },
});
applyStoredTheme();

const rootElement = document.getElementById('root')
if (!rootElement) {
    throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
    <StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </StrictMode>,
)
