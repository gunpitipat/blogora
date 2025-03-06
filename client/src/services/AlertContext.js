import { createContext, useContext, useEffect, useState } from "react";

const AlertContext = createContext()

const useAlertContext = () => {
    return useContext(AlertContext)
}

const AlertProvider = ({ children }) => {
    const initialAlertState = { display: false, type: "", message: "" }
    const [ alertState, setAlertState ] = useState(initialAlertState)

    useEffect(() => {
        let timer;
        if (alertState.display) {
            timer = setTimeout(() => {
                setAlertState(initialAlertState)
            },3000)
        }
        return () => clearTimeout(timer)
        // eslint-disable-next-line
    },[alertState.display, alertState.message])
    
    return(
        <AlertContext.Provider value={{ alertState, setAlertState }}>
            {children}
        </AlertContext.Provider>
    )
}

export { AlertProvider, useAlertContext }