import "./Alert.css"
import { FaCheckCircle } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { useAlertContext } from "../services/AlertContext";

const Alert = ()=>{
    const { alertState } = useAlertContext()

    if (!alertState.display) return null

    return(
        <div className="Alert">
            <div className={`message ${alertState.type}`}>
                <span>{alertState.message}</span>
                {alertState.type === "success" ? <FaCheckCircle/> : <MdError/>}
            </div>
        </div>
    )
}

export default Alert

// © 2025 Pitipat Pattamawilai. All Rights Reserved.