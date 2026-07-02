// src/api/userApi.js

const ADMIN_BASE_URL = 'http://localhost:8080/api/admin';
const DOCTOR_BASE_URL = 'http://localhost:8080/api/doctors';
const USER_BASE_URL = 'http://localhost:8080/api/users';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const getRegisteredUsers = async () => {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/registered-users`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener usuarios registrados');
        return await response.json();
    } catch (error) {
        console.error("Error en getRegisteredUsers:", error);
        return { patients: [], doctors: [] };
    }
};

export const getAllDoctors = async () => {
    try {
        const response = await fetch(`${DOCTOR_BASE_URL}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener la lista de doctores');
        return await response.json();
    } catch (error) {
        console.error("Error en getAllDoctors:", error);
        return [];
    }
};

export const getDoctorPatients = async (doctorId) => {
    try {
        const response = await fetch(`${DOCTOR_BASE_URL}/${doctorId}/patients`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener pacientes del doctor');
        return await response.json();
    } catch (error) {
        console.error("Error en getDoctorPatients:", error);
        return [];
    }
};

export const createUserAdmin = async (userData) => {
    try {
        const response = await fetch(`${USER_BASE_URL}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Error al crear el usuario');
        return await response.json();
    } catch (error) {
        console.error("Error en createUserAdmin:", error);
        throw error;
    }
};

export const deleteUserAdmin = async (email) => {
    try {
        const response = await fetch(`${USER_BASE_URL}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            body: JSON.stringify({ email })
        });
        if (!response.ok) throw new Error('Error al eliminar el usuario');
        return await response.json();
    } catch (error) {
        console.error("Error en deleteUserAdmin:", error);
        throw error;
    }
};