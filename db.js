const sql = require('mssql');
require('dotenv').config();

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } = process.env;

// Validação das variáveis de ambiente
if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_NAME || !DB_PORT) {
  console.error('[ERRO] Variáveis de ambiente de banco de dados estão incompletas. Verifique o arquivo .env.');
  process.exit(1); // Encerra o app, pois não adianta continuar sem config básica
}

const config = {
  user: DB_USER,
  password: DB_PASSWORD,
  server: DB_HOST,
  database: DB_NAME,
  port: parseInt(DB_PORT, 10),
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect()
  .then(() => {
    console.log('[INFO] Conectado com sucesso ao banco de dados MSSQL.');
  })
  .catch((err) => {
    console.error('[ERRO] Falha ao conectar ao banco de dados MSSQL:');
    console.error(err.message || err);
    // Aqui você pode decidir se encerra o processo:
    // process.exit(1);
  });

module.exports = { sql, pool, poolConnect };