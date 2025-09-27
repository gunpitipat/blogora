import { useEffect, useState } from 'react'
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

    // Wait for server waking up on free hosting plans
    useEffect(() => {
        let timeout
        let retries = 0
        const maxRetries = 12 // 120s = 2min limit
        const delay = 10000 // 10s
        const controller = new AbortController()

        const wakeServer = async () => {
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
                clearTimeout(timeout)
            
            } catch (err) {
                if (err.name === "AbortError") return

                retries++
                if (retries < maxRetries) {
                    timeout = setTimeout(wakeServer, delay)
                } else {
                    setIsHealthy(false)
                    setIsChecking(false)
                }
            }
        }

        wakeServer()

        return () => {
            clearTimeout(timeout)
            controller.abort()
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

    if (isChecking) return <LoadingScreen type="shimmer" stage={loadingStage} />
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