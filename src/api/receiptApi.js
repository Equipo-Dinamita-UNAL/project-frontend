// src/api/receiptApi.js

const RECEIPT_BASE_URL = 'http://localhost:8080/api/receipts';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Obtener recibo por ID de pago
export const getReceiptByPayment = async (paymentId) => {
    try {
        const response = await fetch(`${RECEIPT_BASE_URL}/pago/${paymentId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error en getReceiptByPayment:", error);
        return null;
    }
};

// Descargar PDF del recibo
export const downloadReceiptPdf = async (receiptId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${RECEIPT_BASE_URL}/${receiptId}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });
        if (!response.ok) throw new Error('No se pudo descargar el recibo');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${receiptId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error en downloadReceiptPdf:", error);
        throw error;
    }
};