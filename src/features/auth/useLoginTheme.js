import { useEffect, useState } from 'react'
import { setTheme } from '../../utils/theme'

const getDocumentTheme = (defaultTheme) => {
    if (typeof document === 'undefined') return defaultTheme
    return document.documentElement.dataset.theme || defaultTheme
}

export default function useLoginTheme({ defaultTheme = 'dark' } = {}) {
    const [theme, setThemeState] = useState(() => getDocumentTheme(defaultTheme))

    useEffect(() => {
        setTheme(defaultTheme)
    }, [defaultTheme])

    useEffect(() => {
        if (typeof document === 'undefined') return undefined

        const observer = new MutationObserver(() => {
            setThemeState(getDocumentTheme(defaultTheme))
        })
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        })

        return () => observer.disconnect()
    }, [defaultTheme])

    return theme
}
