import "./ServerError.css"

const ServerError = () => {
    return (
        <div className="server-error">
            <h2>Server Unavailable</h2>
            <p>The server might be sleeping on free hosting. Please try again.</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
                Retry
            </button>
        </div>
    )
}

export default ServerError

// © 2025 Pitipat Pattamawilai. All Rights Reserved.