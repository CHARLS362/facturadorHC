
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data, in a real scenario this would be fetched
const mockSales = [
  { id: 'V-001', date: '2024-07-26', client: 'Cliente Ejemplo 1', total: 'S/ 150.00', status: 'Pagado' },
  { id: 'V-002', date: '2024-07-26', client: 'Cliente Ejemplo 2', total: 'S/ 85.50', status: 'Pendiente' },
  { id: 'V-003', date: '2024-07-25', client: 'Cliente Ejemplo 3', total: 'S/ 220.00', status: 'Pagado' },
];

interface VentasPorAlmacenProps {
  almacenId: number;
}

export function VentasPorAlmacen({ almacenId }: VentasPorAlmacenProps) {
  // In a real app, you would use almacenId to fetch specific sales.
  // useEffect(() => { fetchSales(almacenId) }, [almacenId]);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Venta</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockSales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell>{sale.id}</TableCell>
            <TableCell>{sale.date}</TableCell>
            <TableCell>{sale.client}</TableCell>
            <TableCell>{sale.total}</TableCell>
            <TableCell>
              <Badge variant={sale.status === 'Pagado' ? 'default' : 'secondary'}>{sale.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
