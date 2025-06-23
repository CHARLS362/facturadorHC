import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { id } = req.query;

  if (req.method === 'GET') {
    try {
      const pool = await getConnection();
      // 1. Obtener datos principales de la venta
      const result = await pool.request()
        .input('IdVenta', sql.Int, id)
        .query(`
        SELECT 
          v.IdVenta,
          v.IdComprobante,
          v.IdCliente,
          cl.Nombre AS NombreCliente,
          cl.NumeroDocumento AS DocumentoCliente,
          cl.IdTipoDocumento AS TipoDocumentoCliente,
          td.Codigo AS NombreTipoDocumentoCliente, 
          cl.Direccion AS DireccionCliente,
          cl.Email AS EmailCliente,
          cl.Telefono AS TelefonoCliente,
          v.IdFormaPago,
          fp.Descripcion AS NombreFormaPago,
          v.FechaVenta,
          v.Total,
          v.Estado,
          c.IdSerie,
          s.IdTipoComprobante,
          tc.Descripcion AS TipoDocumento
        FROM Ventas v
        LEFT JOIN Cliente cl ON v.IdCliente = cl.IdCliente
        LEFT JOIN TipoDocumento td ON cl.IdTipoDocumento = td.IdTipoDocumento
        LEFT JOIN FormaPago fp ON v.IdFormaPago = fp.IdFormaPago
        LEFT JOIN Comprobante c ON v.IdComprobante = c.IdComprobante
        LEFT JOIN Serie s ON c.IdSerie = s.IdSerie
        LEFT JOIN TipoComprobante tc ON s.IdTipoComprobante = tc.IdTipoComprobante
        WHERE v.IdVenta = @IdVenta
      `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }

      // 2. Obtener detalles de la venta (productos/servicios)
      const detallesResult = await pool.request()
        .input('IdVenta', sql.Int, id)
        .query(`
        SELECT 
          dv.IdProducto,
          p.Nombre AS NombreProducto,
          dv.Cantidad,
          dv.PrecioUnitario,
          dv.Total
        FROM DetalleVenta dv
        INNER JOIN Producto p ON dv.IdProducto = p.IdProducto
        WHERE dv.IdVenta = @IdVenta
      `);

      // 3. Armar la respuesta incluyendo los detalles
      const venta = {
        ...result.recordset[0],
        items: detallesResult.recordset
      };

      return res.status(200).json(venta);
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener la venta' });
    }
  }

  if (req.method === 'PATCH') {
    const { Estado } = req.body;
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('IdVenta', sql.Int, id)
        .input('Estado', sql.VarChar(20), Estado)
        .query('UPDATE Ventas SET Estado = @Estado WHERE IdVenta = @IdVenta');
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }
      return res.status(200).json({ mensaje: 'Estado actualizado' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar estado' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}