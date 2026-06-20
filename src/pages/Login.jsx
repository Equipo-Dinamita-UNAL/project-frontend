import { useState } from 'react';
import { loginRequest } from '../api/authApi';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    loginRequest({ email, password })
      .then((response) => {
        // Pasamos el tipo de usuario al estado global de App
        onLoginSuccess(response.userType);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'white', padding: '40px', borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '360px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#03045e', margin: 0, fontSize: '28px' }}>OdontoGate</h1>
          <p style={{ color: '#0077b6', marginTop: '5px' }}>Gestión Odontológica Profesional</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffe3e3', color: '#e63946', padding: '10px',
            borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#495057', fontSize: '14px', fontWeight: 'bold' }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="ejemplo@odontogate.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#495057', fontSize: '14px', fontWeight: 'bold' }}>
              Contraseña
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
            Iniciar Sesión
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#6c757d' }}>
          <p style={{ margin: '5px 0' }}>💡 <strong>Cuentas demo:</strong></p>
          <p style={{ margin: 0 }}>admin@odontogate.com / doctor@odontogate.com / paciente@odontogate.com</p>
          <p style={{ margin: '3px 0 0 0' }}>Clave: <code>password123</code></p>
        </div>
      </div>
    </div>
  );
}