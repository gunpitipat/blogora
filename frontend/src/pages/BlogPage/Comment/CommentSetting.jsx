import { memo } from "react"
import Modal from "@/components/Modals/Modal"
import { BiDotsHorizontalRounded } from "react-icons/bi"

const CommentSetting = memo(({ 
    commentId, 
    showOption,
    setShowOption,
    toggleOption, 
    showModal,
    setShowModal,
    deleteComment
}) => {
    const handleModalCancel = () => {
        setShowOption(null)
        setShowModal(null)
    }

    return (
        <section>
            <div className="comment-setting">
                <span className="setting-icon" onClick={() => toggleOption(commentId)}>
                    <BiDotsHorizontalRounded />
                </span>
                { showOption === commentId &&
                    <ul className="options">
                        <li className="delete-option" onClick={() => setShowModal(commentId)}>
                            Delete
                        </li>   
                    </ul> 
                }
            </div>
            <Modal
                showModal={showModal === commentId} // Show only one modal to prevent multiple modal overlays from stacking
                action="Delete"
                cancelLabel="Cancel"
                title="Confirm Delete"
                content={
                    <p>Are you sure you want to delete this comment?</p>
                }
                onConfirm={() => deleteComment(commentId)}
                onCancel={handleModalCancel}
            />
        </section>
    )
})

export default CommentSetting

// © 2025 Pitipat Pattamawilai. All Rights Reserved.