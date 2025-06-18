import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { correo, password } = req.body;

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('correo', correo)
      .input('password', password)
      .query('SELECT * FROM facturacion.dbo.usuarios WHERE correo = @correo AND password = @password');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.recordset[0];
    res.status(200).json({ mensaje: 'Login exitoso', usuario });
  } catch (error) {
    console.error('Error interno del servidor:', error);

    return res.status(500).json({
      error: 'Ocurrió un error inesperado. Por favor, intenta más tarde.',
    });
  }
}
