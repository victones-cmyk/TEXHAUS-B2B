import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function Navbar() {
  const { isLoggedIn, isAdmin, signIn, signUp, signOut } = useAuth();
  const { itemCount } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobile = () => setMobileOpen(false);

  const handleAdminAccess = () => {
    setShowModal(false);
    navigate('/admin');
  };

  const handleOpenModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    setShowModal(true);
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

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não conferem.');
      setIsSubmitting(false);
      return;
    }

    const error = await signUp({
      email: formData.get('email') as string,
      password,
      fullName: formData.get('fullName') as string,
      companyName: formData.get('companyName') as string,
      cnpj: formData.get('cnpj') as string,
      phone: formData.get('phone') as string,
      customerType: formData.get('customerType') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
    });

    if (error) {
      setErrorMessage(error);
    } else {
      setSuccessMessage('Solicitação enviada com sucesso! Nossa equipe analisará seu cadastro em breve.');
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
              <button className="btn-secondary" onClick={() => handleOpenModal('login')}>Área do Parceiro</button>
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
                <button className="btn-secondary mobile-auth-btn" onClick={() => { closeMobile(); handleOpenModal('login'); }}>
                  Área do Parceiro
                </button>
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
          <div className={`modal-content ${authMode === 'register' ? 'modal-lg' : ''}`} onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setShowModal(false)}>×</span>

            {errorMessage && (
              <div style={{ color: '#721c24', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>
                {errorMessage}
              </div>
            )}

            {authMode === 'login' ? (
              <>
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
                      Ainda não tem conta? <span onClick={() => setAuthMode('register')}>Solicitar Cadastro</span>
                    </p>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2>Cadastro B2B</h2>

                {successMessage ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ fontSize: '3rem', color: '#c8a86e', marginBottom: '1rem' }}>✓</div>
                    <p style={{ fontSize: '1.1rem', color: '#1a1a1a', fontWeight: '500' }}>{successMessage}</p>
                    <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => setShowModal(false)}>Fechar</button>
                  </div>
                ) : (
                  <>
                    <p>Preencha os dados abaixo para solicitar acesso aos preços exclusivos.</p>
                    <form className="register-form" onSubmit={handleRegisterSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nome Completo*</label>
                          <input type="text" name="fullName" required placeholder="Seu nome" />
                        </div>
                        <div className="form-group">
                          <label>Empresa*</label>
                          <input type="text" name="companyName" required placeholder="Razão Social ou Fantasia" />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>CNPJ*</label>
                          <input type="text" name="cnpj" required placeholder="00.000.000/0000-00" />
                        </div>
                        <div className="form-group">
                          <label>E-mail*</label>
                          <input type="email" name="email" required placeholder="contato@empresa.com.br" />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Senha*</label>
                          <input type="password" name="password" required placeholder="Crie uma senha" minLength={6} />
                        </div>
                        <div className="form-group">
                          <label>Confirmar Senha*</label>
                          <input type="password" name="confirmPassword" required placeholder="Repita a senha" minLength={6} />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Telefone/WhatsApp*</label>
                          <input type="text" name="phone" required placeholder="(00) 00000-0000" />
                        </div>
                        <div className="form-group">
                          <label>Tipo de Cliente*</label>
                          <select name="customerType" required className="auth-select">
                            <option value="">Selecione...</option>
                            <option value="lojista">Lojista</option>
                            <option value="arquiteto">Arquiteto(a)</option>
                            <option value="decorador">Decorador(a)</option>
                            <option value="instalador">Instalador(a)</option>
                            <option value="distribuidor">Distribuidor</option>
                            <option value="outro">Outro</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Cidade*</label>
                          <input type="text" name="city" required placeholder="Sua cidade" />
                        </div>
                        <div className="form-group">
                          <label>Estado*</label>
                          <select name="state" required className="auth-select">
                            <option value="">UF</option>
                            <option value="SP">São Paulo</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="PR">Paraná</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="OUTRO">Outros</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-checkbox">
                        <input type="checkbox" id="termos" required />
                        <label htmlFor="termos">Declaro que li e aceito os Termos e Condições de cadastro B2B.</label>
                      </div>

                      <div className="modal-actions" style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                          {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                        </button>
                        <p className="auth-switch">
                          Já tem cadastro? <span onClick={() => setAuthMode('login')}>Fazer Login</span>
                        </p>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
