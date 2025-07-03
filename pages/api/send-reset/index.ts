import type { NextApiRequest, NextApiResponse } from 'next';
import { sendResetCode } from '@/lib/send-email'; // ruta correcta

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  const { email, code } = req.body;
  
  try {
    await sendResetCode(email, code);
    return res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al enviar correo', error });
  }
}

