import "./PopupAlert.css"

const PopupAlert = (props) => {
    const { popupTitle = null, popupContent, showPopupAlert, setShowPopupAlert } = props

    return (
        <div className="PopupAlert">
            <div className={`overlay ${showPopupAlert ? "show" : ""}`}>
                <div className="container">
                    <h2 style={{ display: popupTitle ? "block" : "none" }}>{popupTitle}</h2>
                    <p>{popupContent}</p>
                    <button className="btn okay" onClick={()=>setShowPopupAlert(false)}>Got it</button>
                </div>
            </div>
        </div>
    )
}

export default PopupAlert

// © 2025 Pitipat Pattamawilai. All Rights Reserved.