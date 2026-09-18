import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    
    const response = await payment.create(paymentData);
    res.status(200).json(response);

  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    res.status(500).json({ error: error.message || 'Erro interno no servidor de pagamentos' });
  }
});

// Servir os arquivos estáticos do React (Frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// Redirecionar todas as outras requisições para o index.html (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Porta dinâmica para Render ou local
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor unificado rodando na porta ${PORT}`);
});
