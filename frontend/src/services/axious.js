import axios from 'axios'
import tokenManager from "@/utils/tokenManager.js";
const BASE_URL = 'http://backend.test/api'

// Create axios instance without authentication
export const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
})

// Create axios instance with authentication
export const privateApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
})


// Request interceptor for private API (adds auth token)
privateApi.interceptors.request.use(
    (config) => {
        const token = tokenManager.getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for private API (handles token expiration)
privateApi.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            tokenManager.removeToken()
            // Redirect to login page
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

// Optional: Response interceptor for public API (general error handling)
publicApi.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // Handle general errors
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
    }
)
