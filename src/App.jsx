import React, { useEffect } from 'react'
import logger from './utils/verboseLogger'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './app/AppRoutes'

function App() {
    useEffect(() => {
        logger.info('App mounted');
        return () => {
            logger.info('App unmounted');
        };
    }, []);

    logger.debug('App render start');
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
}

export default App
