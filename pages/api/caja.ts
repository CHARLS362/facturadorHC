
import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { action, ...payload } = req.body;
    const pool = await getConnection();

    try {
        switch (action) {
            case 'apertura': {
                const { montoInicial, idUsuario } = payload;
                const openSession = await pool.request().query("SELECT IdCaja FROM Caja WHERE Estado = 'Abierta'");
                if (openSession.recordset.length > 0) {
                    return res.status(400).json({ error: 'Ya existe una sesión de caja abierta.' });
                }
                
                const result = await pool.request()
                    .input('MontoInicial', sql.Decimal(18, 2), montoInicial)
                    .input('IdUsuarioApertura', sql.Int, idUsuario)
                    .input('Estado', sql.VarChar(20), 'Abierta')
                    .query(`
                        INSERT INTO Caja (FechaApertura, MontoInicial, IdUsuarioApertura, Estado)
                        OUTPUT INSERTED.*
                        VALUES (GETDATE(), @MontoInicial, @IdUsuarioApertura, @Estado)
                    `);
                
                return res.status(201).json({ message: 'Caja abierta', session: result.recordset[0] });
            }

            case 'cierre': {
                const { idCaja, montoReal, montoCalculado, diferencia, idUsuario } = payload;
                 const result = await pool.request()
                    .input('IdCaja', sql.Int, idCaja)
                    .input('MontoFinalReal', sql.Decimal(18, 2), montoReal)
                    .input('MontoFinalCalculado', sql.Decimal(18, 2), montoCalculado)
                    .input('Diferencia', sql.Decimal(18, 2), diferencia)
                    .input('IdUsuarioCierre', sql.Int, idUsuario)
                    .input('Estado', sql.VarChar(20), 'Cerrada')
                    .query(`
                        UPDATE Caja SET
                            FechaCierre = GETDATE(),
                            MontoFinalReal = @MontoFinalReal,
                            MontoFinalCalculado = @MontoFinalCalculado,
                            Diferencia = @Diferencia,
                            IdUsuarioCierre = @IdUsuarioCierre,
                            Estado = @Estado
                        OUTPUT INSERTED.*
                        WHERE IdCaja = @IdCaja AND Estado = 'Abierta'
                    `);

                if (result.rowsAffected[0] === 0) {
                    return res.status(404).json({ error: 'No se encontró una sesión de caja abierta con ese ID.' });
                }
                
                return res.status(200).json({ message: 'Caja cerrada', session: result.recordset[0] });
            }

            default:
                return res.status(400).json({ error: 'Acción no válida' });
        }
    } catch (error: any) {
        console.error('Error en API de caja:', error);
        if (error.message.includes("Invalid object name 'Caja'")) {
            return res.status(500).json({ error: "La tabla 'Caja' no existe en la base de datos. Por favor, créela para usar esta funcionalidad." });
        }
        return res.status(500).json({ error: 'Error en el servidor.' });
    }
}
