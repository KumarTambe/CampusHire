import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'campushire_token'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    // "loading" covers the initial token → user rehydration on a hard refresh
    const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY)
        // `loading` already starts false when there is no token to exchange
        if (!token) return

        api.get('/auth/me')
            .then(({ data }) => setUser(data.user))
            .catch(() => localStorage.removeItem(TOKEN_KEY))
            .finally(() => setLoading(false))
    }, [])

    const persist = useCallback((data) => {
        localStorage.setItem(TOKEN_KEY, data.token)
        setUser(data.user)
        return data.user
    }, [])

    const login = useCallback(async (credentials) => {
        const { data } = await api.post('/auth/login', credentials)
        return persist(data)
    }, [persist])

    const register = useCallback(async (payload) => {
        const { data } = await api.post('/auth/register', payload)
        return persist(data)
    }, [persist])

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
    }, [])

    const value = useMemo(
        () => ({ user, setUser, loading, login, register, logout }),
        [user, loading, login, register, logout]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
    return ctx
}
