// Datos iniciales de prueba (Mocks) basados en MedicalRecordResponse
let mockRecords = [
  {
    id: 1,
    patientId: 101,
    diagnosis: "Caries profunda en molar inferior derecho",
    treatment: "Endodoncia y corona de porcelana",
    observations: "Paciente presenta sensibilidad extrema al frío.",
    date: "2026-06-15T10:00:00",
    createdAt: "2026-06-15T10:05:00"
  },
  {
    id: 2,
    patientId: 102,
    diagnosis: "Gingivitis moderada generalizada",
    treatment: "Profilaxis profunda y raspaje radicular",
    observations: "Se recomienda uso de enjuague con clorhexidina por 7 días.",
    date: "2026-06-18T15:30:00",
    createdAt: "2026-06-18T15:32:00"
  }
];

// GET /api/medical-records (Simulado para ver todos en el front)
export const getAllMedicalRecords = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockRecords]), 300);
  });
};

// POST /api/medical-records (Basado en MedicalRecordRequest)
export const createMedicalRecord = (recordRequest) => {
  return new Promise((resolve) => {
    const newRecord = {
      id: mockRecords.length + 1,
      ...recordRequest,
      createdAt: new Date().toISOString()
    };
    mockRecords = [newRecord, ...mockRecords];
    setTimeout(() => resolve(newRecord), 300);
  });
};

// DELETE /api/medical-records/{id}
export const deleteMedicalRecord = (id) => {
  return new Promise((resolve) => {
    mockRecords = mockRecords.filter(record => record.id !== id);
    setTimeout(() => resolve(true), 300);
  });
};