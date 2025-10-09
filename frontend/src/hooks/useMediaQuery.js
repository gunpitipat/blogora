import { useEffect, useState } from "react"

export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

    useEffect(() => {
        const media = window.matchMedia(query)
        const listener = (event) => setMatches(event.matches)
        media.addEventListener("change", listener)

        return () => media.removeEventListener("change", listener)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return matches
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.