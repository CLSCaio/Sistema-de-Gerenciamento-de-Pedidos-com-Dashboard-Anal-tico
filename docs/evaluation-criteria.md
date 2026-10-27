# Critérios de avaliação

## Stack

- Frontend React 18 com TypeScript estrito, Vite e testes em Vitest.
- Backend Node.js com TypeScript estrito, Express, Zod e Vitest.
- PostgreSQL com Prisma e migration versionada.
- `docker-compose.yml` sobe banco, API e painel.

## Autenticação

- Perfis `admin` e `viewer`, com 403 para escrita do viewer.
- Access token de 15 minutos e refresh token de 7 dias em cookie HttpOnly.
- Senhas com bcrypt, 10 rounds.
- 401 para token ausente ou inválido.
- Rate limit de 100 requisições por minuto por IP, resposta 429.
- Seed dos usuários `admin@fastmeals.com` e `viewer@fastmeals.com`.

## Produtos

- Campos e limites do enunciado, inclusive preço com no máximo duas casas e URL opcional.
- Exclusão bloqueada quando há pedido `pending` ou `preparing`.
- Listagem padrão esconde produto indisponível. O painel pede `includeUnavailable=true`.
- Paginação, busca por nome, categoria e disponibilidade.

## Pedidos

- Total calculado no backend a partir do preço vigente.
- Produto indisponível não entra em pedido novo.
- Máquina de estados com 422 para transição ilegal.
- `ready → delivering` exige entregador ativo e sem outra entrega em andamento.
- Paginação, filtro por status e por data, ordenação por criação.

## Entregadores e atribuição

- CRUD administrativo.
- `POST /api/orders/optimize-assignment` usa Haversine e o algoritmo húngaro O(n³).
- Excesso de pedidos volta em `unassigned`.
- Aceitar a sugestão move o pedido para `delivering`.

## Relatórios

- Receita dos pedidos entregues no período.
- Contagem por status.
- Top 10 por quantidade vendida em pedidos entregues.
- Tempo médio entre criação e a transição para `delivered`.
- Dois gráficos de barras no painel.

## Testes

Backend, 14 testes: token válido, token inválido, 403, criação de produto, validação de produto, transição válida, transição inválida, exigência de entregador, atribuição ótima, ausência de entregadores, pedido excedente, receita do período e ranking de produtos.

Frontend, 5 testes: renderização do login, validação do formulário, fluxo de login até a tela de pedidos, validação do nome do produto e clique na transição de status.

## Performance

A listagem pagina no SQL e usa índice em status e data. O algoritmo é O(n³). Esta máquina não carregou 10.000 registros nem mediu o percentil da API; a estrutura foi feita para esse limite, mas o tempo não foi comprovado aqui.
