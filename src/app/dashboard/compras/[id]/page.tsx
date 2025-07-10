
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, ArrowLeft, Printer, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import html2pdf from 'html2pdf.js';

interface CompraDetalle {
  Compra_id: string;
  Fecha: string;
  Proveedor: string;
  Total: number;
  Estado: 'Recibido' | 'Pendiente' | 'Cancelado';
  items: {
    NombreProducto: string;
    Cantidad: number;
    CostoUnitario: number;
    Subtotal: number;
  }[];
  subtotal: number;
  igv: number;
}

export default function DetalleCompraPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [compra, setCompra] = useState<CompraDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCompra = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/compra/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            notFound();
          }
          throw new Error("Error al cargar los datos de la compra");
        }
        const data = await res.json();
        setCompra(data);
      } catch (error) {
        console.error(error);
        setCompra(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompra();
  }, [id]);

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-area');
    if (!element) return;
    const opt = {
      margin:       0.5,
      filename:     `compra_${compra?.Compra_id || id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };


  const getStatusBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "recibido": return "default";
      case "pendiente": return "secondary";
      case "cancelado": return "destructive";
      default: return "outline";
    }
  };
  
  if (isLoading) {
    return (
        <div className="space-y-8">
            <PageHeader title="Cargando detalles de la compra..." icon={ClipboardList} />
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-1/4 ml-auto" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!compra) {
    return (
      <div className="space-y-8 text-center">
        <PageHeader title="Compra no encontrada" icon={ClipboardList} />
        <p>No se pudo cargar la información de la compra. Por favor, intente de nuevo.</p>
        <Button onClick={() => router.push('/dashboard/compras')}>Volver al Listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Detalle de Compra: ${compra.Compra_id}`}
        description={`Realizada a ${compra.Proveedor} el ${format(new Date(compra.Fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}`}
        icon={ClipboardList}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
            <Button onClick={() => router.push(`/dashboard/compras/${id}/imprimir`)}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        }
      />

      <div id="printable-area">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader className="flex flex-row justify-between items-start bg-muted/30 p-6">
            <div>
              <CardTitle className="text-2xl font-headline">Orden de Compra</CardTitle>
              <CardDescription>ID: {compra.Compra_id}</CardDescription>
            </div>
            <div className="text-right">
                <p className="font-semibold">{compra.Proveedor}</p>
                <p className="text-sm text-muted-foreground">Fecha: {format(new Date(compra.Fecha), "dd/MM/yyyy")}</p>
                <Badge variant={getStatusBadgeVariant(compra.Estado)} className="mt-2 capitalize">{compra.Estado}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="font-semibold mb-4">Detalle de Productos:</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Costo Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compra.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.NombreProducto}</TableCell>
                    <TableCell className="text-right">{item.Cantidad}</TableCell>
                    <TableCell className="text-right">S/ {item.CostoUnitario.toFixed(2)}</TableCell>
                    <TableCell className="text-right">S/ {item.Subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-muted/30 p-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>S/ {compra.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IGV (18%):</span><span>S/ {compra.igv.toFixed(2)}</span></div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg"><span className="text-primary">Total:</span><span className="text-primary">S/ {compra.Total.toFixed(2)}</span></div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
