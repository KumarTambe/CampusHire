import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

const api = axios.create({ baseURL: `${baseURL}/api` })

// attach the persisted token to every outgoing request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('campushire_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// a 401 means the token is gone or stale — clear it and bounce to login
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
            localStorage.removeItem('campushire_token')
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

/** Pull the most useful message out of an axios error. */
export const errorMessage = (err, fallback = 'Something went wrong') =>
    err?.response?.data?.message || err?.message || fallback

export default api
