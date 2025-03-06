import { Link } from "react-router-dom"
import "./NotFound.css"

const NotFound = () => {
    return (
        <div className="NotFound">
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
            <div className="overlay">
                <Link to="/"><h4>Go Back Home</h4></Link>
            </div>
        </div>
    )
}

export default NotFound