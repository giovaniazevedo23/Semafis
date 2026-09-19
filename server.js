import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { google } from 'googleapis';
import stream from 'stream';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Inicializa a SDK com o Access Token enviado pelo usuário
const client = new MercadoPagoConfig({ 
  accessToken: 'APP_USR-7430180943099085-091811-2f4dc121b34762ea415943f3f1df04db-1745666103', 
  options: { timeout: 5000 } 
});
const payment = new Payment(client);

app.post('/api/process_payment', async (req, res) => {
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

// Configuração de upload via Google Drive API
const upload = multer({ storage: multer.memoryStorage() });
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getDriveService() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    keyFile: 'credentials.json', // Arquivo de credenciais baixado do Google Cloud
  });
  return google.drive({ version: 'v3', auth });
}

app.post('/api/upload_to_drive', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const drive = await getDriveService();
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const driveResponse = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream,
      },
      fields: 'id, webViewLink',
    });

    const fileId = driveResponse.data.id;

    // Torna o arquivo público (leitura)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    res.status(200).json({ 
      success: true, 
      fileId: fileId,
      webViewLink: driveResponse.data.webViewLink 
    });

  } catch (error) {
    console.error('Erro no upload para o Google Drive:', error);
    res.status(500).json({ error: error.message || 'Erro ao enviar arquivo para o Drive.' });
  }
});

// Servir os arquivos estáticos do React (Frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// Redirecionar todas as outras requisições para o index.html (React Router)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Porta dinâmica para Render ou local
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor unificado rodando na porta ${PORT}`);
});
