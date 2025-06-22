
"use client";
import Link from 'next/link';
import React, { useState, useMemo, useEffect} from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Package, FileDown, Edit3, Trash2, AlertTriangle, CheckCircle2, UploadCloud, Barcode } from "lucide-react";
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
import { Skeleton } from '@/components/ui/skeleton';

interface MockProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: string;
  imageUrl: string | null;
}

export default function ProductosPage() {
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [productToDelete, setProductToDelete] = useState<MockProduct | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<MockProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/producto');
        if (!res.ok) throw new Error('Error al obtener productos');
        const data = await res.json();
        const formattedProducts: MockProduct[] = data.map((prod: any) => ({
          id: prod.IdProducto,
          name: prod.Nombre,
          category: prod.CategoriaNombre || 'Sin categoría',
          price: `S/ ${parseFloat(prod.Precio).toFixed(2)}`,
          stock: prod.Stock,
          status:
            prod.Stock === 0
              ? 'Agotado'
              : prod.Stock <= prod.StockMinimo
              ? 'Stock Bajo'
              : 'En Stock',
          imageUrl: prod.ImagenUrl || null,
        }));
        setProducts(formattedProducts);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos.",
          variant: "destructive"
        });
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(product.id).toLowerCase().includes(searchTerm.toLowerCase())
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

  const TableSkeleton = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skeleton-product-${i}`}>
        <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Productos"
        description="Administra tu catálogo de productos, stock y precios."
        icon={Package}
        actions={
          <div className="flex gap-2">
             <Button variant="outline" asChild>
              <Link href="/dashboard/productos/exportar">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/productos/importar">
                <UploadCloud className="mr-2 h-4 w-4" />
                Importación Masiva
              </Link>
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
              {isLoading ? <TableSkeleton /> : (
                filteredProducts.map((product) => (
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
                ))
              )}
            </TableBody>
          </Table>
           {!isLoading && filteredProducts.length === 0 && (
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
    </div>
  );
}
