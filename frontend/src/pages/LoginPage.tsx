import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { user, ready, login } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to="/orders" replace />;

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-ink px-8 py-10 text-cream">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-200">FastMeals</p>
        <div>
          <h1 className="max-w-md font-display text-5xl leading-tight">O painel da cozinha, sem fila e sem chute.</h1>
          <p className="mt-4 max-w-sm text-orange-100">Pedidos, cardápio, relatórios e a rota mais curta para cada entregador.</p>
        </div>
        <p className="text-sm text-orange-100">admin@fastmeals.com · viewer@fastmeals.com</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
          <h2 className="font-display text-3xl">Entrar</h2>
          <div className="mt-6">
            <LoginForm onSuccess={login} />
          </div>
        </div>
      </section>
    </div>
  );
}
