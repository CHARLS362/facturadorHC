
import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  try {
    const pool = await getConnection();
    await pool.request()
      .input('IdProducto', sql.Int, parseInt(id as string))
      .query('DELETE FROM FacturacionHC.dbo.Producto WHERE IdProducto = @IdProducto');

    return res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({ error: 'Error al eliminar producto' });
  }
}
