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
  // Adding timeouts to prevent long hangs on startup
  connectionTimeout: 15000, 
  requestTimeout: 15000,
};

let poolPromise: Promise<ConnectionPool> | null = null;

const createPool = async (): Promise<ConnectionPool> => {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Conexión a SQL Server establecida y pool creado');
        return pool;
    } catch (error) {
        console.error('Error de conexión a la base de datos:', error);
        // Reset promise on failure to allow retry on next request
        poolPromise = null; 
        throw error;
    }
};

export function getConnection(): Promise<ConnectionPool> {
  if (!poolPromise) {
    poolPromise = createPool();
  }
  return poolPromise;
}
