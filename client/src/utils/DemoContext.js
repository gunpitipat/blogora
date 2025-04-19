import { createContext, useContext, useState } from "react";

const DemoContext = createContext()

export const useDemoContext = () => useContext(DemoContext)

export const DemoProvider = ({ children }) => {
    const [prefillDemo, setPrefillDemo] = useState(false)  // Enable auto-prefilling of credentials
    const [showDemoPopUp, setShowDemoPopUp] = useState(false) // Show demo info popup once

    return (
        <DemoContext.Provider value={{ prefillDemo, setPrefillDemo, showDemoPopUp, setShowDemoPopUp }}>
            {children}
        </DemoContext.Provider>
    )
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.