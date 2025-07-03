// src/lib/send-email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'condoriherbert61@gmail.com',
    pass: 'wprs lgdv mlix rnql',
  },
});

export async function sendResetCode(email: string, code: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Factura HC" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Tu código de recuperación',
      html: `<p>Tu código de recuperación es: <strong>${code}</strong></p>`,
    });

    console.log('Correo enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
}
