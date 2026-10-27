import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/ui/Spinner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AssignmentPage } from '@/pages/AssignmentPage';
import { CouriersPage } from '@/pages/CouriersPage';
import { LoginPage } from '@/pages/LoginPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ReportsPage } from '@/pages/ReportsPage';

function RequireAuth() {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Spinner />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

function RequireAdmin() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/orders" replace />;
  return <AssignmentPage />;
}

function RequireCourierAdmin() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/orders" replace />;
  return <CouriersPage />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to="/orders" replace />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/assignment" element={<RequireAdmin />} />
        <Route path="/couriers" element={<RequireCourierAdmin />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
