// Distance from the top of the page
export function getTotalOffsetTop(element) {
    let offset = 0

    while (element) {
      offset += element.offsetTop
      element = element.offsetParent // Move to the nearest positioned ancestor
    }
    
    return offset
}

// Calculate element's line height
export const getLineHeight = (element) => {
    const computed = getComputedStyle(element)
    const lineHeight = computed.lineHeight

    if (lineHeight === "normal") { // CSS default
        const fontSize = parseFloat(computed.fontSize)
        return fontSize * 1.2
    }

    return parseFloat(lineHeight)
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.