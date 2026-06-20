import React, { useState } from 'react';

export default function Schedules() {
  const [schedules, setSchedules] = useState([
    { id: 1, dentistName: "Dr. Alex Muñiz", day: "LUNES", startTime: "08:00", endTime: "12:00" },
    { id: 2, dentistName: "Dra. Maria Silva", day: "MIÉRCOLES", startTime: "14:00", endTime: "18:00" }
  ]);

  // Estados del formulario
  const [dentistName, setDentistName] = useState('');
  const [day, setDay] = useState('Lunes');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!dentistName || !startTime || !endTime) {
      alert("Por favor, selecciona un doctor y completa las horas.");
      return;
    }

    const newSchedule = {
      id: schedules.length + 1,
      dentistName: dentistName, // Guardamos el enlace con el doctor
      day: day.toUpperCase(),
      startTime: startTime,
      endTime: endTime
    };

    // Aquí llamarías a tu API del backend: postSchedule(newSchedule)
    setSchedules([...schedules, newSchedule]);
    
    // Limpiar campos
    setDentistName('');
    setStartTime('');
    setEndTime('');
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>Registrar Nuevo Horario de Atención (Modo Admin)</h2>
      
      <form onSubmit={handleAddSchedule} style={{ marginTop: '20px' }}>
        {/* SELECCIÓN DEL DOCTOR (Campo que te falta añadir 🦷) */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Seleccionar Doctor *</label>
          <select 
            value={dentistName} 
            onChange={(e) => setDentistName(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            required
          >
            <option value="">-- Selecciona un Especialista --</option>
            <option value="Dr. Alex Muñiz">Dr. Alex Muñiz (Endodoncia)</option>
            <option value="Dra. Maria Silva">Dra. Maria Silva (Ortodoncia)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Día de la semana</label>
          <select value={day} onChange={(e) => setDay(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Hora de Inicio</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Hora de Fin</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
        </div>

        <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}>
          Agregar Horario
        </button>
      </form>

      {/* Tu tabla de abajo debe incluir una columna para mostrar a qué doctor le pertenece */}
      <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Doctor</th>
            <th style={{ padding: '10px' }}>Día de la Semana</th>
            <th style={{ padding: '10px' }}>Hora de Inicio</th>
            <th style={{ padding: '10px' }}>Hora de Fin</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px' }}>#{s.id}</td>
              <td style={{ padding: '10px' }}><strong>{s.dentistName}</strong></td>
              <td style={{ padding: '10px' }}>{s.day}</td>
              <td style={{ padding: '10px' }}>{s.startTime}</td>
              <td style={{ padding: '10px' }}>{s.endTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}