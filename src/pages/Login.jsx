import React, { useState } from 'react';
import { loginUser, registerUser } from '../api/authApi';

export default function Login({ onLoginSuccess }) {
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    // Estados para Login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Estados para Registro
    const [regName, setRegName] = useState('');
    const [regLastname, setRegLastname] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPhone, setRegPhone] = useState('');
    // CORRECCIÓN: Estado inicial cambiado a minúsculas para coincidir con la base de datos
    const [regRole, setRegRole] = useState('patient');

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) return;

        loginUser(email, password)
            .then((data) => {
                alert(`¡Bienvenido de nuevo, ${data.name || 'Usuario'}!`);
                if (onLoginSuccess) {
                    onLoginSuccess(data.role, data.userId);
                }
            })
            .catch((err) => {
                // Mostramos el mensaje real que envía el backend (ej: cuenta
                // desactivada) en vez de un mensaje genérico de credenciales.
                alert(err.message || 'Error de autenticación. Verifica tu correo electrónico y contraseña.');
            });
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (!regName || !regLastname || !regEmail || !regPassword) {
            alert('Por favor completa todos los campos obligatorios (*)');
            return;
        }

        const payload = {
            name: regName,
            lastname: regLastname,
            email: regEmail,
            password: regPassword,
            phone: regPhone,
            userType: regRole.toUpperCase()
        };

        registerUser(payload)
            .then(() => {
                alert('¡Cuenta creada con éxito! Ya puedes iniciar sesión con tus credenciales.');
                setIsRegisterMode(false);
                setEmail(regEmail);
                setPassword('');
            })
            .catch((err) => {
                alert(err.message || 'Hubo un error al procesar el registro.');
            });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f8fafc' }}>
            <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' }}>

                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, color: '#03045e', fontSize: '26px' }}>OdontoGate 🦷</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                        {isRegisterMode ? 'Crea tu cuenta en la plataforma clínica' : 'Accede de forma segura a tu panel médico'}
                    </p>
                </div>

                {!isRegisterMode ? (
                    /* FORMULARIO DE LOGIN */
                    <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Correo Electrónico</label>
                            <input type="email" placeholder="ejemplo@odontogate.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Contraseña</label>
                            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                        </div>

                        <button type="submit" style={{ backgroundColor: '#0077b6', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', marginTop: '5px' }}>
                            Ingresar al Sistema
                        </button>
                    </form>
                ) : (
                    /* FORMULARIO DE REGISTRO */
                    <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Nombre *</label>
                                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Apellido *</label>
                                <input type="text" value={regLastname} onChange={(e) => setRegLastname(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Correo Electrónico *</label>
                            <input type="email" placeholder="nombre@correo.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Contraseña de Acceso *</label>
                            <input type="password" placeholder="Mínimo 6 caracteres" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Teléfono de Contacto</label>
                            <input type="text" placeholder="Ej: 3001234567" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        </div>

                        {/* CORRECCIÓN: Los values de las opciones ahora están exactamente en minúsculas */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Rol Asignado</label>
                            <select value={regRole} onChange={(e) => setRegRole(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                <option value="patient">Paciente 👤</option>
                                <option value="doctor">Odontólogo / Especialista 🥼</option>
                                <option value="administrator">Administrador de Clínica 👑</option>
                            </select>
                        </div>

                        <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
                            Crear Cuenta Nueva
                        </button>
                    </form>
                )}

                {/* INTERRUPTOR DE MODO (LOGIN / REGISTRO) */}
                <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                    <button
                        onClick={() => setIsRegisterMode(!isRegisterMode)}
                        style={{ background: 'none', border: 'none', color: '#0077b6', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline' }}
                    >
                        {isRegisterMode ? '¿Ya tienes una cuenta? Inicia sesión aquí' : '¿No tienes cuenta en la clínica? Regístrate aquí'}
                    </button>
                </div>

            </div>
        </div>
    );
}
