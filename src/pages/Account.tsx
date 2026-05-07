import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Loading } from '../components/Loading';

const statusConfig: Record<string, { label: string; className: string; description: string }> = {
  admin: {
    label: 'Administrador',
    className: 'approved',
    description: 'Você tem acesso total ao sistema.',
  },
  b2b_pending: {
    label: 'Aguardando Aprovação',
    className: 'pending',
    description: 'Seu cadastro está em análise pela nossa equipe. Você receberá um e-mail assim que for aprovado.',
  },
  b2b_approved: {
    label: 'Aprovado',
    className: 'approved',
    description: 'Seu cadastro foi aprovado! Você já tem acesso aos preços e pode realizar pedidos.',
  },
  b2b_rejected: {
    label: 'Rejeitado',
    className: 'rejected',
    description: 'Seu cadastro não foi aprovado. Entre em contato conosco para mais informações.',
  },
};

export function Account() {
  const { user, profile, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/', { replace: true });
    return null;
  }

  if (!profile) {
    return (
      <div className="app-wrapper">
        <Navbar />
        <main className="account-page" style={{ paddingTop: '100px' }}>
          <Loading />
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[profile.role] ?? statusConfig.b2b_pending;

  return (
    <div className="app-wrapper">
      <SEO title="Minha Conta" description="Gerencie seus dados e acompanhe o status do seu cadastro B2B." />
      <Navbar />
      <main className="account-page">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Minha Conta</span>
          </div>

          <h1 className="account-title">Minha Conta</h1>

          <div className="account-layout">
            <aside className="account-sidebar">
              <nav className="account-nav">
                <Link to="/account" className="active">Painel</Link>
                <a href="#">Pedidos</a>
                <a href="#">Endereços</a>
                <a href="#">Dados do Cadastro</a>
                <a href="#">Alterar Senha</a>
              </nav>
            </aside>

            <div className="account-content">
              <div className="account-welcome">
                <h2>Bem-vindo, {profile.full_name || 'Parceiro'}!</h2>
                <div className={`status-badge ${status.className}`} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                  {status.label}
                </div>
              </div>

              <p className="account-status-info">{status.description}</p>

              <div className="account-card">
                <h3>Dados da Empresa</h3>
                <div className="account-data-grid">
                  <div className="data-item">
                    <span className="data-label">Empresa</span>
                    <span className="data-value">{profile.company_name || '—'}</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">CNPJ</span>
                    <span className="data-value">{profile.cnpj || '—'}</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">E-mail</span>
                    <span className="data-value">{profile.email || user?.email || '—'}</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Telefone</span>
                    <span className="data-value">{profile.phone || '—'}</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Tipo de Cliente</span>
                    <span className="data-value">{profile.customer_type || '—'}</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Localização</span>
                    <span className="data-value">
                      {profile.city || '—'}{profile.city && profile.state ? ', ' : ''}{profile.state || ''}
                    </span>
                  </div>
                </div>
              </div>

              {profile.role === 'b2b_approved' && (
                <div className="account-card">
                  <h3>Último Pedido</h3>
                  <p style={{ color: 'var(--color-text-light)' }}>
                    Nenhum pedido encontrado. Comece a comprar em nosso catálogo.
                  </p>
                  <Link to="/#produtos" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Ver Catálogo
                  </Link>
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
