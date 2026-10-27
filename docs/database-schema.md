# Banco

PostgreSQL, modelado em `backend/prisma/schema.prisma`. Identificadores são UUID.

## User

E-mail único, `passwordHash` bcrypt e `role` (`admin` ou `viewer`).

## RefreshToken

Hash SHA-256 do refresh token, usuário e expiração. A exclusão do usuário remove os tokens.

## Product

`name`, `description`, `price` decimal (10,2), `category`, `imageUrl`, `isAvailable`, `preparationTime`, `createdAt`, `updatedAt`.

Índices: `name` e `(category, isAvailable)`.

## DeliveryPerson

`name`, `phone`, `vehicleType`, `isActive`, coordenadas atuais anuláveis e `createdAt`. Índice em `isActive`.

## Order

Cliente, telefone, endereço, latitude, longitude, `status`, `totalAmount`, entregador opcional, `createdAt`, `updatedAt`.

Índices: `(status, createdAt)`, `(deliveryPersonId, status)` e `createdAt`.

Se o entregador for removido, `deliveryPersonId` fica nulo. A API impede essa remoção quando ainda existe pedido vinculado.

## OrderItem

`productId` anulável, `soldProductId` estável, `productName`, `quantity` e `unitPrice`. O nome e o preço ficam gravados no momento da venda. Excluir o produto, quando a regra permite, apenas zera `productId`.

## OrderStatusEvent

Cada transição grava `status` e `createdAt`. A receita e o tempo médio de entrega leem o evento `delivered`.

## Estados do pedido

`pending → preparing → ready → delivering → delivered`

`pending`, `preparing` e `ready` também podem ir para `cancelled`. `delivering` só vai para `delivered`.
