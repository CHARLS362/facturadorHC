import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

export default function PerfilPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Mi Perfil"
        description="Visualiza y actualiza tu información personal."
        icon={UserCircle}
      />
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>Estos son los detalles de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de perfil en construcción. Aquí podrás ver y editar tus datos personales,
            cambiar tu contraseña y gestionar tus preferencias de notificación.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
