
"use client";
import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  PlusCircle, 
  Search, 
  ShoppingCart, 
  FileDown, 
  Eye, 
  FileText, 
  Receipt,  
  FileCode2, 
  FileCheck2, 
  Printer,
  Send, 
  Mail,
  Ban, 
  ChevronDown,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WhatsappConfirmationDialog } from '@/components/dashboard/whatsapp-confirmation-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface MockSale {
  id: string;
  ventaId: number;
  date: string;
  customer: string;
  total: string;
  status: string;
  paymentMethod: string;
  documentType: "Factura" | "Boleta";
  clientEmail: string;
  clientPhone: string;
}


export default function VentasPage() {
  const [sales, setSales] = useState<MockSale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [isWhatsappDialogOpen, setIsWhatsappDialogOpen] = useState(false);
  const [selectedSaleForWhatsapp, setSelectedSaleForWhatsapp] = useState<MockSale | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/venta');
        if (!res.ok) throw new Error("Failed to fetch sales");
        const data = await res.json();
        const ventas = data.map((venta: any) => ({
          id: `VENTA${venta.IdVenta.toString().padStart(3, '0')}`,
          ventaId: venta.IdVenta,
          date: venta.FechaVenta ? new Date(venta.FechaVenta).toLocaleDateString('es-PE') : "",
          customer: venta.NombreCliente || "Sin nombre",
          total: `S/ ${Number(venta.Total).toFixed(2)}`,
          status: venta.Estado,
          paymentMethod: venta.NombreFormaPago || "Desconocido",
          documentType: venta.TipoDocumento || "Factura",
          clientEmail: venta.EmailCliente || "",
          clientPhone: venta.TelefonoCliente || "",
        }));
        setSales(ventas);
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar las ventas", variant: "destructive" });
        setSales([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, [toast]);

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    return sales.filter(sale =>
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.date.includes(searchTerm) ||
      sale.documentType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

  
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pagado": return "default";
      case "pendiente": return "secondary";
      case "anulado": return "destructive";
      default: return "outline";
    }
  };

  const getDocumentIcon = (docType: string) => {
    if (docType.toLowerCase() === "factura") {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    if (docType.toLowerCase() === "boleta") {
      return <Receipt className="h-5 w-5 text-green-600" />;
    }
    return null;
  };

  const handleAnularVenta = async (ventaId: number) => {
  try {
    const res = await fetch(`/api/venta/${ventaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Estado: "Anulado" }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "No se pudo anular la venta");

    setSales(prevSales =>
      prevSales.map(s => s.ventaId === ventaId ? { ...s, status: "Anulado" } : s)
    );
    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-white" />
          <span>Venta Anulada</span>
        </div>
      ),
      description: `La venta VENTA${ventaId.toString().padStart(3, '0')} ha sido marcada como anulada.`,
    });
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "No se pudo anular la venta.",
    });
  }
};

  const handleOpenWhatsappDialog = (sale: MockSale) => {
    setSelectedSaleForWhatsapp(sale);
    setIsWhatsappDialogOpen(true);
  };

  const handleConfirmAndSendWhatsapp = (phoneNumber: string, updateClient: boolean, saleId: string, customerName: string) => {
    const message = `Hola ${customerName}, adjunto los detalles de tu ${selectedSaleForWhatsapp?.documentType.toLowerCase()} con ID: ${saleId}. Gracias por tu compra.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    if (updateClient) {
      console.log(`Simulating update of phone number for ${customerName} (Sale ID: ${saleId}) to ${phoneNumber}`);
      
      setSales(prevSales => 
        prevSales.map(s => s.id === saleId ? {...s, clientPhone: phoneNumber} : s)
      );

      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-white" />
            <span>Cliente Actualizado</span>
          </div>
        ),
        description: `El número de teléfono de ${customerName} ha sido actualizado a ${phoneNumber}.`,
      });
    }
  };

  const TableSkeleton = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skeleton-sale-${i}`}>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-5 rounded-md" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Ventas"
        description="Registra y administra todas las transacciones de ventas."
        icon={ShoppingCart}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/ventas/exportar">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Ventas
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/ventas/nueva">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Venta
              </Link>
            </Button>
          </div>
        }
      />
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <CardDescription>Consulta todas las ventas realizadas y su estado.</CardDescription>
          <div className="pt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar ventas por ID, cliente, fecha..." 
              className="pl-10 max-w-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Venta</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo Doc.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right min-w-[230px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? <TableSkeleton /> : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell suppressHydrationWarning>{sale.date}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" title={sale.documentType}>
                          {getDocumentIcon(sale.documentType)}
                          <span className="hidden sm:inline">{sale.documentType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{sale.total}</TableCell>
                      <TableCell>{sale.paymentMethod}</TableCell>
                      <TableCell>
                         <Badge variant={getStatusBadgeVariant(sale.status)} className="capitalize">
                           {sale.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 transition-colors" asChild>
                          <Link href={`/dashboard/ventas/${sale.ventaId}/detalles`}>
                            <Eye className="mr-1.5 h-4 w-4" />
                            <span>Ver</span>
                          </Link>
                        </Button>
                         {sale.status.toLowerCase() !== 'anulado' && (
                          <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-orange-500 hover:text-orange-600 transition-colors" 
                              onClick={() => handleAnularVenta(sale.ventaId)}
                          >
                              <Ban className="mr-1.5 h-4 w-4" />
                              <span>Anular</span>
                          </Button>
                         )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Más
                              <ChevronDown className="ml-1.5 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild className="text-gray-600 dark:text-gray-400 focus:text-gray-700 dark:focus:text-gray-300 focus:bg-gray-500/10">
                              <Link href={`/dashboard/ventas/${sale.ventaId}/imprimir`}>
                                <Printer className="mr-2 h-4 w-4" />
                                <span>Imprimir</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Exportar PDF</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-blue-500 focus:text-blue-500 focus:bg-blue-500/10">
                              <FileCode2 className="mr-2 h-4 w-4" />
                              <span>Exportar XML</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-green-500 focus:text-green-500 focus:bg-green-500/10">
                              <FileCheck2 className="mr-2 h-4 w-4" />
                              <span>Ver CDR</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem 
                               className="text-green-600 focus:text-green-600 focus:bg-green-500/10"
                               onSelect={() => handleOpenWhatsappDialog(sale)}
                             >
                                <Send className="mr-2 h-4 w-4" />
                                <span>Enviar WhatsApp</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-orange-500 focus:text-orange-500 focus:bg-orange-500/10">
                              <a href={`mailto:${sale.clientEmail}?subject=Venta%20${sale.id}&body=Hola,%0AAdjunto%20los%20detalles%20de%20la%20venta%20${sale.id}.%0ASaludos.`}>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Enviar Email</span>
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
           {!isLoading && filteredSales.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              {searchTerm ? `No se encontraron ventas con "${searchTerm}".` : "No hay ventas registradas."}
            </p>
          )}
        </CardContent>
      </Card>

      <WhatsappConfirmationDialog
        isOpen={isWhatsappDialogOpen}
        onOpenChange={setIsWhatsappDialogOpen}
        saleData={selectedSaleForWhatsapp}
        onConfirm={handleConfirmAndSendWhatsapp}
      />
    </div>
  );
}
