import "./PopupAlert.css"

const PopupAlert = ({ 
    popupTitle = null, 
    popupContent, 
    showPopupAlert, 
    setShowPopupAlert 
}) => { 
    return (
        <div className="popup-alert">
            <div className={`popup-overlay ${showPopupAlert ? "show" : ""}`}>
                <div className="container">
                    { popupTitle && <h2>{popupTitle}</h2> }
                    <p>
                        {popupContent}
                    </p>
                    <button onClick={() => setShowPopupAlert(false)}>
                        Got it
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PopupAlert

// © 2025 Pitipat Pattamawilai. All Rights Reserved.