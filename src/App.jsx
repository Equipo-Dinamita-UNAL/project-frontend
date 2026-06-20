import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Schedules from './pages/Schedules';
import Appointments from './pages/Appointments';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2>Bienvenido al Panel de OdontoGate</h2>
            <p style={{ color: '#6c757d', marginTop: '10px' }}>
              Selecciona una opción en el menú lateral izquierdo para gestionar citas, horarios y pacientes.
            </p>
          </div>
        );
      case 'schedules':
        return <Schedules />;
      case 'appointments':
        return <Appointments />;
      default:
        return <h2>Página no encontrada</h2>;
    }
  };

  return (
    <div className="layout-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="main-content">
        <h1>OdontoGate</h1>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>Sistema de Gestión Odontológica</p>
        <hr style={{ border: 'none', borderTop: '1px solid #dee2e6', marginBottom: '30px' }} />
        
        {renderPage()}
      </main>
    </div>
  );
}

export default App;