import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const pool = await getConnection();

    await pool.request()
      .input('Email', email)
      .input('Password', password)
      .query(`
        UPDATE Usuario
        SET Password = @Password
        WHERE Email = @Email
      `);

    return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar la contraseña' });
  }
}
