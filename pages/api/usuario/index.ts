import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db'; // Asegúrate que esta conexión funcione

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const pool = await getConnection();
    
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
      FROM FacturacionHC.dbo.Usuario u
      LEFT JOIN FacturacionHC.dbo.Rol r ON u.IdRol = r.IdRol
    `);

    res.status(200).json(result.recordset);
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error del servidor al obtener usuarios' });
  }
}
