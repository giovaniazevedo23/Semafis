import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function testDrive() {
  try {
    const keyPath = path.join(__dirname, 'credentials.json');
    console.log('Verificando arquivo de chaves em:', keyPath);
    if (!fs.existsSync(keyPath)) {
      console.error('ERRO: credentials.json não encontrado na raiz!');
      process.exit(1);
    }

    const auth = new google.auth.GoogleAuth({
      scopes: SCOPES,
      keyFile: keyPath,
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('Autenticação bem sucedida. Tentando criar um arquivo de teste...');
    
    const response = await drive.files.create({
      requestBody: {
        name: 'teste_upload.txt',
        parents: ['1_rHGRJVTrPCTx0cWqPO48cH-nR8iP7Fy']
      },
      media: {
        mimeType: 'text/plain',
        body: 'Este é um teste de upload gerado pelo sistema.',
      },
      fields: 'id, webViewLink',
    });

    console.log('Sucesso! Arquivo criado com ID:', response.data.id);
    console.log('Link:', response.data.webViewLink);
  } catch (error) {
    console.error('Falha no teste do Google Drive:');
    console.error(error);
  }
}

testDrive();
