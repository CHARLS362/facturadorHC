
import { PageHeader } from "@/components/shared/page-header";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getConnection } from '@/lib/db';
import { sql } from 'mssql';
import { notFound } from 'next/navigation';
import { EditarProductoForm } from "@/components/dashboard/editar-producto-form";

async function getProductData(id: string) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('IdProducto', sql.Int, id)
      .query(`
        SELECT 
          p.IdProducto, p.IdCategoria, c.Descripcion AS CategoriaNombre,
          p.IdUnidadMedida, u.Descripcion AS UnidadMedidaNombre, u.Codigo AS UnidadMedidaSimbolo,
          p.Codigo, p.Nombre, p.Descripcion, p.Precio, p.Stock, p.StockMinimo,
          p.Tipo, p.Estado, p.ImagenUrl, p.FechaRegistro
        FROM Producto p
        LEFT JOIN Categoria c ON p.IdCategoria = c.IdCategoria
        LEFT JOIN UnidadMedida u ON p.IdUnidadMedida = u.IdUnidadMedida
        WHERE p.IdProducto = @IdProducto
      `);
    
    if (result.recordset.length === 0) {
      return null;
    }
    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
}

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const productData = await getProductData(params.id);
  if (!productData) {
    notFound();
  }

  const initialData = {
    name: productData.Nombre ?? "",
    sku: productData.Codigo ?? "",
    category: productData.CategoriaNombre ?? undefined,
    price: productData.Precio ?? 0,
    stock: productData.Stock ?? 0,
    status: productData.Estado ?? "En Stock",
    description: productData.Descripcion ?? "",
    imageUrl: productData.ImagenUrl ?? "",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Producto: ${initialData.name || params.id}`}
        description="Modifique la información del producto o servicio."
        icon={PackageSearch}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/productos">Volver al Listado</Link>
          </Button>
        }
      />
      <EditarProductoForm productId={params.id} initialData={initialData} />
    </div>
  );
}
