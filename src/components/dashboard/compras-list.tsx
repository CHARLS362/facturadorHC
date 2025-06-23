
"use client";
import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';

interface MockCompra {
  id: string;
  compraId: number;
  date: string;
  provider: string;
  total: string;
  status: 'Recibido' | 'Pendiente' | 'Cancelado';
}

export function ComprasList({ initialData }: { initialData: MockCompra[] }) {
  const [compras, setCompras] = useState<MockCompra[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompras = useMemo(() => {
    if (!searchTerm) return compras;
    return compras.filter(compra =>
      compra.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.date.includes(searchTerm)
    );
  }, [compras, searchTerm]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "recibido": return "default";
      case "pendiente": return "secondary";
      case "cancelado": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Historial de Compras</CardTitle>
        <CardDescription>Consulta todas las compras realizadas a proveedores.</CardDescription>
        <div className="pt-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por ID, proveedor, fecha..." 
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
                <TableHead>ID Compra</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompras.map((compra) => (
                <TableRow key={compra.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{compra.id}</TableCell>
                  <TableCell>{compra.date}</TableCell>
                  <TableCell>{compra.provider}</TableCell>
                  <TableCell>{compra.total}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(compra.status)} className="capitalize">
                      {compra.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 transition-colors">
                      <Eye className="mr-1.5 h-4 w-4" />
                      <span>Ver</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredCompras.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            {searchTerm ? `No se encontraron compras con "${searchTerm}".` : "No hay compras registradas."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
