import React, { useState } from 'react';

export default function UsersPage({ userRole }) {
  const role = userRole ? userRole.toUpperCase() : '';

  // --- MOCK DE DATOS DE USUARIOS ---
  const [users] = useState([
    { id: 1, name: "Carlos Pérez", role: "PATIENT", email: "carlos@mail.com", phone: "+57 300 123 4567", extraInfo: "Paciente recurrente - Tratamiento: Ortodoncia" },
    { id: 2, name: "Ana Gómez", role: "PATIENT", email: "ana.gomez@mail.com", phone: "+57 315 987 6543", extraInfo: "Alergia a la Penicilina - Tratamiento: Limpieza" },
    { id: 3, name: "Dr. Alex Muñiz", role: "DOCTOR", email: "alex.muniz@odontogate.com", phone: "+57 310 555 1234", extraInfo: "Especialidad: Endodoncia - Consultorio 201" },
    { id: 4, name: "Dra. Maria Silva", role: "DOCTOR", email: "maria.silva@odontogate.com", phone: "+57 320 444 5678", extraInfo: "Especialidad: Ortodoncia - Consultorio 202" },
    { id: 5, name: "Laura Martínez", role: "ADMINISTRATOR", email: "laura.admin@odontogate.com", phone: "+57 301 777 8899", extraInfo: "Supervisora General de Turnos" }
  ]);

  // --- ESTADOS DE FILTROS ---
  const [searchQuery, setSearchQuery] = useState(''); // Filtro por nombre o ID
  const [roleFilter, setRoleFilter] = useState('ALL'); // Filtro por Rol (Solo Admin)

  // --- LÓGICA DE FILTRADO ---
  const filteredUsers = users.filter(user => {
    // 1. Restricción de Rol: Si es DOCTOR, automáticamente ocultamos administradores y otros doctores
    if (role === 'DOCTOR' && user.role !== 'PATIENT') return false;

    // 2. Filtro de Rol Seleccionado (Solo aplica para el Administrador)
    if (role === 'ADMINISTRATOR' && roleFilter !== 'ALL' && user.role !== roleFilter) return false;

    // 3. Filtro por Nombre o ID (Búsqueda global por texto)
    const matchesText = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        user.id.toString() === searchQuery.trim();

    return matchesText;
  });

  // =========================================================
  // VISTA 1: ADMINISTRADOR (Gestión Completa de todos los Usuarios)
  // =========================================================
  if (role === 'ADMINISTRATOR') {
    return (
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#03045e', marginBottom: '10px' }}>👥 Panel Global de Gestión de Usuarios</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>Acceso total autorizado para el rol Administrador.</p>

        {/* Barra de Filtros para el Admin */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Buscar por Nombre o ID:</label>
            <input 
              type="text" 
              placeholder="Escribe el nombre o número de ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
          
          <div style={{ width: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Filtrar por Rol:</label>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="ALL">Todos los Usuarios</option>
              <option value="ADMINISTRATOR">Administradores</option>
              <option value="DOCTOR">Doctores / Especialistas</option>
              <option value="PATIENT">Pacientes</option>
            </select>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Nombre Completo</th>
              <th style={{ padding: '12px' }}>Rol</th>
              <th style={{ padding: '12px' }}>Contacto (Email / Teléfono)</th>
              <th style={{ padding: '12px' }}>Detalles / Notas Internas</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}><strong>#{u.id}</strong></td>
                  <td style={{ padding: '12px' }}><strong>{u.name}</strong></td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      backgroundColor: u.role === 'ADMINISTRATOR' ? '#fee2e2' : u.role === 'DOCTOR' ? '#e0f2fe' : '#d1fae5', 
                      color: u.role === 'ADMINISTRATOR' ? '#991b1b' : u.role === 'DOCTOR' ? '#0369a1' : '#065f46',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' 
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    <div>{u.email}</div>
                    <div style={{ color: '#64748b' }}>{u.phone}</div>
                  </td>
                  <td style={{ padding: '12px', color: '#475569', fontSize: '13px', fontStyle: 'italic' }}>{u.extraInfo}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No se encontraron usuarios con esos criterios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // =========================================================
  // VISTA 2: DOCTOR (Consulta exclusiva de Pacientes)
  // =========================================================
  if (role === 'DOCTOR') {
    return (
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#0077b6', marginBottom: '10px' }}>👨‍⚕️ Mis Pacientes Registrados</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>Filtra y revisa la información de contacto y detalles médicos de tus pacientes.</p>

        {/* Barra de Búsqueda Exclusiva (Sin selector de roles) */}
        <div style={{ marginBottom: '25px', maxWidth: '500px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Buscar Paciente (Nombre o ID):</label>
          <input 
            type="text" 
            placeholder="Escribe el nombre o ID del paciente a consultar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        {/* Tabla Segura (Solo muestra Pacientes) */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID Paciente</th>
              <th style={{ padding: '12px' }}>Nombre del Paciente</th>
              <th style={{ padding: '12px' }}>Teléfono de Contacto</th>
              <th style={{ padding: '12px' }}>Correo Electrónico</th>
              <th style={{ padding: '12px' }}>Observaciones Clínicas</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}><strong>#{p.id}</strong></td>
                  <td style={{ padding: '12px' }}><span style={{ color: '#03045e', fontWeight: 'bold' }}>{p.name}</span></td>
                  <td style={{ padding: '12px' }}>{p.phone}</td>
                  <td style={{ padding: '12px' }}>{p.email}</td>
                  <td style={{ padding: '12px', color: '#475569', fontSize: '13px' }}>{p.extraInfo}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No se encontró ningún paciente con esos datos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Si un paciente intenta forzar la entrada a esta página
  return <h2 style={{ padding: '20px', color: '#ef4444' }}>⛔ Acceso No Autorizado a este Módulo</h2>;
}