// pages/api/enviar-pdf.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import puppeteer from 'puppeteer';
import { InvoicePreview } from '@/components/templates/invoice-preview';
import { TicketPreview } from '@/components/templates/ticket-preview';
import { sendVentaPdfEmail } from '@/lib/send-email-pdf'; // Asume que admite attachments
import React from 'react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { venta, empresa, email } = req.body;

    const component = venta.TipoDocumento === 'Factura'
      ? React.createElement(InvoicePreview, { venta, empresa })
      : React.createElement(TicketPreview, { venta, empresa });

    const html = renderToStaticMarkup(component);

    const fileName = `${venta.TipoDocumento}_${venta.Serie}-${venta.Numero}.pdf`;
    const tempFilePath = path.join(os.tmpdir(), fileName);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: tempFilePath,
      format: venta.TipoDocumento === 'Boleta' ? [80, 200] : 'A4',
      printBackground: true,
    });

    await browser.close();

    // Leer PDF generado para adjuntar
    const pdfBuffer = await fs.readFile(tempFilePath);

    await sendVentaPdfEmail({
      email,
      fileName,
      attachment: pdfBuffer, // Asegúrate de que tu función acepta buffers
    });

    // Eliminar archivo temporal
    await fs.unlink(tempFilePath);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error en enviar-pdf:', error);
    return res.status(500).json({ ok: false, error: 'No se pudo enviar el PDF' });
  }
}
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb'
    }
  }
};