
import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
        SELECT 
          v.IdVenta,
          v.FechaVenta,
          cl.Nombre AS NombreCliente,
          cl.Email AS EmailCliente,
          cl.Telefono AS TelefonoCliente,
          tc.Descripcion AS TipoDocumento,
          v.Total,
          fp.Descripcion AS NombreFormaPago,
          v.Estado
        FROM Ventas v
        LEFT JOIN Comprobante c ON v.IdComprobante = c.IdComprobante
        LEFT JOIN Serie s ON c.IdSerie = s.IdSerie
        LEFT JOIN TipoComprobante tc ON s.IdTipoComprobante = tc.IdTipoComprobante
        LEFT JOIN Cliente cl ON v.IdCliente = cl.IdCliente
        LEFT JOIN FormaPago fp ON v.IdFormaPago = fp.IdFormaPago
        ORDER BY v.FechaVenta DESC
      `);
      return res.status(200).json(result.recordset);
    } catch (error: any) {
      console.error('Error al obtener ventas:', error);
      return res.status(500).json({ error: error.message || 'Error al obtener ventas' });
    }
  }

  if (req.method === 'POST') {
    // Recibe los datos del frontend
    const {
      IdComprobante,
      FechaVenta,
      Total,
      Estado,
      items,
      clientDocumentType,
      clientDocumentNumber,
      clientFullName,
      clientAddress,
      paymentMethod,
    } = req.body;

    if (
      !IdComprobante ||
      !FechaVenta ||
      Total === undefined ||
      !Estado ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !clientDocumentType ||
      !clientDocumentNumber ||
      !clientFullName ||
      !paymentMethod
    ) {
      return res.status(400).json({ error: 'Faltan campos requeridos o items' });
    }

    try {
      const pool = await getConnection();

      // 1. Buscar o insertar cliente
      let clienteResult = await pool.request()
        .input('NumeroDocumento', sql.VarChar(20), clientDocumentNumber)
        .query('SELECT IdCliente FROM Cliente WHERE NumeroDocumento = @NumeroDocumento');

      let IdCliente;
      if (clienteResult.recordset.length > 0) {
        IdCliente = clienteResult.recordset[0].IdCliente;
      } else {
        // Ajusta los IDs de tipo de documento según tu BD (ejemplo: 1 = DNI, 2 = RUC)
        const tipoDocId = clientDocumentType === 'RUC' ? 2 : 1;
        const insertCliente = await pool.request()
          .input('Nombre', sql.NVarChar(100), clientFullName)
          .input('NumeroDocumento', sql.VarChar(20), clientDocumentNumber)
          .input('IdTipoDocumento', sql.Int, tipoDocId)
          .input('IdTipoCliente', sql.Int, 1) // 1 = cliente regular, ajusta si tienes otro catálogo
          .input('Direccion', sql.NVarChar(200), clientAddress || '')
          .input('Email', sql.NVarChar(100), '')
          .input('Telefono', sql.NVarChar(20), '')
          .query(`
            INSERT INTO Cliente (Nombre, NumeroDocumento, IdTipoDocumento, IdTipoCliente, Direccion, Email, Telefono)
            OUTPUT INSERTED.IdCliente
            VALUES (@Nombre, @NumeroDocumento, @IdTipoDocumento, @IdTipoCliente, @Direccion, @Email, @Telefono)
          `);
        IdCliente = insertCliente.recordset[0].IdCliente;
      }

      // 2. Buscar IdFormaPago por descripción
      let formaPagoResult = await pool.request()
        .input('Descripcion', sql.NVarChar(50), paymentMethod)
        .query('SELECT IdFormaPago FROM FormaPago WHERE Descripcion = @Descripcion');

      let IdFormaPago = 1; // Valor por defecto si no se encuentra
      if (formaPagoResult.recordset.length > 0) {
        IdFormaPago = formaPagoResult.recordset[0].IdFormaPago;
      }

      // 3.1 Validar stock de todos los productos antes de registrar la venta
      for (const item of items) {
        const stockResult = await pool.request()
          .input('IdProducto', sql.Int, item.IdProducto)
          .query('SELECT Stock FROM Producto WHERE IdProducto = @IdProducto');
        const stockActual = stockResult.recordset[0]?.Stock ?? 0;
        if (item.Cantidad > stockActual) {
          return res.status(400).json({
            error: `Stock insuficiente para el producto con ID ${item.IdProducto}. Stock disponible: ${stockActual}, solicitado: ${item.Cantidad}`
          });
        }
      }

      // 3. Insertar venta y obtener el IdVenta generado
      const ventaResult = await pool.request()
        .input('IdComprobante', sql.Int, IdComprobante)
        .input('IdCliente', sql.Int, IdCliente)
        .input('IdFormaPago', sql.Int, IdFormaPago)
        .input('FechaVenta', sql.DateTime, FechaVenta)
        .input('Total', sql.Decimal(18, 2), Total)
        .input('Estado', sql.VarChar(20), Estado)
        .query(`
          INSERT INTO Ventas
            (IdComprobante, IdCliente, IdFormaPago, FechaVenta, Total, Estado)
          OUTPUT INSERTED.IdVenta
          VALUES
            (@IdComprobante, @IdCliente, @IdFormaPago, @FechaVenta, @Total, @Estado)
        `);

      const IdVenta = ventaResult.recordset[0].IdVenta;

      // 4. Insertar los items en DetalleVenta
      for (const item of items) {
        await pool.request()
          .input('IdVenta', sql.Int, IdVenta)
          .input('IdProducto', sql.Int, item.IdProducto)
          .input('Cantidad', sql.Int, item.Cantidad)
          .input('PrecioUnitario', sql.Decimal(18, 2), item.PrecioUnitario)
          .input('Total', sql.Decimal(18, 2), item.Total)
          .query(`
            INSERT INTO DetalleVenta (IdVenta, IdProducto, Cantidad, PrecioUnitario, Total)
            VALUES (@IdVenta, @IdProducto, @Cantidad, @PrecioUnitario, @Total)
          `);

        // ↓↓↓ ACTUALIZA EL STOCK DEL PRODUCTO AQUÍ ↓↓↓
        await pool.request()
          .input('IdProducto', sql.Int, item.IdProducto)
          .input('Cantidad', sql.Int, item.Cantidad)
          .query(`
            UPDATE Producto
            SET Stock = Stock - @Cantidad
            WHERE IdProducto = @IdProducto
          `);
      }

      return res.status(201).json({ mensaje: 'Venta registrada correctamente', IdVenta });
    } catch (error) {
      console.error('Error al registrar venta:', error);
      return res.status(500).json({ error: 'Error al registrar venta' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
