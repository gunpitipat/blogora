import "./LoadingScreen.css"
import clsx from "clsx"

const LoadingScreen = ({ type = "spinner", stage = 0 }) => {
    if (type === "shimmer") {
        return (
            <div className="loading-overlay">
                <div className="loading-wrapper">
                    <p className="loading-headline">
                        Server waking up...
                    </p>
                    <div className="loading-bar" />
                    <p className={clsx("loading-message first",
                        stage === 1 && "active",
                        stage > 1 && "hidden"
                    )}>
                        This may take longer on free hosting. Please wait...
                    </p>
                    <p className={`loading-message second ${stage === 2 ? "active" : ""}`}>
                        Almost there, thank you for your patience!
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="loading-overlay">
            <div className="loading-spinner" />
        </div>
    )
}

export default LoadingScreen

// © 2025 Pitipat Pattamawilai. All Rights Reserved.