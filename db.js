const { Pool } = require('pg');

// O Railway injeta DATABASE_URL automaticamente quando você adiciona
// o plugin PostgreSQL ao mesmo projeto. Não é preciso configurar nada
// manualmente além de garantir que a variável exista (ver README).
if (!process.env.DATABASE_URL) {
  console.warn(
    'Aviso: variável DATABASE_URL não encontrada. ' +
    'Confirme se o plugin PostgreSQL foi adicionado ao projeto no Railway.'
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('proxy.rlwy.net')
    ? { rejectUnauthorized: false }
    : false,
});

// Cria a tabela na primeira execução, caso ainda não exista.
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tecidos (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT DEFAULT '',
      qty NUMERIC NOT NULL CHECK (qty >= 0),
      unit TEXT NOT NULL CHECK (unit IN ('MT', 'KG')),
      color TEXT DEFAULT '#35507A',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = { pool, initDb };
