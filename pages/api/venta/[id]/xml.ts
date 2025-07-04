
import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { 
  generarComprobanteXml, 
  type ComprobanteData, 
  type Empresa, 
  type Cliente, 
  type ItemComprobante,
  type TipoComprobante
} from '@/lib/generarXml'; 
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
          tc.Codigo AS TipoComprobanteCodigo, -- '01' o '03'
          cl.Nombre AS RazonSocialCliente,
          cl.NumeroDocumento,
          td.Codigo AS TipoDocumentoCodigo,
          cl.Direccion
        FROM Ventas v
        INNER JOIN Comprobante c ON v.IdComprobante = c.IdComprobante
        INNER JOIN Serie s ON c.IdSerie = s.IdSerie
        INNER JOIN TipoComprobante tc ON c.IdTipoComprobante = tc.IdTipoComprobante
        LEFT JOIN Cliente cl ON v.IdCliente = cl.IdCliente
        LEFT JOIN TipoDocumento td ON cl.IdTipoDocumento = td.IdTipoDocumento
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
        um.Codigo AS UnidadMedida,
        '10' AS TipoAfectacionIgv -- Asignamos 10 por defecto para gravado
      FROM DetalleVenta dv
      INNER JOIN Producto p ON dv.IdProducto = p.IdProducto
      INNER JOIN UnidadMedida um ON p.IdUnidadMedida = um.IdUnidadMedida
      WHERE dv.IdVenta = @IdVenta
    `);


    const empresaData: Empresa = {
      ruc: '20601234567',
      razonSocial: 'MI EMPRESA SAC', 
      nombreComercial: 'Mi Empresa SAC',
    };

    let clienteData: Cliente | undefined = undefined;
    if (ventaDb.NumeroDocumento) {
        clienteData = {
            razonSocial: ventaDb.RazonSocialCliente,
            numeroDocumento: ventaDb.NumeroDocumento,
            tipoDocumento: ventaDb.TipoDocumentoCodigo as Cliente['tipoDocumento'],
        };
    }

    const comprobanteParaXml: ComprobanteData = {
      tipoComprobante: ventaDb.TipoComprobanteCodigo as TipoComprobante, // '01' o '03'
      serie: ventaDb.Serie,
      numero: String(ventaDb.Numero).padStart(8, '0'),
      fechaEmision: new Date(ventaDb.FechaVenta),
      moneda: 'PEN',
      empresa: empresaData,
      cliente: clienteData, 
      items: detallesResult.recordset.map((item: any): ItemComprobante => {
      const precioUnitario = parseFloat(item.PrecioUnitario);
      return {
        idInterno: item.IdProducto,
        descripcion: item.NombreProducto,
        cantidad: parseInt(item.Cantidad, 10),
        valorUnitario: +(precioUnitario / 1.18).toFixed(6), 
        precioUnitario: +precioUnitario.toFixed(2),
        unidadMedida: item.UnidadMedida,
        tipoAfectacionIgv: '10', 
      };
}),


    };

    const xmlSinFirma = generarComprobanteXml(comprobanteParaXml);

    const tipoDocSunat = comprobanteParaXml.tipoComprobante; // '01' o '03'
    const nombreArchivo = `${comprobanteParaXml.empresa.ruc}-${tipoDocSunat}-${comprobanteParaXml.serie}-${comprobanteParaXml.numero}.xml`;

    const certificatePath = path.join(process.cwd(), process.env.CERTIFICATE_PATH!);
    const privateKeyPath = path.join(process.cwd(), process.env.PRIVATE_KEY_PATH!);
    const certificatePassword = process.env.CERTIFICATE_PASSWORD!;
    
    if (!fs.existsSync(certificatePath) || !fs.existsSync(privateKeyPath) || !certificatePassword) {
        console.error('Certificado, clave privada o contraseña no encontrados. Verifica las variables de entorno.');
        return res.status(500).json({ error: 'Error de configuración del servidor.' });
    }
    
    const certificatePem = fs.readFileSync(certificatePath, 'utf8');
    const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf8');

    const xmlFirmado = await firmarXml(xmlSinFirma, privateKeyPem, certificatePem);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
    
    return res.status(200).send(xmlFirmado);

  } catch (error) {
    console.error('Error al generar y firmar el XML:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido.';
    return res.status(500).json({ error: 'Error interno del servidor.', details: errorMessage });
  }
}