import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/drive'];

async function testFolder() {
  try {
    const keyPath = path.join(__dirname, 'credentials.json');
    const auth = new google.auth.GoogleAuth({
      scopes: SCOPES,
      keyFile: keyPath,
    });

    const drive = google.drive({ version: 'v3', auth });
    const folderId = '1_rHGRJVTrPCTx0cWqPO48cH-nR8iP7Fy';

    console.log('Verificando acesso a pasta:', folderId);
    
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, capabilities'
    });

    console.log('Acesso OK. Pasta:', response.data.name);
    console.log('Capacidades:', response.data.capabilities);
  } catch (error) {
    console.error('Falha ao acessar pasta:');
    console.error(error.message);
  }
}

testFolder();
