import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT IdCliente, Nombre, NumeroDocumento, Direccion
      FROM Cliente
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar clientes' });
  }
}