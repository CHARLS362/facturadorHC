
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList } from "lucide-react";
import { ComprasList } from '@/components/dashboard/compras-list';

// In a real app, this would fetch from an API endpoint `/api/compras`
async function getComprasData() {
  const mockData = [
    { id: "COMP001", compraId: 1, date: "2024-07-26", provider: "Proveedor Textil S.A.", total: "S/ 3,500.00", status: "Recibido" },
    { id: "COMP002", compraId: 2, date: "2024-07-25", provider: "Importaciones Electrónicas EIRL", total: "S/ 12,800.00", status: "Pendiente" },
    { id: "COMP003", compraId: 3, date: "2024-07-22", provider: "Distribuidora de Accesorios ABC", total: "S/ 1,250.00", status: "Recibido" },
    { id: "COMP004", compraId: 4, date: "2024-07-20", provider: "Proveedor Textil S.A.", total: "S/ 2,100.00", status: "Cancelado" },
  ];
  return Promise.resolve(mockData);
}

export default async function ComprasPage() {
  const comprasData = await getComprasData();

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Compras"
        description="Administra las órdenes de compra y el abastecimiento de productos."
        icon={ClipboardList}
        actions={
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/compras/nuevo">
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Compra
              </Link>
            </Button>
          </div>
        }
      />
      <ComprasList initialData={comprasData} />
    </div>
  );
}
