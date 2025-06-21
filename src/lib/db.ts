import sql, { config as SqlConfig, ConnectionPool } from 'mssql';

const dbConfig: SqlConfig = {
  user: 'db_abac2e_facturacionhc_admin',
  password: 'facturacion23',
  server: 'SQL1004.site4now.net',
  database: 'db_abac2e_facturacionhc', 
  port: 1433,
  options: {
    encrypt: true,
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
