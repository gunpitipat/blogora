import "./LoadingScreen.css"

const LoadingScreen = ({ type = "spinner" }) => {
    if (type === "spinner") {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner" />
            </div>
        )
    }

    if (type === "shimmer") {
        return (
            <div className="loading-overlay">
                <div className="loading-wrapper">
                    <p>Server waking up...</p>
                    <div className="loading-bar" />
                </div>
            </div>
        )
    }

    return null
}

export default LoadingScreen

// © 2025 Pitipat Pattamawilai. All Rights Reserved.