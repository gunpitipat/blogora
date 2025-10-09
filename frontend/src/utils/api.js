import axios from "axios"

let useKoyeb = false

const api = axios.create({
    baseURL: "/api",
    withCredentials: true
})

api.interceptors.request.use((req) => {
    if (useKoyeb) {
        req.headers["x-use-koyeb"] = "1"
    }
    return req
})

export function switchToKoyeb() {
    useKoyeb = true
}

export default api

// © 2025 Pitipat Pattamawilai. All Rights Reserved.