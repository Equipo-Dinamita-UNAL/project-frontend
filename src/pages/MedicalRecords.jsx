import React, { useState, useEffect } from 'react';
import {
  getMedicalRecordsByPatient,
  createMedicalRecord,
  updateMedicalRecord,
  downloadMedicalRecordPdf,
  uploadMedicalDocument,
  getDocumentsByPatient,
  downloadMedicalDocument
} from '../api/medicalRecordApi';
import { getRegisteredUsers, getDoctorPatients } from '../api/userApi';

export default function MedicalRecords({ userRole }) {
  const role = userRole ? userRole.toUpperCase() : '';
  const currentUserId = localStorage.getItem('userId') || '1';

  const [searchPatientId, setSearchPatientId] = useState(role === 'PATIENT' ? currentUserId : '');
  const [records, setRecords] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [patientOptions, setPatientOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Estados para subida de documentos (doctor)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadRecordId, setUploadRecordId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (role === 'ADMINISTRATOR') {
      getRegisteredUsers().then(data => {
        setPatientOptions(Array.isArray(data.patients) ? data.patients : []);
      }).catch(() => setPatientOptions([]));
    } else if (role === 'DOCTOR') {
      getDoctorPatients(currentUserId).then(data => {
        setPatientOptions(Array.isArray(data) ? data : []);
      }).catch(() => setPatientOptions([]));
    }
  }, [role, currentUserId]);

  useEffect(() => {
    if (role === 'PATIENT') {
      handleSearch(currentUserId);
      loadDocuments(currentUserId);
    }
  }, [role, currentUserId]);

  const loadDocuments = (patientId) => {
    getDocumentsByPatient(patientId)
      .then(data => setDocuments(Array.isArray(data) ? data : []))
      .catch(() => setDocuments([]));
  };

  const handleSearch = (idToSearch) => {
    const targetId = idToSearch || searchPatientId;
    if (!targetId) return;

    if (role === 'DOCTOR' && patientOptions.length > 0) {
      const esSuPaciente = patientOptions.some(p => p.id?.toString() === targetId?.toString());
      if (!esSuPaciente) {
        alert('No tienes acceso al historial de este paciente.');
        setRecords([]);
        return;
      }
    }

    getMedicalRecordsByPatient(targetId)
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(() => { alert('No se encontraron registros.'); setRecords([]); });

    loadDocuments(targetId);
  };

  const filteredSuggestions = patientOptions.filter(p => {
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase().trim();
    const fullName = `${p.name || ''} ${p.lastname || ''}`.toLowerCase();
    return fullName.includes(term) || p.id?.toString() === term;
  });

  const handleSelectPatient = (patient) => {
    setSearchPatientId(patient.id);
    setSelectedPatient(patient);
    setSearchTerm('');
    setShowSuggestions(false);
    handleSearch(patient.id);
  };

  const handleManualSearchClick = () => {
    const term = searchTerm.trim();
    if (term && !isNaN(term)) {
      setSearchPatientId(term);
      const found = patientOptions.find(p => p.id?.toString() === term);
      setSelectedPatient(found || null);
      handleSearch(term);
      setShowSuggestions(false);
      return;
    }
    if (filteredSuggestions.length === 1) {
      handleSelectPatient(filteredSuggestions[0]);
    } else {
      alert('Escribe un ID exacto o selecciona un paciente de las sugerencias.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!diagnosis || !treatment || !searchPatientId) {
      alert('Por favor rellena los campos obligatorios (*)');
      return;
    }
    const payload = {
      patientId: parseInt(searchPatientId),
      diagnosis,
      treatment,
      observations: notes,
      date: new Date().toISOString()
    };
    if (editingId) {
      updateMedicalRecord(editingId, payload)
        .then(() => { alert('Registro clínico actualizado correctamente.'); setEditingId(null); resetForm(); handleSearch(); })
        .catch((err) => alert(err.message || 'Error al modificar el registro.'));
    } else {
      createMedicalRecord(payload)
        .then(() => { alert('Nueva entrada registrada con éxito.'); resetForm(); handleSearch(); })
        .catch((err) => alert(err.message || 'No se pudo guardar la evolución clínica.'));
    }
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setDiagnosis(record.diagnosis);
    setTreatment(record.treatment);
    setNotes(record.observations || '');
  };

  const resetForm = () => { setDiagnosis(''); setTreatment(''); setNotes(''); setEditingId(null); };

  // ── Descarga PDF de historia clínica ────────────────────────────────────────
  const handleDownloadPdf = (recordId) => {
    downloadMedicalRecordPdf(recordId)
      .catch(() => alert('No se pudo descargar el PDF.'));
  };

  // ── Subida de documentos (doctor) ────────────────────────────────────────────
  const openUploadModal = (recordId) => {
    setUploadRecordId(recordId);
    setUploadFile(null);
    setUploadDescription('');
    setShowUploadModal(true);
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) { alert('Selecciona un archivo.'); return; }
    setUploading(true);
    try {
      await uploadMedicalDocument(uploadFile, searchPatientId, uploadRecordId, uploadDescription);
      alert('Documento subido correctamente.');
      setShowUploadModal(false);
      loadDocuments(searchPatientId);
    } catch (err) {
      alert(err.message || 'Error al subir el documento.');
    } finally {
      setUploading(false);
    }
  };

  // ── Descarga de documento médico (paciente/doctor) ───────────────────────────
  const handleDownloadDocument = (doc) => {
    downloadMedicalDocument(doc.id, doc.originalName)
      .catch(() => alert('No se pudo descargar el documento.'));
  };

  const btnStyle = {
    padding: '4px 12px', fontSize: '12px', borderRadius: '4px',
    cursor: 'pointer', fontWeight: 'bold', border: '1px solid #cbd5e1'
  };

  return (
    <div style={{ padding: '20px' }}>

      {/* ── BUSCADOR (solo admin/doctor) ── */}
      {role !== 'PATIENT' && (
        <div style={{ backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <label style={{ fontWeight: 'bold', color: '#475569', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Buscar Expediente por Nombre o ID Paciente:
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Ej: Juan Garzón  o  11"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%' }}
              />
              {showSuggestions && searchTerm && filteredSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxHeight: '220px', overflowY: 'auto' }}>
                  {filteredSuggestions.map(p => (
                    <div key={p.id} onClick={() => handleSelectPatient(p)} onMouseDown={(e) => e.preventDefault()}
                         style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                      <strong>{p.name} {p.lastname}</strong>
                      <span style={{ color: '#64748b', marginLeft: '8px', fontSize: '12px' }}>#{p.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleManualSearchClick}
                    style={{ backgroundColor: '#0077b6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              Buscar Historia
            </button>
          </div>
        </div>
      )}

      {/* ── FORMULARIO DE REGISTRO (solo admin/doctor) ── */}
      {role !== 'PATIENT' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#03045e' }}>
            {editingId ? `Editando Registro Clínico #${editingId}` : 'Registrar Evolución / Consulta Odontológica'}
          </h3>
          {selectedPatient ? (
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '12px 16px', marginBottom: '18px', display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 'bold', textTransform: 'uppercase' }}>Paciente</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                  {selectedPatient.name} {selectedPatient.lastname}
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>#{selectedPatient.id}</span>
                </p>
              </div>
              {selectedPatient.email && (
                <div>
                  <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 'bold', textTransform: 'uppercase' }}>Correo</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#334155' }}>{selectedPatient.email}</p>
                </div>
              )}
              {selectedPatient.bloodType && (
                <div>
                  <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 'bold', textTransform: 'uppercase' }}>Tipo Sangre</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#334155' }}>🩸 {selectedPatient.bloodType}</p>
                </div>
              )}
              {selectedPatient.allergies && (
                <div>
                  <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', textTransform: 'uppercase' }}>Alergias</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#dc2626' }}>⚠️ {selectedPatient.allergies}</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ backgroundColor: '#fafafa', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '12px 16px', marginBottom: '18px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
              Busca y selecciona un paciente para registrar su evolución clínica.
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Diagnóstico Principal *</label>
                <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                          placeholder="Ej: Caries interproximales en molar 46 y 47..."
                          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical', minHeight: '60px' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Tratamiento Planificado *</label>
                <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)}
                          placeholder="Ej: Resina compuesta fotocurable..."
                          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical', minHeight: '60px' }} required />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Observaciones</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                     placeholder="Ej: Paciente refiere sensibilidad al frío."
                     style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ backgroundColor: editingId ? '#f59e0b' : '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                {editingId ? 'Guardar Cambios' : 'Añadir al Expediente'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── LISTA DE HISTORIALES ── */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#03045e' }}>Expediente Odontológico</h3>
          <button onClick={() => handleSearch()} style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            Actualizar Lista
          </button>
        </div>

        {records.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
            No se han cargado registros clínicos.{role !== 'PATIENT' && ' Realiza una búsqueda con un nombre o ID válido.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {records.map((record) => (
              <div key={record.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '15px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0077b6', backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '4px' }}>
                      Consulta #{record.id}
                    </span>
                    {record.patientName && (
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>
                        👤 {record.patientName}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>
                    {record.createdAt ? record.createdAt.split('T')[0] : 'Fecha Reciente'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '5px' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#475569', display: 'block' }}>Diagnóstico:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1e293b' }}>{record.diagnosis}</p>
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#475569', display: 'block' }}>Tratamiento:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1e293b' }}>{record.treatment}</p>
                  </div>
                </div>

                {record.observations && (
                  <div style={{ marginTop: '12px', backgroundColor: 'white', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid #cbd5e1' }}>
                    <strong style={{ fontSize: '12px', color: '#64748b' }}>Observaciones:</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#475569' }}>{record.observations}</p>
                  </div>
                )}

                {/* Botones por rol */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                  {/* Descargar PDF — todos los roles */}
                  <button onClick={() => handleDownloadPdf(record.id)}
                          style={{ ...btnStyle, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                    📄 Descargar PDF
                  </button>

                  {/* Subir documento — solo doctor/admin */}
                  {role !== 'PATIENT' && (
                    <>
                      <button onClick={() => openUploadModal(record.id)}
                              style={{ ...btnStyle, backgroundColor: '#fefce8', color: '#ca8a04' }}>
                        📎 Subir Documento
                      </button>
                      <button onClick={() => startEdit(record)}
                              style={{ ...btnStyle, backgroundColor: 'white', color: '#0077b6' }}>
                        ✏️ Editar Entrada
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DOCUMENTOS DEL PACIENTE ── */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#03045e' }}>
          {role === 'PATIENT' ? 'Mis Documentos Médicos' : 'Documentos del Paciente'}
        </h3>

        {documents.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '15px' }}>No hay documentos cargados.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {documents.map((doc) => (
              <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>📁 {doc.originalName}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    {doc.fileType} · {(doc.fileSize / 1024).toFixed(1)} KB
                    {doc.description && ` · ${doc.description}`}
                    {doc.createdAt && ` · ${doc.createdAt.split('T')[0]}`}
                  </p>
                </div>
                <button onClick={() => handleDownloadDocument(doc)}
                        style={{ ...btnStyle, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  ⬇️ Descargar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL SUBIR DOCUMENTO ── */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', width: '420px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#03045e' }}>Subir Documento Médico</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 15px 0' }}>
              Historia clínica #{uploadRecordId} · Archivos permitidos: PDF, JPG, PNG (máx 10 MB)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Archivo *</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                       onChange={(e) => setUploadFile(e.target.files[0])}
                       style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Descripción (opcional)</label>
                <input type="text" value={uploadDescription}
                       onChange={(e) => setUploadDescription(e.target.value)}
                       placeholder="Ej: Radiografía panorámica"
                       style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowUploadModal(false)}
                      style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleUploadDocument} disabled={uploading}
                      style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#0077b6', color: 'white', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                {uploading ? 'Subiendo...' : 'Subir Archivo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}