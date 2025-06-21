import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection();

  // GET: Obtener todos los productos
  if (req.method === 'GET') {
    try {
      const result = await pool.request()
        .query('SELECT * FROM FacturacionHC.dbo.Producto');
      return res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
  }

  // POST: Crear nuevo producto
  if (req.method === 'POST') {
    const {
      IdCategoria,
      IdUnidadMedida,
      Codigo,
      Nombre,
      Descripcion,
      Precio,
      Stock,
      StockMinimo,
      Tipo,
      Estado,
      ImagenUrl
    } = req.body;

    if (
      !IdCategoria || !IdUnidadMedida || !Codigo || !Nombre ||
      Precio === undefined || Stock === undefined || StockMinimo === undefined ||
      !Tipo || !Estado
    ) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
      await pool.request()
        .input('IdCategoria', sql.Int, IdCategoria)
        .input('IdUnidadMedida', sql.Int, IdUnidadMedida)
        .input('Codigo', sql.VarChar, Codigo)
        .input('Nombre', sql.VarChar, Nombre)
        .input('Descripcion', sql.VarChar, Descripcion || null)
        .input('Precio', sql.Decimal(18, 2), Precio)
        .input('Stock', sql.Int, Stock)
        .input('StockMinimo', sql.Int, StockMinimo)
        .input('Tipo', sql.VarChar, Tipo)
        .input('Estado', sql.VarChar, Estado)
        .input('ImagenUrl', sql.VarChar, ImagenUrl || null)
        .query(`
          INSERT INTO FacturacionHC.dbo.Producto (
            IdCategoria, IdUnidadMedida, Codigo, Nombre, Descripcion,
            Precio, Stock, StockMinimo, Tipo, Estado, ImagenUrl, FechaRegistro
          ) VALUES (
            @IdCategoria, @IdUnidadMedida, @Codigo, @Nombre, @Descripcion,
            @Precio, @Stock, @StockMinimo, @Tipo, @Estado, @ImagenUrl, GETDATE()
          )
        `);
      return res.status(201).json({ mensaje: 'Producto creado correctamente' });
    } catch (error) {
      console.error('Error al crear producto:', error);
      return res.status(500).json({ error: 'Error al crear producto' });
    }
  }

  // PUT: Actualizar un producto
  if (req.method === 'PUT') {
    const {
      IdProducto,
      IdCategoria,
      IdUnidadMedida,
      Codigo,
      Nombre,
      Descripcion,
      Precio,
      Stock,
      StockMinimo,
      Tipo,
      Estado,
      ImagenUrl
    } = req.body;

    if (
      !IdProducto || !IdCategoria || !IdUnidadMedida || !Codigo || !Nombre ||
      Precio === undefined || Stock === undefined || StockMinimo === undefined ||
      !Tipo || !Estado
    ) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
      await pool.request()
        .input('IdProducto', sql.Int, IdProducto)
        .input('IdCategoria', sql.Int, IdCategoria)
        .input('IdUnidadMedida', sql.Int, IdUnidadMedida)
        .input('Codigo', sql.VarChar, Codigo)
        .input('Nombre', sql.VarChar, Nombre)
        .input('Descripcion', sql.VarChar, Descripcion || null)
        .input('Precio', sql.Decimal(18, 2), Precio)
        .input('Stock', sql.Int, Stock)
        .input('StockMinimo', sql.Int, StockMinimo)
        .input('Tipo', sql.VarChar, Tipo)
        .input('Estado', sql.VarChar, Estado)
        .input('ImagenUrl', sql.VarChar, ImagenUrl || null)
        .query(`
          UPDATE FacturacionHC.dbo.Producto
          SET
            IdCategoria = @IdCategoria,
            IdUnidadMedida = @IdUnidadMedida,
            Codigo = @Codigo,
            Nombre = @Nombre,
            Descripcion = @Descripcion,
            Precio = @Precio,
            Stock = @Stock,
            StockMinimo = @StockMinimo,
            Tipo = @Tipo,
            Estado = @Estado,
            ImagenUrl = @ImagenUrl
          WHERE IdProducto = @IdProducto
        `);
      return res.status(200).json({ mensaje: 'Producto actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ error: 'Error al actualizar producto' });
    }
  }

  // Método no permitido
  return res.status(405).json({ error: 'Método no permitido' });
}
