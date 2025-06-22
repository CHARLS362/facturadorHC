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


let pool: ConnectionPool | null = null;

export async function getConnection(): Promise<ConnectionPool> {
  if (pool) return pool;

  try {
    pool = await sql.connect(dbConfig);
    console.log('Conectado a SQL Server');

    // Guardamos la función original para luego envolverla
    const originalRequest = pool.request.bind(pool);

    // Reemplazamos pool.request para envolver la query
    (pool.request as any) = function() {
      const req = originalRequest();

      // Guardamos la función query original
      const originalQuery = req.query.bind(req);

      // Sobrescribimos query para corregir la consulta antes de ejecutarla
      // Cast to any to work around the complex overloads of the `query` method.
      (req.query as any) = function(queryString: string, callback?: any) {
        const correctedQuery = corregirConsulta(queryString);
        return originalQuery(correctedQuery, callback);
      };

      return req;
    };

    return pool;
  } catch (error) {
    console.error('Error de conexión:', error);
    throw error;
  }
}
