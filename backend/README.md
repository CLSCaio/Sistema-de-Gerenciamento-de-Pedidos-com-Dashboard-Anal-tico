# FastMeals API

API REST em Node.js, TypeScript, Express, Prisma e PostgreSQL. Porta padrão: **3001**.

## Preparar

O banco local deste projeto não usa o PostgreSQL instalado na máquina. Ele sobe na porta 5433, com os dados em `backend/.pgdata`.

```bash
npm install
npm run db
```

Em outro terminal:

```bash
npm run dev
```

Se `backend/.env` não existir, `npm run db` cria o arquivo com usuário e senha `fastmeals`, sobe o Postgres na porta 5433, aplica as migrations e executa o seed quando ainda não há usuários. Um `.env` que já existe é mantido.

- `npm run dev` sobe a API com recarga.
- `npm run build` gera `dist/`.
- `npm start` executa o build.
- `npm test` roda a suíte com Vitest.
- `npm run seed` lê `../seed/data.json`, grava os usuários com bcrypt e recria os pedidos de exemplo pelos IDs fixos.

O seed também cria:

| E-mail | Senha | Perfil |
| --- | --- | --- |
| admin@fastmeals.com | Admin@123 | admin |
| viewer@fastmeals.com | Viewer@123 | viewer |

## Variáveis

| Nome | Função |
| --- | --- |
| DATABASE_URL | Conexão PostgreSQL |
| JWT_ACCESS_SECRET | Assinatura do access token (15 minutos) |
| JWT_REFRESH_SECRET | Segredo HMAC do refresh token |
| PORT | Porta HTTP, padrão 3001 |
| CORS_ORIGIN | Origem do frontend, padrão http://localhost:3000 |
| COOKIE_SECURE | `true` apenas em HTTPS |
| SEED_PATH | Caminho do `data.json`; no Docker é `/seed/data.json` |

O refresh token vai em cookie `HttpOnly` no path `/api/auth`, com validade de 7 dias. O limite global é de 100 requisições por minuto por IP.
