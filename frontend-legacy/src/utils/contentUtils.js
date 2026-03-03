// BlogSnippet
// Render blog content as plain text
const decodeHTMLEntities = (htmlContent) => {
    const parser = new DOMParser()
    return parser.parseFromString(htmlContent, 'text/html').body.textContent
}

const formatPlainTextContent = (htmlContent) => {
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

    const formatted = htmlContent
        .replace(/<p>\s*<\/p>/gi, "\n")     // Keep empty lines
        .replace(/<br\s*\/?>/gi, "\n")      // Keep intentional line breaks
        .replace(/&nbsp;/g, " ")            // Decode non-breaking spaces
        .replace(/<\/a>([.,!?])/gi, "$1")   // Prevent extra space before punctuation after stripping HTML tags
        .replace(/<\/?[^>]+>/g, " ")        // Remove remaining HTML tags
        .replace(/[ \t\r]+/g, " ")          // Collapse multiple spaces into one
        .replace(/ *\n */g, "\n")           // Trim spaces around \n (" \n ")
        .replace(/\n{2,}/g, "\n")           // Collapse multiple line breaks into one
        .trim()

    // Decode remaining HTML entities
    return decodeHTMLEntities(formatted) || formatted || ""
}

const formatPlainTextSubtitle = (subtitle) => {
    // Strip formatting tags
    const stripped = subtitle
        .replace(/<(strong|em|s|u|a)(\s[^>]*)?>/gi, "")   // Remove opening tags like <strong>, <em>, <s>, <u class="...">
        .replace(/<\/(strong|em|s|u|a)>/gi, "")           // Remove closing tags
        .replace(/<br\s*\/?>/gi, "\n")                    // Keep intentional line breaks
        .replace(/&nbsp;/g, " ")                          // Decode non-breaking spaces
        .replace(/[ \t\r]+/g, " ")                        // Collapse multiple spaces into one
        .replace(/ *\n */g, "\n")                         // Trim spaces around \n (" \n ")
        .replace(/\n{2,}/g, "\n")                         // Collapse multiple line breaks into one
        .trim()

    // Decode remaining HTML entities
    return decodeHTMLEntities(stripped) || stripped || ""
}

// Extract each subtitle and its content
export const extractSubsections = (htmlContent) => {
    const sections = []
    const regex = /<h1>(.*?)<\/h1>([\s\S]*?)(?=<h1>|$)/gi
    let match

    const firstH1Index = htmlContent.search(/<h1>/i)

    // Content has no subtitles at all
    if (firstH1Index === -1) {
        sections.push({ subtitle: null, content: formatPlainTextContent(htmlContent) })
        return sections
    }

    // Intro content exists before the first heading
    if (firstH1Index > 0) {
        const leadingContent = htmlContent.slice(0, firstH1Index).trim()
        if (leadingContent) {
            sections.push({ subtitle: null, content: formatPlainTextContent(leadingContent) })
        }
    }

    while ((match = regex.exec(htmlContent)) !== null) {
        const subtitle = match[1].trim()
        const content = match[2].trim()
        sections.push({ subtitle: formatPlainTextSubtitle(subtitle), content: formatPlainTextContent(content) })
    }

    return sections
}

// BlogPage
// Preserve intentional empty lines on render
export const handleEmptyLine = (htmlContent) => {
    if (!htmlContent) return htmlContent

    return htmlContent
        .replace(/<p>(\s|&nbsp;)*<\/p>/gi, "<br>") // Fix -> Empty <p> will take up zero height
        .replace(/<br\s*\/?>/gi, `<span className="fake-br"></span>`) // Fix -> Alone <br> at the end of a block has no visual effect when rendering
}

// CreateBlog & EditBlog
// Clean content state before submitting
export const cleanEditorContent = (htmlContent) => {
    if (!htmlContent) return htmlContent

    return htmlContent
        // Normalize empty paragraphs
        .replace(/<p>\s*<\/p>/gi, "<p></p>")
        // Downgrade empty headings
        .replace(/<h1>\s*<\/h1>/gi, "<p></p>")
        // Remove disallowed tags
        .replace(/<\/?(?!p\b|h1\b|strong\b|em\b|u\b|s\b|ul\b|ol\b|li\b|br\b|a\b)[a-z0-9]+[^>]*>/gi, "")
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.