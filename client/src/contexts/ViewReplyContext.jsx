import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ViewReplyContext = createContext()

export const useViewReplyContext = () => {
    return useContext(ViewReplyContext)
}

export const ViewReplyProvider = ({ children }) => {
    const [viewReply, setViewReply] = useState([]) // Initialize it when rendering BlogPage
    const location = useLocation()

    useEffect(() => {
        setViewReply([])
    }, [location])

    return (
        <ViewReplyContext.Provider value={{ viewReply, setViewReply }}>
            {children}
        </ViewReplyContext.Provider>
    )
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.