import axios from 'axios'
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
        axios.get(`${process.env.REACT_APP_API}/health`)
            .then(() => setIsHealthy(true))
            .catch(() => setIsHealthy(false))
            .finally(() => setIsChecking(false))
    }, [])

    useEffect(() => {
        const timer10 = setTimeout(() => setLoadingStage(1), 10000)
        const timer20 = setTimeout(() => setLoadingStage(2), 20000)

        return () => {
            clearTimeout(timer10)
            clearTimeout(timer20)
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