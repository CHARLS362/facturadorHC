// src/lib/consultasApis.ts

export interface DniResponse {
    success: boolean;
    dni: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombreCompleto: string;
}

export interface RucResponse {
    success: boolean;
    ruc: string;
    razonSocial: string;
    nombreComercial?: string;
    direccion?: string;
    estado: string;
    condicion: string;
}

const API_BASE_URL = "https://api.apis.net.pe/v2";
const TOKEN = process.env.APIS_NET_PE_TOKEN;

async function fetchData<T>(url: string): Promise<T> {
    if (!TOKEN) {
        console.error("Error: El token de autorización para apis.net.pe no está configurado.");
        throw new Error("El servicio de consulta no está configurado en el servidor.");
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido en la API externa.' }));
        throw new Error(errorData.message || `Error en la consulta: ${response.statusText}`);
    }

    return response.json();
}

export async function consultarDni(dni: string): Promise<DniResponse> {
    const url = `${API_BASE_URL}/reniec/dni?numero=${dni}`;
    return fetchData<DniResponse>(url);
}

export async function consultarRuc(ruc: string): Promise<RucResponse> {
    const url = `${API_BASE_URL}/sunat/ruc?numero=${ruc}`;
    return fetchData<RucResponse>(url);
}
