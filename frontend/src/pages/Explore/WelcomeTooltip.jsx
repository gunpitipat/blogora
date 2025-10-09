import "./WelcomeTooltip.css"
import { IoClose } from "react-icons/io5"

const WelcomeTooltip = ({ closeTooltip }) => {
    return(
        <div className="welcome-tooltip">
            <div className="container">
                <p>Sign up and log in{" "}<span>to share your thoughts</span></p>
                <button onClick={closeTooltip}>
                    <span className="close-icon">
                        < IoClose/>
                    </span>
                </button>
            </div>
        </div>
    )
}

export default WelcomeTooltip

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
