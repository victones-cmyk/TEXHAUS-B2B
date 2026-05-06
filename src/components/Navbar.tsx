import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const { isLoggedIn, login, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    setShowModal(false);
    navigate('/admin');
  };

  const handleOpenModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setSuccessMessage('');
    setShowModal(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    const formData = new FormData(e.currentTarget);
    const registrationData = {
      full_name: formData.get('fullName'),
      company_name: formData.get('companyName'),
      cnpj: formData.get('cnpj'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      customer_type: formData.get('customerType'),
      city: formData.get('city'),
      state: formData.get('state')
    };

    try {
      const { error } = await supabase
        .from('b2b_registrations')
        .insert([registrationData]);

      if (error) {
        console.error('Error inserting data:', error);
        alert('Ocorreu um erro ao enviar o cadastro: ' + error.message);
      } else {
        setSuccessMessage('Solicitação enviada com sucesso! Nossa equipe analisará seu cadastro em breve.');
        // Opcional: resetar o formulário aqui
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Erro inesperado de conexão.');
    } finally {
      setIsSubmitting(false);
    }
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
            <a href="/#produtos">Catálogo</a>
            <a href="/#sobre">Sobre Nós</a>
            {!isLoggedIn ? (
              <button className="btn-secondary" onClick={() => handleOpenModal('login')}>Área do Parceiro</button>
            ) : (
              <div className="user-profile">
                <span>Bem-vindo, Distribuidor</span>
                <button className="logout-btn" onClick={logout}>Sair</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className={`modal-content ${authMode === 'register' ? 'modal-lg' : ''}`} onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setShowModal(false)}>×</span>
            
            {authMode === 'login' ? (
              <>
                <h2>Acesso Restrito</h2>
                <p>Faça login na sua conta de parceiro B2B.</p>
                <div className="form-group">
                  <input type="email" placeholder="E-mail corporativo ou CNPJ" />
                  <input type="password" placeholder="Senha" />
                </div>
                <div className="modal-actions">
                  <button className="btn-primary" onClick={() => { login(); setShowModal(false); }}>Entrar como Parceiro</button>
                  <p className="auth-switch">
                    Ainda não tem conta? <span onClick={() => setAuthMode('register')}>Solicitar Cadastro</span>
                  </p>
                  
                  <div className="demo-admin-access">
                    <hr style={{ margin: '20px 0', borderColor: 'var(--color-border)', opacity: 0.3 }} />
                    <button className="btn-secondary" style={{ width: '100%', borderColor: '#1a1a1a', color: '#1a1a1a', padding: '10px' }} onClick={handleAdminLogin}>
                      Painel Admin (Demo)
                    </button>
                  </div>
                </div>
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
