import { FaChevronDown, FaChevronUp } from "react-icons/fa"

const ExpandToggle = ({ onClick, isExpanded }) => {
    return (
        <div className="expand-toggle" onClick={onClick}>
            { !isExpanded 
            ?   <span>
                    Show more <FaChevronDown />
                </span> 
            :   <span>
                    Show less <FaChevronUp />
                </span>
            }
        </div>
    )
}

export default ExpandToggle

// © 2025 Pitipat Pattamawilai. All Rights Reserved.