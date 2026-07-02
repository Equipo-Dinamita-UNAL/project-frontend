import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Schedules from './pages/Schedules';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Payments from './pages/Payments';
import Login from './pages/Login';
import UsersPage from './pages/UsersPage';

export default function App() {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const handleLoginSuccess = (role, userId) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    if (userId) localStorage.setItem('userId', userId);

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
    localStorage.clear();
    setSelectedAppointmentId(null);
    setCurrentPage('dashboard');
  };

  const handleRedirectToPay = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setCurrentPage('payments');
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
          </div>
        );
      case 'schedules':
        return <Schedules userRole={userRole} />;
      case 'appointments':
        return (
          <Appointments
            userRole={userRole}
            onNavigateToPay={handleRedirectToPay}
          />
        );
      case 'history':
        return <MedicalRecords userRole={userRole} />;
      case 'payments':
        return (
          <Payments
            userRole={userRole}
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

  if (!userRole) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        currentPage={currentPage}
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