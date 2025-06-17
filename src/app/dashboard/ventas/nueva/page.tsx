
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const ventaSchema = z.object({
  customerName: z.string().min(3, { message: "El nombre del cliente es requerido (mín. 3 caracteres)." }),
  documentType: z.enum(["Boleta", "Factura"], { required_error: "Seleccione un tipo de documento." }),
  paymentMethod: z.string().min(1, { message: "Seleccione un método de pago." }),
  itemsDescription: z.string().min(10, { message: "Describa los productos/servicios (mín. 10 caracteres)." }),
  totalAmount: z.coerce.number().positive({ message: "El monto total debe ser positivo." }),
  notes: z.string().optional(),
});

type VentaFormValues = z.infer<typeof ventaSchema>;

export default function NuevaVentaPage() {
  const { toast } = useToast();
  const form = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      customerName: "",
      documentType: undefined,
      paymentMethod: "",
      itemsDescription: "",
      totalAmount: 0,
      notes: "",
    },
  });

  function onSubmit(data: VentaFormValues) {
    console.log(data);
    // Here you would typically send the data to your backend
    toast({
      title: "Venta Registrada",
      description: `La venta para ${data.customerName} ha sido registrada exitosamente.`,
      variant: "default", 
    });
    form.reset(); // Reset form after successful submission
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Registrar Nueva Venta"
        description="Complete los detalles para registrar una nueva transacción."
        icon={ShoppingCart}
        actions={
            <Button variant="outline" asChild>
                <Link href="/dashboard/ventas">Volver al Listado</Link>
            </Button>
        }
      />
      <Card className="shadow-xl rounded-lg max-w-3xl mx-auto border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Formulario de Venta</CardTitle>
          <CardDescription>Ingrese la información de la venta.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Boleta">Boleta de Venta</SelectItem>
                          <SelectItem value="Factura">Factura</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="itemsDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de Productos/Servicios</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: 2x Camisa Talla M, 1x Pantalón Jean Azul"
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pago</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                          <SelectItem value="TarjetaCredito">Tarjeta de Crédito</SelectItem>
                          <SelectItem value="TarjetaDebito">Tarjeta de Débito</SelectItem>
                          <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                          <SelectItem value="Yape">Yape</SelectItem>
                          <SelectItem value="Plin">Plin</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto Total (S/)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ej: 150.50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alguna nota o comentario sobre la venta..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Limpiar Formulario
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" /> Registrar Venta
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
