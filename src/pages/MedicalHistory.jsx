import React, { useState } from 'react';

export default function MedicalHistory({ userRole }) {
  const role = userRole ? userRole.toUpperCase() : '';
  const [searchTerm, setSearchTerm] = useState('');

  // Simulación de datos de historiales clínicos con tratamiento incluido
  const [records, setRecords] = useState([
    { 
      id: 1, 
      patientName: "Carlos Pérez", 
      doctorName: "Dr. Alex Muñiz", 
      date: "2026-06-15", 
      treatment: "Ajuste de Ortodoncia ✨",
      diagnosis: "Evolución favorable del alineamiento dental superior." 
    },
    { 
      id: 2, 
      patientName: "Ana Gómez", 
      doctorName: "Dr. Alex Muñiz", 
      date: "2026-06-18", 
      treatment: "Limpieza Dental Profunda 🦷",
      diagnosis: "Remoción de cálculo dental generalizado, encías sanas." 
    },
    { 
      id: 3, 
      patientName: "Carlos Pérez", 
      doctorName: "Dr. Alex Muñiz", 
      date: "2026-04-10", 
      treatment: "Calza Resina de Premolar 💎",
      diagnosis: "Caries de segundo grado en pieza 24 obturada con éxito." 
    }
  ]);

  // Filtro de búsqueda por nombre de paciente (solo relevante para DOCTOR / ADMINISTRATOR)
  const filteredRecords = records.filter(record => {
    if (role === 'PATIENT' && record.patientName !== 'Carlos Pérez') return false;
    return record.patientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      
      {/* SECCIÓN IZQUIERDA: Listado de Registros */}
      <div style={{ flex: 2, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#03045e', marginBottom: '5px' }}>Módulo de Historiales Clínicos</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          Visualización autorizada para: <strong>{role}</strong>
        </p>

        {/* Buscador: Solo se muestra a Doctores o Administradores */}
        {role !== 'PATIENT' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>🔎 Buscar historial de paciente:</label>
            <input 
              type="text" 
              placeholder="Escribe el nombre del paciente para filtrar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
        )}

        <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>
          {role === 'PATIENT' ? 'Mi Historial Clínico Personal' : 'Registros Clínicos Encontrados'}
        </h3>

        {/* Mapeo de Tarjetas de Historial */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredRecords.map(record => (
            <div 
              key={record.id} 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}
            >
              <div>
                {/* SOLUCIÓN AL REQUERIMIENTO: Si es paciente muestra Tratamiento, si es Doctor muestra el Paciente */}
                <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                  {role === 'PATIENT' ? record.treatment : record.patientName} 
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal', marginLeft: '10px' }}>
                    - {record.date}
                  </span>
                </h4>
                <small style={{ color: '#0284c7', display: 'block', marginTop: '4px', fontWeight: '500' }}>
                  Atendido por: {record.doctorName}
                </small>
                {role === 'PATIENT' && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                    <strong>Nota médica:</strong> {record.diagnosis}
                  </p>
                )}
              </div>
              <button 
                onClick={() => alert(`Detalles del registro #${record.id}\nTratamiento: ${record.treatment}\nDiagnóstico: ${record.diagnosis}`)} 
                className="btn btn-primary" 
                style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
              >
                🔷 Ver Detalles
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN DERECHA: Agregar Evolución (Oculta por completo para PACIENTES) */}
      {role !== 'PATIENT' && (
        <div style={{ flex: 1, minWidth: '280px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Añadir Evolución Médica</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Paciente:</label>
              <input type="text" placeholder="Nombre completo" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Tratamiento Realizado:</label>
              <input type="text" placeholder="Ej. Resina, Extracción" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Diagnóstico / Hallazgo:</label>
              <textarea rows="3" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'none' }}></textarea>
            </div>
            <button type="button" onClick={() => alert('Registro guardado (Simulado)')} style={{ width: '100%', padding: '10px', backgroundColor: '#0077b6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Registrar en Historial
            </button>
          </form>
        </div>
      )}

    </div>
  );
}