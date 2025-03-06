import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ViewReplyContext = createContext()

export const useViewReplyContext = () => {
    return useContext(ViewReplyContext)
}

export const ViewReplyProvider = ({ children }) => {
    const [viewReply, setViewReply] = useState([])
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

// Each comment has boolean state to show their replies. 
// When the user clicks view-reply button under the parent comment, that state changes to the opposite value (false -> true).
// State = true means showing all its replies.
// This state cannot be defined within comment component because when comment has been created (assuming the user replies the deep nested comment), onSendComment in BlogComponent will be executed, triggering commentTrigger state to fetch comments again.
// This cause re-rendering comment component which initialize viewReply state = false by default, making the user to re-open the nested comments all the way again, so we have to use context for that state.
// In BlogComponent, works with useEffect by setting default value for all fetched comments once.
// In CommentComponent, acts like individual state for each comment