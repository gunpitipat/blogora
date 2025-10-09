export const config = { runtime: "edge" }

// Helper: Build headers to forward
const buildForwardHeaders = (req) => {
    const headers = new Headers(req.headers)
    headers.set("x-proxy-via", "vercel-edge-proxy")
    headers.delete("host")
    headers.delete("content-length")
    return headers
}

// Helper: Read JSON body to forward
const readJsonBody = async (req) => {
    const method = req.method
    if (method === "POST" || method === "PUT") {
        try {
            const data = await req.json()
            return JSON.stringify(data)
        
        } catch {
            return undefined
        }
    }
    return undefined 
}

// Helper: Convert upstream Response into Edge Response
const makeResponse = (upstreamRes) => {
    return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        headers: upstreamRes.headers
    })
}

// Entry point
export default async function handler(req) {
    try {
        const url = new URL(req.url)
        const endpoint = url.pathname

        const method = req.method
        const headers = buildForwardHeaders(req)
        const body = await readJsonBody(req)

        // Forward to Koyeb if flagged
        if (headers.get("x-use-koyeb") === "1") {
            const res = await fetch(process.env.KOYEB_URL + endpoint, { method, headers, body })
            return makeResponse(res)
        }

        // Default to Render
        const res = await fetch(process.env.RENDER_URL + endpoint, { method, headers, body })
        return makeResponse(res)

    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return new Response(JSON.stringify({ error: message }), { 
            status: 500,
            headers: { "content-type": "application/json" }
        })
    }
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.