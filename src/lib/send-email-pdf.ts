// lib/send-email-pdf.ts
import nodemailer from 'nodemailer';

type EmailParams = {
  email: string;
  fileName: string;
  attachment: Buffer;
};

export async function sendVentaPdfEmail({ email, fileName, attachment }: EmailParams) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'condoriherbert61@gmail.com',
        pass: 'wprs lgdv mlix rnql',
    },
  });

  const mailOptions = {
    from: '"Tu empresa" <noreply@tuempresa.com>',
    to: email,
    subject: 'Tu comprobante de venta',
    text: 'Adjunto encontrarás el documento PDF de tu venta.',
    attachments: [
      {
        filename: fileName,
        content: attachment,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}
