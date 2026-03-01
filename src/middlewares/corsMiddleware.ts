import { ENV } from "../config/env.js"
import cors from "cors";


const allowedOrigins = (ENV.CORS.URL_CLIENT || '')
    .split(',')
    .map(o => o.trim());
const corsMiddleware = cors({
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Cho phép request không có origin (Postman, mobile, server-to-server)
        if (!requestOrigin) return callback(null, true)
        // Origin hợp lệ
        if (allowedOrigins.includes(requestOrigin)) {
            return callback(null, true)
        }
        return callback(new Error("NOT_ALLOWED_BY_CORS"))
    },
    credentials: true

})

export default corsMiddleware
