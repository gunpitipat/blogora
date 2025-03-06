import { FaTrash } from "react-icons/fa"
import './ModalConfirm.css'

const ModalConfirm = (props) => {
    const { showModal, setShowModal, title, slug, deleteBlog } = props
    
    return(
        <div className="Delete-Modal">
            <section className={showModal? "Modal active" : "Modal"}>
                <div className="confirm-container">
                    <div className="trash-background"><FaTrash className="trash"/></div>
                    <h1>Confirm Delete</h1>
                    <p>Are you sure you want to delete "<span style={{fontWeight:"bolder"}}>{title}</span>" blog?</p>
                    <div className="btn-container">
                        <button onClick={()=>setShowModal(false)} className="btn cancel">Cancel</button>
                        <button onClick={()=>deleteBlog(slug)} className="btn del">Delete</button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ModalConfirm