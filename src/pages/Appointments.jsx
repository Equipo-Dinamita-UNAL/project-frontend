import React, { useEffect, useState } from 'react'; // Agregado React explícito para solucionar el error de pantalla blanca
import { getAllAppointments } from '../api/appointmentApi';

export default function Appointments({ userRole, onNavigateToPayments }) {
  const role = userRole ? userRole.toUpperCase() : '';
  const [appointments, setAppointments] = useState([]);
  const [viewMode, setViewMode] = useState('calendar');
  
  // Estado para controlar la semana actual
  const [currentWeekMonday, setCurrentWeekMonday] = useState(new Date("2026-06-22T00:00:00"));

  // Filtros de Admin e Búsqueda Global
  const [filterDentist, setFilterDentist] = useState('TODOS');
  const [filterPatient, setFilterPatient] = useState('TODOS');
  const [globalSearch, setGlobalSearch] = useState('');

  // Formulario
  const [patient, setPatient] = useState(role === 'PATIENT' ? 'Carlos Pérez' : '');
  const [dentist, setDentist] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('Consulta General 🦷');

  const todayStr = new Date().toISOString().split('T')[0];
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

  const daysOfWeek = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(currentWeekMonday);
    d.setDate(currentWeekMonday.getDate() + index);
    return {
      name: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index],
      dateStr: d.toISOString().split('T')[0]
    };
  });

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekMonday);
    prev.setDate(currentWeekMonday.getDate() - 7);
    setCurrentWeekMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekMonday);
    next.setDate(currentWeekMonday.getDate() + 7);
    setCurrentWeekMonday(next);
  };

  const handleCurrentWeek = () => {
    setCurrentWeekMonday(new Date("2026-06-22T00:00:00"));
  };

  useEffect(() => {
    getAllAppointments().then(data => {
      const enriched = data.map((a, idx) => ({
        ...a,
        type: idx % 2 === 0 ? "Ortodoncia ✨" : "Limpieza Dental 🦷"
      }));
      setAppointments(enriched);
    });
  }, []);

  const filteredAppointments = appointments.filter(app => {
    if (role === 'PATIENT' && app.patientName !== 'Carlos Pérez') return false;
    if (role === 'DOCTOR' && app.dentistName !== 'Dr. Alex Muñiz') return false;
    
    if (role === 'ADMINISTRATOR') {
      if (filterDentist !== 'TODOS' && app.dentistName !== filterDentist) return false;
      if (filterPatient !== 'TODOS' && app.patientName !== filterPatient) return false;
    }

    return app.patientName.toLowerCase().includes(globalSearch.toLowerCase()) ||
           app.dentistName.toLowerCase().includes(globalSearch.toLowerCase()) ||
           (app.type && app.type.toLowerCase().includes(globalSearch.toLowerCase()));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patient || !dentist || !date || !time) return;

    const newAppointment = {
      id: appointments.length + 1,
      patientName: patient,
      dentistName: dentist,
      date: date,
      time: time,
      type: appointmentType,
      status: 'Programada'
    };

    setAppointments([newAppointment, ...appointments]);
    if (role !== 'PATIENT') setPatient('');
    setDentist('');
    setDate('');
    setTime('');
  };

  const handleCancel = (id) => {
    if (confirm('¿Deseas cancelar esta cita médica?')) {
      setAppointments(appointments.map(app => app.id === id ? { ...app, status: 'Cancelada' } : app));
    }
  };

  const currentMonthLabel = currentWeekMonday.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="appointments-page">
      
      {/* Controles superiores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <button onClick={() => setViewMode('calendar')} className="btn" style={{ backgroundColor: viewMode === 'calendar' ? '#0077b6' : '#e2e8f0', color: viewMode === 'calendar' ? 'white' : '#475569', marginRight: '10px' }}>
            📅 Vista Calendario
          </button>
          <button onClick={() => setViewMode('table')} className="btn" style={{ backgroundColor: viewMode === 'table' ? '#0077b6' : '#e2e8f0', color: viewMode === 'table' ? 'white' : '#475569', marginRight: '15px' }}>
            📋 Vista Tabla
          </button>

          {/* PUNTO 3: Botón de pago exclusivo para el Paciente */}
          {role === 'PATIENT' && (
            <button 
              onClick={() => onNavigateToPayments ? onNavigateToPayments('payments') : alert('Sección de pagos próximamente disponible de forma externa')} 
              className="btn" 
              style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold' }}
            >
              💳 Pagar mi Cita / Consulta
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>🔎 Buscar:</label>
          <input 
            type="text" 
            placeholder="Buscar doctor, paciente o tipo..." 
            value={globalSearch} 
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '240px' }}
          />
        </div>
      </div>

      {/* Formulario de reserva */}
      {role !== 'DOCTOR' && (
        <div className="form-container" style={{ marginBottom: '25px' }}>
          <h3>Registrar Nueva Cita Médica</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Paciente *</label>
                <input type="text" className="form-control" value={patient} disabled={role === 'PATIENT'} onChange={(e) => setPatient(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Dentista Asignado *</label>
                <select className="form-control" value={dentist} onChange={(e) => setDentist(e.target.value)}>
                  <option value="">Selecciona Especialista</option>
                  <option value="Dr. Alex Muñiz">Dr. Alex Muñiz (Endodoncia)</option>
                  <option value="Dra. Maria Silva">Dra. Maria Silva (Ortodoncia)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de Tratamiento</label>
                <select className="form-control" value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)}>
                  <option value="Consulta General 🦷">Consulta General 🦷</option>
                  <option value="Ortodoncia ✨">Ortodoncia ✨</option>
                  <option value="Diseño de Sonrisa 💎">Diseño de Sonrisa 💎</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha y Hora *</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type="date" className="form-control" value={date} min={todayStr} onChange={(e) => setDate(e.target.value)} />
                  <select className="form-control" value={time} onChange={(e) => setTime(e.target.value)}>
                    <option value="">--:--</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Reservar Espacio</button>
          </form>
        </div>
      )}

      {/* RENDER VISTAS */}
      {viewMode === 'calendar' ? (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <button onClick={handleCurrentWeek} className="btn" style={{ backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', border: '1px solid #cbd5e1' }}>
              Hoy (Semana Base)
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={handlePrevWeek} className="btn" style={{ padding: '5px 12px', backgroundColor: '#0077b6', color: 'white' }}>◀ Anterior</button>
              <span style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'capitalize', color: '#03045e', minWidth: '150px', textAlign: 'center' }}>
                {currentMonthLabel}
              </span>
              <button onClick={handleNextWeek} className="btn" style={{ padding: '5px 12px', backgroundColor: '#0077b6', color: 'white' }}>Siguiente ▶</button>
            </div>
            <div style={{ width: '100px' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, minmax(130px, 1fr))', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', borderRight: '1px solid #e2e8f0' }}></div>
            {daysOfWeek.map(day => (
              <div key={day.name} style={{ padding: '10px', backgroundColor: '#f8fafc', textAlign: 'center', borderBottom: '2px solid #cbd5e1', borderRight: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                {day.name} <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>{day.dateStr.split('-')[2]} / {day.dateStr.split('-')[1]}</span>
              </div>
            ))}

            {timeSlots.map(slot => (
              <React.Fragment key={slot}>
                <div style={{ padding: '15px 5px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', borderRight: '2px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', fontWeight: 'bold' }}>
                  {slot}
                </div>

                {daysOfWeek.map(day => {
                  const match = filteredAppointments.find(a => a.date === day.dateStr && a.time === slot && a.status !== 'Cancelada');

                  return (
                    <div key={`${day.dateStr}-${slot}`} style={{ borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', padding: '4px', minHeight: '65px' }}>
                      {match ? (
                        <div style={{ backgroundColor: '#0284c7', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '11px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            {/* PUNTO 1: Si es Paciente, muestra el nombre del Doctor. Si no, el del Paciente */}
                            {role === 'PATIENT' ? (
                              <>
                                <strong>👨‍⚕️ {match.dentistName}</strong>
                                <span style={{ display: 'block', color: '#bae6fd', fontWeight: 'bold', marginTop: '2px' }}>✨ {match.type || 'Tratamiento'}</span>
                              </>
                            ) : (
                              <>
                                <strong>👤 {match.patientName}</strong>
                                <span style={{ display: 'block', color: '#bae6fd' }}>🦷 {match.type || 'General'}</span>
                                {role === 'ADMINISTRATOR' && <span style={{ display: 'block', color: '#cbd5e1', fontSize: '10px' }}>Dr. {match.dentistName.split(' ').pop()}</span>}
                              </>
                            )}
                          </div>
                          {role !== 'DOCTOR' && (
                            <button onClick={() => handleCancel(match.id)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', textDecoration: 'underline', fontSize: '10px', padding: 0, textAlign: 'left', marginTop: '4px' }}>
                              Cancelar
                            </button>
                          )}
                        </div>
                      ) : (
                        role !== 'DOCTOR' && (
                          <div onClick={() => { setDate(day.dateStr); setTime(slot); }} style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>+</div>
                        )
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        /* Vista Tabla */
        <div className="table-container">
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                {/* PUNTO 2: Ocultamos el ID real de la base de datos si es Paciente (se muestra un número consecutivo visual o se quita) */}
                {role !== 'PATIENT' && <th style={{ padding: '12px' }}>ID</th>}
                <th style={{ padding: '12px' }}>Dentista / Especialista</th>
                {role !== 'PATIENT' && <th style={{ padding: '12px' }}>Paciente</th>}
                <th style={{ padding: '12px' }}>Tratamiento</th>
                <th style={{ padding: '12px' }}>Fecha / Hora</th>
                <th style={{ padding: '12px' }}>Estado</th>
                {role !== 'DOCTOR' && <th style={{ padding: '12px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment, index) => (
                <tr key={appointment.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {role !== 'PATIENT' && <td style={{ padding: '12px' }}><strong>#{appointment.id}</strong></td>}
                  <td style={{ padding: '12px' }}><strong>{appointment.dentistName}</strong></td>
                  {role !== 'PATIENT' && <td style={{ padding: '12px' }}>{appointment.patientName}</td>}
                  <td style={{ padding: '12px' }}>{appointment.type || 'Consulta General'}</td>
                  <td style={{ padding: '12px' }}>{appointment.date} a las {appointment.time}</td>
                  <td style={{ padding: '12px' }}><span className={`status-badge ${appointment.status.toLowerCase()}`}>{appointment.status}</span></td>
                  {role !== 'DOCTOR' && (
                    <td style={{ padding: '12px' }}>
                      {appointment.status !== 'Cancelada' ? (
                        <button onClick={() => handleCancel(appointment.id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>Cancelar</button>
                      ) : (
                        <span style={{ color: '#6c757d', fontStyle: 'italic' }}>Inactiva</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}