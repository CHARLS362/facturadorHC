
import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection();
  if (req.method === 'GET') {
    const { status } = req.query;

    try {
      let query = `
        SELECT 
          p.IdProducto,
          p.IdCategoria,
          c.Descripcion AS CategoriaNombre,
          p.IdUnidadMedida,
          u.Descripcion AS UnidadMedidaNombre,
          u.Codigo AS UnidadMedidaSimbolo,
          p.Codigo,
          p.Nombre,
          p.Descripcion,
          p.Precio,
          p.Stock,
          p.StockMinimo,
          p.Tipo,
          p.Estado,
          p.ImagenUrl,
          p.FechaRegistro
        FROM Producto p
        LEFT JOIN Categoria c ON p.IdCategoria = c.IdCategoria
        LEFT JOIN UnidadMedida u ON p.IdUnidadMedida = u.IdUnidadMedida
      `;

      if (status === 'low_stock') {
        // We only want items that are low in stock but not yet out of stock
        query += ' WHERE p.Stock <= p.StockMinimo AND p.Stock > 0';
      }

      const result = await pool.request().query(query);
      return res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
  }

if (req.method === 'POST') {
  const {
    CategoriaNombre,
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
    !CategoriaNombre || !IdUnidadMedida || !Codigo || !Nombre ||
    Precio === undefined || Stock === undefined || StockMinimo === undefined ||
    !Tipo || !Estado
  ) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const pool = await getConnection();

    const categoriaRes = await pool
      .request()
      .input('NombreCategoria', sql.VarChar, CategoriaNombre)
      .query('SELECT IdCategoria FROM Categoria WHERE Descripcion = @NombreCategoria');

    const IdCategoria = categoriaRes.recordset[0]?.IdCategoria;

    if (!IdCategoria) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }

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
        INSERT INTO Producto (
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

  return res.status(405).json({ error: 'Método no permitido' });
}
