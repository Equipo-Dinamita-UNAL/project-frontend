export default function Sidebar({ currentPage, setCurrentPage, userRole, onLogout }) {
  // Aseguramos que el rol esté en mayúsculas para evitar fallos de coincidencia
  const role = userRole ? userRole.toUpperCase() : '';

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="sidebar-logo">
          <h2>OdontoGate</h2>
          <span style={{ fontSize: '11px', color: '#90e0ef', display: 'block', textTransform: 'lowercase' }}>
            {userRole}
          </span>
        </div>
        <nav className="sidebar-nav">
          {/* El dashboard lo ven todos */}
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>

          {/* Horarios y Pagos: Solo ADMINISTRATOR */}
          {role === 'ADMINISTRATOR' && (
            <>
              <button
                onClick={() => setCurrentPage('schedules')}
                className={`nav-link ${currentPage === 'schedules' ? 'active' : ''}`}
              >
                Horarios
              </button>
              <button 
                onClick={() => setCurrentPage('payments')} 
                className={`nav-link ${currentPage === 'payments' ? 'active' : ''}`}
              >
                Sección de Pagos
              </button>
            </>
          )}

          {/*  NUEVO BOTÓN EXCLUSIVO PARA PACIENTES: Reemplaza el botón que estaba en citas */}
          {role === 'PATIENT' && (
            <button 
              onClick={() => setCurrentPage('payments')} 
              className={`nav-link ${currentPage === 'payments' ? 'active' : ''}`}
            >
              Mis Cuentas / Pagos 
            </button>
          )}

          {/* Citas: ADMINISTRATOR, PATIENT y DOCTOR */}
          {(role === 'ADMINISTRATOR' || role === 'PATIENT' || role === 'DOCTOR') && (
            <button
              onClick={() => setCurrentPage('appointments')}
              className={`nav-link ${currentPage === 'appointments' ? 'active' : ''}`}
            >
              Citas
            </button>
          )}
          
          {/* Historial Clínico: ADMINISTRATOR, DOCTOR y PATIENT */}
          {(role === 'ADMINISTRATOR' || role === 'DOCTOR' || role === 'PATIENT') && (
            <button
              onClick={() => setCurrentPage('history')}
              className={`nav-link ${currentPage === 'history' ? 'active' : ''}`}
            >
              Historial Clínico
            </button>
          )}

          {/* Control de Usuarios para Admin y Mis Pacientes para Doctor */}
          {(role === 'ADMINISTRATOR' || role === 'DOCTOR') && (
            <button
              onClick={() => setCurrentPage('users')}
              className={`nav-link ${currentPage === 'users' ? 'active' : ''}`}
            >
              {role === 'ADMINISTRATOR' ? 'Gestión de Usuarios' : 'Mis Pacientes'}
            </button>
          )}
        </nav>
      </div>

      {/* Botón de salida abajo del sidebar */}
      <div style={{ padding: '20px' }}>
        <button 
          onClick={onLogout} 
          className="btn btn-danger" 
          style={{ width: '100%', padding: '8px', fontSize: '13px' }}
        >
          Salir
        </button>
      </div>
    </aside>
  );
}