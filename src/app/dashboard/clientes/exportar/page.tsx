
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileDown, Download } from "lucide-react";
import { ClientExportPreview, type MockClient } from '@/components/dashboard/client-export-preview';
import { Skeleton } from '@/components/ui/skeleton';
import html2pdf from 'html2pdf.js';

// Using mock data from the clients list page
const initialMockClients: MockClient[] = [
  { id: "CLI001", name: "Empresa XYZ S.A.C.", contactName: "Juan Pérez", email: "juan.perez@empresa.xyz", phone: "987654321", type: "Empresa", registrationDate: "2023-05-10" },
  { id: "CLI002", name: "Ana Morales", contactName: "Ana Morales", email: "ana.morales@personal.com", phone: "912345678", type: "Persona", registrationDate: "2023-06-22" },
  { id: "CLI003", name: "Servicios Globales EIRL", contactName: "Luisa Castro", email: "luisa.castro@serviciosglobales.com", phone: "999888777", type: "Empresa", registrationDate: "2024-01-05" },
];

export default function ExportarClientesPage() {
  const [clients, setClients] = useState<MockClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setClients(initialMockClients);
      setIsLoading(false);
    };
    fetchClients();
  }, []);

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-area');
    const opt = {
      margin:       0.5,
      filename:     'reporte-clientes.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="space-y-8">
      <div className="print-hide">
        <PageHeader
          title="Previsualización de Exportación"
          description="Revisa el reporte de clientes antes de imprimir o descargar."
          icon={FileDown}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
              <Button onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="p-10 border rounded-lg bg-card">
           <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-12 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
        </div>
      ) : (
        <ClientExportPreview clients={clients} />
      )}
    </div>
  );
}
