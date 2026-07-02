// src/api/MedicalRecordApi.js

const API_BASE_URL = 'http://localhost:8080/api/medical-records';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 1. Obtener el historial clínico de un paciente por su ID
export const getMedicalRecordsByPatient = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener el historial clínico');
    return await response.json();
  } catch (error) {
    console.error("Error en getMedicalRecordsByPatient:", error);
    return [];
  }
};

// 2. Crear una nueva entrada en la historia clínica
export const createMedicalRecord = async (recordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(recordData)
    });
    if (!response.ok) {
      // Capturar el mensaje real del backend (ej: "el paciente está inactivo")
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.descripcion || 'No tienes permisos o los datos son inválidos';
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en createMedicalRecord:", error);
    throw error;
  }
};

// 3. Modificar una entrada existente
export const updateMedicalRecord = async (id, recordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(recordData)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.descripcion || 'Error al actualizar la historia clínica';
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en updateMedicalRecord:", error);
    throw error;
  }
};