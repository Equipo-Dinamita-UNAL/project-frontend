import React, { useEffect, useState } from 'react';
import { getRegisteredUsers, getActiveUsers, getInactiveUsers } from '../api/AdminApi';

export default function AdminDashboard({ userRole }) {
  const role = userRole ? userRole.toUpperCase() : '';

  // Estados para almacenar las listas devueltas por la DTO combinada
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Controladores de filtros de vista
  const [currentTab, setCurrentTab] = useState('PATIENTS'); // PATIENTS, DOCTORS, ADMINS
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE
  const [loading, setLoading] = useState(false);

  // Carga de datos según la pestaña de estado seleccionada
  const loadUsersData = () => {
    setLoading(true);
    let apiCall = getRegisteredUsers; // Por defecto trae todos

    if (statusFilter === 'ACTIVE') apiCall = getActiveUsers;
    if (statusFilter === 'INACTIVE') apiCall = getInactiveUsers;

    apiCall()
        .then((data) => {
          setPatients(data.patients || []);
          setDoctors(data.doctors || []);
          setAdmins(data.administrators || []);
        })
        .catch((err) => console.error("Error cargando auditoría de usuarios:", err))
        .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (role === 'ADMINISTRATOR') {
      loadUsersData();
    }
  }, [statusFilter, role]);

  if (role !== 'ADMINISTRATOR') {
    return (
        <div style={{ padding: '30px', textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>
          🛑 Acceso Denegado. Este panel está restringido exclusivamente para la administración central clínica.
        </div>
    );
  }

  return (
      <div className="admin-dashboard-page" style={{ padding: '20px' }}>

        {/* HEADER Y FILTRO DE AUDITORÍA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div>
            <h2 style={{ margin: 0, color: '#03045e' }}>Gestión Global de Usuarios 👑</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>Auditoría interna de cuentas de OdontoGate</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Estado de cuenta:</label>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="ALL">Mostrar Todos (Activos/Inactivos)</option>
              <option value="ACTIVE">Solo Usuarios Activos ✅</option>
              <option value="INACTIVE">Solo Usuarios Inactivos ❌</option>
            </select>
          </div>
        </div>

        {/* RECUENTOS RÁPIDOS (KPI CARDS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
          <div onClick={() => setCurrentTab('PATIENTS')} style={{ cursor: 'pointer', backgroundColor: 'white', padding: '15px', borderRadius: '8px', borderBottom: currentTab === 'PATIENTS' ? '4px solid #0077b6' : '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>PACIENTES REGISTRADOS</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#0f172a' }}>{patients.length} Cuentas</h3>
          </div>
          <div onClick={() => setCurrentTab('DOCTORS')} style={{ cursor: 'pointer', backgroundColor: 'white', padding: '15px', borderRadius: '8px', borderBottom: currentTab === 'DOCTORS' ? '4px solid #10b981' : '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>CUERPO MÉDICO (DOCTORES)</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#0f172a' }}>{doctors.length} Especialistas</h3>
          </div>
          <div onClick={() => setCurrentTab('ADMINS')} style={{ cursor: 'pointer', backgroundColor: 'white', padding: '15px', borderRadius: '8px', borderBottom: currentTab === 'ADMINS' ? '4px solid #f59e0b' : '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>ADMINISTRADORES</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#0f172a' }}>{admins.length} Usuarios</h3>
          </div>
        </div>

        {/* TABLAS DE CONTENIDO DINÁMICO SEGÚN PESTAÑA */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          {loading ? (
              <p style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Consultando registros en el servidor contable...</p>
          ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Nombre Completo</th>
                  <th style={{ padding: '12px' }}>Correo Electrónico</th>
                  <th style={{ padding: '12px' }}>Teléfono</th>

                  {/* Columnas específicas basadas en la pestaña activa */}
                  {currentTab === 'PATIENTS' && <th style={{ padding: '12px' }}>Grupo Sanguíneo / Alergias</th>}
                  {currentTab === 'DOCTORS' && <th style={{ padding: '12px' }}>Especialidad / Licencia</th>}

                  <th style={{ padding: '12px' }}>Estado</th>
                </tr>
                </thead>
                <tbody>
                {/* RENDER DE PACIENTES */}
                {currentTab === 'PATIENTS' && (
                    patients.length === 0 ? (
                        <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay pacientes que coincidan con el filtro.</td></tr>
                    ) : (
                        patients.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '12px' }}><strong>#{p.id}</strong></td>
                              <td style={{ padding: '12px' }}>{p.name} {p.lastname}</td>
                              <td style={{ padding: '12px' }}>{p.email}</td>
                              <td style={{ padding: '12px' }}>{p.phone || 'No registra'}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ fontSize: '12px', display: 'block' }}>🩸 Tipo: {p.bloodType || 'N/A'}</span>
                                <span style={{ fontSize: '11px', color: '#ef4444' }}>⚠️ Alergias: {p.allergies || 'Ninguna'}</span>
                              </td>
                              <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: p.active ? '#d1fae5' : '#fee2e2', color: p.active ? '#065f46' : '#991b1b' }}>
                          {p.active ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                              </td>
                            </tr>
                        ))
                    )
                )}

                {/* RENDER DE DOCTORES */}
                {currentTab === 'DOCTORS' && (
                    doctors.length === 0 ? (
                        <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay doctores que coincidan con el filtro.</td></tr>
                    ) : (
                        doctors.map(d => (
                            <tr key={d.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '12px' }}><strong>#{d.id}</strong></td>
                              <td style={{ padding: '12px' }}>Dr. {d.name} {d.lastname}</td>
                              <td style={{ padding: '12px' }}>{d.email}</td>
                              <td style={{ padding: '12px' }}>{d.phone}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0077b6', display: 'block' }}>{d.speciality}</span>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>🪪 M.L: {d.medicalLicense}</span>
                              </td>
                              <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: d.active ? '#d1fae5' : '#fee2e2', color: d.active ? '#065f46' : '#991b1b' }}>
                          {d.active ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                              </td>
                            </tr>
                        ))
                    )
                )}

                {/* RENDER DE ADMINISTRADORES */}
                {currentTab === 'ADMINS' && (
                    admins.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay administradores asignados con este filtro.</td></tr>
                    ) : (
                        admins.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '12px' }}><strong>#{a.id}</strong></td>
                              <td style={{ padding: '12px' }}>{a.name} {a.lastname}</td>
                              <td style={{ padding: '12px' }}>{a.email}</td>
                              <td style={{ padding: '12px' }}>{a.phone || 'N/A'}</td>
                              <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: a.active ? '#d1fae5' : '#fee2e2', color: a.active ? '#065f46' : '#991b1b' }}>
                          {a.active ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                              </td>
                            </tr>
                        ))
                    )
                )}
                </tbody>
              </table>
          )}
        </div>
      </div>
  );
}