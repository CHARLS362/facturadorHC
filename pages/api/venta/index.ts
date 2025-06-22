import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
        SELECT 
          IdVenta,
          IdComprobante,
          IdCliente,
          IdFormaPago,
          FechaVenta,
          Total,
          Estado
        FROM dbo.dbo.Ventas
      `);
      return res.status(200).json(result.recordset);
        } catch (error: any) {
        console.error('Error al registrar venta:', error);
        return res.status(500).json({ error: error.message || 'Error al registrar venta' });
        }
  }

  if (req.method === 'POST') {
    const { IdComprobante, IdCliente, IdFormaPago, FechaVenta, Total, Estado } = req.body;

    if (
      !IdComprobante ||
      !IdCliente ||
      !IdFormaPago ||
      !FechaVenta ||
      Total === undefined ||
      !Estado
    ) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
      const pool = await getConnection();
      await pool.request()
        .input('IdComprobante', sql.Int, IdComprobante)
        .input('IdCliente', sql.Int, IdCliente)
        .input('IdFormaPago', sql.Int, IdFormaPago)
        .input('FechaVenta', sql.DateTime, FechaVenta)
        .input('Total', sql.Decimal(18, 2), Total)
        .input('Estado', sql.VarChar(20), Estado)
        .query(`
          INSERT INTO dbo.Ventas
            (IdComprobante, IdCliente, IdFormaPago, FechaVenta, Total, Estado)
          VALUES
            (@IdComprobante, @IdCliente, @IdFormaPago, @FechaVenta, @Total, @Estado)
        `);

      return res.status(201).json({ mensaje: 'Venta registrada correctamente' });
    } catch (error) {
      console.error('Error al registrar venta:', error);
      return res.status(500).json({ error: 'Error al registrar venta' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}