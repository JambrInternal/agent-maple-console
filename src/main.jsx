import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
import './index.css'
import { configureAmplify } from './amplify-config'
import { applyStoredTheme } from './utils/theme'
import AppProviders from './app/AppProviders'

configureAmplify();
applyStoredTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </React.StrictMode>,
)
