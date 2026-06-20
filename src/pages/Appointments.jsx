import { useEffect, useState } from 'react';
import { getAllAppointments } from '../api/appointmentApi';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patient, setPatient] = useState('');
  const [dentist, setDentist] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    getAllAppointments().then(data => {
      setAppointments(data);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patient || !dentist || !date || !time) {
      alert('Por favor, completa todos los campos');
      return;
    }
    if (date < todayStr) {
      alert('No puedes registrar una cita en una fecha pasada.');
      return;
    }
    const newAppointment = {
      id: appointments.length + 1,
      patientName: patient,
      dentistName: dentist,
      date: date,
      time: time,
      status: 'Programada'
    };
    setAppointments([newAppointment, ...appointments]);
    setPatient('');
    setDentist('');
    setDate('');
    setTime('');
  };

  const handleCancel = (id) => {
    const updatedAppointments = appointments.map(app => {
      if (app.id === id) {
        return { ...app, status: 'Cancelada' };
      }
      return app;
    });
    setAppointments(updatedAppointments);
  };

  return (
    <div className="appointments-page">
      {/* Formulario Estilizado */}
      <div className="form-container">
        <h3>Registrar Nueva Cita Médica</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Paciente</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Nombre del Paciente" 
                value={patient} 
                onChange={(e) => setPatient(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Dentista asignado</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Nombre del Dentista" 
                value={dentist} 
                onChange={(e) => setDentist(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Fecha de la Cita</label>
              <input 
                type="date" 
                className="form-control"
                value={date} 
                min={todayStr}
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input 
                type="time" 
                className="form-control"
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Guardar Cita</button>
        </form>
      </div>

      {/* Tabla Estilizada */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Paciente</th>
              <th>Dentista</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td><strong>#{appointment.id}</strong></td>
                <td>{appointment.patientName || appointment.patient}</td>
                <td>{appointment.dentistName || appointment.dentist}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>
                  <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </td>
                <td>
                  {appointment.status !== 'Cancelada' ? (
                    <button onClick={() => handleCancel(appointment.id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>
                      Cancelar
                    </button>
                  ) : (
                    <span style={{ color: '#6c757d', fontStyle: 'italic', fontSize: '13px' }}>Inactiva</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}