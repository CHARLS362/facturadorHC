
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as _ from "lodash";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Save, RotateCcw, SearchCheck, AlertTriangle, Calculator, PlusCircle, Trash2, Check, ChevronsUpDown, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";


const IGV_RATE = 0.18; // 18% IGV for Peru


// Mock client data (TODO: replace with actual data fetching in a real app)
const availableClients = [
  { id: "CLI001", name: "Empresa XYZ S.A.C.", documentType: "RUC", documentNumber: "20123456789", address: "Av. Principal 123, Lima" },
  { id: "CLI002", name: "Ana Morales", documentType: "DNI", documentNumber: "12345678", address: "Calle Falsa 123, Miraflores" },
  { id: "CLI003", name: "Servicios Globales EIRL", documentType: "RUC", documentNumber: "20876543211", address: "Jr. de la Union 45, Lima" },
];


const ventaSchema = z.object({
  clientDocumentType: z.enum(["DNI", "RUC"], { required_error: "Seleccione el tipo de documento del cliente." }),
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
type ClientSearchMethod = 'ruc' | 'dni' | 'search';

export default function NuevaVentaPage() {
  const { toast } = useToast();
  const [searchMethod, setSearchMethod] = useState<ClientSearchMethod>('ruc');
  const [isClientDataFetched, setIsClientDataFetched] = useState(false);
  const [isConsultingSunat, setIsConsultingSunat] = useState(false);

  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    fetch("/api/producto") // Cambia la ruta si tu endpoint es diferente
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
  const [clientSearchOpen, setClientSearchOpen] = useState(false);

  const form = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      clientDocumentType: 'RUC',
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

  const calculatedSubtotal = useMemo(() => {
    return _.round(saleItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), 2);
  }, [saleItems]);

  useEffect(() => {
    const igv = _.round(calculatedSubtotal * IGV_RATE, 2);
    const total = _.round(calculatedSubtotal + igv, 2);
    form.setValue("igvAmount", igv, { shouldValidate: true });
    form.setValue("grandTotal", total, { shouldValidate: true });
  }, [calculatedSubtotal, form]);

  const handleSearchMethodChange = (value: ClientSearchMethod) => {
    setSearchMethod(value);
    // Reset client fields
    const newDocType = value === 'search' ? undefined : value.toUpperCase() as 'RUC' | 'DNI';
    form.reset({
      ...form.getValues(),
      // Retain existing form data but clear client info
      saleItems: form.getValues('saleItems'),
      documentType: form.getValues('documentType'),
      paymentMethod: form.getValues('paymentMethod'),
      // Clear client specific fields
      clientDocumentType: newDocType,
      clientDocumentNumber: "",
      clientFullName: "",
      clientAddress: "",
    });
    form.clearErrors(["clientDocumentType", "clientDocumentNumber", "clientFullName"]);
    setIsClientDataFetched(false);
  };
  
  const handleSunatQuery = async () => {
    const docType = searchMethod;
    if (docType === 'search') return;
    
    const docNumber = form.getValues("clientDocumentNumber");

    form.setValue("clientDocumentType", docType.toUpperCase() as "DNI" | "RUC", { shouldValidate: true });
    
    const isValidDocNumber = await form.trigger("clientDocumentNumber");
    if (!isValidDocNumber) {
         toast({
            variant: "destructive",
            title: "Error de Validación",
            description: "Por favor, corrija el número de documento.",
          });
        return;
    }
    if (!docType || !docNumber) return;
    
    setIsConsultingSunat(true);
    // Simulate API call to SUNAT/RENIEC
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    let mockName = "Cliente Ejemplo S.A.C.";
    let mockAddress = "Av. Javier Prado Este 123, San Isidro, Lima";
    if (docType === "dni") {
      mockName = "Juan Pérez Gonzales";
      mockAddress = "Calle Las Begonias 456, Lince, Lima";
    }
    
    form.setValue("clientFullName", mockName, { shouldValidate: true });
    form.setValue("clientAddress", mockAddress);
    setIsClientDataFetched(true);
    setIsConsultingSunat(false);
    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 p-1 bg-emerald-500 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <span>Consulta Exitosa (Simulada)</span>
        </div>
      ),
      description: "Datos del cliente recuperados.",
    });
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
    
    setCurrentProductId(null); // Reset product selection
    setCurrentQuantity(1); // Reset quantity
    form.trigger("saleItems"); // Validate saleItems after adding/updating
  };

  async function onSubmit(data: VentaFormValues) {
    const mapped = {
    IdComprobante: data.documentType === "Factura" ? 1 : 2,
    FechaVenta: new Date().toISOString(),
    Total: data.grandTotal,
    Estado: "Pendiente",
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
    console.log("Datos mapeados a la API:", mapped);

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
        title: (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 p-1 bg-emerald-500 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <span>Venta Registrada</span>
          </div>
        ),
        description: `La venta para ${data.clientFullName} ha sido registrada exitosamente.`,
      });
      form.reset();
      setSearchMethod('ruc');
      setIsClientDataFetched(false);
      setCurrentProductId(null);
      setCurrentQuantity(1);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Error al registrar venta.",
      });
    }
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Error de red al registrar venta.",
    });
  }
  }
  const selectedProductName = currentProductId ? availableProducts.find(p => p.id === currentProductId)?.name : "Seleccionar producto...";

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
          <Card className="shadow-xl rounded-lg w-full max-w-5xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Información del Cliente</CardTitle>
              <CardDescription>Seleccione un método para ingresar los datos del cliente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup onValueChange={handleSearchMethodChange} value={searchMethod} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ruc" id="r-ruc" />
                        <Label htmlFor="r-ruc" className="cursor-pointer">Consultar por RUC</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dni" id="r-dni" />
                        <Label htmlFor="r-dni" className="cursor-pointer">Consultar por DNI</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="search" id="r-search" />
                        <Label htmlFor="r-search" className="cursor-pointer">Buscar Cliente Registrado</Label>
                    </div>
                </RadioGroup>

                <Separator />
                
                <div className="grid md:grid-cols-3 gap-6 items-end">
                    {(searchMethod === 'dni' || searchMethod === 'ruc') && (
                        <>
                            <FormField
                                control={form.control}
                                name="clientDocumentNumber"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                    <FormLabel>Nro. de {searchMethod.toUpperCase()}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder={searchMethod === "dni" ? "8 dígitos" : "11 dígitos"} 
                                            {...field} 
                                            maxLength={searchMethod === "dni" ? 8 : 11}
                                            onChange={(e) => {
                                                const { value } = e.target;
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
                            <Button type="button" onClick={handleSunatQuery} disabled={isConsultingSunat || !form.watch("clientDocumentNumber")} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                            {isConsultingSunat ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                            ) : (
                                <SearchCheck className="mr-2 h-4 w-4" />
                            )}
                            Consultar
                            </Button>
                        </>
                    )}
                    
                    {searchMethod === 'search' && (
                       <div className="md:col-span-3">
                           <FormLabel>Buscar Cliente</FormLabel>
                           <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={clientSearchOpen} className="w-full justify-between font-normal mt-2">
                                        {form.getValues("clientFullName") || "Seleccionar cliente..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar cliente por nombre o documento..." />
                                        <CommandEmpty>No se encontró ningún cliente.</CommandEmpty>
                                        <CommandList>
                                            <CommandGroup>
                                            {availableClients.map((client) => (
                                                <CommandItem
                                                    key={client.id}
                                                    value={client.name}
                                                    onSelect={() => {
                                                        form.setValue("clientDocumentType", client.documentType);
                                                        form.setValue("clientDocumentNumber", client.documentNumber);
                                                        form.setValue("clientFullName", client.name);
                                                        form.setValue("clientAddress", client.address || "");
                                                        form.trigger(["clientDocumentType", "clientDocumentNumber", "clientFullName"]);
                                                        setIsClientDataFetched(true);
                                                        setClientSearchOpen(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", form.getValues("clientDocumentNumber") === client.documentNumber ? "opacity-100" : "opacity-0")} />
                                                    {client.name} ({client.documentType}: {client.documentNumber})
                                                </CommandItem>
                                            ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                           </Popover>
                       </div>
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="clientFullName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre / Razón Social</FormLabel>
                        <FormControl>
                        <Input placeholder="Se completará tras consulta o búsqueda" {...field} readOnly={isClientDataFetched} className={isClientDataFetched ? "bg-muted/50 cursor-not-allowed" : ""} />
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
                        <Input placeholder="Se completará tras consulta o búsqueda" {...field} readOnly={isClientDataFetched} className={isClientDataFetched ? "bg-muted/50 cursor-not-allowed" : ""} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
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
                        render={() => ( <FormMessage /> )} // This will display the general "Debe agregar al menos un producto." message
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
                 {/* Subtotal Display (Calculated) */}
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
                  setSearchMethod('ruc');
                  setIsClientDataFetched(false); 
                  setCurrentProductId(null);
                  setCurrentQuantity(1);
                  // Ensure saleItems array is also cleared
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
