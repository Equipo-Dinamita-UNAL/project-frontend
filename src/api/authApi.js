// Cuentas de prueba simuladas mapeando los UserType de tu backend
const mockUsers = [
  { email: "admin@odontogate.com", password: "password123", userType: "ADMINISTRATOR" },
  { email: "doctor@odontogate.com", password: "password123", userType: "DOCTOR" },
  { email: "paciente@odontogate.com", password: "password123", userType: "PATIENT" }
];

// POST /api/login
export const loginRequest = (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );

      if (user) {
        // Retorna exactamente lo que manda tu LoginResponse en Java
        resolve({ userType: user.userType });
      } else {
        reject(new Error("Credenciales incorrectas. Inténtalo de nuevo."));
      }
    }, 400);
  });
};