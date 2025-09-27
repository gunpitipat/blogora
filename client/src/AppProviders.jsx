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
    const controllerRef = useRef(null) // Holds the latest AbortController to cancel pending request on remount
    const activeGenRef = useRef(null) // Track the current effect generation to stop stale retry loop after remount

    // Wait for server waking up on free hosting plans
    useEffect(() => {
        let timerAbort
        let timerRetry
        let retries = 0
        const maxRetries = 5
        const retryDelay = 5000 // 5s
        
        const gen = Date.now()
        activeGenRef.current = gen

        const wakeServer = async () => {
            if (gen !== activeGenRef.current) return
            controllerRef.current?.abort() // Abort any stale pending request if any
            const controller = new AbortController()
            controllerRef.current = controller

            timerAbort = setTimeout(() => {
                controller.abort()}, 12000) // 12s
            try {
                // Ping backend directly without Vercel rewriting
                // to prevent Vercel from responding 502 if Render takes too long to wake server.
                await fetch("https://blogora-wnay.onrender.com/api/health", {
                    signal: controller.signal
                })

                // NOTE: Use this if testing frontend and backend on localhost
                // await fetch("http://localhost:5500/api/health")
                
                setIsHealthy(true)
                setIsChecking(false)
                clearTimeout(timerAbort)
                clearTimeout(timerRetry)
            
            } catch (err) {
                clearTimeout(timerAbort)
                retries++
                if (retries < maxRetries) {
                    if (gen !== activeGenRef.current) return
                    timerRetry = setTimeout(wakeServer, retryDelay)
                } else {
                    setIsHealthy(false)
                    setIsChecking(false)
                }
            }
        }

        wakeServer()

        return () => {
            clearTimeout(timerAbort)
            clearTimeout(timerRetry)
            controllerRef.current?.abort()
        }
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