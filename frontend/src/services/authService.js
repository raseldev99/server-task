import {privateApi, publicApi} from "@/services/axious.js";

export default {
    login: (credentials) => publicApi.post('/login', credentials),
    register: (userData) => publicApi.post('/register', userData),
    logout: () => privateApi.post('/logout'),
    getCurrentUser: () => privateApi.get('/user'),
    updateUser: (UserData) => privateApi.patch('/user/update', UserData),
    changePassword: (data) => privateApi.put('/user/change-password', data),
}