import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection();

  if (req.method === 'GET') {
    try {
      const result = await pool.request().query(`
        SELECT 
          u.IdUsuario,
          u.Nombre, 
          u.Email, 
          r.Nombre AS Rol, 
          u.FechaRegistro AS FechaIngreso, 
          CASE 
            WHEN u.Estado = 1 THEN 'Activo' 
            ELSE 'Inactivo' 
          END AS Estado
        FROM Usuario u
        LEFT JOIN Rol r ON u.IdRol = r.IdRol
      `);

      return res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return res.status(500).json({ error: 'Error del servidor al obtener usuarios' });
    }
  }

  if (req.method === 'POST') {
    try {
      
      const { Nombre, Email, Password, Rol, Estado} = req.body;

      if (!Nombre || !Email || !Password || !Rol || Estado === undefined) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      // Obtener IdRol desde la tabla Rol
      const rolResult = await pool
        .request()
        .input('NombreRol', sql.VarChar, Rol)
        .query('SELECT IdRol FROM Rol WHERE Nombre = @NombreRol');

      const idRol = rolResult.recordset[0]?.IdRol;
      if (!idRol) {
        return res.status(400).json({ error: 'Rol no válido' });
      }

      // Insertar usuario y obtener IdUsuario
      const insertResult = await pool
        .request()
        .input('Nombre', sql.VarChar, Nombre)
        .input('Email', sql.VarChar, Email)
        .input('Password', sql.VarChar, Password)
        .input('IdRol', sql.Int, idRol)
        .input('Estado', sql.Bit, Estado === 'Activo' ? 1 : 0)
        .query(`
          INSERT INTO Usuario (Nombre, Email, Password, IdRol, Estado, FechaRegistro)
          OUTPUT INSERTED.IdUsuario
          VALUES (@Nombre, @Email, @Password, @IdRol, @Estado, GETDATE())
        `);

      const idUsuario = insertResult.recordset[0].IdUsuario;

      return res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return res.status(500).json({ error: 'Error al crear el usuario' });
    }
  }
  return res.status(405).json({ error: 'Método no permitido' });
}
