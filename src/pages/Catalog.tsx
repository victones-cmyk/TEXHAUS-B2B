import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Loading } from '../components/Loading';
import type { Product } from '../types';

export function Catalog() {
  const { isLoggedIn, isB2BApproved } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setProducts(data);
        setLoading(false);
      });
  }, []);

  const [catTree, setCatTree] = useState<{ id: string; name: string; parent_id: string | null }[]>([]);
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['Todas', ...Array.from(cats).sort()];
  }, [products]);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order')
      .then(({ data }) => { if (data) setCatTree(data); });
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'Todas') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': break; // already sorted
    }

    return result;
  }, [products, selectedCategory, sortBy, search]);

  const canSeePrice = isLoggedIn && isB2BApproved;

  return (
    <div className="app-wrapper">
      <SEO title="Catálogo" description="Catálogo completo de tecidos, persianas e acessórios para decoração. Preços exclusivos para parceiros B2B." />
      <Navbar />
      <main className="catalog-page">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Loja</span>
          </div>

          <div className="catalog-header">
            <h1>Catálogo de Produtos</h1>
            <p>{filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="catalog-layout">
            <aside className="catalog-filters">
              <div className="filter-section">
                <h3>Buscar</h3>
                <input
                  type="text"
                  className="filter-search"
                  placeholder="Buscar produto..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {categories.length > 1 && (
                <div className="filter-section">
                  <h3>Categoria</h3>
                  <div className="filter-categories">
                    <button className={`filter-cat-btn ${selectedCategory === 'Todas' ? 'active' : ''}`} onClick={() => setSelectedCategory('Todas')}>
                      Todas ({products.length})
                    </button>
                    {catTree.filter(c => !c.parent_id).map(root => (
                      <span key={root.id}>
                        <button className={`filter-cat-btn ${selectedCategory === root.name ? 'active' : ''}`} onClick={() => setSelectedCategory(root.name)}>
                          {root.name} ({products.filter(p => p.category === root.name).length})
                        </button>
                        {catTree.filter(c => c.parent_id === root.id).map(sub => (
                          <button key={sub.id} className={`filter-cat-btn sub ${selectedCategory === sub.name ? 'active' : ''}`} onClick={() => setSelectedCategory(sub.name)}>
                            {sub.name} ({products.filter(p => p.category === sub.name).length})
                          </button>
                        ))}
                      </span>
                    ))}
                    {catTree.length === 0 && categories.filter(c => c !== 'Todas').map(cat => (
                      <button key={cat} className={`filter-cat-btn ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                        {cat} ({products.filter(p => p.category === cat).length})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="filter-section">
                <h3>Ordenar</h3>
                <select
                  className="filter-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="newest">Mais recentes</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                  <option value="name">Nome A-Z</option>
                </select>
              </div>
            </aside>

            <div className="catalog-grid">
              {loading ? (
                <Loading type="skeleton" lines={4} />
              ) : filtered.length === 0 ? (
                <div className="catalog-empty">
                  <p>Nenhum produto encontrado.</p>
                  <button className="btn-secondary" onClick={() => { setSelectedCategory('Todas'); setSearch(''); }}>
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <div className="product-grid">
                  {filtered.map(product => (
                    <div key={product.id} className="product-card">
                      <Link to={`/produto/${product.id}`} className="product-image">
                        <img src={product.image_url} alt={product.name} loading="lazy" />
                        {!isLoggedIn && (
                          <div className="b2b-overlay">
                            <span>Área Restrita</span>
                            <button className="btn-primary" onClick={e => { e.preventDefault(); }}>Acesso B2B</button>
                          </div>
                        )}
                      </Link>
                      <div className="product-info">
                        <span className="category">{product.category}</span>
                        <h3>{product.name}</h3>
                        {canSeePrice ? (
                          <div className="price-info">
                            <span className="price">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                            </span>
                            <button className="btn-primary" style={{ width: '100%' }} onClick={() => { addToCart(product); toast(`${product.name} adicionado ao carrinho`, 'success'); }}>
                              Comprar
                            </button>
                          </div>
                        ) : (
                          <p className="login-prompt">Faça login para ver preços</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
