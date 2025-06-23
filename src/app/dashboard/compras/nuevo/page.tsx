
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as _ from "lodash";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Save, RotateCcw, Calculator, PlusCircle, Trash2, Check, ChevronsUpDown, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const IGV_RATE = 0.18;

const availableProducts = [
    { id: "PROD001", name: "Camisa de Algodón Premium", price: 35.50 },
    { id: "PROD002", name: "Pantalón Cargo Resistente", price: 60.00 },
    { id: "PROD003", name: "Zapatillas Urbanas Clásicas", price: 120.00 },
];

const compraSchema = z.object({
  providerName: z.string().min(3, { message: "El nombre del proveedor es requerido." }),
  documentRef: z.string().optional(),
  
  purchaseItems: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.coerce.number().min(1, "Cantidad debe ser mayor a 0."),
    cost: z.coerce.number().min(0, "El costo no puede ser negativo."),
  })).min(1, { message: "Debe agregar al menos un producto." }),

  subtotal: z.coerce.number().nonnegative(),
  igvAmount: z.coerce.number().nonnegative(),
  grandTotal: z.coerce.number().positive(),
  notes: z.string().optional(),
});

type CompraFormValues = z.infer<typeof compraSchema>;

export default function NuevaCompraPage() {
  const { toast } = useToast();
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [currentCost, setCurrentCost] = useState<number>(0);
  const [productSearchOpen, setProductSearchOpen] = useState(false);

  const form = useForm<CompraFormValues>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      providerName: "",
      documentRef: "",
      purchaseItems: [],
      subtotal: 0,
      igvAmount: 0,
      grandTotal: 0,
      notes: "",
    },
  });

  const { fields: purchaseItemsFields, append: appendPurchaseItem, remove: removePurchaseItem } = useFieldArray({
    control: form.control,
    name: "purchaseItems",
  });

  const purchaseItems = form.watch("purchaseItems");

  const calculatedSubtotal = useMemo(() => {
    return _.round(purchaseItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0), 2);
  }, [purchaseItems]);

  useEffect(() => {
    const subtotal = calculatedSubtotal;
    const igv = _.round(subtotal * IGV_RATE, 2);
    const total = _.round(subtotal + igv, 2);
    form.setValue("subtotal", subtotal, { shouldValidate: true });
    form.setValue("igvAmount", igv, { shouldValidate: true });
    form.setValue("grandTotal", total, { shouldValidate: true });
  }, [calculatedSubtotal, form]);

  const handleAddProduct = () => {
    if (!currentProductId) {
      toast({ title: "Error", description: "Seleccione un producto.", variant: "destructive" });
      return;
    }

    const productDetails = availableProducts.find(p => p.id === currentProductId);
    if (!productDetails) return;

    appendPurchaseItem({
      productId: productDetails.id,
      name: productDetails.name,
      quantity: currentQuantity,
      cost: currentCost,
    });
    
    setCurrentProductId(null);
    setCurrentQuantity(1);
    setCurrentCost(0);
    form.trigger("purchaseItems");
  };

  async function onSubmit(data: CompraFormValues) {
    console.log("Datos de Compra:", data);
    toast({
      variant: "success",
      title: <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /><span>Compra Registrada (Simulación)</span></div>,
      description: `La compra al proveedor ${data.providerName} ha sido registrada.`,
    });
    form.reset();
  }

  const selectedProductName = currentProductId ? availableProducts.find(p => p.id === currentProductId)?.name : "Seleccionar producto...";

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Registrar Nueva Compra"
        description="Ingrese los detalles de la compra a un proveedor."
        icon={ClipboardList}
        actions={
            <Button variant="outline" asChild>
                <Link href="/dashboard/compras">Volver al Listado</Link>
            </Button>
        }
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-xl rounded-lg w-full max-w-5xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Información de la Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="providerName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Proveedor</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Proveedor Textil S.A." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="documentRef"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>N° de Factura / Guía (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: F001-12345" {...field} />
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
              <CardTitle className="font-headline text-2xl">Productos de la Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <FormLabel>Añadir Productos</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end mt-2">
                  <FormItem>
                    <FormLabel htmlFor="product-combobox" className="sr-only">Producto</FormLabel>
                     <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                          {selectedProductName}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar producto..." />
                          <CommandList>
                            {availableProducts.map((product) => (
                              <CommandItem key={product.id} value={product.name} onSelect={() => {setCurrentProductId(product.id); setProductSearchOpen(false); setCurrentCost(product.price)}}>
                                <Check className={cn("mr-2 h-4 w-4", currentProductId === product.id ? "opacity-100" : "opacity-0")} />
                                {product.name}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                   <FormItem>
                     <FormLabel htmlFor="costo" className="sr-only">Costo Unitario</FormLabel>
                    <Input id="costo" type="number" placeholder="Costo Unit. (S/)" value={currentCost} onChange={(e) => setCurrentCost(parseFloat(e.target.value) || 0)} min="0" step="0.01" />
                  </FormItem>
                  <FormItem>
                     <FormLabel htmlFor="quantity" className="sr-only">Cantidad</FormLabel>
                    <Input id="quantity" type="number" placeholder="Cantidad" value={currentQuantity} onChange={(e) => setCurrentQuantity(parseInt(e.target.value, 10) || 1)} min="1" />
                  </FormItem>
                  <Button type="button" onClick={handleAddProduct} className="whitespace-nowrap">
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir
                  </Button>
                </div>
              </div>
              
              {purchaseItemsFields.length > 0 && (
                <div className="mt-6">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Costo Unit. (S/)</TableHead>
                            <TableHead className="text-right">Subtotal (S/)</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {purchaseItemsFields.map((item, index) => (
                            <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{item.cost.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{(item.cost * item.quantity).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" type="button" onClick={() => removePurchaseItem(index)} className="text-destructive hover:text-destructive/80">
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-end gap-2 pt-6 border-t">
                <div className="w-full max-w-xs space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>S/ {form.watch("subtotal").toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">IGV (18%):</span><span>S/ {form.watch("igvAmount").toFixed(2)}</span></div>
                    <Separator/>
                    <div className="flex justify-between font-bold text-lg"><span className="text-primary">Total:</span><span className="text-primary">S/ {form.watch("grandTotal").toFixed(2)}</span></div>
                </div>
            </CardFooter>
          </Card>

          <Card className="shadow-xl rounded-lg w-full max-w-5xl mx-auto border-border/50">
            <CardFooter className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                <RotateCcw className="mr-2 h-4 w-4" /> Limpiar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div> : <Save className="mr-2 h-4 w-4" />}
                Registrar Compra
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
