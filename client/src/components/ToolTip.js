import { IoClose } from "react-icons/io5";
import "./ToolTip.css"

const ToolTip = (props) => {
    const { closeToolTip } = props
    return(
        <div className="ToolTip">
            <section>
                <p>Sign up and log in <span>to share your thoughts</span></p>
                <button onClick={closeToolTip}>
                    <span className="close-icon">
                        < IoClose/>
                    </span>
                </button>
            </section>
        </div>
    )
}

export default ToolTip

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
