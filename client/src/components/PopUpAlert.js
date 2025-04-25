import "./PopUpAlert.css"

const PopUpAlert = (props) => {
    const { popUpTitle = null, popUpContent, showPopUpAlert, setShowPopUpAlert } = props

    return (
        <div className="PopUpAlert">
            <div className={`overlay ${showPopUpAlert ? "show" : ""}`}>
                <div className="container">
                    <h2 style={{ display: popUpTitle ? "block" : "none" }}>{popUpTitle}</h2>
                    <p>{popUpContent}</p>
                    <button className="btn okay" onClick={()=>setShowPopUpAlert(false)}>Got it</button>
                </div>
            </div>
        </div>
    )
}

export default PopUpAlert

// © 2025 Pitipat Pattamawilai. All Rights Reserved.