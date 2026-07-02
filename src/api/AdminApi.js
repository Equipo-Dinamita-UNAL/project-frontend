// src/api/AdminApi.js

const ADMIN_BASE_URL = 'http://localhost:8080/api/admin';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// 1. Obtener TODOS los usuarios registrados (Agrupados por pacientes, doctores y administradores)
export const getRegisteredUsers = async () => {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/registered-users`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener los usuarios globales');
        return await response.json();
    } catch (error) {
        console.error("Error en getRegisteredUsers:", error);
        return { patients: [], doctors: [], administrators: [] };
    }
};

// 2. Obtener solo usuarios ACTIVOS globales
export const getActiveUsers = async () => {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/registered-users/active`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener usuarios activos');
        return await response.json();
    } catch (error) {
        console.error("Error en getActiveUsers:", error);
        return { patients: [], doctors: [], administrators: [] };
    }
};

// 3. Obtener solo usuarios INACTIVOS globales
export const getInactiveUsers = async () => {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/registered-users/inactive`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener usuarios inactivos');
        return await response.json();
    } catch (error) {
        console.error("Error en getInactiveUsers:", error);
        return { patients: [], doctors: [], administrators: [] };
    }
};