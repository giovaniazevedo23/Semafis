const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializa a SDK com o Access Token enviado pelo usuário
const client = new MercadoPagoConfig({ 
  accessToken: 'APP_USR-8650725683690446-091811-b03d7fd4b8f7d55684ed38ad4a89e4fe-3687145010' 
});
const payment = new Payment(client);

app.post('/process_payment', async (req, res) => {
  try {
    const { transaction_amount, token, description, installments, payment_method_id, issuer_id, payer } = req.body;
    
    // Configura os dados base exigidos pelo Mercado Pago
    const paymentData = {
      body: {
        transaction_amount: transaction_amount,
        token: token,
        description: description || 'Inscrição EventFlow',
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
    
    console.log("Processando pagamento real para: ", payer.email, " Valor: R$", transaction_amount);
    
    // Faz a chamada oficial de criação do pagamento na API do Mercado Pago
    const response = await payment.create(paymentData);
    
    console.log("Pagamento processado. Status:", response.status);
    res.status(200).json(response);

  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    res.status(500).json({ error: error.message || 'Erro interno no servidor de pagamentos' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor de Pagamentos do Mercado Pago rodando na porta ${PORT}`);
});
