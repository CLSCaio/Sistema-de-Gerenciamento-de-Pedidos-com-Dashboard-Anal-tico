# PostgreSQL do FastMeals

O banco usado no desenvolvimento fica dentro deste projeto. Ele não usa o PostgreSQL instalado na máquina.

Os binários vêm do pacote `embedded-postgres`, em `backend/node_modules/@embedded-postgres/windows-x64`. Os dados ficam em `backend/.pgdata`, pasta ignorada pelo Git.

## Conexão local

Num computador novo, `npm run db` cria `backend/.env` sozinho. A senha padrão é `fastmeals`.

| | |
| --- | --- |
| Host | `localhost` |
| Porta | `5433` |
| Banco | `fastmeals` |
| Usuário | `fastmeals` |
| Senha | `fastmeals` |
| Autenticação | `scram-sha-256` |

String de conexão:

```text
postgresql://fastmeals:fastmeals@localhost:5433/fastmeals
```

Nesta máquina o `backend/.env` já existia, então ele não foi reescrito. A senha deste cluster continua `8mL-v5YXYCe1l37q`:

```text
postgresql://fastmeals:8mL-v5YXYCe1l37q@localhost:5433/fastmeals
```

A senha fica gravada na primeira criação de `backend/.pgdata`. Trocar só o `.env` depois disso não altera a senha do banco. Para recomeçar, pare o processo, apague `backend/.pgdata` e suba de novo.

O PostgreSQL 18 da máquina continua na porta `5432` e não entra nessa conexão.

## Instalar e subir

Na pasta `backend`:

```bash
npm install
npm run db
```

`npm install` baixa o Postgres do projeto. `npm run db` cria o `.env` se ele não existir, cria o cluster na primeira vez, sobe o servidor na porta `5433`, aplica as migrations e carrega o seed quando o banco ainda não tem usuários. Esse terminal precisa continuar aberto. Ao encerrar o processo, o banco para.

Em outro terminal, ainda em `backend`:

```bash
npm run dev
```

O seed lê `seed/data.json` e grava os usuários da aplicação:

| E-mail | Senha | Perfil |
| --- | --- | --- |
| admin@fastmeals.com | Admin@123 | admin |
| viewer@fastmeals.com | Viewer@123 | viewer |

## Cliente gráfico

No pgAdmin, DBeaver ou similar:

- Host: `localhost`
- Port: `5433`
- Maintenance database: `fastmeals`
- Username: `fastmeals`
- Password: `fastmeals` em um clone novo. Nesta máquina, `8mL-v5YXYCe1l37q`

## Docker

O `docker-compose.yml` sobe outro Postgres, o da imagem `postgres:16-alpine`. Ele não lê `backend/.pgdata`.

| | |
| --- | --- |
| Host a partir da máquina | `localhost` |
| Porta | `5432` |
| Banco | `fastmeals` |
| Usuário | `fastmeals` |
| Senha | `fastmeals` |

Dentro da rede do Compose, a API usa `db:5432`, não `localhost`.

Não rode o Postgres do projeto e o do Docker ao mesmo tempo se os dois estiverem publicados na mesma porta. Hoje eles usam portas diferentes: `5433` no projeto e `5432` no Docker.
