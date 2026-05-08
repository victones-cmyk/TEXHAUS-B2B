import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const errorMsg = await signIn(email, password);
    if (errorMsg) {
      setError(errorMsg);
      setIsSubmitting(false);
      return;
    }

    navigate('/account');
  };

  return (
    <>
      <SEO title="Login - TEXHAUS B2B" description="Acesse sua conta de parceiro TEXHAUS" />
      <div className="app-wrapper">
        <Navbar />
        <div className="auth-page">
          <div className="section-container">
            <div className="auth-card">
              <h1>Acesso Parceiro B2B</h1>
              <p className="auth-subtitle">
                Faça login para ver preços exclusivos e fazer pedidos.
                <br />
                <strong>Apenas parceiros aprovados podem comprar.</strong>
              </p>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">E-mail Corporativo*</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="contato@empresa.com.br"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Senha*</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Sua senha"
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Entrando...' : 'Entrar como Parceiro'}
                </button>
              </form>

              <p className="auth-switch">
                Ainda não tem conta? <Link to="/cadastro">Solicitar Cadastro</Link>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
