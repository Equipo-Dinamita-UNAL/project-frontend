import React, { useState } from 'react';

export default function Payments({ userRole }) {
  const role = userRole ? userRole.toUpperCase() : '';

  // --- ESTADOS DE LA VISTA DEL PACIENTE ---
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Datos simulados de lo que debe el paciente logueado ("Carlos Pérez")
  const patientInvoice = {
    id: "INV-2026-089",
    concept: "Tratamiento de Ortodoncia ✨ - Ajuste Mensual",
    doctor: "Dr. Alex Muñiz",
    amount: 45.00,
    status: "Pendiente"
  };

  // --- ESTADOS DE LA VISTA DEL ADMINISTRADOR (Tu base actual) ---
  const [adminPayments, setAdminPayments] = useState([
    { id: 1, patientName: "Carlos Pérez", amount: 45.00, status: "Pendiente", concept: "Ortodoncia" },
    { id: 2, patientName: "Ana Gómez", amount: 30.00, status: "Pagado", concept: "Limpieza Dental" }
  ]);

  // Manejador del pago simulado del paciente
  const handlePatientPaymentSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simular una pasarela de pago (2 segundos de espera)
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      patientInvoice.status = "Pagado";
    }, 2000);
  };


  // ==========================================
  // INTERFAZ 1: ROL PACIENTE (Segura y Limpia)
  // ==========================================
  if (role === 'PATIENT') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ color: '#03045e', marginBottom: '20px' }}>💳 Pasarela de Pago Seguro</h2>
        
        {paymentSuccess ? (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '50px' }}>✅</span>
            <h3 style={{ color: '#065f46', marginTop: '10px' }}>¡Pago Realizado con Éxito!</h3>
            <p style={{ color: '#047857', fontSize: '14px', marginTop: '5px' }}>
              Tu saldo para la factura <strong>{patientInvoice.id}</strong> ha sido liquidado.
            </p>
            <div style={{ marginTop: '20px', padding: '10px', background: 'white', borderRadius: '4px', border: '1px dashed #10b981', display: 'inline-block' }}>
              <small>Código de autorización: <strong>ODONTO-{Math.floor(Math.random() * 90000) + 10000}</strong></small>
            </div>
          </div>
        ) : (
          <div>
            {/* Resumen del Cobro */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px', borderLeft: '5px solid #0077b6' }}>
              <h4 style={{ margin: 0, color: '#475569', fontSize: '14px', textTransform: 'uppercase' }}>Resumen de Cuenta</h4>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0 5px 0' }}>{patientInvoice.concept}</p>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>Atendido por: {patientInvoice.doctor}</span>
              <hr style={{ border: 0, borderTop: '1px solid #f1f5f9', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Total a pagar:</span>
                <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>${patientInvoice.amount.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Formulario de Tarjeta Bancaria */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#1e293b' }}>Información de Pago</h4>
              <form onSubmit={handlePatientPaymentSubmit}>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nombre en la Tarjeta</label>
                  <input type="text" placeholder="Ej. Carlos Pérez" value={cardName} onChange={(e) => setCardName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Número de Tarjeta</label>
                  <input type="text" maxLength="16" placeholder="4111 2222 3333 4444" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', letterSpacing: '2px' }} required />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Vencimiento</label>
                    <input type="text" maxLength="5" placeholder="MM/AA" value={expiry} onChange={(e) => setExpiry(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>CVV / CVC</label>
                    <input type="password" maxLength="3" placeholder="***" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }} required />
                  </div>
                </div>

                <button type="submit" disabled={isProcessing} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                  {isProcessing ? '🔄 Procesando Pago Seguro...' : `Pagar $${patientInvoice.amount.toFixed(2)} USD`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // INTERFAZ 2: ADMINISTRADOR / DOCTOR (Completa)
  // ==========================================
  return (
    <div className="payments-admin-page">
      <h2>Panel Administrativo de Cuentas por Cobrar</h2>
      <p style={{ color: '#64748b', marginBottom: '25px' }}>Rol: <strong>{role}</strong></p>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3>Historial Global de Transacciones Financieras</h3>
        <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID Transacción</th>
              <th style={{ padding: '12px' }}>Paciente</th>
              <th style={{ padding: '12px' }}>Concepto</th>
              <th style={{ padding: '12px' }}>Monto</th>
              <th style={{ padding: '12px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {adminPayments.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>#TRX-00{p.id}</td>
                <td style={{ padding: '12px' }}><strong>{p.patientName}</strong></td>
                <td style={{ padding: '12px' }}>{p.concept}</td>
                <td style={{ padding: '12px' }}>${p.amount.toFixed(2)}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ backgroundColor: p.status === 'Pagado' ? '#d1fae5' : '#fee2e2', color: p.status === 'Pagado' ? '#065f46' : '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}