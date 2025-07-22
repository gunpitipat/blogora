import "./NotFound.css"
import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <div className="not-found">
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
            <div className="return-btn">
                <Link to="/explore">
                    <h4>Back to Explore</h4>
                </Link>
            </div>
        </div>
    )
}

export default NotFound

// © 2025 Pitipat Pattamawilai. All Rights Reserved.