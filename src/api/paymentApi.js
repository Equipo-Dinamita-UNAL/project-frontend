// Datos simulados iniciales basados en PaymentResponse
let mockPayments = [
  {
    id: 1,
    amount: 150000.00,
    method: "Tarjeta de Crédito",
    status: "PAGADO",
    gatewayReference: "REF-99887722",
    createdAt: "2026-06-18T09:15:00",
    patientName: "Carlos",
    patientLastname: "Pérez"
  },
  {
    id: 2,
    amount: 85000.00,
    method: "Efectivo",
    status: "PENDIENTE",
    gatewayReference: null,
    createdAt: "2026-06-19T14:30:00",
    patientName: "Ana",
    patientLastname: "Gómez"
  }
];

// Comprobantes emitidos asociados a un paymentId
let mockReceipts = {
  1: {
    id: 501,
    receiptNumber: "FAC-2026-0001",
    type: "Factura Electrónica",
    pdfUrl: "https://odontogate.com/receipts/fac-0001.pdf",
    issueDate: "2026-06-18T09:20:00",
    createdAt: "2026-06-18T09:20:00"
  }
};

// GET /api/payment (Ver todos los pagos)
export const getAllPayments = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockPayments]), 300);
  });
};

// POST /api/payment (Crear pago)
export const createPayment = (paymentRequest) => {
  return new Promise((resolve) => {
    const newPayment = {
      id: mockPayments.length + 1,
      amount: parseFloat(paymentRequest.amount),
      method: paymentRequest.method,
      status: "PENDIENTE",
      gatewayReference: paymentRequest.method === "Efectivo" ? null : "REF-" + Math.floor(Math.random() * 90000000 + 10000000),
      createdAt: new Date().toISOString(),
      patientName: "Paciente", // Simulación de datos cruzados
      patientLastname: "Nuevo #" + paymentRequest.appointmentId 
    };
    mockPayments = [newPayment, ...mockPayments];
    setTimeout(() => resolve(newPayment), 300);
  });
};

// PUT /api/payment/{id}/estado (Actualizar estado)
export const updatePaymentStatus = (id, newStatus) => {
  return new Promise((resolve) => {
    mockPayments = mockPayments.map(pay => {
      if (pay.id === id) {
        return { ...pay, status: newStatus };
      }
      return pay;
    });
    const updated = mockPayments.find(pay => pay.id === id);
    setTimeout(() => resolve(updated), 200);
  });
};

// POST /receipts (Generar comprobante)
export const createReceipt = (receiptRequest) => {
  return new Promise((resolve) => {
    const randomId = Math.floor(Math.random() * 1000 + 100);
    const newReceipt = {
      id: randomId,
      receiptNumber: `REC-2026-${randomId}`,
      type: receiptRequest.type,
      pdfUrl: `https://odontogate.com/receipts/rec-${randomId}.pdf`,
      issueDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    mockReceipts[receiptRequest.paymentId] = newReceipt;
    setTimeout(() => resolve(newReceipt), 300);
  });
};

// GET /receipts/pago/{paymentId}
export const getReceiptByPayment = (paymentId) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockReceipts[paymentId] || null), 200);
  });
};