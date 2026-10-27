# FastMeals Dashboard

Painel em React 18, TypeScript e Vite. Porta de desenvolvimento: **3000**.

## Comandos

```bash
npm install
npm run dev
```

A API precisa estar em http://localhost:3001, ou no endereço definido por `VITE_API_URL`.

```bash
npm test
npm run build
npm run preview
```

Copie `.env.example` para `.env` se quiser apontar o build para outra origem.

## Telas

- `/login`
- `/orders`
- `/products`
- `/reports`
- `/assignment` (admin)
- `/couriers` (admin)

O access token fica em memória. Ao recarregar a página, o painel chama `POST /api/auth/refresh` com o cookie. Se o refresh falhar, a navegação volta para o login.

A lista de pedidos consulta a API a cada 8 segundos.
