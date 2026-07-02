import React, { useState, useEffect } from 'react';
import { getMedicalRecordsByPatient, createMedicalRecord, updateMedicalRecord } from '../api/MedicalRecordApi';
import { getRegisteredUsers, getDoctorPatients } from '../api/userApi';

export default function MedicalRecords({ userRole }) {
    const role = userRole ? userRole.toUpperCase() : '';
    const currentUserId = localStorage.getItem('userId') || '1';

    const [searchPatientId, setSearchPatientId] = useState(role === 'PATIENT' ? currentUserId : '');
    const [records, setRecords] = useState([]);

    const [patientOptions, setPatientOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null); // objeto completo del paciente seleccionado

    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [notes, setNotes] = useState('');
    const [editingId, setEditingId] = useState(null);

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
        }
    }, [role, currentUserId]);

    const handleSearch = (idToSearch) => {
        const targetId = idToSearch || searchPatientId;
        if (!targetId) return;

        // Si es doctor, verificar que el paciente pertenece a su lista antes de consultar
        if (role === 'DOCTOR' && patientOptions.length > 0) {
            const essuPaciente = patientOptions.some(p => p.id?.toString() === targetId?.toString());
            if (!essuPaciente) {
                alert('No tienes acceso al historial de este paciente. Solo puedes consultar los expedientes de tus propios pacientes.');
                setRecords([]);
                return;
            }
        }

        getMedicalRecordsByPatient(targetId)
            .then(data => setRecords(Array.isArray(data) ? data : []))
            .catch(() => { alert('No se encontraron registros para el paciente ingresado.'); setRecords([]); });
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
            // Intentar encontrar el objeto del paciente en la lista para mostrar su info
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
                .then(() => { alert('Registro clinico actualizado correctamente.'); setEditingId(null); resetForm(); handleSearch(); })
                .catch((err) => alert(err.message || 'Error al intentar modificar el registro.'));
        } else {
            createMedicalRecord(payload)
                .then(() => { alert('Nueva entrada registrada en la historia clinica con exito.'); resetForm(); handleSearch(); })
                .catch((err) => alert(err.message || 'No se pudo guardar la evolucion clinica. Verifica los permisos de tu usuario.'));
        }
    };

    const startEdit = (record) => {
        setEditingId(record.id);
        setDiagnosis(record.diagnosis);
        setTreatment(record.treatment);
        setNotes(record.observations || '');
    };

    const resetForm = () => { setDiagnosis(''); setTreatment(''); setNotes(''); setEditingId(null); };

    const refreshButtonStyle = {
        backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc',
        padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
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
                                            {p.email && <span style={{ color: '#94a3b8', marginLeft: '8px', fontSize: '11px' }}>{p.email}</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showSuggestions && searchTerm && filteredSuggestions.length === 0 && isNaN(searchTerm.trim()) && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px', padding: '10px', fontSize: '13px', color: '#94a3b8' }}>
                                    No se encontraron pacientes con ese nombre.
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
                        {editingId ? `Editando Registro Clinico #${editingId}` : 'Registrar Evolucion / Consulta Odontologica'}
                    </h3>

                    {/* TARJETA DE INFO DEL PACIENTE SELECCIONADO */}
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
                            {selectedPatient.phone && (
                                <div>
                                    <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 'bold', textTransform: 'uppercase' }}>Telefono</span>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#334155' }}>{selectedPatient.phone}</p>
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
                            <div>
                                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold', textTransform: 'uppercase' }}>Estado</span>
                                <p style={{ margin: '4px 0 0 0' }}>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                        backgroundColor: selectedPatient.active ? '#d1fae5' : '#fee2e2',
                                        color: selectedPatient.active ? '#065f46' : '#991b1b'
                                    }}>
                                        {selectedPatient.active ? '✓ Válido' : '✗ Inválido'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: '#fafafa', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '12px 16px', marginBottom: '18px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
                            Busca y selecciona un paciente para registrar su evolucion clinica.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Diagnostico Principal *</label>
                                <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                                          placeholder="Ej: Caries interproximales en molar 46 y 47..."
                                          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical', minHeight: '60px' }} required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Tratamiento Planificado *</label>
                                <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)}
                                          placeholder="Ej: Resina compuesta fotocurable y profilaxis profunda..."
                                          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical', minHeight: '60px' }} required />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Observaciones / Notas Adicionales</label>
                            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                                   placeholder="Ej: Paciente refiere sensibilidad al frio. Proxima cita control en 6 meses."
                                   style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ backgroundColor: editingId ? '#f59e0b' : '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {editingId ? 'Guardar Cambios' : 'Anadir al Expediente'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    Cancelar Edicion
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* ── LISTA DE HISTORIALES ── */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#03045e' }}>Expediente Odontologico Sincronizado</h3>
                    <button onClick={() => handleSearch()} style={refreshButtonStyle}>Actualizar Lista</button>
                </div>

                {records.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                        No se han cargado registros clinicos para mostrar.{role !== 'PATIENT' && ' Por favor realiza una busqueda con un nombre o ID valido.'}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {records.map((record) => (
                            <div key={record.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '15px', backgroundColor: '#f8fafc' }}>

                                {/* CABECERA: número de consulta + nombre del paciente + fecha */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0077b6', backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '4px' }}>
                                            Consulta #{record.id}
                                        </span>
                                        {/* Nombre del paciente — viene del backend gracias al cambio en MedicalRecordServiceImpl */}
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
                                        <strong style={{ fontSize: '13px', color: '#475569', display: 'block' }}>Diagnostico:</strong>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1e293b' }}>{record.diagnosis}</p>
                                    </div>
                                    <div>
                                        <strong style={{ fontSize: '13px', color: '#475569', display: 'block' }}>Tratamiento Aplicado:</strong>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1e293b' }}>{record.treatment}</p>
                                    </div>
                                </div>

                                {record.observations && (
                                    <div style={{ marginTop: '12px', backgroundColor: 'white', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid #cbd5e1' }}>
                                        <strong style={{ fontSize: '12px', color: '#64748b' }}>Observaciones:</strong>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#475569' }}>{record.observations}</p>
                                    </div>
                                )}

                                {role !== 'PATIENT' && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                        <button onClick={() => startEdit(record)}
                                                style={{ padding: '4px 12px', fontSize: '12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#0077b6' }}>
                                            Editar Entrada
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
