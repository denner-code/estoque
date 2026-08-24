const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Rotas da API ----------

// Listar tecidos (com busca e filtro opcionais via query string)
app.get('/api/tecidos', async (req, res) => {
  try {
    const { search = '', unit = '' } = req.query;
    const params = [];
    let query = 'SELECT * FROM tecidos WHERE 1=1';

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR type ILIKE $${params.length})`;
    }
    if (unit === 'MT' || unit === 'KG') {
      params.push(unit);
      query += ` AND unit = $${params.length}`;
    }
    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar tecidos.' });
  }
});

// Criar tecido
app.post('/api/tecidos', async (req, res) => {
  try {
    const { name, type = '', qty, unit, color = '#35507A' } = req.body;

    if (!name || qty === undefined || qty === null || !['MT', 'KG'].includes(unit)) {
      return res.status(400).json({ error: 'Nome, quantidade e unidade (MT/KG) são obrigatórios.' });
    }
    if (Number(qty) < 0) {
      return res.status(400).json({ error: 'Quantidade não pode ser negativa.' });
    }

    const result = await pool.query(
      `INSERT INTO tecidos (name, type, qty, unit, color)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, type, qty, unit, color]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar tecido.' });
  }
});

// Editar tecido
app.put('/api/tecidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type = '', qty, unit, color = '#35507A' } = req.body;

    if (!name || qty === undefined || qty === null || !['MT', 'KG'].includes(unit)) {
      return res.status(400).json({ error: 'Nome, quantidade e unidade (MT/KG) são obrigatórios.' });
    }
    if (Number(qty) < 0) {
      return res.status(400).json({ error: 'Quantidade não pode ser negativa.' });
    }

    const result = await pool.query(
      `UPDATE tecidos
       SET name = $1, type = $2, qty = $3, unit = $4, color = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, type, qty, unit, color, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tecido não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar tecido.' });
  }
});

// Remover tecido
app.delete('/api/tecidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tecidos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tecido não encontrado.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover tecido.' });
  }
});

// Verificação de saúde (útil para o Railway monitorar o serviço)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Qualquer outra rota devolve o front-end (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Inicialização ----------

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao inicializar o banco de dados:', err);
    process.exit(1);
  });
