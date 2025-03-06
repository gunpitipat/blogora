import "./ModalComment.css"
import { FaTrash } from "react-icons/fa"

const ModalComment = (props) => {
    const { showModal, setShowModal, deleteComment, commentId } = props
    
    return (
        <div className="ModalComment">
            <section className={showModal? "modal active" : "modal"}>
                <div className="confirm-container">
                    <div className="trash-background"><FaTrash className="trash"/></div>
                    <h1>Confirm Delete</h1>
                    <p>Are you sure you want to delete this comment?</p>
                    <div className="button-container">
                        <button onClick={()=>setShowModal(null)} className="cancel-button">Cancel</button>
                        <button onClick={()=>deleteComment(commentId)} className="delete-button">Delete</button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ModalComment