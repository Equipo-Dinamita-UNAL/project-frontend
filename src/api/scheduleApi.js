import { getMockSchedules, getMockScheduleById } from './scheduleMock';

// Cambia esto a false cuando el backend esté corriendo
const USE_MOCK = true;
const BASE = 'http://localhost:8080/api/schedules';

export async function getAllSchedules() {
    if (USE_MOCK) return getMockSchedules();
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Error al obtener horarios');
    return res.json();
}

export async function getSchedulesByDoctor(doctorId) {
    if (USE_MOCK) return getMockSchedules().filter(s => s.doctorId === doctorId);
    const res = await fetch(`${BASE}/doctor/${doctorId}`);
    if (!res.ok) throw new Error('Error al obtener horarios del doctor');
    return res.json();
}

export async function createSchedule(data) {
    if (USE_MOCK) {
        const mock = getMockSchedules();
        return { ...data, id: mock.length + 1, doctorName: 'Doctor (mock)' };
    }
    const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear horario');
    return res.json();
}

export async function updateSchedule(id, data) {
    if (USE_MOCK) return { ...data, id, doctorName: 'Doctor (mock)' };
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar horario');
    return res.json();
}

export async function deleteSchedule(id) {
    if (USE_MOCK) return true;
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar horario');
    return true;
}

export async function setScheduleAvailable(id, value) {
    if (USE_MOCK) return { id, isAvailable: value };
    const res = await fetch(`${BASE}/${id}/available?value=${value}`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Error al cambiar disponibilidad');
    return res.json();
}