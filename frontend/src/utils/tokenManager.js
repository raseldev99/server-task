const tokenManager = {
    getToken: () => localStorage.getItem('access_token'),
    setToken: (token) => localStorage.setItem('access_token', token),
    removeToken: () => localStorage.removeItem('access_token'),
    hasToken: () => !!localStorage.getItem('access_token')
}

export default tokenManager;