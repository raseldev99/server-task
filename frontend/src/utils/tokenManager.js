const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_data'

export const tokenManager = {
    // Access Token
    getAccessToken() {
        return localStorage.getItem(TOKEN_KEY)
    },

    setAccessToken(token) {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token)
        } else {
            localStorage.removeItem(TOKEN_KEY)
        }
    },

    // User Data
    getUserData() {
        const userData = localStorage.getItem(USER_KEY)
        return userData ? JSON.parse(userData) : null
    },

    setUserData(user) {
        if (user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user))
        } else {
            localStorage.removeItem(USER_KEY)
        }
    },

    // Clear all auth data
    clearAuthData() {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
    },

    // Check if token exists and is valid
    isTokenValid() {
        return !!this.getAccessToken()
    }
}