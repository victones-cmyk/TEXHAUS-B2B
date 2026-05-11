import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { SearchBar } from './SearchBar';

export function Navbar() {
  const { isLoggedIn, isAdmin, signIn, signOut } = useAuth();
  const { itemCount } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobile = () => setMobileOpen(false);

  const handleAdminAccess = () => {
    setShowModal(false);
    navigate('/admin');
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('loginEmail') as string;
    const password = formData.get('loginPassword') as string;

    const error = await signIn(email, password);
    if (error) {
      setErrorMessage(error);
    } else {
      setShowModal(false);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="section-container nav-content">
          <div className="logo">
            <Link to="/">
              <span className="logo-text">TEXHAUS<span className="b2b-badge">B2B</span></span>
            </Link>
          </div>
          <div className="nav-links">
            <div className="nav-main-links">
              <Link to="/">Home</Link>
              <Link to="/loja">Catálogo</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/contato">Contato</Link>
            </div>
            
            <div className="nav-actions">
              <SearchBar />
              
              <Link to="/cart" className="cart-icon-link" title="Carrinho">
                <span className="cart-icon">
                  <ShoppingBag size={20} />
                  {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </span>
              </Link>

              {!isLoggedIn ? (
                <div className="auth-buttons">
                  <Link to="/cadastro" className="btn-outline btn-small">Cadastro</Link>
                  <button className="btn-primary btn-small" onClick={() => setShowModal(true)}>Acesso</button>
                </div>
              ) : (
                <div className="user-profile">
                  <Link to="/account" className="nav-icon-link" title="Minha Conta">
                    <User size={20} />
                  </Link>
                  {isAdmin && (
                    <button className="nav-icon-link admin-link" onClick={handleAdminAccess} title="Painel Admin">
                      <LayoutDashboard size={20} />
                    </button>
                  )}
                  <button className="nav-icon-link logout-link" onClick={signOut} title="Sair">
                    <LogOut size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <button className={`hamburger ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobile}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <button className="mobile-close" onClick={closeMobile}><X size={24} /></button>
            <div className="mobile-links">
              <Link to="/" onClick={closeMobile}>Home</Link>
              <Link to="/loja" onClick={closeMobile}>Catálogo</Link>
              <Link to="/blog" onClick={closeMobile}>Blog</Link>
              <Link to="/contato" onClick={closeMobile}>Contato</Link>
              <Link to="/cart" onClick={closeMobile} className="mobile-cart-link">
                <ShoppingBag size={20} />
                <span>Carrinho</span>
                {itemCount > 0 && <span className="mobile-cart-count">{itemCount}</span>}
              </Link>
              <div className="mobile-search">
                <SearchBar />
              </div>
              <div className="mobile-auth-section">
                {isLoggedIn ? (
                  <>
                    <Link to="/account" onClick={closeMobile} className="mobile-link-with-icon">
                      <User size={18} /> Minha Conta
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={closeMobile} className="mobile-link-with-icon">
                        <LayoutDashboard size={18} /> Painel Admin
                      </Link>
                    )}
                    <button className="btn-secondary mobile-auth-btn logout" onClick={() => { closeMobile(); signOut(); }}>
                      <LogOut size={18} /> Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/cadastro" onClick={closeMobile} className="btn-outline mobile-auth-btn">Cadastro</Link>
                    <button className="btn-primary mobile-auth-btn" onClick={() => { closeMobile(); setShowModal(true); }}>
                      Área do Parceiro
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setShowModal(false)}>×</span>

            {errorMessage && (
              <div style={{ color: '#721c24', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>
                {errorMessage}
              </div>
            )}

            <h2>Acesso Restrito</h2>
            <p>Faça login na sua conta de parceiro B2B.</p>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <input type="email" name="loginEmail" required placeholder="E-mail corporativo" />
                <input type="password" name="loginPassword" required placeholder="Senha" />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Entrando...' : 'Entrar como Parceiro'}
                </button>
                 <p className="auth-switch">
                    Ainda não tem conta? <Link to="/cadastro" onClick={() => setShowModal(false)}>Solicitar Cadastro</Link>
                  </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
