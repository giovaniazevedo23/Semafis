import emailjs from '@emailjs/browser';

// =====================================================================
// INSTRUÇÕES PARA O EMAILJS
// =====================================================================
// 1. Crie uma conta no site https://www.emailjs.com/
// 2. Vá em "Email Services" e adicione o Gmail. Anote o "Service ID".
// 3. Vá em "Email Templates", crie um template com o seguinte corpo:
// 
//    Assunto: {{title}}
//    Corpo:
//    Olá,
//    {{message}}
// 
// 4. Salve o template e anote o "Template ID".
// 5. Vá em "Account" (no menu principal) -> "API Keys". Anote a "Public Key".
// 6. Substitua os valores abaixo pelas suas chaves!
// =====================================================================

const EMAILJS_SERVICE_ID = "service_gtl7xmn"; 
const EMAILJS_TEMPLATE_ID = "template_qy4jq2q";
const EMAILJS_PUBLIC_KEY = "mNLHg4WMPI_KmzA8c";

export const sendEmailNotification = async (toEmail, toName, title, message) => {
  try {
    const templateParams = {
      to_email: toEmail,
      to_name: toName || 'Participante',
      title: title,
      message: message
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    console.log('E-mail enviado com sucesso via EmailJS!', response.status, response.text);
    return true;
  } catch (error) {
    console.error('Falha ao enviar e-mail via EmailJS:', error);
    return false;
  }
};
