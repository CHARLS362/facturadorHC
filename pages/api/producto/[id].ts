import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  if (req.method === 'GET') {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('IdProducto', sql.Int, parseInt(id as string))
        .query(`
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
          WHERE p.IdProducto = @IdProducto
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      return res.status(200).json(result.recordset[0]);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return res.status(500).json({ error: 'Error al obtener producto' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('IdProducto', sql.Int, parseInt(id as string))
        .query('DELETE FROM Producto WHERE IdProducto = @IdProducto');
      return res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }

  if (req.method === 'PUT') {
  let {
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

    console.log('Datos recibidos en PUT /api/producto/[id]:', req.body);

  let IdCategoria = null;
  try {
    const pool = await getConnection();
    // Buscar el ID de la categoría por nombre
const catResult = await pool.request()
  .input('Descripcion', sql.VarChar, CategoriaNombre)
  .query('SELECT IdCategoria FROM Categoria WHERE Descripcion = @Descripcion');
if (catResult.recordset.length === 0) {
  return res.status(400).json({ error: 'Categoría no encontrada' });
}
const IdCategoria = catResult.recordset[0].IdCategoria;

    await pool.request()
      .input('IdProducto', sql.Int, parseInt(id as string))
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
        UPDATE Producto SET
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

  return res.status(405).json({ error: 'Método no permitido' });
}