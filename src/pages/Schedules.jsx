import { useEffect, useState } from 'react';
import { getAllSchedules } from '../api/scheduleApi';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [weekday, setWeekday] = useState('Lunes');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    getAllSchedules().then(data => {
      setSchedules(data);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      alert('Por favor, ingresa la hora de inicio y de fin.');
      return;
    }
    if (startTime >= endTime) {
      alert('La hora de inicio no puede ser mayor o igual a la hora de fin.');
      return;
    }
    const newSchedule = {
      id: schedules.length + 1,
      weekday: weekday,
      startTime: startTime,
      endTime: endTime
    };
    setSchedules([...schedules, newSchedule]);
    setStartTime('');
    setEndTime('');
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este horario médico?')) {
      const filtered = schedules.filter(sch => sch.id !== id);
      setSchedules(filtered);
    }
  };

  return (
    <div className="schedules-page">
      {/* Formulario Estilizado */}
      <div className="form-container">
        <h3>Registrar Nuevo Horario de Atención (Modo Admin)</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Día de la semana</label>
              <select value={weekday} onChange={(e) => setWeekday(e.target.value)} className="form-control">
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hora de Inicio</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="form-control" />
            </div>
            <div className="form-group">
              <label>Hora de Fin</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="form-control" />
            </div>
          </div>
          <button type="submit" className="btn" style={{ backgroundColor: '#28a745', color: 'white' }}>
            Agregar Horario
          </button>
        </form>
      </div>

      {/* Tabla Estilizada */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Día de la Semana</th>
              <th>Hora de Inicio</th>
              <th>Hora de Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td><strong>#{schedule.id}</strong></td>
                <td>{schedule.weekday}</td>
                <td>{schedule.startTime}</td>
                <td>{schedule.endTime}</td>
                <td>
                  <button onClick={() => handleDelete(schedule.id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}