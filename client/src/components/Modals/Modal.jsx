import "./Modal.css"
import { FaTrash } from "react-icons/fa"

const Modal = (props) => {
    const { showModal, setShowModal, action, title, content, targetId, onConfirm } = props

    return (
        <div className="Modal">
            <div className={`modal-overlay ${showModal ? "show" : ""}`}>
                <div className="modal-container">
                    <div className="trash-background"><FaTrash className="trash"/></div>
                    <h1>{title}</h1>
                    <div className="modal-content">
                        {content}
                    </div>
                    <div className="button-container">
                        <button className="cancel-button" onClick={()=>setShowModal(false)}>Cancel</button>
                        <button className="confirm-button" onClick={()=>onConfirm(targetId)}>
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
