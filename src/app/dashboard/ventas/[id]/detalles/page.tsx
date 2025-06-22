
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Eye, Printer, FileText as FileTextIcon, FileCode2, FileCheck2, Send, Mail, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface VentaDetalle {
  id: string;
  fecha: string; // Store raw date string from API
  cliente: {
    nombre: string;
    documento: string;
    tipoDocumento: string;
    direccion?: string;
    email?: string;
    telefono?: string;
  };
  tipoComprobante: "Factura" | "Boleta";
  serieCorrelativo: string;
  items: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
  }>;
  subtotal: number;
  igv: number;
  totalGeneral: number;
  metodoPago: string;
  estado: string;
  notas?: string;
}

export default function DetallesVentaPage() {
  const router = useRouter();
  const params = useParams();
  const ventaId = params.id as string;
  const [venta, setVenta] = useState<VentaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    if (ventaId) {
      setIsLoading(true);
      fetch(`/api/venta/${ventaId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            throw new Error(data.error);
          }
          setVenta({
            id: `VENTA${data.IdVenta.toString().padStart(3, '0')}`,
            fecha: data.FechaVenta, // Store raw ISO string
            cliente: {
              nombre: data.NombreCliente,
              documento: data.DocumentoCliente,
              tipoDocumento: data.NombreTipoDocumentoCliente,
              direccion: data.DireccionCliente,
              email: data.EmailCliente,
              telefono: data.TelefonoCliente,
            },
            tipoComprobante: data.TipoDocumento,
            serieCorrelativo: data.IdComprobante ? `C${data.IdComprobante.toString().padStart(3, '0')}` : "",
            items: (data.items || []).map((item: any) => ({
              id: `PROD${item.IdProducto.toString().padStart(3, '0')}`,
              nombre: item.NombreProducto,
              cantidad: item.Cantidad,
              precioUnitario: item.PrecioUnitario,
              total: item.Total,
            })),
            subtotal: Number(data.Total) / 1.18,
            igv: Number(data.Total) - (Number(data.Total) / 1.18),
            totalGeneral: Number(data.Total),
            metodoPago: data.NombreFormaPago,
            estado: data.Estado,
            notas: "",
          });
          setFormattedDate(new Date(data.FechaVenta).toLocaleString('es-PE'));
        })
        .catch(() => {
          setVenta(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [ventaId]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Cargando Detalles de Venta..." icon={ShoppingBag} />
        <Card className="shadow-xl rounded-lg w-full max-w-4xl mx-auto border-border/50 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="space-y-8">
        <PageHeader title="Error: Venta no Encontrada" icon={ShoppingBag} />
        <Card className="shadow-xl rounded-lg w-full max-w-4xl mx-auto border-border/50">
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
  }
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pagado": return "default";
      case "pendiente": return "secondary";
      case "anulado": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Detalles de Venta: ${venta.id}`}
        description={`Visualizando ${venta.tipoComprobante} ${venta.serieCorrelativo}`}
        icon={Eye}
        actions={
            <Button variant="outline" asChild>
                <Link href="/dashboard/ventas">Volver al Listado</Link>
            </Button>
        }
      />
      <Card className="shadow-xl rounded-lg w-full max-w-4xl mx-auto border-border/50">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="font-headline text-2xl">{venta.tipoComprobante} Electrónica</CardTitle>
            <CardDescription>{venta.serieCorrelativo}</CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(venta.estado)} className="capitalize text-sm px-3 py-1">
            {venta.estado}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-md border border-border/30">
            <div>
              <h3 className="font-semibold text-md mb-1 text-primary">Cliente</h3>
              <p className="font-medium">{venta.cliente.nombre}</p>
              <p>{venta.cliente.tipoDocumento}: {venta.cliente.documento}</p>
              {venta.cliente.direccion && <p>{venta.cliente.direccion}</p>}
              {venta.cliente.email && <p>Email: {venta.cliente.email}</p>}
              {venta.cliente.telefono && <p>Tel: {venta.cliente.telefono}</p>}
            </div>
            <div>
              <h3 className="font-semibold text-md mb-1 text-primary">Detalles del Comprobante</h3>
              <p>Fecha de Emisión: {formattedDate}</p>
              <p>Método de Pago: {venta.metodoPago}</p>
              {venta.notas && <p>Notas: {venta.notas}</p>}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2 text-primary">Items de la Venta</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto/Servicio</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">P. Unit. (S/)</TableHead>
                  <TableHead className="text-right">Total (S/)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venta.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nombre}</TableCell>
                    <TableCell className="text-right">{item.cantidad}</TableCell>
                    <TableCell className="text-right">{item.precioUnitario.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
            <div className="md:col-start-2 space-y-1">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">S/ {venta.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">IGV (18%):</span>
                    <span className="font-medium">S/ {venta.igv.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-lg font-bold text-primary pt-1 border-t border-border/50 mt-1">
                    <span>Total General:</span>
                    <span>S/ {venta.totalGeneral.toFixed(2)}</span>
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2 pt-6 border-t border-border/30 mt-6">
            <Button variant="outline" size="sm"><Printer className="mr-2 h-4 w-4"/> Imprimir</Button>
            <Button variant="outline" size="sm" className="text-red-600 border-red-500/50 hover:bg-red-500/10 hover:text-red-700"><FileTextIcon className="mr-2 h-4 w-4"/> PDF</Button>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-700"><FileCode2 className="mr-2 h-4 w-4"/> XML</Button>
            <Button variant="outline" size="sm" className="text-green-600 border-green-500/50 hover:bg-green-500/10 hover:text-green-700"><FileCheck2 className="mr-2 h-4 w-4"/> CDR</Button>
            <Button variant="outline" size="sm" className="text-green-700 border-green-600/50 hover:bg-green-600/10 hover:text-green-800">
              <Send className="mr-2 h-4 w-4"/> WhatsApp
            </Button>
             <Button variant="outline" size="sm" className="text-orange-600 border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-700">
              <Mail className="mr-2 h-4 w-4"/> Email
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
