import { useCallback, useEffect, useState } from 'react'
import { getErrorStatus } from '../../api/client'
import {
    buildDebugEvent,
    getInitialDebugEnabled,
    shouldEnableDebugFromSearch,
} from './loginUtils'

export default function useAuthDebug({ search }) {
    const [debugEvents, setDebugEvents] = useState([])
    const [debugEnabled, setDebugEnabled] = useState(() => {
        return getInitialDebugEnabled({
            envDebugFlag: import.meta.env.VITE_DEBUG_AUTH,
            storedValue: localStorage.getItem('am_debug_auth'),
            search,
        })
    })

    useEffect(() => {
        if (!shouldEnableDebugFromSearch({
            search,
            storedValue: localStorage.getItem('am_debug_auth'),
        })) {
            return
        }
        setDebugEnabled(true)
    }, [search])

    const pushDebug = useCallback((label, error) => {
        if (!debugEnabled) return
        setDebugEvents((prev) => [...prev, buildDebugEvent({
            label,
            error,
            getErrorStatus,
        })])
    }, [debugEnabled])

    const toggleDebug = useCallback(() => {
        setDebugEvents([])
        setDebugEnabled((prev) => {
            const next = !prev
            localStorage.setItem('am_debug_auth', String(next))
            return next
        })
    }, [])

    return {
        debugEnabled,
        debugEvents,
        pushDebug,
        toggleDebug,
    }
}
