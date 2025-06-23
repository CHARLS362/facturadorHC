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

function corregirConsulta(sql: string): string {
  // Elimina cualquier nombre de base de datos seguido por .dbo.
  return sql.replace(/\b[\w\d_]+\b\.dbo\./g, 'dbo.');
}


let poolPromise: Promise<ConnectionPool> | null = null;

const createPool = async (): Promise<ConnectionPool> => {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Conexión a SQL Server establecida y pool creado');

        const originalRequest = pool.request.bind(pool);

        (pool.request as any) = function() {
          const req = originalRequest();
          const originalQuery = req.query.bind(req);
          (req.query as any) = function(queryString: string, callback?: any) {
            const correctedQuery = corregirConsulta(queryString);
            return originalQuery(correctedQuery, callback);
          };
          return req;
        };

        return pool;
    } catch (error) {
        console.error('Error de conexión:', error);
        // Reset promise on failure to allow retry
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
