import { createContext, useContext, useState } from "react"

const LoadingContext = createContext()

export const useLoadingContext = () => useContext(LoadingContext)

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(true) // initial value should be true when loading or initially rendering
    
    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    )
}