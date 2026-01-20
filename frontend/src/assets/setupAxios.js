// setupAxios.ts
import axios from 'axios';

axios.defaults.baseURL =
    import.meta.env.VITE_API_URL || 'https://liceo-publico.onrender.com';

// Interceptor de request
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de response
axios.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken');
            console.log('Intentando refrescar token...');
            if (refreshToken) {
                try {
                    const { data } = await axios.post('/refresh/', {
                        refresh: refreshToken,
                    });
                    localStorage.setItem('accessToken', data.access);

                    error.config.headers[
                        'Authorization'
                    ] = `Bearer ${data.accessToken}`;
                    return axios(error.config); // reintenta la petición original
                } catch {
                    localStorage.clear();
                    window.location.href = '/';
                    alert(
                        'Sesión expirada. Por favor, inicia sesión de nuevo.'
                    );
                }
            }
        }
        return Promise.reject(error);
    }
);
