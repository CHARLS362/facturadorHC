"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import html2pdf from 'html2pdf.js';
import { InvoicePreview, type VentaDataForTemplate, type EmpresaDataForTemplate } from "@/components/templates/invoice-preview";
import { TicketPreview } from "@/components/templates/ticket-preview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface VentaFromApi {
  IdVenta: number;
  FechaVenta: string;
  NombreCliente: string;
  DocumentoCliente: string;
  TipoDocumento: "Factura" | "Boleta";
  NombreTipoDocumentoCliente: string;
  DireccionCliente: string;
  IdComprobante: string;
  items: Array<{
    NombreProducto: string;
    Cantidad: number;
    PrecioUnitario: number;
    Total: number;
  }>;
  Total: number;
  NombreFormaPago: string;
}

const mockCompanyInfoFallback: EmpresaDataForTemplate = {
    name: "FacturacionHC Predeterminada S.A.C.",
    address: "Av. La Innovación 123, Distrito Tecnológico, Lima, Perú",
    ruc: "20123456789",
    phone: "(01) 555-1234",
    email: "ventas@facturacionhc.com",
    logoUrl: "https://placehold.co/240x70.png?text=Mi+Logo",
};

const numberToWords = (num: number): string => {
    if (num === null || num === undefined) return "CERO Y 00/100 SOLES";
    const integerPartStr = Math.floor(num).toString();
    const decimalPartStr = num.toFixed(2).split('.')[1];
    return `... ${integerPartStr} Y ${decimalPartStr}/100 SOLES`; // Placeholder
}

export default function ImprimirVentaPage() {
  const router = useRouter();
  const params = useParams();
  const ventaId = params.id as string;
  const [venta, setVenta] = useState<VentaFromApi | null>(null);
  const [companyInfo, setCompanyInfo] = useState<EmpresaDataForTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const fetchVenta = fetch(`/api/venta/${ventaId}`)
        .then(res => {
            if (!res.ok) throw new Error("Venta no encontrada");
            return res.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);
            setVenta(data);
        })
        .catch(() => setVenta(null));

    const loadCompanyInfo = () => {
        try {
            const savedSettings = localStorage.getItem('companySettings');
            const parsed = savedSettings ? JSON.parse(savedSettings) : {};
            setCompanyInfo({
                name: parsed.companyName || mockCompanyInfoFallback.name,
                address: parsed.companyAddress || mockCompanyInfoFallback.address,
                ruc: parsed.companyRuc || mockCompanyInfoFallback.ruc,
                phone: parsed.companyPhone || mockCompanyInfoFallback.phone,
                email: parsed.companyEmail || mockCompanyInfoFallback.email,
                logoUrl: parsed.companyLogoUrl || mockCompanyInfoFallback.logoUrl,
            });
        } catch(e) {
            setCompanyInfo(mockCompanyInfoFallback);
        }
    };
    
    loadCompanyInfo();

    Promise.all([fetchVenta]).finally(() => {
        setIsLoading(false);
    });
  }, [ventaId]);

  useEffect(() => {
    if (!isLoading && venta && companyInfo) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, venta, companyInfo]);

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-area-content');
    if (!element) return;
    
    const isTicket = venta?.TipoDocumento === 'Boleta';

    const opt = {
      margin: 0,
      filename: `${venta?.TipoDocumento}_${venta?.IdComprobante || venta?.IdVenta}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: isTicket 
        ? { unit: 'mm', format: [80, 200], orientation: 'portrait' }
        : { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };
  
  const handlePrint = () => {
    window.print();
  };

  const getMappedVentaData = (): VentaDataForTemplate | null => {
      if (!venta) return null;
      const totalGeneral = Number(venta.Total);
      const opGravada = totalGeneral / 1.18;
      const igv = totalGeneral - opGravada;

      return {
          id: `${venta.TipoDocumento === 'Factura' ? 'F001' : 'B001'}-${String(venta.IdVenta).padStart(8, '0')}`,
          fecha: venta.FechaVenta,
          cliente: {
              nombre: venta.NombreCliente,
              documento: venta.DocumentoCliente,
              tipoDocumento: venta.NombreTipoDocumentoCliente === 'RUC' ? 'RUC' : 'DNI',
              direccion: venta.DireccionCliente
          },
          items: venta.items.map(item => ({
              cantidad: item.Cantidad,
              unidad: "UND",
              nombre: item.NombreProducto,
              precioUnitario: Number(item.PrecioUnitario),
              total: Number(item.Total)
          })),
          opGravada: opGravada,
          igv: igv,
          totalGeneral: totalGeneral,
          totalEnLetras: numberToWords(totalGeneral),
          paymentMethod: venta.NombreFormaPago || 'Efectivo',
      };
  }
  
  const mappedData = getMappedVentaData();

  const renderContent = () => {
    if (isLoading || !companyInfo) {
      return <Skeleton className="h-[842px] w-[595px] mx-auto bg-muted-foreground/20" />;
    }
    if (!venta || !mappedData) {
      return (
         <Card className="shadow-xl rounded-lg w-full max-w-4xl mx-auto border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Venta no encontrada</CardTitle>
            <CardDescription>No se pudo encontrar la venta con ID: {ventaId}. Vuelva atrás e inténtelo de nuevo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (venta.TipoDocumento === "Factura") {
        return <InvoicePreview venta={mappedData} empresa={companyInfo} />;
    } else {
        return <TicketPreview venta={mappedData} empresa={companyInfo} />;
    }
  };

  return (
    <div className="space-y-8 p-6 print:p-0">
      <div className="print-hide">
        <PageHeader
          title={`Imprimiendo: ${venta?.TipoDocumento || 'Comprobante'}`}
          description="Su documento se está preparando para la impresión."
          icon={Printer}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Detalles
              </Button>
              <Button variant="secondary" onClick={handleDownloadPdf} disabled={isLoading || !venta}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
              <Button onClick={handlePrint} disabled={isLoading || !venta}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir de Nuevo
              </Button>
            </div>
          }
        />
      </div>

      <div id="printable-area" className="bg-muted flex justify-center py-8 print:p-0 print:bg-white">
        <div id="printable-area-content" className="transform scale-[0.9] md:scale-[1] origin-top print:transform-none">
           {renderContent()}
        </div>
      </div>
    </div>
  );
}
