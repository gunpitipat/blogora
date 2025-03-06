import { IoClose } from "react-icons/io5";
import "./ToolTip.css"

const ToolTip = (props) => {
    const { closeToolTip } = props
    return(
        <div className="ToolTip">
            <section>
                <p>Sign up and log in to share your thoughts</p>
                <button onClick={closeToolTip}>
                    < IoClose/>
                </button>
            </section>
        </div>
    )
}

export default ToolTip
