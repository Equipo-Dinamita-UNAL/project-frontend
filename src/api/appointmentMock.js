export function getMockAppointments() {
    return [
        {
            id: 1,
            patientName: "Juan Rodríguez",
            doctorName: "Dra. Laura Martínez",
            date: "2026-06-20",
            time: "09:00",
            status: "PENDIENTE",
            reason: "Limpieza dental de rutina"
        },
        {
            id: 2,
            patientName: "María Salcedo",
            doctorName: "Dr. Carlos Pérez",
            date: "2026-06-21",
            time: "10:30",
            status: "CONFIRMADA",
            reason: "Dolor en muela del juicio"
        },
        {
            id: 3,
            patientName: "Pedro Arias",
            doctorName: "Dra. Ana Gómez",
            date: "2026-06-22",
            time: "08:00",
            status: "CANCELADA",
            reason: "Revisión de ortodoncia"
        },
        {
            id: 4,
            patientName: "Sofía Torres",
            doctorName: "Dra. Laura Martínez",
            date: "2026-06-25",
            time: "11:00",
            status: "PENDIENTE",
            reason: "Extracción de pieza 28"
        },
        {
            id: 5,
            patientName: "Andrés López",
            doctorName: "Dr. Carlos Pérez",
            date: "2026-06-26",
            time: "14:00",
            status: "CONFIRMADA",
            reason: "Control post-operatorio"
        }
    ];
}

export function getMockAppointmentById(id) {
    return getMockAppointments().find(a => a.id === id) || null;
}