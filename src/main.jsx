import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
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

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </React.StrictMode>,
)
