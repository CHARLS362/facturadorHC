
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface HistoryItem {
  IdCaja: number;
  FechaCierre: string;
  MontoInicial: number;
  MontoFinalCalculado: number;
  MontoFinalReal: number;
  Diferencia: number;
}

interface HistorialCajaProps {
  history: HistoryItem[];
}

export function HistorialCaja({ history }: HistorialCajaProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Historial de Cierres de Caja</CardTitle>
        <CardDescription>Últimas 10 sesiones de caja cerradas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha Cierre</TableHead>
              <TableHead>Monto Inicial</TableHead>
              <TableHead>Monto Calculado</TableHead>
              <TableHead>Monto Real</TableHead>
              <TableHead>Diferencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history && history.length > 0 ? history.map((item) => (
              <TableRow key={item.IdCaja}>
                <TableCell>{new Date(item.FechaCierre).toLocaleString('es-PE')}</TableCell>
                <TableCell>S/ {Number(item.MontoInicial).toFixed(2)}</TableCell>
                <TableCell>S/ {Number(item.MontoFinalCalculado).toFixed(2)}</TableCell>
                <TableCell>S/ {Number(item.MontoFinalReal).toFixed(2)}</TableCell>
                <TableCell className={cn(
                    "font-bold",
                    item.Diferencia > 0 && "text-blue-600 dark:text-blue-400",
                    item.Diferencia < 0 && "text-red-600 dark:text-red-400",
                )}>
                  {Number(item.Diferencia).toFixed(2)}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No hay historial disponible.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
