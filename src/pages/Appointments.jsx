import React, { useEffect, useState } from 'react';
import { getAppointmentsByRole, createAppointment, deleteAppointment } from '../api/appointmentApi';
import { getSchedulesByDoctor } from '../api/ScheduleApi';
import { getRegisteredUsers, getAllDoctors } from '../api/userApi';

export default function Appointments({ userRole, onNavigateToPay }) {
  const role = userRole ? userRole.toUpperCase() : '';
  const currentUserId = parseInt(localStorage.getItem('userId') || '1');

  const [appointments, setAppointments] = useState([]);
  const [viewMode, setViewMode] = useState('calendar');
  const [currentWeekMonday, setCurrentWeekMonday] = useState(new Date("2026-06-22T00:00:00"));
  const [globalSearch, setGlobalSearch] = useState('');

  // Estados búsqueda paciente
  const [patientSearch, setPatientSearch] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Estados búsqueda doctor
  const [doctorSearch, setDoctorSearch] = useState('');
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [appointmentType, setAppointmentType] = useState('Consulta General');
  const [date, setDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const weekdayLabel = {
    MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miercoles',
    THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sabado'
  };

  const weekdayToNumber = {
    MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 0
  };

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

  const daysOfWeek = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(currentWeekMonday);
    d.setDate(currentWeekMonday.getDate() + index);
    return {
      name: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"][index],
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

  const loadAppointments = () => {
    getAppointmentsByRole(role, currentUserId)
        .then(data => {
          const normalized = data.map(app => ({
            id: app.id,
            patientName: app.patientName || `Paciente #${app.patientId}`,
            dentistName: app.doctorName ? `Dr(a). ${app.doctorName}` : `Especialista #${app.doctorId}`,
            date: app.date,
            time: app.time ? app.time.substring(0, 5) : '08:00',
            type: app.reason || 'Consulta General',
            price: app.price || 80000.0,
            status: app.status ? app.status.toLowerCase() : 'pendiente'
          }));
          setAppointments(normalized);
        })
        .catch(err => console.error("Error al refrescar agenda:", err));
  };

  useEffect(() => {
    if (role === 'ADMINISTRATOR') {
      getRegisteredUsers().then(data => {
        setAllDoctors(data.doctors || []);
        setAllPatients(data.patients || []);
      });
    } else if (role === 'PATIENT') {
      getAllDoctors().then(data => {
        setAllDoctors(Array.isArray(data) ? data : []);
      });
    }
    loadAppointments();
  }, [role, currentUserId]);

  // Filtrar doctores
  useEffect(() => {
    if (!doctorSearch.trim()) { setFilteredDoctors([]); return; }
    const term = doctorSearch.toLowerCase();
    setFilteredDoctors(
        allDoctors.filter(d => `${d.name} ${d.lastname}`.toLowerCase().includes(term)).slice(0, 5)
    );
  }, [doctorSearch, allDoctors]);

  // Filtrar pacientes
  useEffect(() => {
    if (!patientSearch.trim()) { setFilteredPatients([]); return; }
    const term = patientSearch.toLowerCase();
    setFilteredPatients(
        allPatients.filter(p => `${p.name} ${p.lastname}`.toLowerCase().includes(term)).slice(0, 5)
    );
  }, [patientSearch, allPatients]);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorSearch(`${doctor.name} ${doctor.lastname}`);
    setFilteredDoctors([]);
    setSelectedSchedule(null);
    setDate('');
    getSchedulesByDoctor(doctor.id).then(data => {
      setDoctorSchedules(Array.isArray(data) ? data.filter(s => s.isAvailable !== false) : []);
    });
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(`${patient.name} ${patient.lastname}`);
    setFilteredPatients([]);
  };

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setDate('');
  };

  const isDateValidForSchedule = (dateStr) => {
    if (!selectedSchedule || !dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDay() === weekdayToNumber[selectedSchedule.weekday];
  };

  const filteredAppointments = appointments.filter(app => {
    const term = globalSearch.toLowerCase();
    return app.patientName.toLowerCase().includes(term) ||
        app.dentistName.toLowerCase().includes(term) ||
        app.type.toLowerCase().includes(term);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const patientIdFinal = role === 'PATIENT' ? currentUserId : selectedPatient?.id;

    if (!selectedDoctor || !selectedSchedule || !date || !patientIdFinal) {
      alert('Completa todos los campos: paciente, doctor, horario y fecha.');
      return;
    }
    if (!isDateValidForSchedule(date)) {
      alert(`La fecha debe ser un ${weekdayLabel[selectedSchedule.weekday]}.`);
      return;
    }

    const appointmentRequest = {
      doctorId: selectedDoctor.id,
      patientId: parseInt(patientIdFinal),
      doctorScheduleId: selectedSchedule.id,
      date: date,
      time: selectedSchedule.startTime.substring(0, 5) + ':00',  // ✅ hora fija = inicio del horario
      status: 'pendiente',
      reason: appointmentType,
      modifiedBy: currentUserId
    };

    createAppointment(appointmentRequest)
        .then(() => {
          alert('Cita agendada correctamente!');
          loadAppointments();
          setSelectedPatient(null);
          setPatientSearch('');
          setSelectedDoctor(null);
          setDoctorSearch('');
          setDoctorSchedules([]);
          setSelectedSchedule(null);
          setDate('');
        })
        .catch(() => alert('No se pudo guardar la cita. Verifica que la fecha coincida con el dia del horario y no haya conflicto.'));
  };

  const handleCancel = (id) => {
    if (confirm('Seguro que deseas eliminar esta cita?')) {
      deleteAppointment(id)
          .then(() => {
            alert('Cita eliminada.');
            loadAppointments();
          })
          .catch(() => alert('Error al eliminar la cita.'));
    }
  };

  const currentMonthLabel = currentWeekMonday.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%' };
  const colStyle = { display: 'flex', flexDirection: 'column', position: 'relative' };
  const labelStyle = { fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' };
  const dropdownStyle = {
    position: 'absolute', top: '100%', left: 0, right: 0,
    backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px',
    zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '2px'
  };
  const dropdownItemStyle = { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px' };
  const refreshButtonStyle = {
    backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc',
    padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
  };

  return (
      <div style={{ padding: '20px' }}>

        {/* BARRA SUPERIOR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setViewMode('calendar')} style={{ backgroundColor: viewMode === 'calendar' ? '#0077b6' : '#e2e8f0', color: viewMode === 'calendar' ? 'white' : '#475569', padding: '8px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Vista Calendario
            </button>
            <button onClick={() => setViewMode('table')} style={{ backgroundColor: viewMode === 'table' ? '#0077b6' : '#e2e8f0', color: viewMode === 'table' ? 'white' : '#475569', padding: '8px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Vista Tabla
            </button>
            <button onClick={loadAppointments} style={refreshButtonStyle}>Actualizar Lista</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Buscar:</label>
            <input type="text" placeholder="Nombre, doctor, tratamiento..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '250px' }} />
          </div>
        </div>

        {/* FORMULARIO */}
        {role !== 'DOCTOR' && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#03045e' }}>Agendar Nueva Cita Odontologica</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '15px' }}>

                  {/* BUSCADOR PACIENTE */}
                  {role === 'ADMINISTRATOR' ? (
                      <div style={colStyle}>
                        <label style={labelStyle}>Buscar Paciente *</label>
                        <input
                            type="text"
                            placeholder="Escribe el nombre del paciente..."
                            value={patientSearch}
                            onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
                            style={inputStyle}
                        />
                        {filteredPatients.length > 0 && (
                            <div style={dropdownStyle}>
                              {filteredPatients.map(p => (
                                  <div
                                      key={p.id}
                                      onClick={() => handleSelectPatient(p)}
                                      style={dropdownItemStyle}
                                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                                  >
                                    <strong>{p.name} {p.lastname}</strong>
                                    <span style={{ color: '#64748b', marginLeft: '8px', fontSize: '12px' }}>{p.email}</span>
                                  </div>
                              ))}
                            </div>
                        )}
                        {selectedPatient && (
                            <span style={{ fontSize: '11px', color: '#10b981', marginTop: '3px' }}>
                      Paciente seleccionado: ID #{selectedPatient.id}
                    </span>
                        )}
                      </div>
                  ) : (
                      <div style={colStyle}>
                        <label style={labelStyle}>Paciente</label>
                        <input type="text" value="Mi Cuenta (Autenticado)" disabled style={{ ...inputStyle, backgroundColor: '#f1f5f9' }} />
                      </div>
                  )}

                  {/* BUSCADOR DOCTOR */}
                  <div style={colStyle}>
                    <label style={labelStyle}>Buscar Doctor *</label>
                    <input
                        type="text"
                        placeholder="Escribe el nombre del doctor..."
                        value={doctorSearch}
                        onChange={(e) => {
                          setDoctorSearch(e.target.value);
                          setSelectedDoctor(null);
                          setSelectedSchedule(null);
                          setDoctorSchedules([]);
                        }}
                        style={inputStyle}
                    />
                    {filteredDoctors.length > 0 && (
                        <div style={dropdownStyle}>
                          {filteredDoctors.map(d => (
                              <div
                                  key={d.id}
                                  onClick={() => handleSelectDoctor(d)}
                                  style={dropdownItemStyle}
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                <strong>{d.name} {d.lastname}</strong>
                                {d.speciality && <span style={{ color: '#64748b', marginLeft: '8px', fontSize: '12px' }}>— {d.speciality}</span>}
                              </div>
                          ))}
                        </div>
                    )}
                    {selectedDoctor && (
                        <span style={{ fontSize: '11px', color: '#10b981', marginTop: '3px' }}>
                    Doctor seleccionado: ID #{selectedDoctor.id}
                  </span>
                    )}
                  </div>

                  {/* TIPO DE TRATAMIENTO */}
                  <div style={colStyle}>
                    <label style={labelStyle}>Tipo de Tratamiento</label>
                    <select value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)} style={inputStyle}>
                      <option value="Consulta General">Consulta General</option>
                      <option value="Ortodoncia">Ortodoncia</option>
                      <option value="Limpieza Dental">Limpieza Dental</option>
                      <option value="Diseño de Sonrisa">Diseño de Sonrisa</option>
                    </select>
                  </div>
                </div>

                {/* SELECTOR VISUAL DE HORARIOS */}
                {selectedDoctor && doctorSchedules.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ ...labelStyle, display: 'block', marginBottom: '10px' }}>Selecciona un Horario *</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {doctorSchedules.map(sch => (
                            <div
                                key={sch.id}
                                onClick={() => handleSelectSchedule(sch)}
                                style={{
                                  padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                                  border: selectedSchedule?.id === sch.id ? '2px solid #0077b6' : '2px solid #e2e8f0',
                                  backgroundColor: selectedSchedule?.id === sch.id ? '#e0f2fe' : '#f8fafc',
                                  color: selectedSchedule?.id === sch.id ? '#0077b6' : '#475569',
                                  fontWeight: selectedSchedule?.id === sch.id ? 'bold' : 'normal',
                                  minWidth: '130px'
                                }}
                            >
                              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{weekdayLabel[sch.weekday] || sch.weekday}</div>
                              <div style={{ fontSize: '12px', marginTop: '3px' }}>
                                {sch.startTime?.substring(0, 5)} - {sch.endTime?.substring(0, 5)}
                              </div>
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>ID #{sch.id}</div>
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                {selectedDoctor && doctorSchedules.length === 0 && (
                    <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '15px' }}>
                      Este doctor no tiene horarios disponibles registrados.
                    </p>
                )}

                {/* FECHA — solo si hay horario seleccionado */}
                {selectedSchedule && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                      <div style={colStyle}>
                        <label style={labelStyle}>
                          Fecha * <span style={{ color: '#64748b', fontWeight: 'normal' }}>(debe ser un {weekdayLabel[selectedSchedule.weekday]})</span>
                        </label>
                        <input
                            type="date"
                            value={date}
                            min={todayStr}
                            onChange={(e) => setDate(e.target.value)}
                            style={{
                              ...inputStyle,
                              borderColor: date && !isDateValidForSchedule(date) ? '#ef4444' : '#cbd5e1'
                            }}
                            required
                        />
                        {date && !isDateValidForSchedule(date) && (
                            <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '3px' }}>
                      Esta fecha no es un {weekdayLabel[selectedSchedule.weekday]}
                    </span>
                        )}
                        {date && isDateValidForSchedule(date) && (
                            <span style={{ fontSize: '11px', color: '#10b981', marginTop: '3px' }}>
                      Hora de la cita: {selectedSchedule.startTime?.substring(0, 5)} (hora de inicio del horario)
                    </span>
                        )}
                      </div>
                    </div>
                )}

                <button
                    type="submit"
                    style={{ backgroundColor: '#0077b6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}
                >
                  Reservar Espacio en Agenda
                </button>
              </form>
            </div>
        )}

        {/* CALENDARIO */}
        {viewMode === 'calendar' ? (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <button onClick={() => setCurrentWeekMonday(new Date("2026-06-22T00:00:00"))} style={{ backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '13px', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                  Semana Base
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={handlePrevWeek} style={{ padding: '6px 12px', backgroundColor: '#0077b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Anterior</button>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'capitalize', color: '#03045e', minWidth: '160px', textAlign: 'center' }}>{currentMonthLabel}</span>
                  <button onClick={handleNextWeek} style={{ padding: '6px 12px', backgroundColor: '#0077b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Siguiente</button>
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
                        const match = filteredAppointments.find(a => a.date === day.dateStr && a.time === slot && a.status !== 'cancelada');
                        const cardBgColor = (role === 'PATIENT' && match && match.status === 'pendiente') ? '#10b981' : '#0077b6';
                        return (
                            <div key={`${day.dateStr}-${slot}`} style={{ borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', padding: '4px', minHeight: '75px' }}>
                              {match ? (
                                  <div style={{ backgroundColor: cardBgColor, color: 'white', padding: '8px', borderRadius: '4px', fontSize: '11px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                      {role === 'PATIENT' ? (
                                          <>
                                            <strong>{match.dentistName}</strong>
                                            <span style={{ display: 'block', color: '#bae6fd', fontWeight: 'bold', marginTop: '2px' }}>{match.type}</span>
                                          </>
                                      ) : (
                                          <>
                                            <strong>{match.patientName}</strong>
                                            <span style={{ display: 'block', color: '#bae6fd' }}>{match.type}</span>
                                            <span style={{ display: 'block', color: '#cbd5e1', fontSize: '10px' }}>{match.dentistName}</span>
                                          </>
                                      )}
                                      {role === 'PATIENT' && match.status === 'pendiente' && match.price && (
                                          <span style={{ display: 'block', color: '#fed7aa', fontSize: '11px', fontWeight: 'bold', marginTop: '2px' }}>
                                ${match.price.toLocaleString()} COP
                              </span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '4px' }}>
                                      {role !== 'DOCTOR' && (
                                          <button onClick={() => handleCancel(match.id)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', textDecoration: 'underline', fontSize: '10px', padding: 0 }}>
                                            Eliminar
                                          </button>
                                      )}
                                    </div>
                                  </div>
                              ) : (
                                  role !== 'DOCTOR' && (
                                      <div style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '16px' }}>+</div>
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
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <thead>
                <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                  {role !== 'PATIENT' && <th style={{ padding: '12px' }}>ID</th>}
                  <th style={{ padding: '12px' }}>Dentista</th>
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
                      <td style={{ padding: '12px' }}><strong>{appointment.dentistName}</strong></td>
                      {role !== 'PATIENT' && <td style={{ padding: '12px' }}>{appointment.patientName}</td>}
                      <td style={{ padding: '12px' }}>{appointment.type}</td>
                      {role !== 'DOCTOR' && <td style={{ padding: '12px', color: '#0077b6', fontWeight: 'bold' }}>${appointment.price?.toLocaleString() || '0'} COP</td>}
                      <td style={{ padding: '12px' }}>{appointment.date} a las {appointment.time}</td>
                      <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: appointment.status === 'cancelada' ? '#fee2e2' : '#e0f2fe', color: appointment.status === 'cancelada' ? '#991b1b' : '#0369a1' }}>
                      {appointment.status.toUpperCase()}
                    </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {role !== 'DOCTOR' && (
                            <button onClick={() => handleCancel(appointment.id)} style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              Eliminar
                            </button>
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