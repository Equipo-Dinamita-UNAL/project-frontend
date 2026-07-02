import React, { useEffect, useState } from 'react';
import { getAllPayments, createVirtualPayment, createPresentialPayment, updatePaymentStatus, downloadReceiptPdf } from '../api/paymentApi.js';

export default function Payments({ userRole }) {
  const role = userRole ? userRole.toUpperCase() : '';
  const currentUserId = localStorage.getItem('userId') || '1';

  const [transactions, setTransactions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('TODOS');

  // Estados para simular o procesar nuevos cobros
  const [appointmentId, setAppointmentId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');

  // Cargar el historial real del backend
  const loadFinancialData = () => {
    getAllPayments()
        .then(data => {
          // Mapeamos de forma segura la lista que retorna el backend
          if (Array.isArray(data)) {
            setTransactions(data);
          } else {
            setTransactions([]);
          }
        })
        .catch(err => {
          console.error("Error al cargar caja general:", err);
          setTransactions([]);
        });
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  // Filtrado reactivo e inmediato en pantalla
  const filteredTransactions = transactions.filter(t => {
    if (filterStatus !== 'TODOS' && t.status !== filterStatus) return false;
    return true;
  });

  const handleRegisterPayment = (e) => {
    e.preventDefault();
    if (!appointmentId || !amount) return;

    const paymentRequest = {
      appointmentId: parseInt(appointmentId),
      amount: parseFloat(amount),
      method: paymentMethod
    };

    // Si es Administrador procesa presencial, si es Paciente genera link virtual
    const action = role === 'ADMINISTRATOR' ? createPresentialPayment : createVirtualPayment;

    action(paymentRequest)
        .then(() => {
          alert('Transacción financiera registrada correctamente en el libro de caja.');
          loadFinancialData();
          setAppointmentId('');
          setAmount('');
        })
        .catch(err => alert('No se pudo asentar el pago. Revisa que el ID de la cita sea válido.'));
  };

  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'PAGADO' ? 'RECHAZADO' : 'PAGADO';
    updatePaymentStatus(id, nextStatus)
        .then(() => {
          alert(`Estado de transacción #${id} modificado a ${nextStatus}.`);
          loadFinancialData();
        })
        .catch(err => alert('Error al actualizar el estado de la transacción'));
  };

  return (
      <div className="payments-page" style={{ padding: '20px' }}>

        {/* SECCIÓN DE RESUMEN EJECUTIVO (KPI CARDS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Ingresos Registrados</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#0f172a' }}>
              ${transactions.filter(t => t.status === 'PAGADO').reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()} COP
            </h2>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Transacciones Pendientes</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#0f172a' }}>
              {transactions.filter(t => t.status === 'PENDIENTE').length} Ops
            </h2>
          </div>
        </div>

        {/* FILTROS DE VISTA FINANCIERA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Filtrar Libro:</label>
            <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            >
              <option value="TODOS">Ver todos los movimientos</option>
              <option value="PAGADO">Solo transacciones Pagadas</option>
              <option value="PENDIENTE">Solo transacciones Pendientes</option>
              <option value="RECHAZADO">Solo transacciones Rechazadas</option>
            </select>
          </div>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>Caja General Activa</span>
        </div>

        {/* FORMULARIO DE ACCIÓN DE CAJA (Oculto para Doctores) */}
        {role !== 'DOCTOR' && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#03045e' }}>
                {role === 'ADMINISTRATOR' ? 'Registrar Recibo de Caja Presencial' : 'Realizar Pago Virtual de Cita'}
              </h3>
              <form onSubmit={handleRegisterPayment} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Número de Cita (ID) *</label>
                  <input type="number" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} placeholder="Ej: 14" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Monto Total ($ COP) *</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} placeholder="Ej: 85000" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Método de Pago</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    <option value="EFECTIVO">Efectivo 💵</option>
                    <option value="TARJETA">Tarjeta Débito/Crédito 💳</option>
                    <option value="TRANSFERENCIA">Transferencia Virtual 💻</option>
                  </select>
                </div>
                <button type="submit" style={{ backgroundColor: '#0077b6', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {role === 'ADMINISTRATOR' ? 'Asentar Movimiento' : 'Proceder al Pago'}
                </button>
              </form>
            </div>
        )}

        {/* TABLA PRINCIPAL DE MOVIMIENTOS CONTABLES */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '12px' }}>ID Operación</th>
              <th style={{ padding: '12px' }}>ID Cita</th>
              <th style={{ padding: '12px' }}>Monto Bruto</th>
              <th style={{ padding: '12px' }}>Método</th>
              <th style={{ padding: '12px' }}>Fecha Registro</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones / Comprobantes</th>
            </tr>
            </thead>
            <tbody>
            {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No se han detectado transacciones financieras en este libro contable.</td>
                </tr>
            ) : (
                filteredTransactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}><strong>#{tx.id}</strong></td>
                      <td style={{ padding: '12px' }}>Cita #{tx.appointmentId}</td>
                      <td style={{ padding: '12px', color: '#0077b6', fontWeight: 'bold' }}>${tx.amount?.toLocaleString()} COP</td>
                      <td style={{ padding: '12px' }}><span style={{ fontSize: '12px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{tx.method}</span></td>
                      <td style={{ padding: '12px' }}>{tx.paymentDate ? tx.paymentDate.split('T')[0] : 'Presencial'}</td>
                      <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: tx.status === 'PAGADO' ? '#d1fae5' : tx.status === 'PENDIENTE' ? '#fef3c7' : '#fee2e2',
                      color: tx.status === 'PAGADO' ? '#065f46' : tx.status === 'PENDIENTE' ? '#92400e' : '#991b1b'
                    }}>
                      {tx.status}
                    </span>
                      </td>
                      <td style={{ padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {role === 'ADMINISTRATOR' && (
                            <button
                                onClick={() => handleToggleStatus(tx.id, tx.status)}
                                style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white' }}
                            >
                              Cambiar Estado
                            </button>
                        )}
                        {tx.status === 'PAGADO' && (
                            <button
                                onClick={() => downloadReceiptPdf(tx.id)}
                                style={{ padding: '4px 10px', fontSize: '11px', color: 'white', backgroundColor: '#10b981', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              📄 Descargar Factura PDF
                            </button>
                        )}
                      </td>
                    </tr>
                ))
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
}