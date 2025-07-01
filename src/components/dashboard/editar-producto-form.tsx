  "use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import React, { useState } from "react";

// Catálogo de categorías
const categorias = [
  { id: 1, descripcion: "Electrónica" },
  { id: 2, descripcion: "Ropa" },
  { id: 3, descripcion: "Calzado" },
  { id: 4, descripcion: "Accesorios" },
  { id: 5, descripcion: "Hogar" },
  { id: 6, descripcion: "Servicios" },
];

// Mapeo para status si tu API devuelve valores distintos
function mapStatus(apiStatus: string) {
  switch (apiStatus) {
    case "EN_STOCK":
    case "En Stock":
      return "En Stock";
    case "STOCK_BAJO":
    case "Stock Bajo":
      return "Stock Bajo";
    case "AGOTADO":
    case "Agotado":
      return "Agotado";
    default:
      return "En Stock";
  }
}

const productSchema = z.object({
  name: z.string().min(3, { message: "El nombre del producto es requerido (mín. 3 caracteres)." }),
  sku: z.string().optional(),
  category: z.enum(["Electrónica", "Ropa", "Calzado", "Accesorios", "Hogar", "Servicios"], { required_error: "Seleccione una categoría." }),
  price: z.coerce.number().positive({ message: "El precio debe ser un número positivo." }),
  stock: z.coerce.number().int().min(0, { message: "El stock no puede ser negativo." }),
  status: z.enum(["En Stock", "Stock Bajo", "Agotado"], { required_error: "Seleccione un estado." }),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "Ingrese una URL de imagen válida." }).optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function EditarProductoForm({ productId, initialData }: { productId: string, initialData: any }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Mapea el IdCategoria o categoryId a su descripción para el valor inicial del select
  const initialCategory =
    initialData.IdCategoria
      ? categorias.find(cat => cat.id === initialData.IdCategoria)?.descripcion
      : initialData.categoryId
        ? categorias.find(cat => cat.id === initialData.categoryId)?.descripcion
        : initialData.category || categorias[0].descripcion;

  // Mapea el estado de stock si viene en otro formato
  const initialStatus = initialData.status ? mapStatus(initialData.status) : "En Stock";

  // useForm con la categoría y estado ya mapeados
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...initialData, category: initialCategory, status: initialStatus },
  });

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      // Convertir descripción de categoría a ID
      const categoriaId = categorias.find(cat => cat.descripcion === data.category)?.id;
      if (!categoriaId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debe seleccionar una categoría válida.",
        });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        Nombre: data.name,
        Codigo: data.sku,
        IdCategoria: categoriaId,
        Precio: data.price,
        Stock: data.stock,
        Estado: data.status,
        Descripcion: data.description,
        ImagenUrl: data.imageUrl,
        IdUnidadMedida: 1,
        Tipo: "Producto",
        StockMinimo: 5,
      };

      const res = await fetch(`/api/producto/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al actualizar producto");
      }

      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-white" />
            <span>Producto Actualizado</span>
          </div>
        ),
        description: `El producto ${data.name} ha sido actualizado exitosamente.`,
      });
      router.push("/dashboard/productos");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-xl rounded-lg w-full max-w-3xl mx-auto border-border/50">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Información del Producto</CardTitle>
        <CardDescription>Actualice los campos necesarios.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Camisa Casual Slim Fit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: CAM-SLIM-001-AZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat.id} value={cat.descripcion}>
                          {cat.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (S/)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 79.90" {...field} step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Disponible</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="En Stock">En Stock</SelectItem>
                        <SelectItem value="Stock Bajo">Stock Bajo</SelectItem>
                        <SelectItem value="Agotado">Agotado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles adicionales sobre el producto..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Imagen (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen.png" {...field} />
                  </FormControl>
                  <FormDescription>
                    La imagen se mostrará en el listado de productos. Use placehold.co para placeholders.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
               <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}