import "./Tooltip.css"

const Tooltip = ({ 
    showTooltip, 
    content, 
    style = {}, 
    baseTransform, // Hidden position before showing
    activeTransform, // Visible position, creating a sliding effect
    duration = 0.5,
}) => {
    const transition = `opacity ${duration}s ease-in-out, transform ${duration}s ease`
    const transform = showTooltip
        ? activeTransform
        : baseTransform

    return (
        <div 
            className={`tooltip ${showTooltip ? "show" : ""}`}
            style={{ ...style, transition, transform }}
        >
            {content}
        </div>
    )
}

export default Tooltip

// © 2025 Pitipat Pattamawilai. All Rights Reserved.