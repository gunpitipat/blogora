import "./Timestamp.css"
import { useState } from "react"
import { formatCommentTime, showFullDateTime } from "../../utils/formatDateUtils"
import Tooltip from "../Tooltip/Tooltip"

const Timestamp = ({ date }) => {
    const [showTooltip, setShowTooltip] = useState(false)
    
    return (
        <span className="timestamp"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <label>
                {formatCommentTime(date)}
            </label>
            <Tooltip 
                showTooltip={showTooltip}
                content={<p>{showFullDateTime(date)}</p>}
                baseTransform="translateX(-10px) translateY(-50%)"
                activeTransform="translateX(0) translateY(-50%)"
            />
        </span>
    )
}

export default Timestamp

// © 2025 Pitipat Pattamawilai. All Rights Reserved.