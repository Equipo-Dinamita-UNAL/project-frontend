import React, { useState, useEffect } from 'react';
import { getAllSchedules, getSchedulesByDoctor, createSchedule, toggleScheduleAvailability, deleteSchedule } from '../api/ScheduleApi';
import { getRegisteredUsers } from '../api/userApi';

export default function Schedules({ userRole }) {
    const role = userRole ? userRole.toUpperCase() : '';
    const currentUserId = localStorage.getItem('userId') || '1';

    const [schedules, setSchedules] = useState([]);
    const [weekday, setWeekday] = useState('MONDAY');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Estados buscador de doctor
    const [allDoctors, setAllDoctors] = useState([]);
    const [doctorSearch, setDoctorSearch] = useState('');
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const loadSchedules = () => {
        const apiCall = role === 'DOCTOR' ? () => getSchedulesByDoctor(currentUserId) : getAllSchedules;
        apiCall()
            .then(data => setSchedules(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error cargando agenda:", err));
    };

    useEffect(() => {
        loadSchedules();
        if (role === 'ADMINISTRATOR') {
            getRegisteredUsers().then(data => setAllDoctors(data.doctors || []));
        }
    }, [role]);

    // Filtrar doctores mientras escribe
    useEffect(() => {
        if (!doctorSearch.trim()) { setFilteredDoctors([]); return; }
        const term = doctorSearch.toLowerCase();
        setFilteredDoctors(
            allDoctors.filter(d => `${d.name} ${d.lastname}`.toLowerCase().includes(term)).slice(0, 5)
        );
    }, [doctorSearch, allDoctors]);

    const handleSelectDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setDoctorSearch(`${doctor.name} ${doctor.lastname}`);
        setFilteredDoctors([]);
    };

    const handleCreateSchedule = (e) => {
        e.preventDefault();
        if (role === 'ADMINISTRATOR' && !selectedDoctor) {
            alert('Selecciona un doctor de la lista.');
            return;
        }
        if (!weekday || !startTime || !endTime) return;

        const payload = {
            doctorId: role === 'DOCTOR' ? parseInt(currentUserId) : selectedDoctor.id,
            weekday,
            startTime,
            endTime,
            isAvailable: true
        };

        createSchedule(payload)
            .then(() => {
                alert('Franja horaria guardada con exito!');
                setWeekday('MONDAY');
                setStartTime('');
                setEndTime('');
                setSelectedDoctor(null);
                setDoctorSearch('');
                loadSchedules();
            })
            .catch(() => alert('No se pudo asentar la franja horaria. Revisa los datos.'));
    };

    const handleToggle = (id, currentAvailable) => {
        toggleScheduleAvailability(id, !currentAvailable)
            .then(() => {
                alert('Estado de disponibilidad modificado.');
                loadSchedules();
            })
            .catch(() => alert('No se pudo actualizar el estado de la franja.'));
    };

    const handleDelete = (id) => {
        if (!window.confirm('Seguro que deseas eliminar este horario?')) return;
        deleteSchedule(id)
            .then(() => {
                alert('Horario eliminado correctamente.');
                loadSchedules();
            })
            .catch(() => alert('No se pudo eliminar el horario.'));
    };

    const weekdayLabel = {
        MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miercoles',
        THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sabado'
    };

    const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%' };
    const colStyle = { display: 'flex', flexDirection: 'column', position: 'relative' };
    const labelStyle = { fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' };
    const dropdownStyle = {
        position: 'absolute', top: '100%', left: 0, right: 0,
        backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px',
        zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '2px'
    };
    const refreshButtonStyle = {
        backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc',
        padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
    };

    return (
        <div style={{ padding: '20px' }}>

            {role !== 'PATIENT' && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#03045e' }}>Habilitar Nueva Disponibilidad Medica</h3>
                    <form onSubmit={handleCreateSchedule}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', alignItems: 'flex-end', marginBottom: '15px' }}>

                            {/* BUSCADOR DE DOCTOR */}
                            {role === 'ADMINISTRATOR' && (
                                <div style={colStyle}>
                                    <label style={labelStyle}>Buscar Doctor *</label>
                                    <input
                                        type="text"
                                        placeholder="Escribe el nombre del doctor..."
                                        value={doctorSearch}
                                        onChange={(e) => {
                                            setDoctorSearch(e.target.value);
                                            setSelectedDoctor(null);
                                        }}
                                        style={inputStyle}
                                        required
                                    />
                                    {filteredDoctors.length > 0 && (
                                        <div style={dropdownStyle}>
                                            {filteredDoctors.map(d => (
                                                <div
                                                    key={d.id}
                                                    onClick={() => handleSelectDoctor(d)}
                                                    style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}
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
                            )}

                            <div style={colStyle}>
                                <label style={labelStyle}>Dia de la Semana</label>
                                <select value={weekday} onChange={(e) => setWeekday(e.target.value)} style={inputStyle}>
                                    <option value="MONDAY">Lunes</option>
                                    <option value="TUESDAY">Martes</option>
                                    <option value="WEDNESDAY">Miercoles</option>
                                    <option value="THURSDAY">Jueves</option>
                                    <option value="FRIDAY">Viernes</option>
                                    <option value="SATURDAY">Sabado</option>
                                </select>
                            </div>

                            <div style={colStyle}>
                                <label style={labelStyle}>Hora Inicio</label>
                                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} required />
                            </div>

                            <div style={colStyle}>
                                <label style={labelStyle}>Hora Fin</label>
                                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} required />
                            </div>

                            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', height: '36px' }}>
                                Abrir Turno
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#03045e' }}>
                        {role === 'DOCTOR' ? 'Mi Agenda Medica Planificada' : 'Turnos de Atencion Disponibles'}
                    </h3>
                    <button onClick={loadSchedules} style={refreshButtonStyle}>Actualizar Lista</button>
                </div>

                {schedules.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', padding: '25px' }}>No hay turnos planificados en agenda actualmente.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
                        {schedules.map((sch) => (
                            <div key={sch.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>CUPO #{sch.id}</span>
                                        <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: sch.isAvailable ? '#d1fae5' : '#fee2e2', color: sch.isAvailable ? '#065f46' : '#991b1b' }}>
                                            {sch.isAvailable ? 'Disponible' : 'Bloqueado'}
                                        </span>
                                    </div>
                                    <h4 style={{ margin: '5px 0', color: '#0f172a' }}>{weekdayLabel[sch.weekday] || sch.weekday}</h4>
                                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>
                                        {sch.startTime?.substring(0, 5)} - {sch.endTime?.substring(0, 5)}
                                    </p>
                                    {role !== 'DOCTOR' && (
                                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#0077b6', fontWeight: 'bold' }}>
                                            {sch.doctorName}
                                        </p>
                                    )}
                                </div>

                                {role !== 'PATIENT' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                                        <button
                                            onClick={() => handleToggle(sch.id, sch.isAvailable)}
                                            style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white', fontWeight: 'bold', color: sch.isAvailable ? '#ef4444' : '#10b981' }}
                                        >
                                            {sch.isAvailable ? 'Bloquear Turno' : 'Habilitar Turno'}
                                        </button>
                                        {role === 'ADMINISTRATOR' && (
                                            <button
                                                onClick={() => handleDelete(sch.id)}
                                                style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fee2e2', fontWeight: 'bold', color: '#991b1b' }}
                                            >
                                                Eliminar Horario
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}