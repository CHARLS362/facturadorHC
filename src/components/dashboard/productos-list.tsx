
"use client";
import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit3, Trash2, AlertTriangle, CheckCircle2, Barcode } from "lucide-react";
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
import { BarcodeDialog } from '@/components/dashboard/barcode-dialog';
import { Button } from '@/components/ui/button';

interface MockProduct {
  id: number;
  name: string;
  sku: string | null;
  category: string;
  price: string;
  stock: number;
  status: string;
  imageUrl: string | null;
}

export function ProductosList({ initialData }: { initialData: MockProduct[] }) {
  const [products, setProducts] = useState<MockProduct[]>(initialData);
  const [productToDelete, setProductToDelete] = useState<MockProduct | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<MockProduct | null>(null);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const res = await fetch(`/api/producto/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar producto');

      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
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
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el producto.",
      });
    } finally {
      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (product: MockProduct) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
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
                        src={product.imageUrl || `https://placehold.co/64x64.png?text=${String(product.name).substring(0,3)}`}
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
                      <Button variant="ghost" size="icon" className="hover:text-blue-500 transition-colors" onClick={() => setSelectedProductForBarcode(product)}>
                        <Barcode className="h-4 w-4" />
                        <span className="sr-only">Ver Código de Barras</span>
                      </Button>
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
           {filteredProducts.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              {searchTerm ? `No se encontraron productos con "${searchTerm}".` : "No hay productos registrados."}
            </p>
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

      <BarcodeDialog
        isOpen={!!selectedProductForBarcode}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedProductForBarcode(null);
          }
        }}
        product={selectedProductForBarcode}
      />
    </>
  );
}
