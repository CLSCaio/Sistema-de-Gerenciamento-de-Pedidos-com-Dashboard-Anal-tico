# FastMeals

Painel administrativo e API de pedidos da FastMeals. O backend fica em `backend/`, o frontend em `frontend/` e os dados iniciais em `seed/data.json`.

## Subir com Docker

Na raiz do projeto:

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3001
- PostgreSQL: localhost:5432 (`fastmeals` / `fastmeals`)

O backend aplica a migration e executa o seed na subida.

## Subir sem Docker

O banco local fica dentro do projeto, na porta 5433, separado do PostgreSQL da máquina. Não precisa criar senha nem copiar `.env`: o primeiro `npm run db` grava `backend/.env` com a senha `fastmeals`, sobe o Postgres, aplica as migrations e carrega o seed se o banco estiver vazio.

```bash
cd backend
npm install
npm run db
```

Em outro terminal:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

A API sobe na porta 3001 e o painel na porta 3000.

## Acesso

| E-mail | Senha | Perfil |
| --- | --- | --- |
| admin@fastmeals.com | Admin@123 | admin |
| viewer@fastmeals.com | Viewer@123 | viewer |

O perfil `viewer` consulta pedidos, produtos e relatórios. Escrita, entregadores e atribuição ficam com `admin`.

## Testes

```bash
cd backend && npm test
cd frontend && npm test
```

Os testes do backend não dependem de um Postgres em execução. A suíte cobre autenticação, validação de produto, transição de pedido, o algoritmo de atribuição e os relatórios.

## Documentação

- [Decisões](DECISIONS.md)
- [API](docs/api-spec.md)
- [Banco](docs/database-schema.md)
- [Critérios](docs/evaluation-criteria.md)
