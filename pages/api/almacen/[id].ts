import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '../../../src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const pool = await getConnection();

    if (req.method === 'GET') {
        try {
            const result = await pool.request()
                .input('IdAlmacen', sql.Int, id)
                .query('SELECT * FROM Almacen WHERE IdAlmacen = @IdAlmacen');
            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Almacén no encontrado.' });
            }
            res.status(200).json(result.recordset[0]);
        } catch (error) {
            console.error(`API Error fetching warehouse ${id}:`, error);
            res.status(500).json({ error: 'Error al obtener el almacén.' });
        }
    } else if (req.method === 'PUT') {
        const { Nombre, Direccion, Estado } = req.body;
        try {
            const result = await pool.request()
                .input('IdAlmacen', sql.Int, id)
                .input('Nombre', sql.NVarChar, Nombre)
                .input('Direccion', sql.NVarChar, Direccion)
                .input('Estado', sql.Bit, Estado)
                .query('UPDATE Almacen SET Nombre = @Nombre, Direccion = @Direccion, Estado = @Estado WHERE IdAlmacen = @IdAlmacen');
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Almacén no encontrado.' });
            }
            res.status(200).json({ message: 'Almacén actualizado correctamente.' });
        } catch (error) {
            console.error(`API Error updating warehouse ${id}:`, error);
            res.status(500).json({ error: 'Error al actualizar el almacén.' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const result = await pool.request()
                .input('IdAlmacen', sql.Int, id)
                .query('DELETE FROM Almacen WHERE IdAlmacen = @IdAlmacen');
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Almacén no encontrado.' });
            }
            res.status(200).json({ message: 'Almacén eliminado correctamente.' });
        } catch (error) {
            console.error(`API Error deleting warehouse ${id}:`, error);
            res.status(500).json({ error: 'Error al eliminar el almacén.' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
