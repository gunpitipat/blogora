import axios from "axios"

const baseURL = process.env.NODE_ENV === "development"
    ? "http://localhost:5500/api"
    : "/api"

// NOTE: Use this if testing with `vercel dev` and backend on Render
// const baseURL = "/api"

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true
})

export default api
