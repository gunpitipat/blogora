import { createContext, useContext, useEffect, useState } from "react"

const AlertContext = createContext()

const useAlertContext = () => {
    return useContext(AlertContext)
}

const AlertProvider = ({ children }) => {
    const initialAlertState = { display: false, type: "", message: "" }
    const [alertState, setAlertState] = useState(initialAlertState)

    useEffect(() => {
        let timeout
        if (alertState.display) {
            timeout = setTimeout(() => {
                setAlertState(initialAlertState)
            }, 3000)
        }
        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alertState.display, alertState.message])
    
    return(
        <AlertContext.Provider value={{ alertState, setAlertState }}>
            {children}
        </AlertContext.Provider>
    )
}

export { AlertProvider, useAlertContext }

// © 2025 Pitipat Pattamawilai. All Rights Reserved.