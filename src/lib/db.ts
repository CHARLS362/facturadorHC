/*
import sql, { config as SqlConfig, ConnectionPool } from 'mssql';

const dbConfig: SqlConfig = {
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '12345',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'FacturacionHC',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: ConnectionPool | null = null;

export async function getConnection(): Promise<ConnectionPool> {
  if (pool) return pool;

  try {
    pool = await sql.connect(dbConfig);
    console.log('Conectado a SQL Server');
    return pool;
  } catch (error) {
    console.error('Error de conexión:', error);
    throw error;
  }
}
*/
import sql, { config as SqlConfig, ConnectionPool } from 'mssql';

const dbConfig: SqlConfig = {
  user: process.env.DB_USER || 'db_abac2e_facturacionhc_admin',         // Cambia por tu usuario remoto
  password: process.env.DB_PASSWORD || 'facturacion23',    // Cambia por tu contraseña remota
  server: process.env.DB_SERVER || 'SQL1004.site4now.net',   // IP o dominio del servidor remoto
  database: process.env.DB_NAME || 'FacturacionHC',
  port: 1433, // Cambia si tu servidor usa otro puerto
  options: {
    encrypt: true, // true si usas Azure o conexión segura
    trustServerCertificate: true, // true si el certificado es autofirmado
  },
};

let pool: ConnectionPool | null = null;

export async function getConnection(): Promise<ConnectionPool> {
  if (pool) return pool;

  try {
    pool = await sql.connect(dbConfig);
    console.log('Conectado a SQL Server remoto');
    return pool;
  } catch (error) {
    console.error('Error de conexión:', error);
    throw error;
  }
}