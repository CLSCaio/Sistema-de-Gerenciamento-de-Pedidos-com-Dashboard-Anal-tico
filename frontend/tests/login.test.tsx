import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthProvider } from '@/context/AuthContext';
import { AppRoutes } from '@/App';

describe('login', () => {
  it('renderiza os campos de e-mail e senha', () => {
    render(<LoginForm onSuccess={vi.fn()} />);
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('mostra erro quando os campos obrigatórios estão vazios', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('E-mail é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
  });

  it('entra e abre a tela de pedidos', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/api/auth/refresh')) {
          return new Response(JSON.stringify({ error: { message: 'ausente', code: 'UNAUTHORIZED', details: [] } }), { status: 401 });
        }
        if (url.endsWith('/api/auth/login')) {
          return new Response(
            JSON.stringify({ accessToken: 'token', user: { id: '1', email: 'admin@fastmeals.com', role: 'admin' } }),
            { status: 200 },
          );
        }
        if (url.includes('/api/orders')) {
          return new Response(JSON.stringify({ data: [], meta: { page: 1, pageSize: 8, total: 0, totalPages: 0 } }), { status: 200 });
        }
        return new Response(JSON.stringify({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }), {
          status: init?.method === 'POST' ? 201 : 200,
        });
      }),
    );

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('E-mail'), 'admin@fastmeals.com');
    await user.type(screen.getByLabelText('Senha'), 'Admin@123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('heading', { name: 'Pedidos' })).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
