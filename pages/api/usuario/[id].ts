import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const pool = await getConnection();

  if (req.method === 'GET') {
    try {
      const result = await pool
        .request()
        .input('Id', sql.Int, parseInt(id))
        .query(`
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
          FROM FacturacionHC.dbo.Usuario u
          LEFT JOIN FacturacionHC.dbo.Rol r ON u.IdRol = r.IdRol
          WHERE u.IdUsuario = @Id
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      return res.status(200).json(result.recordset[0]);
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await pool
        .request()
        .input('Id', sql.Int, parseInt(id))
        .query('DELETE FROM FacturacionHC.dbo.Usuario WHERE IdUsuario = @Id');

      return res.status(200).json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }

  if (req.method === 'PUT') {
    const { Nombre, Email, Rol, Estado, Password } = req.body;

    // Convierte Rol a IdRol
    const rolMapeo: Record<string, number> = {
      "Admin": 1,
      "Vendedor": 2,
      "Soporte": 3,
    };

    
    const estadoMapeo: Record<string, number> = {
      "Activo": 1,
      "Inactivo": 0,
    };

    const IdRol = rolMapeo[Rol];
    const EstadoNum = estadoMapeo[Estado];

    if (IdRol === undefined || EstadoNum === undefined) {
      return res.status(400).json({ error: 'Datos de Rol o Estado inválidos' });
    }

    try {
      const request = pool
        .request()
        .input('Id', sql.Int, parseInt(id))
        .input('Nombre', sql.VarChar, Nombre)
        .input('Email', sql.VarChar, Email)
        .input('IdRol', sql.Int, IdRol)
        .input('Estado', sql.Int, EstadoNum);

      let updateQuery = `
        UPDATE FacturacionHC.dbo.Usuario
        SET Nombre = @Nombre,
            Email = @Email,
            IdRol = @IdRol,
            Estado = @Estado
      `;
      // Solo actualizar la contraseña si viene en el body y no está vacía
      if (Password && Password.trim() !== "") {
        request.input('Password', sql.VarChar, Password); // Aquí deberías hashear la contraseña
        updateQuery += `,
            Password = @Password
        `;
      }

      updateQuery += ` WHERE IdUsuario = @Id`;

      await request.query(updateQuery);

      return res.status(200).json({ mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }
}
