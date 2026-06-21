import React, { useState, useEffect } from 'react';

export default function Payments({ userRole, selectedAppointmentId, clearSelectedId }) {
  const role = userRole ? userRole.toUpperCase() : '';

  // Base de datos de simulación (Mocks alineados a los IDs comunes del sistema)
  const [appointments, setAppointments] = useState([
    { id: 1, patientName: "Carlos Pérez", dentistName: "Dra. Maria Silva", reason: "Ortodoncia", price: 150000, status: "pendiente", date: "2026-06-25" },
    { id: 2, patientName: "Carlos Pérez", dentistName: "Dr. Alex Muñiz", reason: "Limpieza Dental", price: 100000, status: "pendiente", date: "2026-06-28" },
    { id: 3, patientName: "Ana Gómez", dentistName: "Dr. Alex Muñiz", reason: "Consulta General", price: 80000, status: "pendiente", date: "2026-06-24" }
  ]);

  const [paymentHistory, setPaymentHistory] = useState([
    { id: "TRX-9901", appointmentId: 95, patientName: "Carlos Pérez", reason: "Diseño de Sonrisa", amount: 800000, date: "2026-05-10", method: "TARJETA_CREDITO" },
    { id: "TRX-9902", appointmentId: 96, patientName: "Ana Gómez", reason: "Ortodoncia", amount: 150000, date: "2026-06-01", method: "TRANSFERENCIA_PSE" }
  ]);

  // Estados de formulario
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('TARJETA_CREDITO');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Estado de Rastreo del Administrador
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // EFECTO: Escucha de forma limpia la redirección externa externa
  useEffect(() => {
    if (selectedAppointmentId) {
      const target = appointments.find(app => app.id === Number(selectedAppointmentId));
      if (target) {
        setActiveAppointment(target);
        setPaymentSuccess(false);
      }
    }
  }, [selectedAppointmentId]);

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!activeAppointment) return;
    setIsProcessing(true);

    const backendPayload = {
      appointmentId: activeAppointment.id,
      paymentMethod: paymentMethod,
      amount: activeAppointment.price,
      transactionDate: new Date().toISOString().split('T')[0]
    };

    console.log("Payload enviado al endpoint /api/payments/process :", backendPayload);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      setAppointments(prev => prev.map(app => app.id === activeAppointment.id ? { ...app, status: 'pagado' } : app));
      setPaymentHistory(prev => [
        {
          id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
          appointmentId: activeAppointment.id,
          patientName: activeAppointment.patientName,
          reason: activeAppointment.reason,
          amount: activeAppointment.price,
          date: new Date().toISOString().split('T')[0],
          method: paymentMethod
        },
        ...prev
      ]);

      if (clearSelectedId) clearSelectedId();
    }, 2000);
  };

  const handleResetForm = () => {
    setPaymentSuccess(false);
    setActiveAppointment(null);
    if (clearSelectedId) clearSelectedId();
  };

  // ==================== VISTA PACIENTES ====================
  if (role === 'PATIENT') {
    const myPendingAppointments = appointments.filter(app => app.patientName === "Carlos Pérez" && app.status === "pendiente");
    const myHistory = paymentHistory.filter(pay => pay.patientName === "Carlos Pérez");

    return (
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ color: '#03045e', marginBottom: '20px' }}>💳 Mi Gestión de Pagos y Facturas</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Columna Izquierda: Selección y Formulario */}
          <div>
            {!activeAppointment ? (
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Escoge una Obligación Pendiente</h3>
                {myPendingAppointments.length === 0 ? (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No tienes cobros pendientes en este momento. ¡Estás al día!</p>
                ) : (
                  myPendingAppointments.map(app => (
                    <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '10px' }}>
                      <div>
                        <strong style={{ display: 'block' }}>{app.reason}</strong>
                        <small style={{ color: '#64748b' }}>Fecha: {app.date} | #{app.id}</small>
                      </div>
                      <button onClick={() => setActiveAppointment(app)} className="btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Pagar (${app.price.toLocaleString()})
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : paymentSuccess ? (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '40px' }}>✅</span>
                <h3 style={{ color: '#065f46', marginTop: '10px' }}>Transacción Exitosa</h3>
                <p style={{ fontSize: '14px', color: '#047857' }}>La cita #{activeAppointment.id} ha sido aprobada por la entidad financiera.</p>
                <button onClick={handleResetForm} className="btn" style={{ marginTop: '15px', backgroundColor: '#065f46', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Volver a mis cuentas
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Pasarela de Pago</h3>
                  <button onClick={handleResetForm} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>❌ Cancelar</button>
                </div>
                <p style={{ fontSize: '14px', margin: '0 0 15px 0', background: '#f8fafc', padding: '10px', borderRadius: '4px', lineHeight: '1.4' }}>
                  Estás pagando: <strong>{activeAppointment.reason}</strong> por un valor de <strong style={{ color: '#1e40af' }}>${activeAppointment.price.toLocaleString()} COP</strong>.
                </p>
                <form onSubmit={handleProcessPayment}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Franquicia / Método</label>
                    <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <option value="TARJETA_CREDITO">Tarjeta de Crédito Bancaria</option>
                      <option value="TRANSFERENCIA_PSE">PSE - Cuenta de Ahorros / Corriente</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Número de Tarjeta o Identificación</label>
                    <input type="text" className="form-control" placeholder="Valores numéricos obligatorios" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <button type="submit" disabled={isProcessing} style={{ width: '100%', padding: '10px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                    {isProcessing ? 'Procesando con el Banco...' : 'Confirmar Pago Directo'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Columna Derecha: Historial del Paciente */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Historial de Pagos Emitidos</h3>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {myHistory.map(pay => (
                <div key={pay.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'block' }}>{pay.reason}</span>
                    <small style={{ color: '#94a3b8' }}>{pay.date} | Ref: {pay.id}</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#16a34a', fontWeight: 'bold', display: 'block' }}>+ ${pay.amount.toLocaleString()}</span>
                    <small style={{ fontSize: '10px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{pay.method}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== VISTA ADMINISTRADORES ====================
  const filteredHistory = paymentHistory.filter(p => 
    p.patientName.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  const totalRecaudado = paymentHistory.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: '#03045e', margin: 0 }}>📊 Auditoría Financiera y Rastreo de Clientes</h2>
        <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold' }}>
          Total Recaudado en Caja: ${totalRecaudado.toLocaleString()} COP
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', color: '#475569' }}>🔍 Rastrear Cliente / Paciente:</span>
        <input 
          type="text" 
          placeholder="Escribe el nombre del paciente (Ej. Carlos Pérez)..." 
          value={adminSearchQuery}
          onChange={(e) => setAdminSearchQuery(e.target.value)}
          style={{ padding: '8px', width: '350px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
        />
        {adminSearchQuery && <button onClick={() => setAdminSearchQuery('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Limpiar Filtro</button>}
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>Reporte Consolidado de Transacciones</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '12px' }}>ID Transacción</th>
              <th style={{ padding: '12px' }}>Paciente Auditado</th>
              <th style={{ padding: '12px' }}>Tratamiento Liquidado</th>
              <th style={{ padding: '12px' }}>Fecha de Pago</th>
              <th style={{ padding: '12px' }}>Canal</th>
              <th style={{ padding: '12px' }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No se encontraron registros financieros para este criterio de búsqueda.</td>
              </tr>
            ) : (
              filteredHistory.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>{p.id}</td>
                  <td style={{ padding: '12px' }}><strong>{p.patientName}</strong></td>
                  <td style={{ padding: '12px' }}>{p.reason}</td>
                  <td style={{ padding: '12px' }}>{p.date}</td>
                  <td style={{ padding: '12px' }}><span style={{ fontSize: '11px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>{p.method}</span></td>
                  <td style={{ padding: '12px', color: '#16a34a', fontWeight: 'bold' }}>${p.amount.toLocaleString()} COP</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}