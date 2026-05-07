import { useEffect } from 'react';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminApprovals } from '../components/Admin/AdminApprovals';
import { AdminProducts } from '../components/Admin/AdminProducts';
import { AdminOrders } from '../components/Admin/AdminOrders';
import { AdminPosts } from '../components/Admin/AdminPosts';
import { AdminCategories } from '../components/Admin/AdminCategories';

export function Admin() {
  const { isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const getActiveClass = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return 'active';
    if (path !== '/admin' && location.pathname.startsWith(path)) return 'active';
    return '';
  };

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          TEXHAUS<span>.</span> <span className="admin-badge">ADMIN</span>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={getActiveClass('/admin')}>Aprovação B2B</Link>
          <Link to="/admin/products" className={getActiveClass('/admin/products')}>Produtos</Link>
          <Link to="/admin/orders" className={getActiveClass('/admin/orders')}>Pedidos</Link>
          <Link to="/admin/blog" className={getActiveClass('/admin/blog')}>Blog</Link>
          <Link to="/admin/categories" className={getActiveClass('/admin/categories')}>Categorias</Link>
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/" className="btn-logout-admin">← Voltar para a Loja</Link>
          <button onClick={signOut} className="btn-logout-admin" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f44336' }}>
            Sair da Conta
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Routes>
          <Route path="/" element={<AdminApprovals />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="blog" element={<AdminPosts />} />
          <Route path="categories" element={<AdminCategories />} />
        </Routes>
      </main>
    </div>
  );
}
