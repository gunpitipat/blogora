export const formatDayMonth = (value) => {
    let date = new Date(value) // convert value to a Date object
    let day = date.getDate().toString().padStart(2, '0')
    let month = (date.getMonth() + 1).toString().padStart(2, '0') // getMonth() method returns the month index which starts at 0 (JAN), 1 (FEB)
    let year = String(date.getFullYear())
    return `${day}/${month}/${year}`
}

// Display comment's timestamp based on how much time has passed
export const formatCommentTime = (value) => {
    let commentDate = new Date(value)
    let today = new Date()

    // Calculate the difference in time between now and the comment's created time
    const timeDiff = today - commentDate // results in milliseconds
    const hoursAgo = Math.floor(timeDiff / (60 * 60 * 1000)) // converts to hours and rounds it down to integer
    const daysAgo = Math.floor(hoursAgo / 24)

    const secondsAgo = Math.floor(timeDiff / 1000)
    const minutesAgo = Math.floor(timeDiff / (60 * 1000))

    if (secondsAgo < 60) {
        // If the comment was just created within 1 minute, show seconds ago
        return `${secondsAgo} second${secondsAgo > 1 ? "s" : ""} ago`
    }

    if (minutesAgo < 60) {
        // If the comment was created within 1 hour, show minutes ago
        return `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`
    }

    if (hoursAgo < 24) {
        // If the comment was created within the last 24 hours, show hours ago
        return `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`
    }

    if (daysAgo === 1) {
        return `1 day ago`
    }

    // If the comments was created more than 1 day ago, show in DD/MM/YY format    
    const day = commentDate.getDate().toString().padStart(2, '0')
    const month = (commentDate.getMonth() + 1).toString().padStart(2, '0')
    const year = commentDate.getFullYear().toString().slice(-2)

    return `${day}/${month}/${year}`
}


export const showFullDateTime = (value) => {
    let date = new Date(value)
    let day = date.getDate().toString().padStart(2, '0')
    let month = (date.getMonth() + 1).toString().padStart(2, '0')
    let year = String(date.getFullYear())
    let time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
    return `${day}/${month}/${year}, ${time}`
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.