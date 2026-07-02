// src/api/appointmentApi.js

const API_BASE_URL = 'http://localhost:8080/api/appointments';

// Helper para adjuntar el Token JWT que ya maneja tu frontend
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 1. Obtener citas dependiendo del rol del usuario conectado
export const getAppointmentsByRole = async (role, userId) => {
  try {
    let url = `${API_BASE_URL}`; // Por defecto para ADMINISTRATOR

    if (role === 'PATIENT' && userId) {
      url = `${API_BASE_URL}/patient/${userId}`;
    } else if (role === 'DOCTOR' && userId) {
      url = `${API_BASE_URL}/doctor/${userId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener las citas de la base de datos');
    return await response.json();
  } catch (error) {
    console.error("Error en getAppointmentsByRole:", error);
    return [];
  }
};

// 2. Crear una nueva cita (Usa AppointmentRequest)
export const createAppointment = async (appointmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData)
    });
    if (!response.ok) throw new Error('Error al registrar la cita médica');
    return await response.json();
  } catch (error) {
    console.error("Error en createAppointment:", error);
    throw error;
  }
};

// 3. Eliminar físicamente una cita (Según tu @DeleteMapping("/{id}"))
export const deleteAppointment = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar la cita');
    return true;
  } catch (error) {
    console.error("Error en deleteAppointment:", error);
    throw error;
  }
};