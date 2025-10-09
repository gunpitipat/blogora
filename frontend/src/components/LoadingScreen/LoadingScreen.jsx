import "./LoadingScreen.css"
import clsx from "clsx"

const LoadingScreen = ({ 
    isLoading,
    type = "spinner", 
    stage = 0 
}) => {
    if (type === "shimmer") {
        return (
            <div className={`loading-overlay ${isLoading ? "active" : ""}`}>
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
                    <p className={clsx("loading-message second",
                        stage === 2 && "active",
                        stage > 2 && "hidden"
                    )}>
                        Almost there, thank you for your patience!
                    </p>
                    <p className={`loading-message third ${stage === 3 ? "active" : ""}`}>
                        This is taking longer than usual, still trying to connect.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className={`loading-overlay ${isLoading ? "active" : ""}`}>
            <div className="loading-spinner" />
        </div>
    )
}

export default LoadingScreen

// © 2025 Pitipat Pattamawilai. All Rights Reserved.