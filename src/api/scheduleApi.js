// src/api/ScheduleApi.js

const SCHEDULE_BASE_URL = 'http://localhost:8080/api/schedules';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const getAllSchedules = async () => {
    try {
        const response = await fetch(`${SCHEDULE_BASE_URL}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener la agenda global');
        return await response.json();
    } catch (error) {
        console.error("Error en getAllSchedules:", error);
        return [];
    }
};

export const getSchedulesByDoctor = async (doctorId) => {
    try {
        const response = await fetch(`${SCHEDULE_BASE_URL}/doctor/${doctorId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener la agenda del especialista');
        return await response.json();
    } catch (error) {
        console.error("Error en getSchedulesByDoctor:", error);
        return [];
    }
};

export const createSchedule = async (scheduleData) => {
    try {
        const response = await fetch(`${SCHEDULE_BASE_URL}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(scheduleData)
        });
        if (!response.ok) throw new Error('Error al guardar la franja horaria');
        return await response.json();
    } catch (error) {
        console.error("Error en createSchedule:", error);
        throw error;
    }
};

export const toggleScheduleAvailability = async (id, isAvailable) => {
    try {
        const response = await fetch(`${SCHEDULE_BASE_URL}/${id}/available?value=${isAvailable}`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al modificar disponibilidad del horario');
        return await response.json();
    } catch (error) {
        console.error("Error en toggleScheduleAvailability:", error);
        throw error;
    }
};

export const deleteSchedule = async (id) => {
    try {
        const response = await fetch(`${SCHEDULE_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar el horario');
    } catch (error) {
        console.error("Error en deleteSchedule:", error);
        throw error;
    }
};