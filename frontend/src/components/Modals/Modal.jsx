import "./Modal.css"
import { FaTrash, FaExclamation } from "react-icons/fa"

const Modal = ({ 
    showModal, 
    setShowModal = null, 
    action, 
    cancelLabel, 
    title, 
    content, 
    onConfirm, 
    onCancel = null 
}) => {
    let icon
    switch (action) {
        case "Delete":
            icon = <FaTrash />
            break
        default:
            icon = <FaExclamation className="warning-icon" />
    }

    return (
        <div className="modal">
            <div className={`modal-overlay ${showModal ? "show" : ""}`}>
                <div className="modal-container">
                    <div className="icon-bg">
                        {icon}
                    </div>
                    <h1 className="modal-title">
                        {title}
                    </h1>
                    <div className="modal-content">
                        {content}
                    </div>
                    <div className="btn-container">
                        <button className="cancel-btn" 
                            onClick={ !onCancel && setShowModal 
                                ? () => setShowModal(false) 
                                : onCancel
                            }
                        >
                            {cancelLabel}
                        </button>
                        <button className="confirm-btn" onClick={onConfirm}>
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