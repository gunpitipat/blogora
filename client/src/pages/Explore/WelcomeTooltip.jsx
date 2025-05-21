import { IoClose } from "react-icons/io5";
import "./WelcomeTooltip.css"

const WelcomeTooltip = (props) => {
    const { closeTooltip } = props
    return(
        <div className="WelcomeTooltip">
            <section>
                <p>Sign up and log in <span>to share your thoughts</span></p>
                <button onClick={closeTooltip}>
                    <span className="close-icon">
                        < IoClose/>
                    </span>
                </button>
            </section>
        </div>
    )
}

export default WelcomeTooltip

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
