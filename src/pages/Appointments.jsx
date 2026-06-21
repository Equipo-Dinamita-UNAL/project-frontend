import React, { useEffect, useState } from 'react'; 
import { getAllAppointments } from '../api/appointmentApi';

export default function Appointments({ userRole, onNavigateToPay }) {
  const role = userRole ? userRole.toUpperCase() : '';
  const [appointments, setAppointments] = useState([]);
  const [viewMode, setViewMode] = useState('calendar'); 
  const [currentWeekMonday, setCurrentWeekMonday] = useState(new Date("2026-06-22T00:00:00"));

  // 🔍 ESTADOS DE FILTRADO PARA EL ADMINISTRADOR
  const [filterDentist, setFilterDentist] = useState('TODOS');
  const [filterPatient, setFilterPatient] = useState('TODOS');
  const [globalSearch, setGlobalSearch] = useState('');

  // Estado del Formulario de Registro
  const [patient, setPatient] = useState(role === 'PATIENT' ? 'Carlos Pérez' : '');
  const [dentist, setDentist] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('Consulta General');

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

  useEffect(() => {
    getAllAppointments().then(data => {
      const enriched = data.map((a) => ({
        ...a,
        type: a.reason || "Consulta General" 
      }));
      setAppointments(enriched);
    }).catch(err => console.error("Error cargando citas:", err));
  }, []);

  // 🚀 LÓGICA DE FILTRADO REACTIVA PARA ACTUALIZAR EL HORARIO
  const filteredAppointments = appointments.filter(app => {
    // Restricciones base por rol
    if (role === 'PATIENT' && app.patientName !== 'Carlos Pérez') return false;
    if (role === 'DOCTOR' && app.dentistName !== 'Dr. Alex Muñiz') return false;
    
    // Filtros dinámicos del Administrador
    if (role === 'ADMINISTRATOR') {
      if (filterDentist !== 'TODOS' && app.dentistName !== filterDentist) return false;
      if (filterPatient !== 'TODOS' && app.patientName !== filterPatient) return false;
    }

    // Barra de búsqueda global
    const term = globalSearch.toLowerCase();
    return app.patientName.toLowerCase().includes(term) ||
           (app.dentistName && app.dentistName.toLowerCase().includes(term)) ||
           (app.type && app.type.toLowerCase().includes(term));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patient || !dentist || !date || !time) return;

    let estimatedPrice = 80000.0;
    if (appointmentType === 'Ortodoncia') estimatedPrice = 150000.0;
    if (appointmentType === 'Limpieza Dental') estimatedPrice = 100000.0;
    if (appointmentType === 'Diseño de Sonrisa') estimatedPrice = 800000.0;

    const newAppointment = {
      id: appointments.length + 1,
      patientName: patient,
      dentistName: dentist,
      date: date,
      time: time,
      type: appointmentType,
      reason: appointmentType,
      price: estimatedPrice,
      status: 'pendiente'
    };

    setAppointments([newAppointment, ...appointments]);
    if (role !== 'PATIENT') setPatient('');
    setDentist('');
    setDate('');
    setTime('');
  };

  const handleCancel = (id) => {
    if (confirm('¿Deseas cancelar esta cita médica?')) {
      setAppointments(appointments.map(app => app.id === id ? { ...app, status: 'cancelada' } : app));
    }
  };

  const currentMonthLabel = currentWeekMonday.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="appointments-page" style={{ padding: '20px' }}>
      
      {/* SECCIÓN DE MANDOS SUPERIOR CON FILTROS AVANZADOS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setViewMode('calendar')} className="btn" style={{ backgroundColor: viewMode === 'calendar' ? '#0077b6' : '#e2e8f0', color: viewMode === 'calendar' ? 'white' : '#475569', padding: '8px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            📅 Vista Calendario
          </button>
          <button onClick={() => setViewMode('table')} className="btn" style={{ backgroundColor: viewMode === 'table' ? '#0077b6' : '#e2e8f0', color: viewMode === 'table' ? 'white' : '#475569', padding: '8px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            📋 Vista Tabla
          </button>
        </div>

        {/* 🛠️ SELECTORES DE FILTRADO EXCLUSIVOS PARA EL ADMINISTRADOR */}
        {role === 'ADMINISTRATOR' && (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>🥼 Doctor:</label>
              <select 
                value={filterDentist} 
                onChange={(e) => setFilterDentist(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="TODOS">Todos los especialistas</option>
                <option value="Dr. Alex Muñiz">Dr. Alex Muñiz</option>
                <option value="Dra. Maria Silva">Dra. Maria Silva</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>👤 Paciente:</label>
              <select 
                value={filterPatient} 
                onChange={(e) => setFilterPatient(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="TODOS">Todos los pacientes</option>
                <option value="Carlos Pérez">Carlos Pérez</option>
                <option value="Ana Gómez">Ana Gómez</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>🔎 Buscar:</label>
          <input 
            type="text" 
            placeholder="Buscar por texto libre..." 
            value={globalSearch} 
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '220px' }}
          />
        </div>
      </div>

      {/* FORMULARIO DE REGISTRO */}
      {role !== 'DOCTOR' && (
        <div className="form-container" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#03045e' }}>Agendar Nueva Cita Odontológica</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Paciente *</label>
                <input type="text" className="form-control" value={patient} disabled={role === 'PATIENT'} onChange={(e) => setPatient(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: role === 'PATIENT' ? '#f1f5f9' : 'white' }} required />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Dentista Asignado *</label>
                <select className="form-control" value={dentist} onChange={(e) => setDentist(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required>
                  <option value="">Selecciona Especialista</option>
                  <option value="Dr. Alex Muñiz">Dr. Alex Muñiz (Endodoncia)</option>
                  <option value="Dra. Maria Silva">Dra. Maria Silva (Ortodoncia)</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Tipo de Tratamiento</label>
                <select className="form-control" value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  <option value="Consulta General">Consulta General 🦷</option>
                  <option value="Ortodoncia">Ortodoncia ✨</option>
                  <option value="Limpieza Dental">Limpieza Dental 🪥</option>
                  <option value="Diseño de Sonrisa">Diseño de Sonrisa 💎</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Fecha y Hora *</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type="date" className="form-control" value={date} min={todayStr} onChange={(e) => setDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: 1 }} required />
                  <select className="form-control" value={time} onChange={(e) => setTime(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '90px' }} required>
                    <option value="">--:--</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0077b6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Reservar Espacio en Agenda</button>
          </form>
        </div>
      )}

      {/* CALENDARIO INTERACTIVO */}
      {viewMode === 'calendar' ? (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <button onClick={() => setCurrentWeekMonday(new Date("2026-06-22T00:00:00"))} className="btn" style={{ backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '13px', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
              Hoy (Semana Base)
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={handlePrevWeek} style={{ padding: '6px 12px', backgroundColor: '#0077b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>◀ Anterior</button>
              <span style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'capitalize', color: '#03045e', minWidth: '160px', textAlign: 'center' }}>
                {currentMonthLabel}
              </span>
              <button onClick={handleNextWeek} style={{ padding: '6px 12px', backgroundColor: '#0077b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Siguiente ▶</button>
            </div>
            <div style={{ width: '100px' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, minmax(140px, 1fr))', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', borderRight: '1px solid #e2e8f0' }}></div>
            {daysOfWeek.map(day => (
              <div key={day.name} style={{ padding: '10px', backgroundColor: '#f8fafc', textAlign: 'center', borderBottom: '2px solid #cbd5e1', borderRight: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                {day.name} <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>{day.dateStr.split('-')[2]} / {day.dateStr.split('-')[1]}</span>
              </div>
            ))}

            {timeSlots.map(slot => (
              <React.Fragment key={slot}>
                <div style={{ padding: '20px 5px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', borderRight: '2px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', fontWeight: 'bold' }}>
                  {slot}
                </div>

                {daysOfWeek.map(day => {
                  const match = filteredAppointments.find(a => a.date === day.dateStr && a.time === slot && a.status.toLowerCase() !== 'cancelada');

                  // 🎨 REGLA CORREGIDA PARA IMAGEN 2: El color VERDE es exclusivo de pacientes con deudas.
                  const cardBgColor = (role === 'PATIENT' && match && match.status === 'pendiente')
                    ? '#10b981'
                    : '#0077b6';

                  return (
                    <div key={`${day.dateStr}-${slot}`} style={{ borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', padding: '4px', minHeight: '75px' }}>
                      {match ? (
                        <div style={{ backgroundColor: cardBgColor, color: 'white', padding: '8px', borderRadius: '4px', fontSize: '11px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            {role === 'PATIENT' ? (
                              <>
                                <strong>👨‍⚕️ {match.dentistName || match.doctorName}</strong>
                                <span style={{ display: 'block', color: '#bae6fd', fontWeight: 'bold', marginTop: '2px' }}>✨ {match.type}</span>
                              </>
                            ) : (
                              <>
                                <strong>👤 {match.patientName}</strong>
                                <span style={{ display: 'block', color: '#bae6fd' }}>🦷 {match.type}</span>
                                {match.dentistName && <span style={{ display: 'block', color: '#cbd5e1', fontSize: '10px' }}>Dr. {match.dentistName.split(' ').pop()}</span>}
                              </>
                            )}
                            
                            {/* 💰 CORRECCIÓN IMAGEN 2: No renderizar texto COP vacío a médicos o administradores */}
                            {role === 'PATIENT' && match.status === 'pendiente' && match.price && (
                              <span style={{ display: 'block', color: '#fed7aa', fontSize: '11px', fontWeight: 'bold', marginTop: '2px' }}>
                                ${match.price.toLocaleString()} COP
                              </span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '4px' }}>
                            {role !== 'DOCTOR' && (
                              <button onClick={() => handleCancel(match.id)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', textDecoration: 'underline', fontSize: '10px', padding: 0 }}>
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        role !== 'DOCTOR' && (
                          <div onClick={() => { setDate(day.dateStr); setTime(slot); }} style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '16px' }}>+</div>
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
        
        /* VISTA TABLA */
        <div className="table-container">
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                {role !== 'PATIENT' && <th style={{ padding: '12px' }}>ID</th>}
                <th style={{ padding: '12px' }}>Dentista / Especialista</th>
                {role !== 'PATIENT' && <th style={{ padding: '12px' }}>Paciente</th>}
                <th style={{ padding: '12px' }}>Tratamiento</th>
                {role !== 'DOCTOR' && <th style={{ padding: '12px' }}>Tarifa</th>}
                <th style={{ padding: '12px' }}>Fecha / Hora</th>
                <th style={{ padding: '12px' }}>Estado</th>
                <th style={{ padding: '12px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {role !== 'PATIENT' && <td style={{ padding: '12px' }}><strong>#{appointment.id}</strong></td>}
                  <td style={{ padding: '12px' }}><strong>{appointment.dentistName || appointment.doctorName}</strong></td>
                  {role !== 'PATIENT' && <td style={{ padding: '12px' }}>{appointment.patientName}</td>}
                  <td style={{ padding: '12px' }}>{appointment.type}</td>
                  {role !== 'DOCTOR' && <td style={{ padding: '12px', color: '#0077b6', fontWeight: 'bold' }}>${appointment.price?.toLocaleString() || '0'} COP</td>}
                  <td style={{ padding: '12px' }}>{appointment.date} a las {appointment.time}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: (role === 'PATIENT' && appointment.status === 'pendiente') ? '#fef3c7' : appointment.status === 'cancelada' ? '#fee2e2' : '#e0f2fe', color: (role === 'PATIENT' && appointment.status === 'pendiente') ? '#d97706' : appointment.status === 'cancelada' ? '#991b1b' : '#0369a1' }}>
                      {appointment.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {role !== 'DOCTOR' && appointment.status !== 'cancelada' && (
                      <button onClick={() => handleCancel(appointment.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}