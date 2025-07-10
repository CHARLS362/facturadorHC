
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data, in a real scenario this would be fetched
const mockProducts = [
  { id: 'P-001', name: 'Camisa de Algodón Premium', stock: 50, status: 'En Stock' },
  { id: 'P-002', name: 'Pantalón Cargo Resistente', stock: 8, status: 'Stock Bajo' },
  { id: 'P-003', name: 'Zapatillas Urbanas Clásicas', stock: 0, status: 'Agotado' },
  { id: 'P-004', name: 'Gorra de Lona', stock: 120, status: 'En Stock' },
];

interface StockPorAlmacenProps {
  almacenId: number;
}

export function StockPorAlmacen({ almacenId }: StockPorAlmacenProps) {
  // In a real app, you would use almacenId to fetch specific stock info.
  // useEffect(() => { fetchStock(almacenId) }, [almacenId]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'En Stock': return 'default';
      case 'Stock Bajo': return 'secondary';
      case 'Agotado': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Producto</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Stock Actual</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockProducts.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.id}</TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(product.status)}>{product.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
