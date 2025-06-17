import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, UsersRound, FileDown, Mail, Phone } from "lucide-react";
import Image from "next/image";

const mockClients = [
  { id: "CLI001", name: "Empresa XYZ S.A.C.", contactName: "Juan Pérez", email: "juan.perez@empresa.xyz", phone: "987654321", type: "Empresa", registrationDate: "2023-05-10" },
  { id: "CLI002", name: "Ana Morales", contactName: "Ana Morales", email: "ana.morales@personal.com", phone: "912345678", type: "Persona", registrationDate: "2023-06-22" },
  { id: "CLI003", name: "Servicios Globales EIRL", contactName: "Luisa Castro", email: "luisa.castro@serviciosglobales.com", phone: "999888777", type: "Empresa", registrationDate: "2024-01-05" },
];

export default function ClientesPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Clientes"
        description="Administra la información de tus clientes y su historial."
        icon={UsersRound}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Clientes
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Cliente
            </Button>
          </div>
        }
      />
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <CardDescription>Busca y gestiona la información de tus clientes.</CardDescription>
          <div className="pt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Buscar clientes por nombre, RUC/DNI, email..." className="pl-10 max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre / Razón Social</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium flex items-center gap-2">
                     <Image src={`https://avatar.vercel.sh/${client.email}.png?size=40`} alt={client.name} width={32} height={32} className="rounded-full" data-ai-hint="client avatar" />
                    {client.name}
                  </TableCell>
                  <TableCell>{client.contactName}</TableCell>
                  <TableCell>
                    <a href={`mailto:${client.email}`} className="text-primary hover:underline flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {client.email}
                    </a>
                  </TableCell>
                  <TableCell>
                     <a href={`tel:${client.phone}`} className="text-primary hover:underline flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {client.phone}
                    </a>
                  </TableCell>
                  <TableCell>{client.type}</TableCell>
                  <TableCell>{client.registrationDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Ver Perfil</Button>
                    <Button variant="ghost" size="sm" className="hover:text-primary">Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
