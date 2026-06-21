import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Schedules from './pages/Schedules';
import Appointments from './pages/Appointments';
import MedicalHistory from './pages/MedicalHistory';
import Payments from './pages/Payments';
import Login from './pages/Login';
import UsersPage from './pages/UsersPage';

export default function App() {
  // Al arrancar, revisamos si el navegador ya recuerda el rol guardado
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // 🔌 ESTADO COMPARTIDO PARA PASAR LA CITA SELECCIONADA A PAGOS
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Guardamos el token y el rol al iniciar sesión con éxito desde el backend
  const handleLoginSuccess = (role, token) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    
    if (token) {
      localStorage.setItem('token', token); // 🔑 ¡Aquí guardamos el pase JWT!
    }

    // Redirección inicial según el rol retornado
    if (role === 'DOCTOR') {
      setCurrentPage('history');
    } else if (role === 'PATIENT') {
      setCurrentPage('appointments');
    } else {
      setCurrentPage('dashboard');
    }
  };

  // Limpiamos la sesión del navegador
  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('token'); // ❌ Eliminamos el JWT para revocar acceso
    setSelectedAppointmentId(null);  // Reseteamos el ID al cerrar sesión
    setCurrentPage('dashboard');
  };

  // 🚀 FUNCIÓN INTERMEDIARIA PARA CAPTURAR EL ID Y REDIRECCIONAR A PAGOS
  const handleRedirectToPay = (appointmentId) => {
    setSelectedAppointmentId(appointmentId); // Guarda el ID (puede ser null si se entra desde el menú global)
    setCurrentPage('payments');               // Cambia de página automáticamente
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2>Bienvenido al Panel de OdontoGate</h2>
            <p style={{ color: '#6c757d', marginTop: '10px' }}>
              Rol activo: <strong>{userRole}</strong>. Usa el menú lateral para navegar por tus módulos autorizados.
            </p>
            <button onClick={handleLogout} className="btn btn-danger" style={{ marginTop: '15px' }}>
              Cerrar Sesión
            </button>
          </div>
        );
      case 'schedules':
        return <Schedules />;

      case 'appointments':
        return (
          <Appointments 
            userRole={userRole} 
            // Conectamos la acción con nuestro gestor de redirección
            onNavigateToPay={handleRedirectToPay}  
          />
        );

      case 'history':
        return <MedicalHistory userRole={userRole}/>;

      case 'payments':
        return (
          <Payments 
            userRole={userRole} 
            // Inyectamos el ID guardado y la función para limpiarlo al terminar
            selectedAppointmentId={selectedAppointmentId}
            clearSelectedId={() => setSelectedAppointmentId(null)}
          />
        );

      case 'users':
        return <UsersPage userRole={userRole} />;

      default:
        return <h2>Página no encontrada</h2>;
    }
  };

  // Si no hay sesión iniciada, se bloquea la app entera mostrando solo el Login
  if (!userRole) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        currentPage={currentPage} 
        // Cuando cambien de página manualmente desde el Sidebar, limpiamos el ID seleccionado 
        // para que no entre bloqueado a la pasarela por defecto
        setCurrentPage={(page) => {
          if (page !== 'payments') setSelectedAppointmentId(null);
          setCurrentPage(page);
        }} 
        userRole={userRole} 
        onLogout={handleLogout} 
      />
      <main className="main-content" style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa' }}>
        {renderPage()}
      </main>
    </div>
  );
}