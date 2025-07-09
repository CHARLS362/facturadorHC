
import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection();

  if (req.method === 'GET') {
    try {
      const result = await pool.request().query(`
        SELECT IdAlmacen, Nombre, Direccion, Estado FROM Almacen
      `);
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener almacenes:', error);
      res.status(500).json({ error: 'Error al obtener los almacenes' });
    }
  } else if (req.method === 'POST') {
    const { Nombre, Direccion, Estado } = req.body;
    if (!Nombre || !Direccion) {
      return res.status(400).json({ error: 'Nombre y Dirección son requeridos' });
    }

    try {
      await pool.request()
        .input('Nombre', sql.NVarChar, Nombre)
        .input('Direccion', sql.NVarChar, Direccion)
        .input('Estado', sql.Bit, Estado ?? 1)
        .query(`
          INSERT INTO Almacen (Nombre, Direccion, Estado)
          VALUES (@Nombre, @Direccion, @Estado)
        `);
      res.status(201).json({ message: 'Almacén creado correctamente' });
    } catch (error) {
      console.error('Error al crear almacén:', error);
      res.status(500).json({ error: 'Error al crear el almacén' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
