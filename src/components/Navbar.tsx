import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

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
            <Link to="/">Home</Link>
            <Link to="/loja">Catálogo</Link>
            <Link to="/sobre-nos">Sobre Nós</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contato">Contato</Link>
            <Link to="/cart" className="cart-icon-link">
              <span className="cart-icon">
                🛒
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </span>
            </Link>
            {!isLoggedIn ? (
              <>
                <Link to="/cadastro" className="nav-link cadastro-link">Cadastre-se</Link>
                <button className="btn-secondary" onClick={() => setShowModal(true)}>Área do Parceiro</button>
              </>
            ) : (
              <div className="user-profile">
                <Link to="/account" className="nav-link">Minha Conta</Link>
                {isAdmin && (
                  <button className="logout-btn" onClick={handleAdminAccess} style={{ color: 'var(--color-accent)' }}>
                    Painel Admin
                  </button>
                )}
                <button className="logout-btn" onClick={signOut}>Sair</button>
              </div>
            )}
          </div>
          <button className={`hamburger ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobile}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <button className="mobile-close" onClick={closeMobile}>&times;</button>
            <div className="mobile-links">
              <Link to="/" onClick={closeMobile}>Home</Link>
              <Link to="/loja" onClick={closeMobile}>Catálogo</Link>
              <Link to="/sobre-nos" onClick={closeMobile}>Sobre Nós</Link>
              <Link to="/blog" onClick={closeMobile}>Blog</Link>
              <Link to="/contato" onClick={closeMobile}>Contato</Link>
              <Link to="/cart" onClick={closeMobile} className="mobile-cart-link">
                Carrinho {itemCount > 0 && <span className="mobile-cart-count">{itemCount}</span>}
              </Link>
              {isLoggedIn && <Link to="/account" onClick={closeMobile}>Minha Conta</Link>}
              {isAdmin && <Link to="/admin" onClick={closeMobile}>Painel Admin</Link>}
              {!isLoggedIn ? (
                <>
                  <Link to="/cadastro" onClick={closeMobile} className="mobile-cadastro-link">Cadastre-se</Link>
                  <button className="btn-secondary mobile-auth-btn" onClick={() => { closeMobile(); setShowModal(true); }}>
                    Área do Parceiro
                  </button>
                </>
              ) : (
                <button className="btn-secondary mobile-auth-btn logout" onClick={() => { closeMobile(); signOut(); }}>
                  Sair
                </button>
              )}
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
