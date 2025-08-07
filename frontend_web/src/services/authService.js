/**
 * Servicio de Autenticación
 * 
 * Este servicio maneja toda la lógica de autenticación en el frontend:
 * - Login y registro
 * - Almacenamiento de tokens
 * - Requests autenticados
 * - Refresh automático de tokens
 * - Logout
 * 
 * ¿Cómo funciona?
 * 1. Al hacer login, se almacenan los tokens en localStorage
 * 2. Cada request autenticado incluye el access token
 * 3. Si el token expira, se usa el refresh token automáticamente
 * 4. Si el refresh falla, se redirige al login
 */

const API_BASE_URL = 'https://1a0f5b29f58b.ngrok-free.app';

class AuthService {
    constructor() {
        this.accessToken = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    /**
     * Iniciar sesión
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<Object>} Datos del usuario y tokens
     */
    async login(email, password) {
        try {
            console.log('🔄 Iniciando login...');
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {//revisar este endpoint, creo que se llama solo 8000/login

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correo: email,
                    password: password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Error en el login');
            }

            // Almacenar tokens y datos del usuario
            this.setTokens(data.access_token, data.refresh_token, data.user);
            
            console.log('✅ Login exitoso:', data.user.nombre);
            return data;

        } catch (error) {
            console.error('❌ Error en login:', error);
            throw error;
        }
    }

    /**
     * Registrar nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<Object>} Datos del usuario y tokens
     */
    async signup(userData) {
        try {
            console.log('🔄 Registrando usuario...');
            
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Error en el registro');
            }

            // Almacenar tokens y datos del usuario
            this.setTokens(data.access_token, data.refresh_token, data.user);
            
            console.log('✅ Registro exitoso:', data.user.nombre);
            return data;

        } catch (error) {
            console.error('❌ Error en signup:', error);
            throw error;
        }
    }

    /**
     * Cerrar sesión
     * @param {boolean} revokeRefresh - Si revocar también el refresh token
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async logout(revokeRefresh = false) {
        try {
            console.log('🔄 Cerrando sesión...');
            
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    revoke_refresh_token: revokeRefresh
                }),
            });

            // Limpiar tokens locales independientemente de la respuesta
            this.clearTokens();
            
            console.log('✅ Logout exitoso');
            return { message: 'Sesión cerrada exitosamente' };

        } catch (error) {
            console.error('❌ Error en logout:', error);
            // Limpiar tokens locales incluso si hay error
            this.clearTokens();
            throw error;
        }
    }

    /**
     * Renovar access token usando refresh token
     * @returns {Promise<string>} Nuevo access token
     */
    async refreshAccessToken() {
        try {
            console.log('🔄 Renovando access token...');
            
            if (!this.refreshToken) {
                throw new Error('No hay refresh token disponible');
            }

            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh_token: this.refreshToken
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Error renovando token');
            }

            // Actualizar tokens
            this.setTokens(data.access_token, data.refresh_token, data.user);
            
            console.log('✅ Token renovado exitosamente');
            return data.access_token;

        } catch (error) {
            console.error('❌ Error renovando token:', error);
            // Si falla el refresh, limpiar tokens y redirigir al login
            this.clearTokens();
            throw error;
        }
    }

    /**
     * Hacer request autenticado con manejo automático de refresh
     * @param {string} url - URL del endpoint
     * @param {Object} options - Opciones del fetch
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async authenticatedRequest(url, options = {}) {
        try {
            // Agregar token de autorización
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };

            if (this.accessToken) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
            }

            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Si el token expiró, intentar refresh
            if (response.status === 401) {
                console.log('🔄 Token expirado, intentando refresh...');
                
                try {
                    await this.refreshAccessToken();
                    
                    // Reintentar el request con el nuevo token
                    headers['Authorization'] = `Bearer ${this.accessToken}`;
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers,
                    });

                    if (!retryResponse.ok) {
                        throw new Error(`Error en request: ${retryResponse.status}`);
                    }

                    return await retryResponse.json();

                } catch (refreshError) {
                    console.error('❌ Error en refresh, redirigiendo al login');
                    this.clearTokens();
                    // Aquí podrías redirigir al login
                    window.location.href = '/login';
                    throw refreshError;
                }
            }

            if (!response.ok) {
                throw new Error(`Error en request: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('❌ Error en request autenticado:', error);
            throw error;
        }
    }

    /**
     * Obtener información del usuario actual
     * @returns {Promise<Object>} Datos del usuario
     */
    async getCurrentUser() {
        try {
            const response = await this.authenticatedRequest(`${API_BASE_URL}/auth/me`);
            return response;
        } catch (error) {
            console.error('❌ Error obteniendo usuario actual:', error);
            throw error;
        }
    }

    /**
     * Obtener sesiones del usuario
     * @returns {Promise<Object>} Lista de sesiones
     */
    async getUserSessions() {
        try {
            const response = await this.authenticatedRequest(`${API_BASE_URL}/auth/sessions`);
            return response;
        } catch (error) {
            console.error('❌ Error obteniendo sesiones:', error);
            throw error;
        }
    }

    /**
     * Cerrar una sesión específica
     * @param {string} sessionId - ID de la sesión a cerrar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async logoutSession(sessionId) {
        try {
            const response = await this.authenticatedRequest(
                `${API_BASE_URL}/auth/sessions/${sessionId}`,
                { method: 'DELETE' }
            );
            return response;
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            throw error;
        }
    }

    /**
     * Cerrar todas las sesiones
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async logoutAllSessions() {
        try {
            const response = await this.authenticatedRequest(
                `${API_BASE_URL}/auth/sessions`,
                { method: 'DELETE' }
            );
            return response;
        } catch (error) {
            console.error('❌ Error cerrando todas las sesiones:', error);
            throw error;
        }
    }

    /**
     * Almacenar tokens y datos del usuario
     * @param {string} accessToken - Access token
     * @param {string} refreshToken - Refresh token
     * @param {Object} user - Datos del usuario
     */
    setTokens(accessToken, refreshToken, user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
    }

    /**
     * Limpiar tokens y datos del usuario
     */
    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }

    /**
     * Verificar si el usuario está autenticado
     * @returns {boolean} True si está autenticado
     */
    isAuthenticated() {
        return !!(this.accessToken && this.user);
    }

    /**
     * Obtener datos del usuario actual
     * @returns {Object|null} Datos del usuario o null
     */
    getCurrentUserData() {
        return this.user;
    }

    /**
     * Obtener access token actual
     * @returns {string|null} Access token o null
     */
    getAccessToken() {
        return this.accessToken;
    }

    /**
     * Verificar si el token está próximo a expirar
     * @returns {boolean} True si está próximo a expirar
     */
    isTokenExpiringSoon() {
        if (!this.accessToken) return false;

        try {
            // Decodificar el token JWT (sin verificar firma)
            const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = payload.exp - now;
            
            // Si expira en menos de 5 minutos, renovar
            return timeUntilExpiry < 300;
        } catch (error) {
            console.error('Error verificando expiración del token:', error);
            return false;
        }
    }

    /**
     * Inicializar el servicio (verificar tokens al cargar la app)
     */
    async initialize() {
        if (this.isAuthenticated()) {
            // Verificar si el token está próximo a expirar
            if (this.isTokenExpiringSoon()) {
                try {
                    await this.refreshAccessToken();
                    console.log('✅ Token renovado automáticamente');
                } catch (error) {
                    console.log('❌ Error renovando token, limpiando sesión');
                    this.clearTokens();
                }
            }
        }
    }
}

// Crear instancia global del servicio
const authService = new AuthService();

// Inicializar al cargar el módulo
authService.initialize();

export default authService; 