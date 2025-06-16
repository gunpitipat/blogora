import "./FeatureSection.css"
import FeaturePanel from "./FeaturePanel"
import featureVideo1 from "../../assets/videos/blogora-feature-1.mp4"
import featureVideo2 from "../../assets/videos/blogora-feature-2.mp4"
import { lazyLoadVideos } from "../../utils/lazyVideoLoader"
import { useEffect } from "react"
import gsap from "gsap"
// import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/all"
gsap.registerPlugin(ScrollTrigger)

const FeatureSection = () => {

    useEffect(() => {
        lazyLoadVideos()
    }, [])

    return (
        <section className="FeatureSection">
            <div className="container">
                <h2 id="feature-headline">
                    What you can do {" "}
                    <span className="headline-sm-split"><br /></span>
                    with{" "}
                    <span className="brandname">
                        Blogora
                    </span>
                </h2>
                <div className="features-wrapper">
                    <FeaturePanel 
                        dataSrc={featureVideo1}
                        subtitle={`Create Your Blog`}
                        bodyText={`Compose your thoughts and format your content with a rich text editor designed to help you express ideas clearly.`}
                    />
                    <FeaturePanel
                        dataSrc={featureVideo2}
                        subtitle={`Live Preview`}
                        bodyText={`See exactly how your blog will look when published. With real-time updates, your edits are instantly reflected as you write, making it easy to fine-tune layout and content.`}
                    />
                </div>
                <div className="scroll-progress">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
            </div>
        </section>
    )
}

export default FeatureSection

// © 2025 Pitipat Pattamawilai. All Rights Reserved.