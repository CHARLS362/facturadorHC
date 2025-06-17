import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine, Camera, UploadCloud } from "lucide-react";
import Image from "next/image";

export default function EscanerPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Escáner de Códigos"
        description="Utiliza la cámara para escanear códigos de barras o QR de productos y documentos."
        icon={ScanLine}
      />
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Iniciar Escaneo</CardTitle>
          <CardDescription>Apunta la cámara hacia un código de barras o QR.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mx-auto my-8 flex items-center justify-center w-64 h-64 bg-muted rounded-lg border-2 border-dashed border-border">
            {/* Placeholder for camera feed or icon */}
            <Camera className="h-24 w-24 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            Asegúrate de que el código esté bien iluminado y centrado en el recuadro.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="font-headline">
              <ScanLine className="mr-2 h-5 w-5" />
              Activar Cámara
            </Button>
            <Button size="lg" variant="outline" className="font-headline">
              <UploadCloud className="mr-2 h-5 w-5" />
              Subir Imagen de Código
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Último Producto Escaneado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-md">
            <Image 
                src="https://placehold.co/80x80.png" 
                alt="Producto escaneado" 
                width={80} 
                height={80} 
                className="rounded-md"
                data-ai-hint="product photo"
            />
            <div>
                <h3 className="font-semibold text-lg">Nombre del Producto Ejemplo</h3>
                <p className="text-sm text-muted-foreground">SKU: 12345XYZ</p>
                <p className="text-lg font-bold text-primary">S/ 99.90</p>
            </div>
            <Button className="ml-auto">Añadir al Carrito</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Aquí se mostrará la información del último producto o documento escaneado con éxito.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
