import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Configuración"
        description="Ajusta las configuraciones generales de la aplicación."
        icon={Settings}
      />
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Preferencias del Sistema</CardTitle>
          <CardDescription>Personaliza el comportamiento de FacturacionHC.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de configuración en construcción. Aquí podrás ajustar parámetros
            como la información de tu empresa, formatos de moneda, series de facturación,
            integraciones y más.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
