import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { generarXml, type FacturaData, type Empresa, type Cliente, type Venta, type VentaItem } from '@/lib/generarXml';
import { firmarXml } from '@/lib/firmarXml';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const ventaId = parseInt(id as string, 10);
  if (isNaN(ventaId)) {
    return res.status(400).json({ error: 'ID de venta inválido' });
  }

  try {
    const pool = await getConnection();

    const ventaResult = await pool.request()
      .input('IdVenta', sql.Int, ventaId)
      .query(`
        SELECT 
          v.IdVenta,
          v.FechaVenta,
          v.Total,
          s.Serie,
          c.Numero,
          cl.Nombre AS RazonSocialCliente,
          cl.NumeroDocumento,
          td.Codigo AS TipoDocumentoCodigo,
          cl.Direccion
        FROM Ventas v
        INNER JOIN Comprobante c ON v.IdComprobante = c.IdComprobante
        INNER JOIN Serie s ON c.IdSerie = s.IdSerie
        INNER JOIN Cliente cl ON v.IdCliente = cl.IdCliente
        INNER JOIN TipoDocumento td ON cl.IdTipoDocumento = td.IdTipoDocumento
        WHERE v.IdVenta = @IdVenta
      `);

    if (ventaResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    const ventaDb: any = ventaResult.recordset[0];

    const detallesResult = await pool.request()
      .input('IdVenta', sql.Int, ventaId)
      .query(`
        SELECT 
          dv.IdProducto,
          p.Nombre AS NombreProducto,
          dv.Cantidad,
          dv.PrecioUnitario,
          dv.Total
        FROM DetalleVenta dv
        INNER JOIN Producto p ON dv.IdProducto = p.IdProducto
        WHERE dv.IdVenta = @IdVenta
      `);

    const empresaData: Empresa = {
      ruc: '20601234567',
      razonSocial: 'MI EMPRESA SAC', 
      nombreComercial: 'Mi Empresa SAC',
    };

    const clienteData: Cliente = {
      razonSocial: ventaDb.RazonSocialCliente,
      numeroDocumento: ventaDb.NumeroDocumento,
      tipoDocumento: ventaDb.TipoDocumentoCodigo as Cliente['tipoDocumento'],
    };

    const ventaData: Venta = {
      fecha: new Date(ventaDb.FechaVenta),
      total: parseFloat(ventaDb.Total),
      serie: ventaDb.Serie,
      numero: String(ventaDb.Numero).padStart(8, '0'),
      moneda: 'PEN',
      items: detallesResult.recordset.map((item: any): VentaItem => ({
        IdProducto: item.IdProducto,
        NombreProducto: item.NombreProducto,
        Cantidad: parseInt(item.Cantidad, 10),
        PrecioUnitario: parseFloat(item.PrecioUnitario),
        Total: parseFloat(item.Total),
      })),
    };

    const facturaParaXml: FacturaData = {
      empresa: empresaData,
      cliente: clienteData,
      venta: ventaData,
    };

    const xmlSinFirma = generarXml(facturaParaXml);
    // --- INICIO DE CÓDIGO DE DEPURACIÓN TEMPORAL ---
    const rawCertPath = process.env.CERTIFICATE_PATH;
    const rawCertPass = process.env.CERTIFICATE_PASSWORD;
    const fullCalculatedPath = path.join(process.cwd(), rawCertPath || '');

    console.log('\n\n--- DEBUG INFO ---');
    console.log('Valor de process.cwd():', process.cwd());
    console.log('Ruta leída de .env (CERTIFICATE_PATH):', rawCertPath);
    console.log('Contraseña leída de .env (CERTIFICATE_PASSWORD):', rawCertPass ? 'Sí, la contraseña existe.' : 'NO, la contraseña está vacía o es undefined.');
    console.log('Ruta completa calculada para el certificado:', fullCalculatedPath);
    console.log('¿Existe el archivo en esa ruta? (fs.existsSync):', fs.existsSync(fullCalculatedPath));
    console.log('------------------\n\n');
    // --- FIN DE CÓDIGO DE DEPURACIÓN TEMPORAL ---
    
    const certificatePath = path.join(process.cwd(), process.env.CERTIFICATE_PATH!);
    const certificatePassword = process.env.CERTIFICATE_PASSWORD!;

    if (!fs.existsSync(certificatePath) || !certificatePassword) {
        console.error('Certificado o contraseña no encontrados. Verifica las variables de entorno.');
        return res.status(500).json({ error: 'Error de configuración del servidor.' });
    }
    
    const certificateBuffer = fs.readFileSync(certificatePath);
    
    const xmlFirmado = firmarXml(xmlSinFirma, certificateBuffer, certificatePassword);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    const nombreArchivo = `${facturaParaXml.empresa.ruc}-01-${facturaParaXml.venta.serie}-${facturaParaXml.venta.numero}.xml`;
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
    
    return res.status(200).send(xmlFirmado);

  } catch (error) {
    console.error('Error al generar y firmar el XML:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido.';
    return res.status(500).json({ error: 'Error interno del servidor.', details: errorMessage });
  }
}
