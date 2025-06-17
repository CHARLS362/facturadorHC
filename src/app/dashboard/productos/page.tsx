import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Package, FileDown, Edit3, Trash2 } from "lucide-react";
import Image from "next/image";

const mockProducts = [
  { id: "PROD001", name: "Camisa de Algodón Premium", category: "Ropa", price: "S/ 79.90", stock: 120, status: "En Stock" },
  { id: "PROD002", name: "Pantalón Cargo Resistente", category: "Ropa", price: "S/ 119.90", stock: 75, status: "En Stock" },
  { id: "PROD003", name: "Zapatillas Urbanas Clásicas", category: "Calzado", price: "S/ 249.90", stock: 0, status: "Agotado" },
  { id: "PROD004", name: "Mochila Antirrobo Impermeable", category: "Accesorios", price: "S/ 189.50", stock: 45, status: "Stock Bajo" },
];

export default function ProductosPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Productos"
        description="Administra tu catálogo de productos, stock y precios."
        icon={Package}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Producto
            </Button>
          </div>
        }
      />

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Listado de Productos</CardTitle>
          <CardDescription>Visualiza y gestiona tus productos.</CardDescription>
           <div className="pt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Buscar productos por nombre, SKU, categoría..." className="pl-10 max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <Image 
                      src={`https://placehold.co/64x64.png`} 
                      alt={product.name} 
                      width={48} 
                      height={48} 
                      className="rounded-md object-cover aspect-square"
                      data-ai-hint="product photo" 
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === "En Stock" ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100" : 
                      product.status === "Stock Bajo" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100" : 
                      "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
                    }`}>
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                      <Edit3 className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 transition-colors">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
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
