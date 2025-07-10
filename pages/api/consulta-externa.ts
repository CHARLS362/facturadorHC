// pages/api/consulta-externa.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { consultarDni, consultarRuc } from '@/lib/consultasApis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { tipo, numero } = req.query;

    if (!tipo || !numero || typeof tipo !== 'string' || typeof numero !== 'string') {
        return res.status(400).json({ error: 'Parámetros inválidos.' });
    }

    try {
        if (tipo.toUpperCase() === 'DNI') {
            if (numero.length !== 8) {
                return res.status(400).json({ error: 'El DNI debe tener 8 dígitos.' });
            }
            const data = await consultarDni(numero);
            return res.status(200).json({ nombre: data.nombreCompleto, direccion: '-' });

        } else if (tipo.toUpperCase() === 'RUC') {
            if (numero.length !== 11) {
                return res.status(400).json({ error: 'El RUC debe tener 11 dígitos.' });
            }
            const data = await consultarRuc(numero);
            return res.status(200).json({ nombre: data.razonSocial, direccion: data.direccion || '-' });

        } else {
            return res.status(400).json({ error: 'Tipo de documento no soportado.' });
        }
    } catch (error: any) {
        console.error(`Error en API de consulta externa:`, error);
        return res.status(500).json({ error: error.message || 'Error al consultar el servicio externo.' });
    }
}
