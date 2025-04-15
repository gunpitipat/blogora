import "./Skeleton.css"

const Skeleton = (props) => {
    const { contentLineCount=4 } = props

    const skeletonContent = Array.from({ length: contentLineCount })

    return (
        <div className="skeleton">
            <div className="title" />
            <div className="content-container">
                {skeletonContent.map((_, index) => {
                    const randomWidth = `${90 + Math.floor(Math.random() * 11)}%` // 90% - 100%
                    return (
                        <div
                            key={index}
                            className="content"
                            style={{
                                width: index < skeletonContent.length - 1 ? randomWidth : "75%"
                            }}
                        />
                    )
                    })}
            </div>
            <div className="footer" />
        </div>
    )
}

export default Skeleton

// © 2025 Pitipat Pattamawilai. All Rights Reserved.