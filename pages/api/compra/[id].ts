
import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db'; 
import sql from 'mssql';

// Asumimos que esta tabla existe para los detalles, similar a DetalleVenta
// Si no existe, este endpoint fallará y deberá ser creada en la BD.
const MOCK_ITEMS = [
    { NombreProducto: 'Camisa de Algodón Premium', Cantidad: 10, CostoUnitario: 25.00, Subtotal: 250.00 },
    { NombreProducto: 'Pantalón Cargo Resistente', Cantidad: 5, CostoUnitario: 45.00, Subtotal: 225.00 },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!id) {
    return res.status(400).json({ error: 'ID de compra es requerido' });
  }

  try {
    const pool = await getConnection();

    // 1. Obtener la información principal de la compra
    const compraResult = await pool.request()
      .input('Compra_id', sql.VarChar, id)
      .query('SELECT * FROM Compras WHERE Compra_id = @Compra_id');

    if (compraResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    
    const compraData = compraResult.recordset[0];

    // 2. Obtener los detalles de la compra (productos)
    // NOTA: Esta parte se simula porque la tabla `DetalleCompra` no está confirmada.
    // En una implementación real, aquí iría una consulta a la tabla de detalles.
    // const detallesResult = await pool.request()
    //   .input('Compra_id', sql.VarChar, id)
    //   .query(`
    //     SELECT p.Nombre as NombreProducto, dc.Cantidad, dc.CostoUnitario, (dc.Cantidad * dc.CostoUnitario) as Subtotal
    //     FROM DetalleCompra dc
    //     JOIN Producto p ON dc.IdProducto = p.IdProducto
    //     WHERE dc.Compra_id = @Compra_id
    //   `);
    
    const items = MOCK_ITEMS; // Usamos datos de simulación por ahora

    const subtotal = items.reduce((acc, item) => acc + item.Subtotal, 0);
    const igv = subtotal * 0.18;
    // El total ya viene en `compraData.Total`, pero lo recalculamos para consistencia con los items.
    const totalConItems = subtotal + igv;


    // 3. Combinar los datos y devolver la respuesta
    const responseData = {
      ...compraData,
      items: items,
      subtotal: subtotal,
      igv: igv,
      Total: totalConItems, // Devolvemos el total recalculado
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error(`Error al obtener la compra ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor al obtener la compra' });
  }
}
