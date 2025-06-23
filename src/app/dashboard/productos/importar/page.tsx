
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, FileDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Example structure for a parsed CSV row
interface ParsedProduct {
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: string;
}

export default function ImportarProductosPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setUploadedFile(file);
      // Simulate CSV parsing for preview
      const mockParsed: ParsedProduct[] = [
        { name: "Polo de Algodón Pima", sku: "POL-PIMA-01", category: "Ropa", price: "49.90", stock: "150" },
        { name: "Zapatillas de Cuero Genuino", sku: "ZAP-CUERO-42", category: "Calzado", price: "299.90", stock: "50" },
        { name: "Lentes de Sol UV400", sku: "LEN-SOL-BLK", category: "Accesorios", price: "89.00", stock: "200" },
      ];
      setParsedData(mockParsed);
    } else {
      toast({
        variant: "destructive",
        title: "Archivo no válido",
        description: "Por favor, seleccione un archivo con formato CSV.",
      });
      setUploadedFile(null);
      setParsedData([]);
    }
  };

  const handleProcessImport = async () => {
    if (!uploadedFile) {
      toast({ variant: "destructive", title: "Error", description: "No se ha seleccionado ningún archivo." });
      return;
    }
    setIsProcessing(true);
    // Simulate backend processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    toast({
      variant: "success",
      title: "Importación Exitosa",
      description: `${parsedData.length} productos han sido importados correctamente.`,
    });
    setUploadedFile(null);
    setParsedData([]);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Importación Masiva de Productos"
        description="Añada múltiples productos a su catálogo subiendo un archivo CSV."
        icon={UploadCloud}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/productos">Volver al Listado</Link>
          </Button>
        }
      />

      <Card className="shadow-xl rounded-lg border-border/50">
        <CardHeader>
          <CardTitle>Paso 1: Preparar el archivo</CardTitle>
          <CardDescription>
            Descargue la plantilla CSV y llénela con la información de sus productos. Asegúrese de mantener el formato y los encabezados de las columnas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" asChild>
            <a href="/templates/plantilla_productos.csv" download>
              <FileDown className="mr-2 h-4 w-4" />
              Descargar Plantilla CSV
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-xl rounded-lg border-border/50">
        <CardHeader>
          <CardTitle>Paso 2: Subir el archivo CSV</CardTitle>
          <CardDescription>
            Seleccione el archivo CSV que preparó en el paso anterior. Se mostrará una vista previa de los datos a importar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                      {uploadedFile ? (
                        <p className="font-semibold text-primary">{uploadedFile.name}</p>
                      ) : (
                        <>
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haga clic para subir</span> o arrastre el archivo</p>
                          <p className="text-xs text-muted-foreground">CSV (MAX. 5MB)</p>
                        </>
                      )}
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
              </label>
          </div>
        </CardContent>
      </Card>
      
      {parsedData.length > 0 && (
        <Card className="shadow-xl rounded-lg border-border/50">
          <CardHeader>
            <CardTitle>Paso 3: Previsualizar y Confirmar</CardTitle>
            <CardDescription>
              Revise los datos a continuación. Si todo es correcto, proceda con la importación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
             <div className="flex justify-end gap-3 pt-6 mt-4 border-t">
                <Button variant="destructive" onClick={() => { setUploadedFile(null); setParsedData([]); }} disabled={isProcessing}>
                    Cancelar
                </Button>
                <Button onClick={handleProcessImport} disabled={isProcessing}>
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Procesar Importación
                </Button>
              </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
