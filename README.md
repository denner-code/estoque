# Estoque de Tecidos

Sistema simples de gestão de estoque de tecidos, com quantidades em metros
(MT) ou quilogramas (KG). Backend em Node.js/Express, banco de dados
PostgreSQL, front-end estático servido pelo próprio backend.

## Rodando localmente (opcional)

```bash
npm install
cp .env.example .env   # edite com a connection string do seu Postgres
npm start
```

Acesse em `http://localhost:3000`.

## Deploy no Railway

Veja o passo a passo completo na conversa com o Claude, ou resumidamente:

1. Suba esta pasta para um repositório no GitHub.
2. No Railway, crie um projeto a partir desse repositório.
3. Adicione o plugin **PostgreSQL** ao mesmo projeto.
4. Na variável `DATABASE_URL` do serviço do app, referencie a do Postgres
   (`${{Postgres.DATABASE_URL}}`).
5. Gere um domínio público em Settings → Networking → Generate Domain.
6. Acesse o domínio gerado de qualquer computador com internet.
