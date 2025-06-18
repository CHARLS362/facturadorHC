
"use client";
import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Package, FileDown, Edit3, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


interface MockProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: string;
  imageUrl?: string; // Optional: for product image
}

const initialMockProducts: MockProduct[] = [
  { id: "PROD001", name: "Camisa de Algodón Premium", category: "Ropa", price: "S/ 79.90", stock: 120, status: "En Stock", imageUrl: `https://placehold.co/64x64.png?text=C01` },
  { id: "PROD002", name: "Pantalón Cargo Resistente", category: "Ropa", price: "S/ 119.90", stock: 75, status: "En Stock", imageUrl: `https://placehold.co/64x64.png?text=P01` },
  { id: "PROD003", name: "Zapatillas Urbanas Clásicas", category: "Calzado", price: "S/ 249.90", stock: 0, status: "Agotado", imageUrl: `https://placehold.co/64x64.png?text=Z01` },
  { id: "PROD004", name: "Mochila Antirrobo Impermeable", category: "Accesorios", price: "S/ 189.50", stock: 45, status: "Stock Bajo", imageUrl: `https://placehold.co/64x64.png?text=M01` },
];

export default function ProductosPage() {
  const [products, setProducts] = useState<MockProduct[]>(initialMockProducts);
  const [productToDelete, setProductToDelete] = useState<MockProduct | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete.id));
    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 p-1 bg-emerald-500 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <span>Producto Eliminado</span>
        </div>
      ),
      description: `El producto ${productToDelete.name} ha sido eliminado.`,
    });
    setProductToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (product: MockProduct) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };


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
            <Button asChild>
              <Link href="/dashboard/productos/nuevo">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Producto
              </Link>
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
            <Input 
              placeholder="Buscar productos por nombre, SKU, categoría..." 
              className="pl-10 max-w-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <Image 
                      src={product.imageUrl || `https://placehold.co/64x64.png?text=${product.id.substring(0,3)}`}
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
                    <Button variant="ghost" size="icon" className="hover:text-primary transition-colors" asChild>
                      <Link href={`/dashboard/productos/${product.id}/editar`}>
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 transition-colors" onClick={() => openDeleteDialog(product)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProducts.length === 0 && searchTerm && (
            <p className="text-center text-muted-foreground py-4">No se encontraron productos con "{searchTerm}".</p>
          )}
        </CardContent>
      </Card>

      {productToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Confirmar Eliminación
              </AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar el producto <strong>{productToDelete.name}</strong>? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteProduct}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Eliminar Producto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </div>
  );
}
