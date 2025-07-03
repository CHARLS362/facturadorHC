import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { tipo, numero } = req.query;

  if (!tipo || !numero) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  try {
    const pool = await getConnection();

    // Mapea el tipo corto a la descripción real
    let descripcion = '';
    if (tipo.toString().toUpperCase() === 'DNI') {
      descripcion = 'Documento Nacional de Identidad';
    } else if (tipo.toString().toUpperCase() === 'RUC') {
      descripcion = 'Registro Único de Contribuyentes';
    } else {
      return res.status(400).json({ error: 'Tipo de documento inválido' });
    }

    // Busca el tipo de documento en la tabla TipoDocumento
    const tipoDocResult = await pool.request()
      .input('Descripcion', sql.VarChar(100), descripcion)
      .query('SELECT IdTipoDocumento FROM TipoDocumento WHERE Descripcion = @Descripcion');

    if (tipoDocResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Tipo de documento no encontrado' });
    }

    const IdTipoDocumento = tipoDocResult.recordset[0].IdTipoDocumento;

    console.log("tipo:", tipo, "numero:", numero, "descripcion:", descripcion, "IdTipoDocumento:", IdTipoDocumento);

    // Busca el cliente
    const clienteResult = await pool.request()
      .input('IdTipoDocumento', sql.Int, IdTipoDocumento)
      .input('NumeroDocumento', sql.VarChar(20), numero.toString())
      .query(`
        SELECT IdCliente, Nombre, NombreComercial, Direccion, Telefono, NumeroDocumento
        FROM Cliente
        WHERE IdTipoDocumento = @IdTipoDocumento AND NumeroDocumento = @NumeroDocumento
      `);

    if (clienteResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const cliente = clienteResult.recordset[0];
    return res.status(200).json(cliente);
  } catch (error) {
    console.error('Error al consultar cliente:', error);
    return res.status(500).json({ error: 'Error al consultar cliente' });
  }
}