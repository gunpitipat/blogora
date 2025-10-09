import api, { switchToKoyeb } from './utils/api'
import { useEffect, useRef, useState } from 'react'
import { LoadingProvider } from './contexts/LoadingContext'
import { AlertProvider } from './contexts/AlertContext'
import { AuthProvider } from './contexts/AuthContext'
import { DemoProvider } from './contexts/DemoContext'
import Layout from './components/Layout/Layout'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import ServerError from './pages/ServerError/ServerError'

const AppProviders = () => {
    const [isChecking, setIsChecking] = useState(true)
    const [isHealthy, setIsHealthy] = useState(false)
    const [loadingStage, setLoadingStage] = useState(0)

    const activeGenRef = useRef(null) // Track the current effect generation to stop stale retry loop after remount
    
    const STORAGE_KEY = "blogora-backend"
    const validBackends = ["render", "koyeb"]
    const CACHE_TTL = 10 * 60 * 1000 // 10min

    const saveBackend = (backend) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ backend, ts: Date.now() }))
    }

    const getCachedBackend = () => {
        // NOTE: During local development, if switching from local to remote backend (npm run dev -> npm run dev:remote) within CACHE_TTL,
        // clear localStorage key "blogora-backend" manually to avoid skipping health check.
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (!saved) return null

            const { backend, ts } = JSON.parse(saved)
            if (Date.now() - ts <= CACHE_TTL && validBackends.includes(backend)) {
                return backend
            }

        } catch {
            localStorage.removeItem(STORAGE_KEY) // Clean it if JSON corrupted
        }
        return null
    }

    // Wake up servers on free hosting
    useEffect(() => {
        let controller
        let timerAbort

        let attempt = 1
        const maxAttempt = 2
        const TIMEOUT_FIRST = 40000
        const TIMEOUT_FINAL = 45000

        const gen = Date.now()
        activeGenRef.current = gen

        const wakeServer = async () => {
            if (gen !== activeGenRef.current) return

            const cached = getCachedBackend()
            if (cached) {
                // Skip health check and keep using the cached backend on refresh
                if (cached === "koyeb") switchToKoyeb()
                setIsHealthy(true)
                setIsChecking(false)
                return
            }

            // Wake up Render and Koyeb servers on mount
            while (attempt <= maxAttempt && gen === activeGenRef.current) {
                controller = new AbortController()
                const { signal } = controller

                timerAbort = setTimeout(() => controller.abort(), 
                    attempt === maxAttempt ? TIMEOUT_FINAL : TIMEOUT_FIRST)
                
                const [renderResult, koyebResult] = await Promise.allSettled([
                    api.get("/health", { signal }), // Forwarded to Render
                    api.get("/health", { headers: { "x-use-koyeb": "1" }, signal }) // Forwarded to Koyeb
                ])

                clearTimeout(timerAbort)

                // If effect remounted while awaiting, stop and don't update states
                if (gen !== activeGenRef.current) return

                // Default to Render
                if (renderResult.status === "fulfilled") {
                    setIsHealthy(true)
                    setIsChecking(false)
                    saveBackend("render")
                    return
                }
                
                // Fallback to Koyeb
                if (koyebResult.status === "fulfilled") {
                    setIsHealthy(true)
                    setIsChecking(false)
                    saveBackend("koyeb")
                    switchToKoyeb()
                    return
                }

                // Retry if both failed
                attempt++
                await new Promise(r => setTimeout(r, 1000))
            }

            setIsHealthy(false)
            setIsChecking(false)
            localStorage.removeItem(STORAGE_KEY)
        }

        wakeServer()

        return () => {
            clearTimeout(timerAbort)
            controller?.abort() // Cancel pending requests on remount    
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const timer10 = setTimeout(() => setLoadingStage(1), 10000)
        const timer20 = setTimeout(() => setLoadingStage(2), 20000)
        const timer40 = setTimeout(() => setLoadingStage(3), 40000)

        return () => {
            clearTimeout(timer10)
            clearTimeout(timer20)
            clearTimeout(timer40)
        }
    }, [])

    if (isChecking) return <LoadingScreen 
                                isLoading={true}
                                type="shimmer" 
                                stage={loadingStage} 
                            />
                            
    if (!isHealthy) return <ServerError />

    return (
        <LoadingProvider>
            <AlertProvider>
                <AuthProvider>
                    <DemoProvider>
                        <Layout />
                    </DemoProvider>
                </AuthProvider>
            </AlertProvider>
        </LoadingProvider>
    )
}
 
export default AppProviders

// © 2025 Pitipat Pattamawilai. All Rights Reserved.