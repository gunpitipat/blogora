import "./Reminder.css"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/contexts/AuthContext"
import { motion, useScroll, useTransform } from "framer-motion"
import blogora_user from "@/assets/images/blogora-user.png"
import TryDemoButton from "./TryDemoButton"
import { GoCommentDiscussion } from "react-icons/go"
import { TbMessageUser } from "react-icons/tb"

const Reminder = () => {
    const visualRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: visualRef,
        offset: ["start end", "start center"]
    })
    const leftY = useTransform(scrollYProgress, [0, 1], [0, -24])
    const rightY = useTransform(scrollYProgress, [0, 1], [0, 24])

    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuthContext()
    const isLoggedIn = isAuthenticated && user?.username

    return (
        <section className="reminder">
            <div className="container">
                <div className="reminder-visual" ref={visualRef}>
                    <img src={blogora_user} alt="blogora-user" />

                    <motion.div className="bubble-icon left" style={{ y: leftY }}>
                        <GoCommentDiscussion />
                    </motion.div>

                    <motion.div className="bubble-icon right" style={{ y: rightY }}>
                        <TbMessageUser strokeWidth={1.7} />
                    </motion.div>
                </div>
                <div className="reminder-content">
                    { isLoggedIn
                        ?   <div className="content-wrapper">
                                <p>See the latest from the community.</p>
                                <button className="explore-btn"
                                    onClick={() => navigate("/explore")}
                                >
                                    Explore
                                </button>
                            </div>
                        :   <div className="content-wrapper">
                                <p>Don't miss the full experience{" "}
                                    <span className="content-sm-split"><br /></span>
                                    without signing up.
                                </p>
                                <TryDemoButton />
                            </div>
                    }
                </div>
            </div>
        </section>
    )
}

export default Reminder

// © 2025 Pitipat Pattamawilai. All Rights Reserved.