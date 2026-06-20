export function getMockSchedules() {
    return [
        {
            id: 1,
            doctorName: "Dra. Laura Martínez",
            weekday: "LUNES",
            startTime: "08:00",
            endTime: "12:00",
            isAvailable: true
        },
        {
            id: 2,
            doctorName: "Dra. Laura Martínez",
            weekday: "MIÉRCOLES",
            startTime: "14:00",
            endTime: "18:00",
            isAvailable: true
        },
        {
            id: 3,
            doctorName: "Dr. Carlos Pérez",
            weekday: "MARTES",
            startTime: "09:00",
            endTime: "13:00",
            isAvailable: false
        },
        {
            id: 4,
            doctorName: "Dr. Carlos Pérez",
            weekday: "JUEVES",
            startTime: "10:00",
            endTime: "14:00",
            isAvailable: true
        },
        {
            id: 5,
            doctorName: "Dra. Ana Gómez",
            weekday: "VIERNES",
            startTime: "07:00",
            endTime: "11:00",
            isAvailable: true
        }
    ];
}

export function getMockScheduleById(id) {
    return getMockSchedules().find(s => s.id === id) || null;
}