
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PackageSearch, Save, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";

const productSchema = z.object({
  name: z.string().min(3, { message: "El nombre del producto es requerido (mín. 3 caracteres)." }),
  sku: z.string().optional(),
  category: z.enum(["Ropa", "Calzado", "Accesorios", "Electrónicos", "Hogar", "Servicios", "Otro"], { required_error: "Seleccione una categoría." }),
  price: z.coerce.number().positive({ message: "El precio debe ser un número positivo." }),
  stock: z.coerce.number().int().min(0, { message: "El stock no puede ser negativo." }),
  status: z.enum(["En Stock", "Stock Bajo", "Agotado"], { required_error: "Seleccione un estado." }),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "Ingrese una URL de imagen válida." }).optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditarProductoPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: undefined,
      price: 0,
      stock: 0,
      status: "En Stock",
      description: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      fetch(`/api/producto/${productId}`)
        .then(res => {
          if (!res.ok) throw new Error("Producto no encontrado");
          return res.json();
        })
        .then(productToEdit => {
          if (productToEdit && !productToEdit.error) {
            form.reset({
              name: productToEdit.Nombre ?? "",
              sku: productToEdit.Codigo ?? "",
              category: productToEdit.CategoriaNombre ?? undefined,
              price: productToEdit.Precio ?? 0,
              stock: productToEdit.Stock ?? 0,
              status: productToEdit.Estado ?? "En Stock",
              description: productToEdit.Descripcion ?? "",
              imageUrl: productToEdit.ImagenUrl ?? "",
            });
          } else {
            throw new Error("Producto no encontrado");
          }
        })
        .catch(() => {
          toast({ title: "Error", description: "Producto no encontrado.", variant: "destructive" });
          router.push("/dashboard/productos");
        })
        .finally(() => setIsLoading(false));
    }
  }, [productId, form, router, toast]);

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        Nombre: data.name,
        Codigo: data.sku,
        CategoriaNombre: data.category,
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
            <div className="flex-shrink-0 p-1 bg-emerald-500 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <span>Producto Actualizado</span>
          </div>
        ),
        description: `El producto ${data.name} ha sido actualizado exitosamente.`,
      });
      router.push("/dashboard/productos");
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Editar Producto"
          description="Cargando la información del producto..."
          icon={PackageSearch}
        />
        <Card className="shadow-xl rounded-lg w-full max-w-3xl mx-auto border-border/50">
          <CardHeader>
            <CardTitle><Skeleton className="h-8 w-64" /></CardTitle>
            <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            </div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
            </div>
            <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-20 w-full" /></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Producto: ${form.getValues("name") || productId}`}
        description="Modifique la información del producto o servicio."
        icon={PackageSearch}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/productos">Volver al Listado</Link>
          </Button>
        }
      />
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
                        <SelectItem value="Ropa">Ropa</SelectItem>
                        <SelectItem value="Calzado">Calzado</SelectItem>
                        <SelectItem value="Accesorios">Accesorios</SelectItem>
                        <SelectItem value="Electrónicos">Electrónicos</SelectItem>
                        <SelectItem value="Hogar">Hogar</SelectItem>
                        <SelectItem value="Servicios">Servicios</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
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
    </div>
  );
}

    