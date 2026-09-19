import { MercadoPagoConfig, Payment } from 'mercadopago';

// Inicializa a SDK
const client = new MercadoPagoConfig({ 
  accessToken: 'APP_USR-7430180943099085-091811-2f4dc121b34762ea415943f3f1df04db-1745666103', 
  options: { timeout: 5000 } 
});
const payment = new Payment(client);

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { transaction_amount, token, description, installments, payment_method_id, issuer_id, payer } = req.body;
    
    const paymentData = {
      body: {
        transaction_amount: transaction_amount,
        token: token,
        description: description || 'Inscrição Semafis',
        installments: installments,
        payment_method_id: payment_method_id,
        issuer_id: issuer_id,
        payer: {
          email: payer.email,
          identification: payer.identification
            ? {
                type: payer.identification.type,
                number: payer.identification.number
              }
            : undefined
        }
      }
    };
    
    const response = await payment.create(paymentData);
    res.status(200).json(response);

  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    res.status(500).json({ error: error.message || 'Erro interno no servidor de pagamentos' });
  }
}
