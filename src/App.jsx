import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'

import Contacts from './pages/Contacts'
import Phone from './pages/Phone'
import SMS from './pages/SMS'
import DataSources from './pages/DataSources'

// Placeholder pages
const Dashboard = () => <h2>Dashboard</h2>

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/contacts" replace />} />
                    <Route path="contacts" element={<Contacts />} />
                    <Route path="phone" element={<Phone />} />
                    <Route path="sms" element={<SMS />} />
                    <Route path="data-sources" element={<DataSources />} />
                    <Route path="*" element={<Dashboard />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
