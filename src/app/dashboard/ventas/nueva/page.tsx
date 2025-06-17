
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as _ from "lodash";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Save, RotateCcw, SearchCheck, AlertTriangle, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";

const IGV_RATE = 0.18; // 18% IGV for Peru

const ventaSchema = z.object({
  clientDocumentType: z.enum(["DNI", "RUC"], { required_error: "Seleccione el tipo de documento del cliente." }),
  clientDocumentNumber: z.string()
    .min(1, { message: "El número de documento es requerido."}) // General message, refined below
    .refine(val => /^\d+$/.test(val), { message: "Solo se permiten números." }),
  clientFullName: z.string().min(3, { message: "Nombre del cliente es requerido (mín. 3 caracteres)." }),
  clientAddress: z.string().optional(),
  
  documentType: z.enum(["Boleta", "Factura"], { required_error: "Seleccione un tipo de comprobante." }),
  
  itemsDescription: z.string().min(10, { message: "Describa los productos/servicios (mín. 10 caracteres)." }),
  subtotal: z.coerce.number().positive({ message: "El subtotal debe ser un número positivo." }),
  igvAmount: z.coerce.number().nonnegative(),
  grandTotal: z.coerce.number().positive(),
  
  paymentMethod: z.string().min(1, { message: "Seleccione un método de pago." }),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.clientDocumentType === "DNI" && data.clientDocumentNumber.length !== 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "DNI debe tener 8 dígitos.",
      path: ["clientDocumentNumber"],
    });
  }
  if (data.clientDocumentType === "RUC" && data.clientDocumentNumber.length !== 11) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "RUC debe tener 11 dígitos.",
      path: ["clientDocumentNumber"],
    });
  }
});


type VentaFormValues = z.infer<typeof ventaSchema>;

export default function NuevaVentaPage() {
  const { toast } = useToast();
  const [isClientDataFetched, setIsClientDataFetched] = useState(false);
  const [isConsultingSunat, setIsConsultingSunat] = useState(false);

  const form = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      clientDocumentType: undefined,
      clientDocumentNumber: "",
      clientFullName: "",
      clientAddress: "",
      documentType: undefined,
      itemsDescription: "",
      subtotal: 0,
      igvAmount: 0,
      grandTotal: 0,
      paymentMethod: "",
      notes: "",
    },
  });

  const subtotalValue = form.watch("subtotal");
  const clientDocType = form.watch("clientDocumentType");

  useEffect(() => {
    if (typeof subtotalValue === 'number' && subtotalValue > 0) {
      const igv = _.round(subtotalValue * IGV_RATE, 2);
      const total = _.round(subtotalValue + igv, 2);
      form.setValue("igvAmount", igv, { shouldValidate: true });
      form.setValue("grandTotal", total, { shouldValidate: true });
    } else {
      form.setValue("igvAmount", 0);
      form.setValue("grandTotal", 0);
    }
  }, [subtotalValue, form]);

  // Clear client data when doc type changes
  useEffect(() => {
    form.setValue("clientDocumentNumber", "");
    form.setValue("clientFullName", "");
    form.setValue("clientAddress", "");
    setIsClientDataFetched(false);
    form.clearErrors("clientDocumentNumber");
  }, [clientDocType, form]);


  const handleSunatQuery = async () => {
    const docType = form.getValues("clientDocumentType");
    const docNumber = form.getValues("clientDocumentNumber");

    // Trigger validation for document number before proceeding
    const isValidDocNumber = await form.trigger("clientDocumentNumber");
    if (!isValidDocNumber) {
         toast({
            variant: "destructive",
            title: "Error de Validación",
            description: "Por favor, corrija el número de documento.",
          });
        return;
    }

    if (!docType || !docNumber) { // This check might be redundant due to schema validation but good for safety
      toast({
        variant: "destructive",
        title: "Error de Validación",
        description: "Por favor, seleccione tipo y número de documento.",
      });
      return;
    }
    
    setIsConsultingSunat(true);
    // Simulate API call to SUNAT
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let mockName = "Cliente Ejemplo S.A.C.";
    let mockAddress = "Av. Javier Prado Este 123, San Isidro, Lima";
    if (docType === "DNI") {
      mockName = "Juan Pérez Gonzales";
      mockAddress = "Calle Las Begonias 456, Lince, Lima";
    } else if (docType === "RUC") {
        // Keep mock RUC data or adjust if needed
    }
    
    form.setValue("clientFullName", mockName, { shouldValidate: true });
    form.setValue("clientAddress", mockAddress);
    setIsClientDataFetched(true);
    setIsConsultingSunat(false);
    toast({
      title: "Consulta Exitosa (Simulada)",
      description: "Datos del cliente recuperados.",
    });
  };

  function onSubmit(data: VentaFormValues) {
    console.log(data);
    toast({
      title: "Venta Registrada",
      description: `La venta para ${data.clientFullName} ha sido registrada exitosamente.`,
      variant: "default", 
    });
    form.reset(); 
    setIsClientDataFetched(false);
  }

  return (
    <div className="space-y-8 pb-12">
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-xl rounded-lg max-w-4xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Información del Cliente</CardTitle>
              <CardDescription>Ingrese los datos del cliente. Puede consultar en SUNAT (simulado).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6 items-end">
                <FormField
                  control={form.control}
                  name="clientDocumentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Documento Cliente</FormLabel>
                      <Select 
                        onValueChange={(value) => { 
                          field.onChange(value);
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccione tipo" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="RUC">RUC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientDocumentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nro. Documento Cliente</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={form.getValues("clientDocumentType") === "DNI" ? "8 dígitos" : form.getValues("clientDocumentType") === "RUC" ? "11 dígitos" : "Nro. Documento"} 
                          {...field} 
                          maxLength={form.getValues("clientDocumentType") === "DNI" ? 8 : form.getValues("clientDocumentType") === "RUC" ? 11 : undefined}
                          onChange={(e) => {
                            const { value } = e.target;
                             // Allow only numbers
                            if (/^\d*$/.test(value)) {
                                field.onChange(value);
                            }
                            setIsClientDataFetched(false);
                            form.setValue("clientFullName", "", { shouldValidate: false });
                            form.setValue("clientAddress", "", { shouldValidate: false });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" onClick={handleSunatQuery} disabled={isConsultingSunat || !form.watch("clientDocumentType") || !form.watch("clientDocumentNumber")} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isConsultingSunat ? (
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  ) : (
                    <SearchCheck className="mr-2 h-4 w-4" />
                  )}
                  Consultar SUNAT
                </Button>
              </div>
              <FormField
                control={form.control}
                name="clientFullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre / Razón Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Se completará tras consulta" {...field} readOnly={!isClientDataFetched} className={!isClientDataFetched ? "bg-muted/50 cursor-not-allowed" : ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección del Cliente (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Se completará tras consulta (opcional)" {...field} readOnly={!isClientDataFetched} className={!isClientDataFetched ? "bg-muted/50 cursor-not-allowed" : ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-xl rounded-lg max-w-4xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Detalles del Comprobante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Comprobante</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccione tipo" /></SelectTrigger>
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
              <FormField
                control={form.control}
                name="itemsDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de Productos/Servicios</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: 2x Camisa Talla M, 1x Pantalón Jean Azul."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                        <span>Mejora futura: selección de productos existentes.</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-xl rounded-lg max-w-4xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Calculator className="h-6 w-6 text-primary" />
                Totales y Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="subtotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtotal (S/)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ej: 127.12" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pago</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccione método" /></SelectTrigger>
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
              </div>

              <div className="space-y-2 p-4 bg-muted/50 rounded-md border border-border/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">IGV ({(IGV_RATE * 100).toFixed(0)}%) S/:</span>
                  <span className="text-md font-semibold">
                    {form.watch("igvAmount")?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <Separator className="bg-border/50"/>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-lg font-bold text-primary">TOTAL (S/):</span>
                  <span className="text-xl font-bold text-primary">
                    {form.watch("grandTotal")?.toFixed(2) || "0.00"}
                  </span>
                </div>
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
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/30 mt-6">
              <Button type="button" variant="outline" onClick={() => { form.reset(); setIsClientDataFetched(false); }}>
                <RotateCcw className="mr-2 h-4 w-4" /> Limpiar Formulario
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Registrar Venta
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
