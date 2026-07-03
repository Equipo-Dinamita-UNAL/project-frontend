// src/api/paymentApi.js

const PAYMENT_BASE_URL = 'http://localhost:8080/api/payment';
const RECEIPT_BASE_URL = 'http://localhost:8080/api/receipts';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 1. Obtener todos los pagos (solo ADMINISTRATOR)
export const getAllPayments = async () => {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener el historial de caja');
    return await response.json();
  } catch (error) {
    console.error("Error en getAllPayments:", error);
    return [];
  }
};

// 2. Obtener pagos de un paciente específico
export const getPaymentsByPatient = async (patientId) => {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}/patient/${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener los pagos del paciente');
    return await response.json();
  } catch (error) {
    console.error("Error en getPaymentsByPatient:", error);
    return [];
  }
};

// 3. Crear Pago Virtual (PATIENT → redirige a MercadoPago)
export const createVirtualPayment = async (paymentData) => {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}/virtual`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.descripcion || 'Error en pasarela de pago virtual';
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en createVirtualPayment:", error);
    throw error;
  }
};

// 4. Reintentar pago virtual existente (pago PENDIENTE ya creado)
// Regenera el checkoutUrl de MercadoPago sin crear un nuevo registro
export const retryVirtualPayment = async (paymentId) => {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}/${paymentId}/retry`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.descripcion || 'Error al reintentar el pago';
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en retryVirtualPayment:", error);
    throw error;
  }
};

// 5. Registrar Pago Presencial (ADMINISTRATOR)
export const createPresentialPayment = async (paymentData) => {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}/presencial`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.descripcion || 'Error al registrar pago presencial';
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en createPresentialPayment:", error);
    throw error;
  }
};

// 6. Cambiar Estado del Pago (ADMINISTRATOR) — envía texto plano según el @RequestBody String del controller
export const updatePaymentStatus = async (id, statusText) => {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}/${id}/estado`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'text/plain'
      },
      body: statusText
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.descripcion || 'Error al actualizar estado';
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en updatePaymentStatus:", error);
    throw error;
  }
};

// 7. Descargar PDF del Recibo
export const downloadReceiptPdf = async (receiptId) => {
  try {
    const response = await fetch(`${RECEIPT_BASE_URL}/${receiptId}/pdf`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('No se pudo generar el archivo PDF');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Factura_OdontoGate_#${receiptId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error("Error descargando el PDF:", error);
    alert('Ocurrió un error al procesar la descarga de la factura.');
  }
};