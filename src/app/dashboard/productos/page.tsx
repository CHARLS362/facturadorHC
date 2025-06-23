
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, FileDown, UploadCloud } from "lucide-react";
import { getConnection } from '@/lib/db';
import { ProductosList } from '@/components/dashboard/productos-list';

async function getProductsData() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        p.IdProducto, p.IdCategoria, c.Descripcion AS CategoriaNombre,
        p.IdUnidadMedida, u.Descripcion AS UnidadMedidaNombre, u.Codigo AS UnidadMedidaSimbolo,
        p.Codigo, p.Nombre, p.Descripcion, p.Precio, p.Stock, p.StockMinimo,
        p.Tipo, p.Estado, p.ImagenUrl, p.FechaRegistro
      FROM Producto p
      LEFT JOIN Categoria c ON p.IdCategoria = c.IdCategoria
      LEFT JOIN UnidadMedida u ON p.IdUnidadMedida = u.IdUnidadMedida
    `);

    return result.recordset.map((prod: any) => ({
      id: prod.IdProducto,
      name: prod.Nombre,
      sku: prod.Codigo || null,
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
  } catch (error) {
    console.error("Error fetching products data:", error);
    return [];
  }
}


export default async function ProductosPage() {
  const productsData = await getProductsData();

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
      <ProductosList initialData={productsData} />
    </div>
  );
}
