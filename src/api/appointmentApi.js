let mockAppointments = [
  { id: 1, patientName: "Carlos Pérez", dentistName: "Dr. Alex Muñiz", date: "2026-06-22", time: "09:00", status: "Programada" },
  { id: 2, patientName: "Ana Gómez", dentistName: "Dr. Alex Muñiz", date: "2026-06-24", time: "11:00", status: "Programada" },
  { id: 3, patientName: "Carlos Pérez", dentistName: "Dra. Maria Silva", date: "2026-06-23", time: "14:00", status: "Programada" }
];

export const getAllAppointments = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockAppointments]), 200);
  });
};