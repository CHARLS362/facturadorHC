import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { generarXml } from '@/lib/generarXml';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const pool = await getConnection();

    const ventaResult = await pool.request()
      .input('IdVenta', sql.Int, id)
      .query(`
        SELECT 
          v.IdVenta,
          v.FechaVenta,
          v.Total,
          v.Estado,
          v.IdComprobante,
          s.Serie, -- Serie textual
          c.Numero,
          tc.Codigo AS TipoComprobanteCodigo,
          cl.Nombre AS RazonSocial,
          cl.NumeroDocumento,
          td.Codigo AS TipoDocumento,
          cl.Direccion
        FROM Ventas v
        INNER JOIN Comprobante c ON v.IdComprobante = c.IdComprobante
        INNER JOIN Serie s ON c.IdSerie = s.IdSerie
        INNER JOIN TipoComprobante tc ON s.IdTipoComprobante = tc.IdTipoComprobante
        INNER JOIN Cliente cl ON v.IdCliente = cl.IdCliente
        INNER JOIN TipoDocumento td ON cl.IdTipoDocumento = td.IdTipoDocumento
        WHERE v.IdVenta = @IdVenta
      `);

    if (ventaResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const venta = ventaResult.recordset[0];

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

    // datos de empresa prueba pero eso sacar de la bd
    const empresa = {
      ruc: '20601234567',
      nombreComercial: 'Mi Empresa SAC',
    };

    const cliente = {
      razonSocial: venta.RazonSocial,
      numeroDocumento: venta.NumeroDocumento,
      tipoDocumento: venta.TipoDocumento,
      direccion: venta.Direccion,
    };

    const ventaData = {
      fecha: venta.FechaVenta,
      total: venta.Total,
      serie: venta.Serie,
      numero: venta.Numero,
      moneda: 'PEN', // Moneda pero se crea bd Moneda @Roy
      items: detallesResult.recordset,
    };

    const xml = generarXml({ empresa, cliente, venta: ventaData });

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename=venta-${id}.xml`);
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error al generar XML:', error);
    return res.status(500).json({ error: 'Error al generar XML' });
  }
}
