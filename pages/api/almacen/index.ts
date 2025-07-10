import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '../../../src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const pool = await getConnection();

    if (req.method === 'GET') {
        try {
            const result = await pool.request().query('SELECT * FROM Almacen ORDER BY Nombre');
            res.status(200).json(result.recordset);
        } catch (error) {
            console.error('API Error fetching warehouses:', error);
            res.status(500).json({ error: 'Error al obtener los almacenes.' });
        }
    } else if (req.method === 'POST') {
        const { Nombre, Direccion } = req.body;
        try {
            const result = await pool.request()
                .input('Nombre', sql.NVarChar, Nombre)
                .input('Direccion', sql.NVarChar, Direccion)
                .input('Estado', sql.Bit, 1) // Default to active
                .query('INSERT INTO Almacen (Nombre, Direccion, Estado) OUTPUT INSERTED.* VALUES (@Nombre, @Direccion, @Estado)');
            res.status(201).json(result.recordset[0]);
        } catch (error) {
            console.error('API Error creating warehouse:', error);
            res.status(500).json({ error: 'Error al crear el almacén.' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
