import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, ShoppingCart, FileDown, Eye, FileEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockSales = [
  { id: "VENTA001", date: "2024-07-20", customer: "Carlos Mendoza", total: "S/ 150.00", status: "Pagado", paymentMethod: "Tarjeta" },
  { id: "VENTA002", date: "2024-07-19", customer: "Luisa Fernandez", total: "S/ 85.50", status: "Pendiente", paymentMethod: "Efectivo" },
  { id: "VENTA003", date: "2024-07-19", customer: "Ana Torres", total: "S/ 220.00", status: "Pagado", paymentMethod: "Transferencia" },
  { id: "VENTA004", date: "2024-07-18", customer: "Jorge Vargas", total: "S/ 45.00", status: "Anulado", paymentMethod: "Yape" },
];

export default function VentasPage() {
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pagado": return "default"; // Uses primary color
      case "pendiente": return "secondary"; // Uses secondary color (often gray)
      case "anulado": return "destructive";
      default: return "outline";
    }
  };
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Ventas"
        description="Registra y administra todas las transacciones de ventas."
        icon={ShoppingCart}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Ventas
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Venta
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
            <Input placeholder="Buscar ventas por ID, cliente, fecha..." className="pl-10 max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Venta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.total}</TableCell>
                  <TableCell>{sale.paymentMethod}</TableCell>
                  <TableCell>
                     <Badge variant={getStatusBadgeVariant(sale.status)} className="capitalize">
                       {sale.status}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                      <Eye className="h-4 w-4" />
                       <span className="sr-only">Ver Detalle</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-accent transition-colors">
                      <FileEdit className="h-4 w-4" />
                       <span className="sr-only">Editar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
