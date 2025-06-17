import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Edit, PlusCircle } from "lucide-react";
import { InvoicePreview } from "@/components/templates/invoice-preview";
import { TicketPreview } from "@/components/templates/ticket-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function PlantillasPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Plantillas de Documentos"
        description="Personaliza y previsualiza tus plantillas de facturas y boletas."
        icon={FileText}
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Nueva Plantilla
          </Button>
        }
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
                  <CardDescription>Previsualización de la plantilla de factura electrónica.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" /> Previsualizar</Button>
                  <Button size="sm"><Edit className="mr-2 h-4 w-4" /> Personalizar</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-muted/30 p-4 md:p-8 flex justify-center">
              <div className="w-full max-w-3xl">
                <InvoicePreview />
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
                  <CardDescription>Previsualización de la plantilla de boleta electrónica.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" /> Previsualizar</Button>
                  <Button size="sm"><Edit className="mr-2 h-4 w-4" /> Personalizar</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-muted/30 p-4 md:p-8 flex justify-center">
              <div className="w-full max-w-md">
                 <TicketPreview />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
