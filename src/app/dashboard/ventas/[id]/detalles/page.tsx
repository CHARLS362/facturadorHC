
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Eye, Printer, FileDown, FileCode2, FileCheck2, Send, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoicePreview, type VentaDataForTemplate, type EmpresaDataForTemplate } from "@/components/templates/invoice-preview";
import { TicketPreview } from "@/components/templates/ticket-preview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { WhatsappConfirmationDialog } from '@/components/dashboard/whatsapp-confirmation-dialog';
import html2pdf from 'html2pdf.js';

interface VentaFromApi {
  IdVenta: number;
  FechaVenta: string;
  NombreCliente: string;
  DocumentoCliente: string;
  TipoDocumento: "Factura" | "Boleta";
  NombreTipoDocumentoCliente: string;
  DireccionCliente: string;
  EmailCliente: string;
  TelefonoCliente: string;
  IdComprobante: string;
  items: Array<{
    IdProducto: number;
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

export default function DetallesVentaPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const ventaId = params.id as string;

  const [venta, setVenta] = useState<VentaFromApi | null>(null);
  const [companyInfo, setCompanyInfo] = useState<EmpresaDataForTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWhatsappDialogOpen, setIsWhatsappDialogOpen] = useState(false);
  
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

    Promise.all([fetchVenta]).finally(() => setIsLoading(false));
  }, [ventaId]);

  const handlePrint = () => {
    router.push(`/dashboard/ventas/${ventaId}/imprimir`);
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-area-content');
    if (!element || !venta) return;
    
    const isTicket = venta.TipoDocumento === 'Boleta';
    const opt = {
      margin: 0,
      filename: `${venta.TipoDocumento}_${venta.IdComprobante || venta.IdVenta}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: isTicket 
        ? { unit: 'mm', format: [80, 200], orientation: 'portrait' }
        : { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleConfirmAndSendWhatsapp = (phoneNumber: string, updateClient: boolean) => {
    if (!venta) return;
    const message = `Hola ${venta.NombreCliente}, adjunto los detalles de tu ${venta.TipoDocumento.toLowerCase()} con ID: ${venta.IdVenta}. Gracias por tu compra.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    if (updateClient) {
      console.log(`Simulating update of phone number for ${venta.NombreCliente} to ${phoneNumber}`);
    }
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
              unidad: "NIU", // API does not provide this, using placeholder
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

  const handleEmail = () => {
    if (!mappedData || !venta) return;
    const mailtoLink = `mailto:${venta.EmailCliente || ''}?subject=Comprobante%20Electrónico:%20${mappedData.id}&body=Estimado(a)%20${venta.NombreCliente},%0A%0AAdjuntamos%20los%20detalles%20de%20su%20comprobante.%0A%0AGracias%20por%20su%20preferencia.`;

    toast({
        title: "Paso siguiente: Adjuntar PDF",
        description: "No olvides descargar el PDF primero para adjuntarlo a tu correo.",
        variant: "default",
    });
    window.location.href = mailtoLink;
  };

  const handleDownloadXml = () => {
    if (!ventaId) return;
    window.open(`/api/venta/${ventaId}/xml`, '_blank');
    toast({
        title: "Descargando XML...",
        description: "Se está generando el archivo XML para la descarga.",
    });
  };

  const handleDownloadCdr = () => {
    if (!venta || !mappedData) return;
    const cdrContent = `El comprobante ${mappedData.id} ha sido aceptado por SUNAT.`;
    const blob = new Blob([cdrContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `R-${mappedData.id}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
        title: "CDR Descargado (Simulación)",
        description: "Se ha iniciado la descarga del archivo CDR de respuesta.",
    });
  };

  const renderLoading = () => (
    <div className="space-y-8">
      <PageHeader title="Cargando Detalles de Venta..." icon={Eye} />
      <div className="flex justify-center py-8">
        <Skeleton className="h-[842px] w-[595px] bg-muted-foreground/20" />
      </div>
    </div>
  );

  const renderNotFound = () => (
    <div className="space-y-8">
      <PageHeader title="Error: Venta no Encontrada" icon={Eye} />
      <Card className="shadow-xl rounded-lg w-full max-w-4xl mx-auto border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Venta no encontrada</CardTitle>
          <CardDescription>No se pudo encontrar la venta con ID: {ventaId}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push("/dashboard/ventas")}>
            Volver al Listado de Ventas
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading || !companyInfo) return renderLoading();
  if (!venta || !mappedData) return renderNotFound();

  return (
    <div className="space-y-8">
      <div className="print-hide">
        <PageHeader
          title={`Detalles: ${venta.TipoDocumento}`}
          description={`Visualizando ${mappedData.id}`}
          icon={Eye}
          actions={
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver
              </Button>
              <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/>Imprimir</Button>
              <Button variant="secondary" onClick={handleDownloadPdf}><FileDown className="mr-2 h-4 w-4"/>PDF</Button>
              <Button variant="secondary" onClick={handleDownloadXml}><FileCode2 className="mr-2 h-4 w-4"/>XML</Button>
              <Button variant="secondary" onClick={handleDownloadCdr}><FileCheck2 className="mr-2 h-4 w-4"/>CDR</Button>
              <Button variant="outline" className="text-green-600 border-green-500/50 hover:bg-green-500/10" onClick={() => setIsWhatsappDialogOpen(true)}><Send className="mr-2 h-4 w-4"/>WhatsApp</Button>
              <Button onClick={handleEmail} variant="outline" className="text-orange-600 border-orange-500/50 hover:bg-orange-500/10">
                <Mail className="mr-2 h-4 w-4"/>Email
              </Button>
            </div>
          }
        />
      </div>
      
      <div id="printable-area" className="bg-muted flex justify-center py-8 print:p-0 print:bg-white">
        <div id="printable-area-content" className="transform scale-[0.9] md:scale-[1] origin-top print:transform-none">
          {venta.TipoDocumento === "Factura" ? (
            <InvoicePreview venta={mappedData} empresa={companyInfo} />
          ) : (
            <TicketPreview venta={mappedData} empresa={companyInfo} />
          )}
        </div>
      </div>
      
      <WhatsappConfirmationDialog
        isOpen={isWhatsappDialogOpen}
        onOpenChange={setIsWhatsappDialogOpen}
        saleData={{
          id: mappedData.id,
          customer: venta.NombreCliente,
          clientPhone: venta.TelefonoCliente
        }}
        onConfirm={handleConfirmAndSendWhatsapp}
      />
    </div>
  );
}
