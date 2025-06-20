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
