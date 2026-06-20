import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Schedules from './pages/Schedules';
import Appointments from './pages/Appointments';
import MedicalHistory from './pages/MedicalHistory';
import Payments from './pages/Payments';
import Login from './pages/Login';
import UsersPage from './pages/UsersPage'; // Importación lista ✅

export default function App() {
  const [userRole, setUserRole] = useState(null); // Almacena ADMINISTRATOR, DOCTOR o PATIENT
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    // Redirección inicial según el rol del backend
    if (role === 'DOCTOR') {
      setCurrentPage('history');
    } else if (role === 'PATIENT') {
      setCurrentPage('appointments');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentPage('dashboard');
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
            onNavigateToPayments={(page) => setCurrentPage(page)} 
          />
        );

      case 'history':
        return <MedicalHistory userRole={userRole}/>;

      case 'payments':
        return <Payments userRole={userRole} />;

      // CASO NUEVO INTEGRADO AQUÍ ✅
      case 'users':
        return <UsersPage userRole={userRole} />;

      default:
        return <h2>Página no encontrada</h2>;
    }
  };

  // Si no está logueado, se bloquea la app entera mostrando solo el Login
  if (!userRole) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        userRole={userRole} 
        onLogout={handleLogout} 
      />
      <main className="main-content" style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa' }}>
        {renderPage()}
      </main>
    </div>
  );
}