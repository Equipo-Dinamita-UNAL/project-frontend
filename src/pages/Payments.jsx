import React, { useEffect, useState } from 'react';
import {
    getAllPayments, getPaymentsByPatient,
    createVirtualPayment, retryVirtualPayment,
    createPresentialPayment, updatePaymentStatus
} from '../api/paymentApi.js';
import { getAppointmentsByRole } from '../api/appointmentApi.js';
import { getRegisteredUsers } from '../api/AdminApi.js';
import { getReceiptByPayment, downloadReceiptPdf } from '../api/receiptApi.js';

export default function Payments({ userRole }) {
    const role = userRole ? userRole.toUpperCase() : '';
    const currentUserId = parseInt(localStorage.getItem('userId') || '1');

    const [transactions, setTransactions] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [filterStatus, setFilterStatus] = useState('TODOS');
    const [searchPatient, setSearchPatient] = useState('');
    const [loading, setLoading] = useState(false);

    // Mapa paymentId → receiptId (para saber qué pagos tienen recibo)
    const [receiptMap, setReceiptMap] = useState({});
    const [loadingReceipt, setLoadingReceipt] = useState(null);

    // Admin: formulario pago presencial
    const [appointmentSearch, setAppointmentSearch] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');

    const [paidAppointmentIds, setPaidAppointmentIds] = useState(new Set());
    const [pendingPaymentByAppointment, setPendingPaymentByAppointment] = useState({});

    const loadData = () => {
        setLoading(true);
        if (role === 'ADMINISTRATOR') {
            Promise.all([
                getAllPayments(),
                getAppointmentsByRole('ADMINISTRATOR', currentUserId),
                getRegisteredUsers()
            ]).then(([payments, appts]) => {
                const paymentList = Array.isArray(payments) ? payments : [];
                setTransactions(paymentList);
                setAppointments(Array.isArray(appts) ? appts : []);
                const paidIds = new Set(
                    paymentList.filter(p => p.status === 'PAGADO').map(p => p.appointmentId).filter(Boolean)
                );
                setPaidAppointmentIds(paidIds);
                // Cargar recibos para pagos PAGADO
                loadReceipts(paymentList.filter(p => p.status === 'PAGADO'));
            }).finally(() => setLoading(false));

        } else if (role === 'PATIENT') {
            Promise.all([
                getPaymentsByPatient(currentUserId),
                getAppointmentsByRole('PATIENT', currentUserId)
            ]).then(([payments, appts]) => {
                const paymentList = Array.isArray(payments) ? payments : [];
                setTransactions(paymentList);
                setAppointments(Array.isArray(appts) ? appts : []);
                const paidIds = new Set(
                    paymentList.filter(p => p.status === 'PAGADO').map(p => p.appointmentId).filter(Boolean)
                );
                setPaidAppointmentIds(paidIds);
                const pendingMap = {};
                paymentList
                    .filter(p => p.status === 'PENDIENTE' && p.appointmentId)
                    .forEach(p => { pendingMap[p.appointmentId] = p; });
                setPendingPaymentByAppointment(pendingMap);
                // Cargar recibos para pagos PAGADO
                loadReceipts(paymentList.filter(p => p.status === 'PAGADO'));
            }).finally(() => setLoading(false));
        }
    };

    // Cargar recibos en paralelo para todos los pagos pagados
    const loadReceipts = (paidPayments) => {
        if (!paidPayments.length) return;
        Promise.all(
            paidPayments.map(p =>
                getReceiptByPayment(p.id).then(receipt => ({ paymentId: p.id, receipt }))
            )
        ).then(results => {
            const map = {};
            results.forEach(({ paymentId, receipt }) => {
                if (receipt) map[paymentId] = receipt.id;
            });
            setReceiptMap(map);
        });
    };

    const handleDownloadReceipt = (paymentId) => {
        const receiptId = receiptMap[paymentId];
        if (!receiptId) {
            alert('Este pago aun no tiene recibo generado.');
            return;
        }
        setLoadingReceipt(paymentId);
        downloadReceiptPdf(receiptId)
            .catch(() => alert('No se pudo descargar el recibo.'))
            .finally(() => setLoadingReceipt(null));
    };

    useEffect(() => { loadData(); }, [role, currentUserId]);

    const unpaidAppointments = appointments.filter(app =>
        !paidAppointmentIds.has(app.id) && app.status !== 'cancelada'
    );

    const filteredAppointmentsForPayment = unpaidAppointments.filter(app => {
        if (!appointmentSearch.trim()) return true;
        const term = appointmentSearch.toLowerCase();
        return (app.patientName || '').toLowerCase().includes(term) ||
            app.id?.toString() === appointmentSearch.trim();
    });

    const filteredTransactions = transactions.filter(tx => {
        if (filterStatus !== 'TODOS' && tx.status !== filterStatus) return false;
        if (role === 'ADMINISTRATOR' && searchPatient.trim()) {
            const term = searchPatient.toLowerCase();
            const fullName = `${tx.patientName || ''} ${tx.patientLastname || ''}`.toLowerCase();
            return fullName.includes(term);
        }
        return true;
    });

    const handleVirtualPayment = (appointment) => {
        const doctorLabel = appointment.doctorName
            ? `Dr(a). ${appointment.doctorName}`
            : `Doctor #${appointment.doctorId}`;

        if (!window.confirm(`Pagar la cita #${appointment.id} con ${doctorLabel}? Se abrira MercadoPago en una nueva pestana.`)) return;

        const payload = {
            appointmentId: appointment.id,
            amount: appointment.price || 70000,
            method: 'MERCADO_PAGO'
        };

        createVirtualPayment(payload)
            .then(response => {
                if (response.checkoutUrl) window.open(response.checkoutUrl, '_blank');
                loadData();
            })
            .catch(err => alert(err.message || 'No se pudo iniciar el pago virtual.'));
    };

    const handleRetryPayment = (appointment) => {
        const existingPayment = pendingPaymentByAppointment[appointment.id];
        if (!existingPayment) return;

        retryVirtualPayment(existingPayment.id)
            .then(response => {
                if (response.checkoutUrl) window.open(response.checkoutUrl, '_blank');
                else alert('No se pudo regenerar el enlace de pago.');
            })
            .catch(err => alert(err.message || 'No se pudo reintentar el pago.'));
    };

    const handlePresentialPayment = (e) => {
        e.preventDefault();
        if (!selectedAppointment) { alert('Selecciona una cita.'); return; }
        const payload = {
            appointmentId: selectedAppointment.id,
            amount: selectedAppointment.price || 70000,
            method: paymentMethod
        };
        createPresentialPayment(payload)
            .then(() => {
                alert(`Pago presencial de la cita #${selectedAppointment.id} registrado.`);
                setSelectedAppointment(null);
                setAppointmentSearch('');
                setPaymentMethod('EFECTIVO');
                loadData();
            })
            .catch(err => alert(err.message || 'No se pudo registrar el pago.'));
    };

    const handleToggleStatus = (id, currentStatus) => {
        const nextStatus = currentStatus === 'PAGADO' ? 'PENDIENTE' : 'PAGADO';
        if (!window.confirm(`Cambiar estado del pago #${id} a ${nextStatus}?`)) return;
        updatePaymentStatus(id, nextStatus)
            .then(() => loadData())
            .catch(err => alert(err.message || 'Error al actualizar el estado.'));
    };

    const cardStyle = {
        backgroundColor: 'white', padding: '20px', borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px'
    };
    const statusColor = (status) => ({
        backgroundColor: status === 'PAGADO' ? '#d1fae5' : status === 'PENDIENTE' ? '#fef3c7' : '#fee2e2',
        color: status === 'PAGADO' ? '#065f46' : status === 'PENDIENTE' ? '#92400e' : '#991b1b'
    });

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Cargando informacion financiera...
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>

            {/* KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                <div style={{ ...cardStyle, marginBottom: 0, borderLeft: '4px solid #10b981' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {role === 'PATIENT' ? 'Total Pagado' : 'Ingresos Registrados'}
                    </span>
                    <h2 style={{ margin: '5px 0 0 0', color: '#0f172a', fontSize: '22px' }}>
                        ${transactions
                        .filter(t => t.status === 'PAGADO')
                        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
                        .toLocaleString()} COP
                    </h2>
                </div>
                <div style={{ ...cardStyle, marginBottom: 0, borderLeft: '4px solid #f59e0b' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {role === 'PATIENT' ? 'Citas Pendientes de Pago' : 'Transacciones Pendientes'}
                    </span>
                    <h2 style={{ margin: '5px 0 0 0', color: '#0f172a', fontSize: '22px' }}>
                        {role === 'PATIENT'
                            ? unpaidAppointments.length
                            : transactions.filter(t => t.status === 'PENDIENTE').length}
                    </h2>
                </div>
                {role === 'ADMINISTRATOR' && (
                    <div style={{ ...cardStyle, marginBottom: 0, borderLeft: '4px solid #0077b6' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Movimientos</span>
                        <h2 style={{ margin: '5px 0 0 0', color: '#0f172a', fontSize: '22px' }}>{transactions.length}</h2>
                    </div>
                )}
            </div>

            {/* CITAS PENDIENTES DE PAGO — PACIENTE */}
            {role === 'PATIENT' && (
                <div style={cardStyle}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#03045e' }}>
                        Citas Disponibles para Pagar
                    </h3>
                    {unpaidAppointments.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                            No tienes citas pendientes de pago en este momento.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {unpaidAppointments.map(app => {
                                const doctorLabel = app.doctorName
                                    ? `Dr(a). ${app.doctorName}`
                                    : app.dentistName || `Doctor #${app.doctorId}`;
                                const pendingPayment = pendingPaymentByAppointment[app.id];
                                const hasPending = !!pendingPayment;

                                return (
                                    <div key={app.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '15px', borderRadius: '8px', flexWrap: 'wrap', gap: '10px',
                                        border: hasPending ? '1px solid #fcd34d' : '1px solid #e2e8f0',
                                        backgroundColor: hasPending ? '#fffbeb' : '#f8fafc'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '12px', color: '#0077b6', fontWeight: 'bold' }}>
                                                    Cita #{app.id}
                                                </span>
                                                {hasPending && (
                                                    <span style={{
                                                        fontSize: '10px', fontWeight: 'bold',
                                                        backgroundColor: '#fef3c7', color: '#92400e',
                                                        padding: '2px 8px', borderRadius: '4px'
                                                    }}>
                                                        PAGO PENDIENTE
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#0f172a' }}>
                                                {doctorLabel}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                                {app.date} a las {app.time ? app.time.substring(0, 5) : ''} — {app.reason || app.type || 'Consulta'}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#0077b6', fontSize: '16px' }}>
                                                ${(app.price || 70000).toLocaleString()} COP
                                            </span>
                                            {hasPending ? (
                                                <button
                                                    onClick={() => handleRetryPayment(app)}
                                                    style={{
                                                        backgroundColor: '#f59e0b', color: 'white', border: 'none',
                                                        padding: '10px 18px', borderRadius: '6px', cursor: 'pointer',
                                                        fontWeight: 'bold', fontSize: '13px'
                                                    }}
                                                >
                                                    Reintentar Pago
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleVirtualPayment(app)}
                                                    style={{
                                                        backgroundColor: '#10b981', color: 'white', border: 'none',
                                                        padding: '10px 18px', borderRadius: '6px', cursor: 'pointer',
                                                        fontWeight: 'bold', fontSize: '13px'
                                                    }}
                                                >
                                                    Pagar con MercadoPago
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* FORMULARIO PAGO PRESENCIAL — ADMINISTRADOR */}
            {role === 'ADMINISTRATOR' && (
                <div style={cardStyle}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#03045e' }}>
                        Registrar Pago Presencial
                    </h3>
                    <form onSubmit={handlePresentialPayment}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                                Buscar Cita por Paciente o ID de Cita:
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Juan Garzon o 14"
                                value={appointmentSearch}
                                onChange={(e) => { setAppointmentSearch(e.target.value); setSelectedAppointment(null); }}
                                style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', maxWidth: '400px' }}
                            />
                        </div>

                        {appointmentSearch.trim() && (
                            <div style={{ marginBottom: '15px' }}>
                                {filteredAppointmentsForPayment.length === 0 ? (
                                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                                        No se encontraron citas pendientes de pago para ese criterio.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                                        {filteredAppointmentsForPayment.map(app => {
                                            const doctorLabel = app.doctorName
                                                ? `Dr(a). ${app.doctorName}`
                                                : app.dentistName || `Doctor #${app.doctorId}`;
                                            return (
                                                <div key={app.id} onClick={() => setSelectedAppointment(app)} style={{
                                                    padding: '12px', borderRadius: '6px', cursor: 'pointer',
                                                    border: selectedAppointment?.id === app.id ? '2px solid #0077b6' : '1px solid #e2e8f0',
                                                    backgroundColor: selectedAppointment?.id === app.id ? '#e0f2fe' : '#f8fafc',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0077b6' }}>Cita #{app.id}</span>
                                                        <p style={{ margin: '2px 0 0 0', fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>
                                                            {app.patientName || `Paciente #${app.patientId}`}
                                                        </p>
                                                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                                            {doctorLabel} — {app.date} — {app.reason || app.type}
                                                        </p>
                                                    </div>
                                                    <span style={{ fontWeight: 'bold', color: '#0077b6' }}>
                                                        ${(app.price || 70000).toLocaleString()} COP
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedAppointment && (
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '10px 14px' }}>
                                    <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 'bold', display: 'block' }}>CITA SELECCIONADA</span>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>
                                        #{selectedAppointment.id} — {selectedAppointment.patientName}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Metodo de Pago</label>
                                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                        <option value="EFECTIVO">Efectivo</option>
                                        <option value="TARJETA">Tarjeta Debito/Credito</option>
                                        <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                                    </select>
                                </div>
                                <button type="submit" style={{
                                    backgroundColor: '#0077b6', color: 'white', border: 'none',
                                    padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                                }}>
                                    Registrar Pago
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* HISTORIAL DE TRANSACCIONES */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#03045e' }}>
                        {role === 'PATIENT' ? 'Mis Pagos' : 'Libro de Caja General'}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {role === 'ADMINISTRATOR' && (
                            <input type="text" placeholder="Buscar por nombre de paciente..."
                                   value={searchPatient} onChange={(e) => setSearchPatient(e.target.value)}
                                   style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', width: '230px' }}
                            />
                        )}
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                            <option value="TODOS">Todos los estados</option>
                            <option value="PAGADO">Solo Pagados</option>
                            <option value="PENDIENTE">Solo Pendientes</option>
                            <option value="RECHAZADO">Solo Rechazados</option>
                        </select>
                        <button onClick={loadData} style={{
                            backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc',
                            padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                        }}>
                            Actualizar
                        </button>
                    </div>
                </div>

                {filteredTransactions.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
                        No hay transacciones que mostrar con los filtros actuales.
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>ID Pago</th>
                                <th style={{ padding: '12px' }}>Cita</th>
                                <th style={{ padding: '12px' }}>Paciente</th>
                                <th style={{ padding: '12px' }}>Monto</th>
                                <th style={{ padding: '12px' }}>Metodo</th>
                                <th style={{ padding: '12px' }}>Fecha</th>
                                <th style={{ padding: '12px' }}>Estado</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Recibo</th>
                                {role === 'ADMINISTRATOR' && <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTransactions.map(tx => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px' }}><strong>#{tx.id}</strong></td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>
                                        {tx.appointmentId ? `Cita #${tx.appointmentId}` : '—'}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {tx.patientName ? `${tx.patientName} ${tx.patientLastname || ''}` : '—'}
                                    </td>
                                    <td style={{ padding: '12px', color: '#0077b6', fontWeight: 'bold' }}>
                                        ${Number(tx.amount || 0).toLocaleString()} COP
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                            <span style={{ fontSize: '12px', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                                                {tx.method || '—'}
                                            </span>
                                    </td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>
                                        {tx.createdAt ? tx.createdAt.split('T')[0] : '—'}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', ...statusColor(tx.status) }}>
                                                {tx.status}
                                            </span>
                                    </td>
                                    {/* COLUMNA RECIBO */}
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {tx.status === 'PAGADO' ? (
                                            receiptMap[tx.id] ? (
                                                <button
                                                    onClick={() => handleDownloadReceipt(tx.id)}
                                                    disabled={loadingReceipt === tx.id}
                                                    style={{
                                                        backgroundColor: loadingReceipt === tx.id ? '#e2e8f0' : '#d1fae5',
                                                        color: '#065f46', border: '1px solid #6ee7b7',
                                                        padding: '5px 12px', borderRadius: '4px',
                                                        cursor: loadingReceipt === tx.id ? 'not-allowed' : 'pointer',
                                                        fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {loadingReceipt === tx.id ? 'Descargando...' : 'Descargar PDF'}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Generando...</span>
                                            )
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>—</span>
                                        )}
                                    </td>
                                    {role === 'ADMINISTRATOR' && (
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button onClick={() => handleToggleStatus(tx.id, tx.status)} style={{
                                                padding: '5px 12px', fontSize: '11px', border: '1px solid #cbd5e1',
                                                borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white',
                                                fontWeight: 'bold', color: '#475569'
                                            }}>
                                                Cambiar Estado
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}