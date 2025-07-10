
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as _ from "lodash";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Save, RotateCcw, SearchCheck, AlertTriangle, Calculator, PlusCircle, Trash2, Check, ChevronsUpDown, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useEffect, useState, useMemo, } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const IGV_RATE = 0.18; // 18% IGV for Peru


const ventaSchema = z.object({
  clientDocumentType: z.enum(["DNI", "RUC"], { required_error: "Seleccione un tipo de documento." }),
  clientDocumentNumber: z.string()
    .min(1, { message: "El número de documento es requerido."})
    .refine(val => /^\d+$/.test(val), { message: "Solo se permiten números." }),
  clientFullName: z.string().min(3, { message: "Nombre del cliente es requerido (mín. 3 caracteres)." }),
  clientAddress: z.string().optional(),
  
  documentType: z.enum(["Boleta", "Factura"], { required_error: "Seleccione un tipo de comprobante." }),
  
  saleItems: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.coerce.number().min(1, "Cantidad debe ser mayor a 0."),
    price: z.coerce.number(),
  })).min(1, { message: "Debe agregar al menos un producto." }),

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
  const [isConsultingSunat, setIsConsultingSunat] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/producto")
      .then(res => res.json())
      .then(data => setAvailableProducts(
        data.map((p: any) => ({
          id: p.IdProducto ? `PROD${p.IdProducto.toString().padStart(3, '0')}` : p.id,
          name: p.Nombre || p.name,
          price: p.Precio || p.price,
          stock: p.Stock ?? 0,
        }))
      ))
      .catch(() => setAvailableProducts([]));
  }, []);

  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [productSearchOpen, setProductSearchOpen] = useState(false);

  const form = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      clientDocumentType: undefined,
      clientDocumentNumber: "",
      clientFullName: "",
      clientAddress: "",
      documentType: undefined,
      saleItems: [],
      igvAmount: 0,
      grandTotal: 0,
      paymentMethod: "",
      notes: "",
    },
  });

  const { fields: saleItemsFields, append: appendSaleItem, remove: removeSaleItem, update: updateSaleItem } = useFieldArray({
    control: form.control,
    name: "saleItems",
  });

  const saleItems = form.watch("saleItems");
  const clientDocType = form.watch("clientDocumentType");

  useEffect(() => {
    if (clientDocType === "RUC") {
      form.setValue("documentType", "Factura");
    } else if (clientDocType === "DNI") {
      form.setValue("documentType", "Boleta");
    }
  }, [clientDocType, form]);

  const calculatedSubtotal = useMemo(() => {
    return _.round(saleItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), 2);
  }, [saleItems]);

  useEffect(() => {
    const igv = _.round(calculatedSubtotal * IGV_RATE, 2);
    const total = _.round(calculatedSubtotal + igv, 2);
    form.setValue("igvAmount", igv, { shouldValidate: true });
    form.setValue("grandTotal", total, { shouldValidate: true });
  }, [calculatedSubtotal, form]);
  
  const handleSunatQuery = async () => {
    const docType = form.getValues("clientDocumentType");
    const docNumber = form.getValues("clientDocumentNumber");
    
    if (!docType || !docNumber) {
        toast({ variant: "destructive", title: "Datos incompletos", description: "Seleccione un tipo y número de documento." });
        return;
    }

    const isValidDocNumber = await form.trigger("clientDocumentNumber");
    if (!isValidDocNumber) return;

    setIsConsultingSunat(true);
    try {
        const response = await fetch(`/api/cliente/consulta-cliente?tipo=${docType}&numero=${docNumber}`);
        const data = await response.json();

        if (!response.ok) {
            toast({
                variant: "destructive",
                title: "Cliente no encontrado",
                description: "No se encontró un cliente con ese documento. Puede registrarlo manualmente.",
            });
            form.setValue("clientFullName", "");
            form.setValue("clientAddress", "");
        } else {
            form.setValue("clientFullName", data.Nombre || "");
            form.setValue("clientAddress", data.Direccion || "");
            toast({ variant: "success", title: "Cliente encontrado", description: "Datos del cliente cargados." });
        }
    } catch (error) {
        toast({ variant: "destructive", title: "Error de red", description: "No se pudo realizar la consulta." });
    } finally {
        setIsConsultingSunat(false);
    }
  };

  const handleAddProduct = () => {
    if (!currentProductId) {
      toast({ title: "Error", description: "Seleccione un producto.", variant: "destructive" });
      return;
    }
    if (currentQuantity <= 0) {
      toast({ title: "Error", description: "La cantidad debe ser mayor a cero.", variant: "destructive" });
      return;
    }

    const existingProductIndex = saleItems.findIndex(item => item.productId === currentProductId);
    const productDetails = availableProducts.find(p => p.id === currentProductId);

    if (!productDetails) {
      toast({ title: "Error", description: "Producto no encontrado.", variant: "destructive" });
      return;
    }

    const cantidadEnVenta = existingProductIndex > -1
      ? saleItems[existingProductIndex].quantity + currentQuantity
      : currentQuantity;

    if (cantidadEnVenta > productDetails.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Producto: ${productDetails.name} | Stock disponible: ${productDetails.stock} | Cantidad solicitada: ${cantidadEnVenta}`,
        variant: "destructive"
      });
      return;
    }

    if (existingProductIndex > -1) {
      const existingItem = saleItems[existingProductIndex];
      updateSaleItem(existingProductIndex, {
        ...existingItem,
        quantity: existingItem.quantity + currentQuantity,
      });
    } else {
      appendSaleItem({
        productId: productDetails.id,
        name: productDetails.name,
        quantity: currentQuantity,
        price: productDetails.price,
      });
    }
    
    setCurrentProductId(null);
    setCurrentQuantity(1);
    form.trigger("saleItems");
  };

  async function onSubmit(data: VentaFormValues) {
    const mapped = {
      IdComprobante: data.documentType === "Factura" ? 1 : 2,
      FechaVenta: new Date().toISOString(),
      Total: data.grandTotal,
      Estado: "Pagado", // Changed from "Pendiente" to "Pagado"
      items: data.saleItems.map(item => ({
        IdProducto: parseInt(item.productId.replace("PROD", "")),
        Cantidad: item.quantity,
        PrecioUnitario: item.price,
        Total: item.price * item.quantity,
      })),
      clientDocumentType: data.clientDocumentType,
      clientDocumentNumber: data.clientDocumentNumber,
      clientFullName: data.clientFullName,
      clientAddress: data.clientAddress,
      paymentMethod: data.paymentMethod,
    };
    
    try {
      const res = await fetch("/api/venta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapped),
      });
      const result = await res.json();
      if (res.ok) {
        toast({
          variant: "success",
          title: "Venta Registrada",
          description: `La venta para ${data.clientFullName} ha sido registrada.`,
        });
        form.reset();
        setCurrentProductId(null);
        setCurrentQuantity(1);
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error || "Error al registrar venta." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Error de red al registrar venta." });
    }
  }
  
  const selectedProductName = currentProductId ? availableProducts.find(p => p.id === currentProductId)?.name : "Seleccionar producto...";

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Registrar Nueva Venta"
        description="Complete los detalles para registrar una nueva transacción."
        icon={ShoppingCart}
        actions={ <Button variant="outline" asChild><Link href="/dashboard/ventas">Volver al Listado</Link></Button> }
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-xl rounded-lg w-full max-w-5xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Información del Cliente</CardTitle>
              <CardDescription>Consulte un cliente por DNI/RUC o ingrese los datos manualmente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <FormField
                    control={form.control}
                    name="clientDocumentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Seleccione tipo"/></SelectTrigger>
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
                    <FormItem className="md:col-span-2">
                        <FormLabel>N° de Documento</FormLabel>
                        <div className="flex gap-2">
                            <FormControl>
                                <Input placeholder="Ingrese el número..." {...field} />
                            </FormControl>
                            <Button type="button" onClick={handleSunatQuery} disabled={isConsultingSunat}>
                                {isConsultingSunat ? (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>) : <SearchCheck className="mr-2 h-4 w-4"/>}
                                Consultar
                            </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
               </div>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                 <FormField
                    control={form.control}
                    name="clientFullName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre / Razón Social</FormLabel>
                        <FormControl>
                          <Input placeholder="Se completará tras la consulta" {...field} />
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
                        <FormLabel>Dirección del Cliente (Editable)</FormLabel>
                        <FormControl>
                          <Input placeholder="Se completará tras la consulta" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl rounded-lg w-full max-w-5xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Detalles del Comprobante y Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Comprobante</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              <Separator />
              
              <div>
                <FormLabel>Añadir Productos/Servicios</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-end mt-2">
                  <FormItem>
                    <FormLabel htmlFor="product-combobox" className="sr-only">Producto</FormLabel>
                     <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={productSearchOpen}
                          className="w-full justify-between font-normal"
                          id="product-combobox"
                        >
                          {selectedProductName}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar producto..." />
                          <CommandEmpty>No se encontró el producto.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {availableProducts.map((product) => (
                                <CommandItem
                                  key={product.id}
                                  value={product.name}
                                  onSelect={() => {
                                    setCurrentProductId(product.id);
                                    setProductSearchOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      currentProductId === product.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {product.name} (S/ {product.price.toFixed(2)})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                  <FormItem>
                     <FormLabel htmlFor="quantity" className="sr-only">Cantidad</FormLabel>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Cantidad"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(parseInt(e.target.value, 10) || 1)}
                      min="1"
                    />
                  </FormItem>
                  <Button type="button" onClick={handleAddProduct} className="whitespace-nowrap">
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir
                  </Button>
                </div>
              </div>
              
              {saleItemsFields.length > 0 && (
                <div className="mt-6 space-y-2">
                    <FormLabel>Productos/Servicios Añadidos</FormLabel>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Producto/Servicio</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-right">P. Unitario (S/)</TableHead>
                                <TableHead className="text-right">P. Total (S/)</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {saleItemsFields.map((item, index) => (
                                <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{(item.price * item.quantity).toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" type="button" onClick={() => removeSaleItem(index)} className="text-destructive hover:text-destructive/80">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                    <FormField
                        control={form.control}
                        name="saleItems"
                        render={() => ( <FormMessage /> )}
                    />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl rounded-lg w-full max-w-5xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Calculator className="h-6 w-6 text-primary" />
                Totales y Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <FormLabel>Subtotal (S/)</FormLabel>
                    <p className="text-lg font-semibold mt-1 h-10 flex items-center px-3 py-2 border rounded-md bg-muted/50">
                        {calculatedSubtotal.toFixed(2)}
                    </p>
                </div>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pago</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
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
                      <Input
                        placeholder="Alguna nota o comentario sobre la venta..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/30 mt-6">
              <Button type="button" variant="outline" onClick={() => { 
                  form.reset(); 
                  setCurrentProductId(null);
                  setCurrentQuantity(1);
                  while(saleItemsFields.length > 0) {
                      removeSaleItem(0);
                  }
                }}>
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

    