import "./Modal.css"
import { FaTrash, FaExclamation } from "react-icons/fa"

const Modal = (props) => {
    const { showModal, setShowModal, action, cancelLabel, title, content, targetId = null, onConfirm, onCancel = null } = props

    let icon
    switch (action) {
        case "Delete":
            icon = <FaTrash />
            break
        default:
            icon = <FaExclamation className="warning-icon" />
    }

    return (
        <div className="Modal">
            <div className={`modal-overlay ${showModal ? "show" : ""}`}>
                <div className="modal-container">
                    <div className="icon-background">
                        {icon}
                    </div>
                    <h1>{title}</h1>
                    <div className="modal-content">
                        {content}
                    </div>
                    <div className="button-container">
                        <button className="cancel-button" onClick={!onCancel ? ()=>setShowModal(false) : onCancel}>
                            {cancelLabel}
                        </button>
                        <button className="confirm-button" onClick={targetId ? ()=>onConfirm(targetId) : onConfirm}>
                            {action}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
