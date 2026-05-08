import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function RegisterSuccess() {
  return (
    <>
      <SEO title="Cadastro Enviado - TEXHAUS" description="Solicitação de cadastro enviada com sucesso" />
      <div className="app-wrapper">
        <Navbar />
        <div className="auth-page">
          <div className="section-container">
            <div className="auth-card success-card">
              <div className="success-icon">✓</div>
              <h1>Solicitação Enviada!</h1>
              <p className="success-text">
                Seu cadastro foi recebido e está em análise pela nossa equipe.
              </p>
              <p className="success-detail">
                Você receberá um e-mail quando seu cadastro for aprovado.
                <br />
                Enquanto isso, você <strong>não consegue ver preços ou fazer pedidos</strong> até a aprovação.
              </p>
              <div className="success-actions">
                <Link to="/login" className="btn-primary">Fazer Login</Link>
                <Link to="/" className="btn-secondary">Voltar para Home</Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
