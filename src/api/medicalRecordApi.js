// src/api/medicalRecordApi.js

const API_BASE_URL = 'http://localhost:8080/api/medical-records';
const API_DOCS_URL = 'http://localhost:8080/api/medical-documents';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const getAuthHeadersNoContentType = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// ── MEDICAL RECORDS ───────────────────────────────────────────────────────────

export const getMedicalRecordsByPatient = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener el historial clínico');
    return await response.json();
  } catch (error) {
    console.error('Error en getMedicalRecordsByPatient:', error);
    return [];
  }
};

export const createMedicalRecord = async (recordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(recordData)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.descripcion || 'No tienes permisos o los datos son inválidos';
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en createMedicalRecord:', error);
    throw error;
  }
};

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
    console.error('Error en updateMedicalRecord:', error);
    throw error;
  }
};

// Descarga el PDF de una historia clínica
export const downloadMedicalRecordPdf = async (recordId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/${recordId}/pdf`, {
    method: 'GET',
    headers: { 'Authorization': token ? `Bearer ${token}` : '' }
  });
  if (!response.ok) throw new Error('No se pudo descargar el PDF');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `historia-clinica-${recordId}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// ── MEDICAL DOCUMENTS ─────────────────────────────────────────────────────────

// Subir un documento médico (doctor/admin)
export const uploadMedicalDocument = async (file, patientId, medicalRecordId, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('patientId', patientId);
  if (medicalRecordId) formData.append('medicalRecordId', medicalRecordId);
  if (description) formData.append('description', description);

  const response = await fetch(`${API_DOCS_URL}`, {
    method: 'POST',
    headers: getAuthHeadersNoContentType(),
    body: formData
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Error al subir el documento');
  }
  return await response.json();
};

// Obtener documentos de un paciente
export const getDocumentsByPatient = async (patientId) => {
  const response = await fetch(`${API_DOCS_URL}/patient/${patientId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Error al obtener los documentos');
  return await response.json();
};

// Descargar un documento médico
export const downloadMedicalDocument = async (docId, originalName) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_DOCS_URL}/${docId}/download`, {
    method: 'GET',
    headers: { 'Authorization': token ? `Bearer ${token}` : '' }
  });
  if (!response.ok) throw new Error('No se pudo descargar el documento');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = originalName || `documento-${docId}`;
  a.click();
  window.URL.revokeObjectURL(url);
};