export default function Sidebar({ currentPage, setCurrentPage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>OdontoGate</h2>
      </div>
      <nav className="sidebar-nav">
        <button 
          onClick={() => setCurrentPage('dashboard')} 
          className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
        >
          Dashboard
        </button>
        
        <button 
          onClick={() => setCurrentPage('schedules')} 
          className={`nav-link ${currentPage === 'schedules' ? 'active' : ''}`}
        >
          Horarios
        </button>
        
        <button 
          onClick={() => setCurrentPage('appointments')} 
          className={`nav-link ${currentPage === 'appointments' ? 'active' : ''}`}
        >
          Citas
        </button>
      </nav>
    </aside>
  );
}