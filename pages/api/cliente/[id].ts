import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const pool = await getConnection();

      const ventasResult = await pool.request()
        .input('IdCliente', sql.Int, id)
        .query('SELECT COUNT(*) as total FROM Ventas WHERE IdCliente = @IdCliente');

      if (ventasResult.recordset[0].total > 0) {
        return res.status(400).json({ error: 'No se puede eliminar el cliente porque tiene ventas asociadas.' });
      }

      // Si no tiene ventas, elimina
      await pool.request()
        .input('IdCliente', sql.Int, id)
        .query('DELETE FROM Cliente WHERE IdCliente = @IdCliente');

      return res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      return res.status(500).json({ error: 'Error al eliminar cliente' });
    }
  } else if (req.method === 'PUT') {
    const {
      nombre,
      nombreComercial,
      direccion,
      telefono,
      email,
      contacto,
      estado,
      tipoClienteDescripcion,
      tipoDocumentoCodigo,
      numeroDocumento,
    } = req.body;

    if (!nombre || !tipoClienteDescripcion || !tipoDocumentoCodigo || !numeroDocumento) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
      const pool = await getConnection();

      // Buscar IdTipoCliente por descripción
      const tipoClienteResult = await pool.request()
        .input('Descripcion', sql.NVarChar(50), tipoClienteDescripcion)
        .query('SELECT IdTipoCliente FROM TipoCliente WHERE Descripcion = @Descripcion');
      if (tipoClienteResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Tipo de cliente no válido' });
      }
      const IdTipoCliente = tipoClienteResult.recordset[0].IdTipoCliente;

      // Buscar IdTipoDocumento por código
      const tipoDocumentoResult = await pool.request()
        .input('Codigo', sql.VarChar(10), tipoDocumentoCodigo)
        .query('SELECT IdTipoDocumento FROM TipoDocumento WHERE Codigo = @Codigo');
      if (tipoDocumentoResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Tipo de documento no válido' });
      }
      const IdTipoDocumento = tipoDocumentoResult.recordset[0].IdTipoDocumento;

      // Actualizar cliente
      await pool.request()
        .input('IdCliente', sql.Int, id)
        .input('IdTipoCliente', sql.Int, IdTipoCliente)
        .input('IdTipoDocumento', sql.Int, IdTipoDocumento)
        .input('NumeroDocumento', sql.VarChar(20), numeroDocumento)
        .input('Nombre', sql.NVarChar(100), nombre)
        .input('NombreComercial', sql.NVarChar(100), nombreComercial || null)
        .input('Direccion', sql.NVarChar(200), direccion || null)
        .input('Telefono', sql.NVarChar(20), telefono || null)
        .input('Email', sql.NVarChar(100), email || null)
        .input('Contacto', sql.NVarChar(100), contacto || null)
        .input('Estado', sql.Int, estado ?? 1)
        .query(`
          UPDATE Cliente SET
            IdTipoCliente = @IdTipoCliente,
            IdTipoDocumento = @IdTipoDocumento,
            NumeroDocumento = @NumeroDocumento,
            Nombre = @Nombre,
            NombreComercial = @NombreComercial,
            Direccion = @Direccion,
            Telefono = @Telefono,
            Email = @Email,
            Contacto = @Contacto,
            Estado = @Estado
          WHERE IdCliente = @IdCliente
        `);

      return res.status(200).json({ mensaje: 'Cliente actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      return res.status(500).json({ error: 'Error al actualizar cliente' });
    }
  } else if (req.method === 'GET') {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('IdCliente', sql.Int, id)
        .query(`
          SELECT 
            c.IdCliente,
            c.NumeroDocumento,
            c.Nombre,
            c.NombreComercial,
            c.Direccion,
            c.Telefono,
            c.Email,
            c.Contacto,
            c.Estado,
            c.FechaRegistro,
            tc.IdTipoCliente,
            tc.Descripcion AS TipoCliente,
            td.IdTipoDocumento,
            td.Codigo AS TipoDocumento
          FROM Cliente c
          LEFT JOIN TipoCliente tc ON c.IdTipoCliente = tc.IdTipoCliente
          LEFT JOIN TipoDocumento td ON c.IdTipoDocumento = td.IdTipoDocumento
          WHERE c.IdCliente = @IdCliente
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      return res.status(200).json(result.recordset[0]);
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener el cliente' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}