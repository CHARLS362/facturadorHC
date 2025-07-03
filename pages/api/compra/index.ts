import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection();

  if (req.method === 'GET') {
    try {
      const result = await pool.request().query(`
        SELECT 
          Compra_id, 
          CONVERT(varchar, Fecha, 23) as Fecha, 
          Proveedor, 
          Total, 
          Estado 
        FROM Compras
        ORDER BY Fecha DESC
      `);
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener compras' });
    }
  } else if (req.method === 'POST') {
    const { Fecha, Proveedor, Total, Estado } = req.body;
    if (!Fecha || !Proveedor || !Total || !Estado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
      const countResult = await pool.request().query('SELECT COUNT(*) as total FROM Compras');
      const totalCompras = countResult.recordset[0].total;
      const nextNumber = (totalCompras + 1).toString().padStart(3, '0'); // 001, 002, etc.
      const Compra_id = `COMP${nextNumber}`;

      await pool.request()
        .input('Compra_id', Compra_id)
        .input('Fecha', Fecha)
        .input('Proveedor', Proveedor)
        .input('Total', Total)
        .input('Estado', Estado)
        .query(`
          INSERT INTO Compras (Compra_id, Fecha, Proveedor, Total, Estado)
          VALUES (@Compra_id, @Fecha, @Proveedor, @Total, @Estado)
        `);
      res.status(201).json({ message: 'Compra registrada correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar compra' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}