import { getMockAppointments, getMockAppointmentById } from './appointmentMock';

// Cambia esto a false cuando el backend esté corriendo
const USE_MOCK = true;
const BASE = 'http://localhost:8080/api/appointments';

export async function getAllAppointments() {
    if (USE_MOCK) return getMockAppointments();
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Error al obtener citas');
    return res.json();
}

export async function getAppointmentsByPatient(patientId) {
    if (USE_MOCK) return getMockAppointments().filter(a => a.patientId === patientId);
    const res = await fetch(`${BASE}/patient/${patientId}`);
    if (!res.ok) throw new Error('Error al obtener citas del paciente');
    return res.json();
}

export async function getAppointmentsByDoctor(doctorId) {
    if (USE_MOCK) return getMockAppointments().filter(a => a.doctorId === doctorId);
    const res = await fetch(`${BASE}/doctor/${doctorId}`);
    if (!res.ok) throw new Error('Error al obtener citas del doctor');
    return res.json();
}

export async function createAppointment(data) {
    if (USE_MOCK) {
        const mock = getMockAppointments();
        return { ...data, id: mock.length + 1, patientName: 'Paciente (mock)', doctorName: 'Doctor (mock)' };
    }
    const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear cita');
    return res.json();
}

export async function updateAppointment(id, data) {
    if (USE_MOCK) return { ...data, id, patientName: 'Paciente (mock)', doctorName: 'Doctor (mock)' };
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar cita');
    return res.json();
}

export async function cancelAppointment(id) {
    if (USE_MOCK) return { id, status: 'CANCELADA' };
    const res = await fetch(`${BASE}/${id}/cancel`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Error al cancelar cita');
    return res.json();
}

export async function deleteAppointment(id) {
    if (USE_MOCK) return true;
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar cita');
    return true;
}