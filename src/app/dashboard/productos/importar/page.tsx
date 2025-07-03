
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, FileDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ParsedProduct {
  Codigo: string;
  Nombre: string;
  CategoriaNombre: string;
  UnidadMedidaCodigo: string;
  Precio: string;
  Stock: string;
  Estado: string;
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
        { Codigo: "POL-PIMA-01", Nombre: "Polo de Algodón Pima", CategoriaNombre: "Ropa", UnidadMedidaCodigo: "NIU", Precio: "49.90", Stock: "150", Estado: "En Stock" },
        { Codigo: "ZAP-CUERO-42", Nombre: "Zapatillas de Cuero Genuino", CategoriaNombre: "Calzado", UnidadMedidaCodigo: "NIU", Precio: "299.90", Stock: "50", Estado: "En Stock" },
        { Codigo: "LEN-SOL-BLK", Nombre: "Lentes de Sol UV400", CategoriaNombre: "Accesorios", UnidadMedidaCodigo: "NIU", Precio: "89.00", Stock: "200", Estado: "Stock Bajo" },
        { Codigo: "SERV-WEB-01", Nombre: "Servicio de Diseño Web", CategoriaNombre: "Servicios", UnidadMedidaCodigo: "ZZ", Precio: "1200.00", Stock: "999", Estado: "En Stock" },
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
            Descargue nuestra plantilla para asegurar que su archivo tenga el formato correcto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="secondary" asChild>
            <a href="/templates/plantilla_productos.csv" download>
              <FileDown className="mr-2 h-4 w-4" />
              Descargar Plantilla CSV
            </a>
          </Button>
           <Alert>
            <FileDown className="h-4 w-4" />
            <AlertTitle>Columnas Requeridas</AlertTitle>
            <AlertDescription>
                Asegúrese de que su archivo CSV contenga las siguientes columnas: <strong>Codigo, Nombre, CategoriaNombre, UnidadMedidaCodigo, Precio, Stock, Estado.</strong> La descripción y otros campos son opcionales.
            </AlertDescription>
          </Alert>
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
            <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.Codigo}</TableCell>
                        <TableCell>{product.Nombre}</TableCell>
                        <TableCell>{product.CategoriaNombre}</TableCell>
                        <TableCell>{product.UnidadMedidaCodigo}</TableCell>
                        <TableCell>S/ {product.Precio}</TableCell>
                        <TableCell>{product.Stock}</TableCell>
                        <TableCell>{product.Estado}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </div>
            
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
