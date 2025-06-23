

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Edit, PlusCircle } from "lucide-react";
import { InvoicePreview, type VentaDataForTemplate, type EmpresaDataForTemplate } from "@/components/templates/invoice-preview";
import { TicketPreview } from "@/components/templates/ticket-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Mock data for preview purposes
const mockEmpresa: EmpresaDataForTemplate = {
  name: "FacturacionHC Predeterminada S.A.C.",
  address: "Av. La Innovación 123, Distrito Tecnológico, Lima, Perú",
  ruc: "20123456789",
  phone: "(01) 555-1234",
  email: "ventas@facturacionhc.com",
  logoUrl: "https://placehold.co/180x60.png?text=Mi+Logo",
};

const mockVenta: VentaDataForTemplate = {
  id: "F001-00012345",
  fecha: new Date().toISOString(),
  cliente: {
    nombre: "CLIENTE DE EJEMPLO S.A.C.",
    documento: "20987654321",
    tipoDocumento: "RUC",
    direccion: "Calle Falsa 123, Miraflores, Lima"
  },
  items: [
    { cantidad: 2, unidad: "NIU", nombre: "Producto de Ejemplo A", precioUnitario: 1000.00, total: 2000.00 },
    { cantidad: 1, unidad: "ZZ", nombre: "Servicio de Consultoría Anual", precioUnitario: 300.00, total: 300.00 },
    { cantidad: 5, unidad: "KGM", nombre: "Material a Granel", precioUnitario: 2.80, total: 14.00 },
  ],
  opGravada: 2314.00,
  igv: 416.52,
  totalGeneral: 2730.52,
  totalEnLetras: "DOS MIL SETECIENTOS TREINTA Y 52/100 SOLES"
};

const mockBoleta: VentaDataForTemplate = {
    ...mockVenta,
    id: "B001-00054321",
    cliente: {
        nombre: "JUAN PEREZ GOMEZ",
        documento: "12345678",
        tipoDocumento: "DNI",
        direccion: "Av. Sol 123, Cusco"
    }
};


export default function PlantillasPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Plantillas de Documentos"
        description="Personaliza y previsualiza tus plantillas de facturas y boletas."
        icon={FileText}
      />

      <Tabs defaultValue="factura" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px] bg-muted/80">
          <TabsTrigger value="factura" className="font-headline">Factura Electrónica</TabsTrigger>
          <TabsTrigger value="boleta" className="font-headline">Boleta Electrónica</TabsTrigger>
        </TabsList>
        <TabsContent value="factura">
          <Card className="shadow-lg rounded-lg mt-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Plantilla de Factura Actual</CardTitle>
                  <CardDescription>Esta es una vista previa de cómo se verán tus facturas.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href="/dashboard/configuracion">
                      <Edit className="mr-2 h-4 w-4" /> Personalizar Datos
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-muted/30 p-4 md:p-8 flex justify-center">
              <div className="w-full max-w-3xl">
                <InvoicePreview venta={mockVenta} empresa={mockEmpresa} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="boleta">
          <Card className="shadow-lg rounded-lg mt-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Plantilla de Boleta Actual</CardTitle>
                  <CardDescription>Esta es una vista previa de cómo se verán tus boletas.</CardDescription>
                </div>
                <div className="flex gap-2">
                   <Button size="sm" asChild>
                    <Link href="/dashboard/configuracion">
                      <Edit className="mr-2 h-4 w-4" /> Personalizar Datos
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-muted/30 p-4 md:p-8 flex justify-center">
              <div className="w-full max-w-md">
                 <TicketPreview venta={mockBoleta} empresa={mockEmpresa} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
