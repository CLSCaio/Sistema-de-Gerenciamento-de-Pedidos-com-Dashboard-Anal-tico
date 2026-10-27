# API

Base: `http://localhost:3001/api`

Erros:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": [{ "field": "price", "message": "O preço deve ser maior que zero" }]
  }
}
```

Códigos usados: 200, 201, 204, 400, 401, 403, 404, 422, 429, 500.

Listas paginadas:

```json
{ "data": [], "meta": { "page": 1, "pageSize": 10, "total": 0, "totalPages": 0 } }
```

Há no máximo 100 requisições por minuto por IP. Acima disso a resposta é 429 `RATE_LIMITED`.

Rotas públicas: `GET /health`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.

As demais exigem `Authorization: Bearer <accessToken>`. Token ausente, inválido ou expirado responde 401. Papel insuficiente responde 403.

## Auth

`POST /auth/login`

```json
{ "email": "admin@fastmeals.com", "password": "Admin@123" }
```

Resposta: `{ "accessToken": "...", "user": { "id", "email", "role" } }`. O refresh token vai no cookie `refreshToken`, HttpOnly, por 7 dias. O access token expira em 15 minutos.

`POST /auth/refresh` lê o cookie, gira o token e devolve um novo access token.

`POST /auth/logout` apaga o refresh token e limpa o cookie.

`GET /auth/me` devolve o usuário do access token.

## Produtos

`GET /products?page&pageSize&search&category&isAvailable&includeUnavailable`

Sem `includeUnavailable=true` e sem filtro explícito de disponibilidade, a lista traz só `isAvailable=true`. O painel envia `includeUnavailable=true`.

`GET /products/:id`

`POST /products`, `PUT /products/:id` e `PATCH /products/:id/availability` exigem admin.

Campos: `name` (3–120), `description` (10–500), `price` (> 0, até 2 casas), `category` (`meal`, `drink`, `dessert`, `side`), `imageUrl` opcional, `isAvailable` padrão true, `preparationTime` (1–120).

`DELETE /products/:id` responde 422 `PRODUCT_IN_USE` se existir item em pedido `pending` ou `preparing`.

## Pedidos

`GET /orders?page&pageSize&status&sort&startDate&endDate`

`sort` é `asc` ou `desc` sobre `createdAt`. Datas são `YYYY-MM-DD` no fuso de São Paulo e precisam ir juntas.

`GET /orders/:id`

`POST /orders` (admin). O corpo leva cliente, telefone `(XX) XXXXX-XXXX`, endereço, latitude, longitude e `items: [{ productId, quantity }]`. O `totalAmount` é a soma de preço atual vezes quantidade. Produto indisponível responde 422 `PRODUCT_UNAVAILABLE`.

`PATCH /orders/:id/status` (admin)

```json
{ "status": "preparing", "deliveryPersonId": "opcional" }
```

Transições aceitas:

| De | Para |
| --- | --- |
| pending | preparing, cancelled |
| preparing | ready, cancelled |
| ready | delivering, cancelled |
| delivering | delivered |

`ready` → `delivering` exige `deliveryPersonId` de um entregador ativo sem outro pedido `delivering`. Qualquer outra troca responde 422 `INVALID_STATUS_TRANSITION`.

`POST /orders/optimize-assignment` (admin) não recebe corpo. Considera pedidos `ready` e entregadores ativos, com coordenada e sem pedido em rota.

```json
{
  "assignments": [{ "orderId": "...", "deliveryPersonId": "...", "estimatedDistanceKm": 2.45 }],
  "unassigned": [{ "orderId": "...", "reason": "No available delivery person" }],
  "totalDistanceKm": 4.32
}
```

`POST /orders/accept-assignment` (admin)

```json
{ "orderId": "...", "deliveryPersonId": "..." }
```

O pedido sai de `ready` para `delivering`.

## Entregadores

Admin. `GET/POST /delivery-persons`, `GET/PUT/DELETE /delivery-persons/:id`.

Campos: `name` (3–100), `phone` no formato brasileiro, `vehicleType` (`bicycle`, `motorcycle`, `car`), `isActive`, `currentLatitude`, `currentLongitude`. As duas coordenadas vêm juntas ou ficam nulas. Excluir um entregador com pedido vinculado responde 422.

## Relatórios

`GET /reports?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

```json
{
  "revenue": { "total": 0 },
  "ordersByStatus": [{ "status": "pending", "count": 0 }],
  "topProducts": [{ "productId": "...", "name": "...", "quantity": 1 }],
  "averageDeliveryTimeMinutes": null
}
```

Receita e tempo médio usam pedidos cuja transição para `delivered` caiu no período. O ranking usa a quantidade desses pedidos, no máximo 10. A contagem por status usa pedidos criados no período.
