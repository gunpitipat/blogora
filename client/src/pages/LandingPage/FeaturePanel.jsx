const FeaturePanel = ({ 
    isFirst = false, 
    poster,
    dataSrc, 
    subtitle, 
    bodyText
}) => {
    return (
        <div className="feature-panel">
            <div className="feature-visual">
                <video
                    poster={poster}
                    autoPlay={isFirst}
                    muted loop playsInline
                    preload="metadata" data-src={dataSrc} // For lazy loading
                >
                    <source type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="feature-content">
                <h3 className="feature-subtitle">
                    {subtitle}
                </h3>
                <p className="feature-body">
                    {bodyText}
                </p>
            </div>
        </div>
    )
}

export default FeaturePanel

// © 2025 Pitipat Pattamawilai. All Rights Reserved.