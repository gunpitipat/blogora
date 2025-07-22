import { useRef } from "react"
import { useMediaQuery } from "../../hooks/useMediaQuery"
import { motion, useScroll, useTransform } from "framer-motion"

const BubbleChat = ({ className, children, onClick = () => {} }) => {
    const ref = useRef()
    const isSmallDevice = useMediaQuery("(max-width: 768px)")
    const { scrollY } = useScroll()

    // Scroll 0-300px -> Move element up to -30px
    const y = useTransform(scrollY, [0, 300], [0, isSmallDevice ? -15 : -30])

    return (
        <motion.div 
            ref={ref} 
            className={`bubble-chat ${className ?? ""}`} 
            style={{ y }} 
            onClick={onClick}
        >
            {children}
        </motion.div>
    )
}

export default BubbleChat

// © 2025 Pitipat Pattamawilai. All Rights Reserved.