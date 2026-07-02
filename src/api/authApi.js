// src/api/authApi.js

const LOGIN_BASE_URL = 'http://localhost:8080/api/login';
const USER_BASE_URL = 'http://localhost:8080/api/users';

// 1. Iniciar sesión real
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${LOGIN_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      // Intentamos leer el mensaje específico que envía el backend
      // (ej: "Esta cuenta ha sido desactivada...") en vez de mostrar
      // siempre un mensaje genérico de credenciales incorrectas.
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.descripcion || 'Credenciales incorrectas o usuario inválido';
      throw new Error(message);
    }

    const data = await response.json();

    // Guardamos la sesión en el almacenamiento local de forma persistente
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId || '1');
      localStorage.setItem('userRole', data.role || 'PATIENT');
      localStorage.setItem('username', data.name || 'Usuario');
    }

    return data;
  } catch (error) {
    console.error("Error en loginUser:", error);
    throw error;
  }
};

// 2. Registrar un nuevo usuario (Cualquier rol)
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${USER_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData) // Mapea con CrearUsuarioRequest del backend
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.descripcion || 'Error al registrar el usuario. El correo podría ya estar en uso.';
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
};

// 3. Cambiar contraseña
export const changePassword = async (email, oldPassword, newPassword) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${LOGIN_BASE_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ email, oldPassword, newPassword })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.descripcion || 'No se pudo actualizar la contraseña';
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en changePassword:", error);
    throw error;
  }
};
