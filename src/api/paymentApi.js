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

// 1. Obtener todos los pagos (Caja General para Administrador)
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

// 2. Crear Pago Virtual (Paciente)
export const createVirtualPayment = async (paymentData) => {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}/virtual`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) throw new Error('Error en pasarela de pago virtual');
    return await response.json();
  } catch (error) {
    console.error("Error en createVirtualPayment:", error);
    throw error;
  }
};

// 3. Registrar Pago Presencial (Administrador)
export const createPresentialPayment = async (paymentData) => {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}/presencial`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) throw new Error('Error al registrar pago en efectivo/tarjeta');
    return await response.json();
  } catch (error) {
    console.error("Error en createPresentialPayment:", error);
    throw error;
  }
};

// 4. Cambiar Estado del Pago (Administrador)
export const updatePaymentStatus = async (id, statusText) => {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}/${id}/estado`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: statusText // Envía el texto plano según tu controlador (@RequestBody String status)
    });
    if (!response.ok) throw new Error('Error al actualizar estado financiero');
    return await response.json();
  } catch (error) {
    console.error("Error en updatePaymentStatus:", error);
    throw error;
  }
};

// 5. Descargar PDF del Recibo/Factura (Manejo de Bytes crudos de Spring Boot)
export const downloadReceiptPdf = async (receiptId) => {
  try {
    const response = await fetch(`${RECEIPT_BASE_URL}/${receiptId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('No se pudo generar el archivo PDF');

    // Convertir la respuesta a un blob físico ejecutable en navegador
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
    alert('Ocurrió un error al procesar la descarga de la factura física.');
  }
};