import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define your backend server's address ONCE.
// - Use http://10.0.2.2:3001 for the Android Emulator.
// - For a physical device, find your computer's IP address (e.g., ipconfig/ifconfig)
//   and use that (e.g., 'http://192.168.1.5:3001').
const API_BASE_URL = 'http://10.0.2.2:3001';

// Create a special, pre-configured instance of axios.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// This "interceptor" is the magic part. It's a function that runs
// automatically BEFORE any API request is sent from your app.
apiClient.interceptors.request.use(
  async (config) => {
    // 1. It tries to get the user's token from storage.
    const token = await AsyncStorage.getItem('userToken');

    // 2. If a token exists, it adds the "Authorization" header to the request.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. It returns the request configuration so the call can proceed.
    return config;
  },
  (error) => {
    // This part handles errors during the request setup.
    return Promise.reject(error);
  }
);

// We export the base URL so we can build full image paths in our components.
export { API_BASE_URL };

// We export the pre-configured client to use in our screens.
export default apiClient;