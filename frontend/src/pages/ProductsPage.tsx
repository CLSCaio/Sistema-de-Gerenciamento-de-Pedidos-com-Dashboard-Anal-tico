import { useCallback, useEffect, useState } from 'react';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { ProductForm } from '@/components/products/ProductForm';
import { ProductTable } from '@/components/products/ProductTable';
import { Button } from '@/components/ui/Button';
import { EmptyState, Notice, PageHeader } from '@/components/ui/Feedback';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/http';
import { createProduct, deleteProduct, listProducts, setProductAvailability, updateProduct } from '@/services/resources';
import type { Category, Product, ProductInput } from '@/types/api';
import { categoryLabels } from '@/utils/labels';

export function ProductsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'' | Category>('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listProducts({ page, search, category, includeUnavailable: true });
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
      setError(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
    }
  }, [category, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(input: ProductInput) {
    if (editing) await updateProduct(editing.id, input);
    else await createProduct(input);
    setEditing(null);
    setCreating(false);
    await load();
  }

  return (
    <section className="grid gap-6">
      <PageHeader
        title="Cardápio"
        description="Produtos indisponíveis somem da venda, mas continuam visíveis aqui."
        action={canEdit ? <Button onClick={() => setCreating(true)}>Novo produto</Button> : undefined}
      />
      <form
        className="grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-[1fr_220px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          void load();
        }}
      >
        <Field label="Busca" htmlFor="product-search">
          <Input id="product-search" value={search} onChange={(event) => setSearch(event.target.value)} />
        </Field>
        <Field label="Categoria" htmlFor="filter-category">
          <Select id="filter-category" value={category} onChange={(event) => setCategory(event.target.value as '' | Category)}>
            <option value="">Todas</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="secondary">
            Filtrar
          </Button>
        </div>
      </form>
      {error ? <Notice>{error}</Notice> : null}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <EmptyState>Nenhum produto encontrado.</EmptyState>
      ) : (
        <ProductTable
          products={products}
          canEdit={canEdit}
          onEdit={setEditing}
          onDelete={setRemoving}
          onToggle={(product) => void setProductAvailability(product.id, !product.isAvailable).then(() => load())}
        />
      )}
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      {creating || editing ? (
        <Modal title={editing ? 'Editar produto' : 'Novo produto'} onClose={() => { setCreating(false); setEditing(null); }}>
          <ProductForm initial={editing ?? undefined} onCancel={() => { setCreating(false); setEditing(null); }} onSubmit={save} />
        </Modal>
      ) : null}
      {removing ? (
        <DeleteProductDialog
          product={removing}
          onClose={() => setRemoving(null)}
          onConfirm={() => {
            void deleteProduct(removing.id)
              .then(() => {
                setRemoving(null);
                return load();
              })
              .catch((caught: unknown) => setError(caught instanceof ApiError ? caught.message : 'Não foi possível excluir'));
          }}
        />
      ) : null}
    </section>
  );
}
