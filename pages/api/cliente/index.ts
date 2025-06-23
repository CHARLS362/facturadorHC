import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
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
      `);

      // Mapea para frontend
      const clientes = result.recordset.map(c => ({
        id: c.IdCliente,
        documentNumber: c.NumeroDocumento,
        name: c.Nombre,
        commercialName: c.NombreComercial,
        address: c.Direccion,
        phone: c.Telefono,
        email: c.Email,
        contact: c.Contacto,
        status: c.Estado,
        registeredAt: c.FechaRegistro,
        tipoCliente: {
          id: c.IdTipoCliente,
          descripcion: c.TipoCliente
        },
        tipoDocumento: {
          id: c.IdTipoDocumento,
          codigo: c.TipoDocumento
        }
      }));

      return res.status(200).json(clientes);
    } catch (error: any) {
      console.error('Error al obtener clientes:', error);
      return res.status(500).json({ error: error.message || 'Error al obtener clientes' });
    }
  }

  if (req.method === 'POST') {
    const {
      numeroDocumento,
      nombre,
      nombreComercial,
      direccion,
      telefono,
      email,
      contacto,
      tipoClienteDescripcion,
      tipoDocumentoCodigo
    } = req.body;

    if (!numeroDocumento || !nombre || !tipoClienteDescripcion || !tipoDocumentoCodigo) {
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

      // Insertar cliente
      const insertResult = await pool.request()
        .input('IdTipoCliente', sql.Int, IdTipoCliente)
        .input('IdTipoDocumento', sql.Int, IdTipoDocumento)
        .input('NumeroDocumento', sql.VarChar(20), numeroDocumento)
        .input('Nombre', sql.NVarChar(100), nombre)
        .input('NombreComercial', sql.NVarChar(100), nombreComercial || null)
        .input('Direccion', sql.NVarChar(200), direccion || null)
        .input('Telefono', sql.NVarChar(20), telefono || null)
        .input('Email', sql.NVarChar(100), email || null)
        .input('Contacto', sql.NVarChar(100), contacto || null)
        .input('Estado', sql.Int, 1)
        .query(`
          INSERT INTO Cliente (IdTipoCliente, IdTipoDocumento, NumeroDocumento, Nombre, NombreComercial, Direccion, Telefono, Email, Contacto, Estado)
          OUTPUT INSERTED.IdCliente
          VALUES (@IdTipoCliente, @IdTipoDocumento, @NumeroDocumento, @Nombre, @NombreComercial, @Direccion, @Telefono, @Email, @Contacto, @Estado)
        `);

      return res.status(201).json({ mensaje: 'Cliente registrado', id: insertResult.recordset[0].IdCliente });
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      return res.status(500).json({ error: 'Error al registrar cliente' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}