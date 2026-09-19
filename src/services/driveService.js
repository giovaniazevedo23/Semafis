export const uploadToDrive = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload_to_drive', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro no upload para o Drive');
    }

    return data.webViewLink; // URL do arquivo público no Drive
  } catch (error) {
    console.error('Erro no driveService:', error);
    throw error;
  }
};
