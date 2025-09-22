// 📂 File: src/api/client.js (FINAL AND CORRECTED)

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ★★★ 1. IMPORT THE CORRECT, LIVE URL FROM YOUR CENTRAL CONFIG FILE ★★★
import { API_BASE_URL } from '../../apiConfig'; // Adjust the path if necessary

// We no longer define API_BASE_URL here. We import it.
// const API_BASE_URL = 'http://10.0.2.2:3001'; // <-- THIS IS THE OLD, DELETED LINE

// Create the axios instance using the LIVE base URL.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// This interceptor logic is PERFECT and remains the same.
// It automatically attaches the token to every request.
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// We no longer need to export API_BASE_URL from here.
// Components should get SERVER_URL from apiConfig.js for images.
// export { API_BASE_URL }; // <-- THIS IS THE OLD, DELETED LINE

export default apiClient;