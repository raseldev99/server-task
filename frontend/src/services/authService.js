import {privateApi, publicApi} from "@/services/axious.js";

export default {
    login: (credentials) => publicApi.post('/login', credentials),
    register: (userData) => publicApi.post('/register', userData),
    logout: () => privateApi.post('/logout'),
    getCurrentUser: () => privateApi.get('/user'),
}