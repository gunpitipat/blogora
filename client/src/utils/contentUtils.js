// Render blog content as plain text
export const cleanContent = (htmlContent) => {
    // Convert ordered lists
    htmlContent = htmlContent.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_, listItems) => {
        const items = listItems.match(/<li>(.*?)<\/li>/gi)
        if (!items) return ""
        return items.map((item, index) => {
            const text = item.replace(/<\/?li>/gi, "").trim()
            return `${index + 1}. ${text}`
        }).join(" ")
    })

    // Convert unordered lists
    htmlContent = htmlContent.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, listItems) => {
        const items = listItems.match(/<li>(.*?)<\/li>/gi)
        if (!items) return ""
        return items.map((item) => {
            const text = item.replace(/<\/?li>/gi, "").trim()
            return `- ${text}`
        }).join(" ")
    })
    
    return htmlContent
        .replace(/<br\s*\/?>/gi, "\n")  // Keep intentional line breaks
        .replace(/&nbsp;/g, " ")        // Decode non-breaking spaces
        .replace(/<\/?[^>]+>/g, " ")    // Remove remaining HTML tags
        .replace(/[ \t\r]+/g, " ")      // Collapse multiple spaces into one
        .replace(/ *\n */g, "\n")       // Trim spaces around \n since <p><br></p> is converted to " \n "
        .replace(/\n{2,}/g, "\n")       // Collapse multiple line breaks into one
        .trim()
}

// Extract each subtitle and its content
export const extractSubsections = (htmlContent) => {
    const sections = []
    const regex = /<h1>(.*?)<\/h1>([\s\S]*?)(?=<h1>|$)/gi
    let match;
    let hasSubtitle = false

    // Content has subtitles
    while ((match = regex.exec(htmlContent)) !== null) {
        hasSubtitle = true
        const subtitle = match[1].trim()
        const content = cleanContent(match[2].trim())
        sections.push({ subtitle, content })
    }

    // Content has no subtitles at all
    if (!hasSubtitle) {
        const content = cleanContent(htmlContent)
        sections.push({ subtitle: null, content })
    }

    return sections
}

// Truncate blog content for previewing
export const truncateContent = (text, maxLength) => {
    if (text.length <= maxLength) return [text, false]

    const truncated = text.slice(0, maxLength)
    const lastSpace = truncated.lastIndexOf(" ")
    return [truncated.slice(0, lastSpace), true]
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.