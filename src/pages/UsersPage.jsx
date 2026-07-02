import React, { useState, useEffect } from 'react';
import { getRegisteredUsers, getDoctorPatients, createUserAdmin, deleteUserAdmin } from '../api/userApi';

export default function UsersPage({ userRole }) {
  const role = userRole ? userRole.toUpperCase() : '';
  const currentUserId = localStorage.getItem('userId') || '1';

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [newName, setNewName] = useState('');
  const [newLastname, setNewLastname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newUserType, setNewUserType] = useState('PATIENT');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newMedicalLicense, setNewMedicalLicense] = useState('');
  const [newPosition, setNewPosition] = useState('');

  const loadUsers = () => {
    if (role === 'ADMINISTRATOR') {
      getRegisteredUsers().then(data => {
        setPatients(data.patients || []);
        setDoctors(data.doctors || []);
        setAdmins(data.administrators || []);
      });
    } else if (role === 'DOCTOR') {
      getDoctorPatients(currentUserId).then(data => {
        setPatients(Array.isArray(data) ? data : []);
      });
    }
  };

  useEffect(() => {
    loadUsers();
  }, [role, currentUserId]);

  const resetForm = () => {
    setNewName('');
    setNewLastname('');
    setNewEmail('');
    setNewPassword('');
    setNewPhone('');
    setNewUserType('PATIENT');
    setNewSpecialty('');
    setNewMedicalLicense('');
    setNewPosition('');
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newName || !newLastname || !newEmail || !newPassword) {
      alert('Completa los campos obligatorios (*)');
      return;
    }

    const payload = {
      name: newName,
      lastname: newLastname,
      email: newEmail,
      password: newPassword,
      phone: newPhone,
      userType: newUserType,
      specialty: newUserType === 'DOCTOR' ? newSpecialty : undefined,
      medicalLicense: newUserType === 'DOCTOR' ? newMedicalLicense : undefined,
      position: newUserType === 'ADMINISTRATOR' ? newPosition : undefined
    };

    createUserAdmin(payload)
        .then(() => {
          alert('Usuario creado correctamente.');
          resetForm();
          loadUsers();
        })
        .catch(() => alert('No se pudo crear el usuario. Verifica los datos o si el correo ya existe.'));
  };

  const handleDeleteUser = (email) => {
    if (!window.confirm(`Seguro que deseas eliminar al usuario con correo ${email}?`)) return;
    deleteUserAdmin(email)
        .then(() => {
          alert('Usuario eliminado correctamente.');
          loadUsers();
        })
        .catch(() => alert('No se pudo eliminar el usuario.'));
  };

  const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' };
  const colStyle = { display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' };
  const refreshButtonStyle = {
    backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc',
    padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
  };

  if (role === 'ADMINISTRATOR') {
    const combinedUsers = [
      ...doctors.map(d => ({ ...d, roleLabel: 'DOCTOR' })),
      ...patients.map(p => ({ ...p, roleLabel: 'PATIENT' })),
      ...admins.map(a => ({ ...a, roleLabel: 'ADMINISTRATOR' }))
    ];

    const filteredUsers = combinedUsers.filter(u => {
      if (roleFilter !== 'ALL' && u.roleLabel !== roleFilter) return false;
      const fullName = `${u.name} ${u.lastname}`.toLowerCase();
      const term = searchQuery.toLowerCase();
      return fullName.includes(term) || u.id?.toString() === searchQuery.trim();
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#03045e' }}>Crear Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div style={colStyle}>
                  <label style={labelStyle}>Nombre *</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} required />
                </div>
                <div style={colStyle}>
                  <label style={labelStyle}>Apellido *</label>
                  <input type="text" value={newLastname} onChange={(e) => setNewLastname(e.target.value)} style={inputStyle} required />
                </div>
                <div style={colStyle}>
                  <label style={labelStyle}>Correo *</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={inputStyle} required />
                </div>
                <div style={colStyle}>
                  <label style={labelStyle}>Contrasena *</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} required />
                </div>
                <div style={colStyle}>
                  <label style={labelStyle}>Telefono</label>
                  <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} style={inputStyle} />
                </div>
                <div style={colStyle}>
                  <label style={labelStyle}>Rol</label>
                  <select value={newUserType} onChange={(e) => setNewUserType(e.target.value)} style={inputStyle}>
                    <option value="PATIENT">Paciente</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMINISTRATOR">Administrador</option>
                  </select>
                </div>

                {newUserType === 'DOCTOR' && (
                    <>
                      <div style={colStyle}>
                        <label style={labelStyle}>Especialidad</label>
                        <input type="text" value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} style={inputStyle} />
                      </div>
                      <div style={colStyle}>
                        <label style={labelStyle}>Licencia Medica</label>
                        <input type="text" value={newMedicalLicense} onChange={(e) => setNewMedicalLicense(e.target.value)} style={inputStyle} />
                      </div>
                    </>
                )}

                {newUserType === 'ADMINISTRATOR' && (
                    <div style={colStyle}>
                      <label style={labelStyle}>Cargo</label>
                      <input type="text" value={newPosition} onChange={(e) => setNewPosition(e.target.value)} style={inputStyle} />
                    </div>
                )}
              </div>

              <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Crear Usuario
              </button>
            </form>
          </div>

          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ color: '#03045e', margin: 0 }}>Panel Global de Gestion de Usuarios</h2>
              <button onClick={loadUsers} style={refreshButtonStyle}>Actualizar Lista</button>
            </div>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Acceso total autorizado para el rol Administrador.</p>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Buscar por Nombre o ID:</label>
                <input type="text" placeholder="Escribe el nombre o numero de ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
              </div>
              <div style={{ width: '200px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Filtrar por Rol:</label>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
                  <option value="ALL">Todos los Usuarios</option>
                  <option value="ADMINISTRATOR">Administradores</option>
                  <option value="DOCTOR">Doctores / Especialistas</option>
                  <option value="PATIENT">Pacientes</option>
                </select>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Nombre Completo</th>
                <th style={{ padding: '12px' }}>Rol</th>
                <th style={{ padding: '12px' }}>Contacto</th>
                <th style={{ padding: '12px' }}>Estado</th>
                <th style={{ padding: '12px' }}>Acciones</th>
              </tr>
              </thead>
              <tbody>
              {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                      <tr key={`${u.roleLabel}-${u.id}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}><strong>#{u.id}</strong></td>
                        <td style={{ padding: '12px' }}><strong>{u.name} {u.lastname}</strong></td>
                        <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: u.roleLabel === 'DOCTOR' ? '#e0f2fe' : u.roleLabel === 'ADMINISTRATOR' ? '#fee2e2' : '#d1fae5',
                        color: u.roleLabel === 'DOCTOR' ? '#0369a1' : u.roleLabel === 'ADMINISTRATOR' ? '#991b1b' : '#065f46',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                      }}>
                        {u.roleLabel}
                      </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>
                          <div>{u.email}</div>
                          <div style={{ color: '#64748b' }}>{u.phone}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                      <span style={{ color: u.active ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '12px' }}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                              onClick={() => handleDeleteUser(u.email)}
                              style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                  ))
              ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No se encontraron usuarios con esos criterios.</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
    );
  }

  if (role === 'DOCTOR') {
    const filteredPatients = patients.filter(p => {
      const fullName = `${p.name} ${p.lastname}`.toLowerCase();
      const term = searchQuery.toLowerCase();
      return fullName.includes(term) || p.id?.toString() === searchQuery.trim();
    });

    return (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ color: '#0077b6', margin: 0 }}>Mis Pacientes Registrados</h2>
            <button onClick={loadUsers} style={refreshButtonStyle}>Actualizar Lista</button>
          </div>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>Pacientes con citas agendadas contigo.</p>

          <div style={{ marginBottom: '25px', maxWidth: '500px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Buscar Paciente (Nombre o ID):</label>
            <input type="text" placeholder="Escribe el nombre o ID del paciente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID Paciente</th>
              <th style={{ padding: '12px' }}>Nombre</th>
              <th style={{ padding: '12px' }}>Telefono</th>
              <th style={{ padding: '12px' }}>Correo</th>
              <th style={{ padding: '12px' }}>Citas Agendadas</th>
            </tr>
            </thead>
            <tbody>
            {filteredPatients.length > 0 ? (
                filteredPatients.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}><strong>#{p.id}</strong></td>
                      <td style={{ padding: '12px' }}><span style={{ color: '#03045e', fontWeight: 'bold' }}>{p.name} {p.lastname}</span></td>
                      <td style={{ padding: '12px' }}>{p.phone}</td>
                      <td style={{ padding: '12px' }}>{p.email}</td>
                      <td style={{ padding: '12px', color: '#475569', fontSize: '13px' }}>{p.appointments?.length || 0} cita(s)</td>
                    </tr>
                ))
            ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No se encontro ningun paciente con esos datos.</td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
    );
  }

  return <h2 style={{ padding: '20px', color: '#ef4444' }}>Acceso No Autorizado a este Modulo</h2>;
}
