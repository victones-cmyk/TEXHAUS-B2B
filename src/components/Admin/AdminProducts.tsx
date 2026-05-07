import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { ProductModal } from './ProductModal';
import type { Product } from '../../types';

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching products:', error);
        } else {
          setProducts(data || []);
        }
        setLoading(false);
      });
  }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast('Erro ao excluir: ' + error.message, 'error');
    } else {
      setProducts(products.filter(p => p.id !== id));
      toast('Produto excluído.', 'info');
    }
  };

  const handleModalClose = (saved: boolean) => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
    if (saved) {
      setLoading(true);
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error) setProducts(data || []);
          setLoading(false);
        });
    }
  };

  return (
    <>
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Gestão de Produtos</h2>
          <p>Adicione e gerencie os produtos do catálogo B2B.</p>
        </div>
        <button
          className="btn-approve"
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          onClick={() => {
            setEditingProduct(undefined);
            setIsModalOpen(true);
          }}
        >
          + Novo Produto
        </button>
      </header>

      <div className="admin-content">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Categoria</th>
                <th>Preço B2B</th>
                <th>Estoque</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Carregando produtos...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum produto cadastrado.</td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.7rem' }}>S/ img</div>
                          )}
                        </div>
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>{product.sku || '-'}</td>
                    <td><span className="category-tag">{product.category || 'Geral'}</span></td>
                    <td>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </td>
                    <td>{product.stock_quantity} un</td>
                    <td>
                      <span className={`status-badge ${product.status === 'published' ? 'approved' : 'pending'}`}>
                        {product.status === 'published' ? 'Ativo' : 'Rascunho'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-approve" style={{ backgroundColor: '#007bff' }} onClick={() => handleEdit(product)}>Editar</button>
                        <button className="btn-reject" onClick={() => handleDelete(product.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
