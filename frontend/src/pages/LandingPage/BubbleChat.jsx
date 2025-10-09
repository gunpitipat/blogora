import { motion, useScroll, useTransform } from "framer-motion"

const BubbleChat = ({ 
    children, 
    className, 
    isMobile, 
    onClick = () => {} 
}) => {
    const { scrollY } = useScroll()

    // Scroll 0-300px -> Move element up to -30px
    const y = useTransform(scrollY, [0, 300], [0, isMobile ? -15 : -30])

    return (
        <motion.div 
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