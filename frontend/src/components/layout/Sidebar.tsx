import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const links = [
  { to: '/orders', label: 'Pedidos', admin: false },
  { to: '/products', label: 'Produtos', admin: false },
  { to: '/reports', label: 'Relatórios', admin: false },
  { to: '/assignment', label: 'Atribuição', admin: true },
  { to: '/couriers', label: 'Entregadores', admin: true },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const visible = links.filter((link) => !link.admin || user?.role === 'admin');

  return (
    <aside className="flex w-full flex-col bg-ink text-cream lg:min-h-screen lg:w-72">
      <div className="px-6 py-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">FastMeals</p>
        <p className="mt-2 font-display text-3xl">Cozinha em movimento</p>
      </div>
      <nav className="flex gap-2 overflow-auto px-4 pb-4 lg:flex-col">
        {visible.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-2xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-ember text-white' : 'text-cream/80 hover:bg-white/10'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex items-center justify-between gap-3 px-6 py-6">
        <div>
          <p className="text-sm font-semibold">{user?.email}</p>
          <p className="text-xs uppercase tracking-wide text-orange-200">{user?.role}</p>
        </div>
        <Button variant="secondary" onClick={() => void logout()}>
          Sair
        </Button>
      </div>
    </aside>
  );
}
