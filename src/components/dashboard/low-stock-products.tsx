
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  imageUrl: string | null;
  sku: string;
}

export function LowStockProducts() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchLowStock = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/producto?status=low_stock');
          if (!res.ok) {
            throw new Error('Error al cargar productos');
          }
          const data = await res.json();
          const formattedProducts: LowStockProduct[] = data.map((prod: any) => ({
            id: prod.IdProducto.toString(),
            name: prod.Nombre,
            stock: prod.Stock,
            imageUrl: prod.ImagenUrl,
            sku: prod.Codigo || 'N/A',
          }));
          setProducts(formattedProducts);
        } catch (error) {
          console.error("Failed to fetch low stock products:", error);
          setProducts([]); // Set to empty on error
        } finally {
          setIsLoading(false);
        }
    };
    fetchLowStock();
  }, []);

  const ProductSkeleton = () => (
    Array.from({ length: 3 }).map((_, i) => (
       <div key={`skel-${i}`} className="flex items-center p-2">
         <Skeleton className="h-9 w-9 rounded-full" />
         <div className="ml-4 space-y-1 w-full">
           <Skeleton className="h-4 w-3/4" />
           <Skeleton className="h-3 w-1/2" />
         </div>
         <Skeleton className="h-6 w-12 rounded-md" />
      </div>
    ))
  );

  return (
    <div className="space-y-4">
      {isLoading ? <ProductSkeleton /> : (
        products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="flex items-center p-2 hover:bg-muted/50 rounded-md transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarImage src={product.imageUrl || `https://avatar.vercel.sh/${product.sku}.png`} alt={product.name} />
                <AvatarFallback>
                  <ShieldAlert className="h-4 w-4 text-muted-foreground"/>
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{product.name}</p>
                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              </div>
              <div className="ml-auto font-bold text-sm text-yellow-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{product.stock}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No hay productos con bajo stock.</p>
        )
      )}
      <div className="pt-2 text-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard/productos">
            Ver todos los productos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
