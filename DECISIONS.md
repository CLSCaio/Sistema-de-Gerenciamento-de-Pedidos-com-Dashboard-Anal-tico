# Decisões

## Bibliotecas

Express foi escolhido porque o contrato é uma API REST pequena, com middleware explícito para JWT, papel e rate limit. Fastify seria mais rápido, mas não muda o desenho deste escopo.

Prisma com PostgreSQL cobre relações entre pedido, item, produto e entregador, transações na troca de status e índices para a listagem paginada. O schema fica versionado em `backend/prisma/migrations`.

Zod valida body, query e params na borda HTTP. O TypeScript não substitui essa validação.

`bcryptjs` implementa bcrypt com 10 salt rounds. A biblioteca pura evita compilação nativa no Windows e na imagem Alpine.

Vitest roda backend e frontend. A suíte do backend exercita regras e HTTP com stores em memória, então `npm test` não exige o Postgres. A persistência real continua no Prisma.

No frontend, Vite entrega React 18 sem o custo do Next.js, que o enunciado não pede. React Router organiza as telas. Recharts renderiza os dois gráficos. Tailwind é o único sistema visual do painel: os componentes de `src/components/ui` concentram botão, campo, select, modal e checkbox.

## Algoritmo

A atribuição é o problema de assignment bipartido: cada pedido pronto recebe no máximo um entregador livre, e cada entregador recebe no máximo um pedido. A distância é a fórmula de Haversine.

A solução é o algoritmo húngaro na versão de caminhos aumentados de custo mínimo (Jonker–Volgenant), com complexidade **O(n³)**, em que `n = max(pedidos, entregadores)`. Para 50 pedidos e 30 entregadores, `n = 50`. Não é busca fatorial.

A matriz é completada até ficar quadrada. Colunas ou linhas excedentes representam a falta de par. O matching perfeito obriga o uso de todos os entregadores quando há pedidos suficientes, e a soma minimizada é a das distâncias reais. Pedidos sem coluna real voltam em `unassigned` com o motivo `No available delivery person`.

Entregador inativo, sem coordenada ou com pedido `delivering` nem entra na matriz. O resultado é ótimo para a distância geodésica em linha reta. Não considera trânsito, prioridade do pedido nem capacidade maior que um pedido por vez. Uma heurística gulosa seria mais simples e poderia ficar arbitrariamente pior, como no caso em que o par mais barato isolado deixa o segundo pedido com um custo muito alto.

## Arquitetura

O HTTP fica em routes, controllers e middlewares. A regra de transição, o total do pedido e o resumo dos relatórios são funções puras. O acesso ao Prisma fica nos stores, para a suíte testar o comportamento sem banco.

O access token dura 15 minutos e não é gravado. O refresh token é aleatório, só o HMAC-SHA256 com `JWT_REFRESH_SECRET` fica no banco, e cada refresh invalida o token anterior. O cookie é `HttpOnly`, `SameSite=Lax` e path `/api/auth`. Em localhost, portas diferentes ainda são o mesmo site, então o navegador envia o cookie para a API.

O painel faz uma única renovação em voo. Isso evita que o modo estrito do React dispare dois refresh paralelos e invalide o cookie recém-girado.

Produtos ligados a pedidos `pending` ou `preparing` não podem ser excluídos. Pedidos já concluídos guardam `soldProductId`, nome e preço no item. A chave estrangeira do produto usa `ON DELETE SET NULL`, então o histórico sobrevive à exclusão permitida pela regra.

Relatórios filtram a receita e o tempo médio pela data em que o pedido passou a `delivered`, no fuso `America/Sao_Paulo`. A contagem por status usa a data de criação. A listagem pagina no banco, com índice em `(status, createdAt)`.

Pedidos em tempo real usam consulta a cada 8 segundos. WebSocket não entra porque não há outro consumidor além deste painel.

## Dificuldades

O refresh em origens `localhost:3000` e `localhost:3001` funciona com `SameSite=Lax` porque o site ignora a porta. `Secure` fica desligado no HTTP local e só deve ser ligado com HTTPS.

A matriz retangular do húngaro precisa de um matching perfeito com custo constante nas posições artificiais. Custo zero nessas posições não “rouba” um entregador real, porque toda coluna real continua obrigada a um par quando existem pedidos suficientes.

O formulário de pedido acumula vários itens antes de enviar. O total continua sendo calculado só no backend.
