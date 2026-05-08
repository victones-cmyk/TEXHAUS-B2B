import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Loading } from '../components/Loading';

const statusConfig: Record<string, { label: string; className: string; description: string }> = {
  admin: { label: 'Administrador', className: 'approved', description: 'Você tem acesso total ao sistema.' },
  b2b_pending: { label: 'Aguardando Aprovação', className: 'pending', description: 'Seu cadastro está em análise pela nossa equipe. Você receberá um e-mail assim que for aprovado.' },
  b2b_approved: { label: 'Aprovado', className: 'approved', description: 'Seu cadastro foi aprovado! Você já tem acesso aos preços e pode realizar pedidos.' },
  b2b_rejected: { label: 'Rejeitado', className: 'rejected', description: 'Seu cadastro não foi aprovado. Entre em contato conosco para mais informações.' },
};

interface OrderItem {
  id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
}

const orderStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const orderStatusClass: Record<string, string> = {
  pending: 'pending',
  confirmed: 'approved',
  shipped: 'approved',
  delivered: 'approved',
  cancelled: 'rejected',
};

type TabKey = 'dashboard' | 'orders' | 'data' | 'password';

export function Account() {
  const { user, profile, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      loadOrders();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await api<Order[]>('/orders/my');
      setOrders(data);
    } catch {
      toast('Erro ao carregar pedidos', 'error');
    }
    setLoadingOrders(false);
  };

  const toggleOrderExpand = async (orderId: string) => {
    if (expandedOrderId === orderId) { setExpandedOrderId(null); return; }
    setExpandedOrderId(orderId);
    if (!orderItems[orderId]) {
      try {
        const order = await api<Order>(`/orders/${orderId}`);
        if (order.items) setOrderItems(prev => ({ ...prev, [orderId]: order.items as OrderItem[] }));
      } catch { /* silent */ }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) { toast('Preencha todos os campos', 'error'); return; }
    setChangingPassword(true);
    try {
      await api('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast('Senha alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao alterar senha', 'error');
    }
    setChangingPassword(false);
  };

  if (!isLoggedIn) return <Navigate to="/" replace />;

  if (!profile) {
    return (
      <div className="app-wrapper">
        <Navbar />
        <main className="account-page" style={{ paddingTop: '100px' }}><Loading /></main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[profile.role] ?? statusConfig.b2b_pending;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'dashboard', label: 'Painel' },
    { key: 'orders', label: 'Pedidos' },
    { key: 'data', label: 'Dados do Cadastro' },
    { key: 'password', label: 'Alterar Senha' },
  ];

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
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    className={activeTab === tab.key ? 'active' : ''}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </aside>

            <div className="account-content">
              {activeTab === 'dashboard' && (
                <>
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
                      <div className="data-item"><span className="data-label">Empresa</span><span className="data-value">{profile.company_name || '—'}</span></div>
                      <div className="data-item"><span className="data-label">CNPJ</span><span className="data-value">{profile.cnpj || '—'}</span></div>
                      <div className="data-item"><span className="data-label">E-mail</span><span className="data-value">{profile.email || user?.email || '—'}</span></div>
                      <div className="data-item"><span className="data-label">Telefone</span><span className="data-value">{profile.phone || '—'}</span></div>
                      <div className="data-item"><span className="data-label">Tipo de Cliente</span><span className="data-value">{profile.customer_type || '—'}</span></div>
                      <div className="data-item"><span className="data-label">Localização</span><span className="data-value">{profile.city || '—'}{profile.city && profile.state ? ', ' : ''}{profile.state || ''}</span></div>
                    </div>
                  </div>

                  {(profile.role === 'b2b_approved' || profile.role === 'admin') && (
                    <div className="account-card">
                      <h3>Acesso ao Catálogo</h3>
                      <p style={{ color: 'var(--color-text-light)' }}>Você tem acesso completo aos preços e pode realizar pedidos.</p>
                      <Link to="/loja" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Ver Catálogo</Link>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'orders' && (
                <>
                  <div className="account-welcome"><h2>Meus Pedidos</h2></div>
                  {loadingOrders ? (
                    <Loading />
                  ) : orders.length === 0 ? (
                    <div className="account-card" style={{ textAlign: 'center', padding: '3rem' }}>
                      <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>Nenhum pedido encontrado.</p>
                      <Link to="/loja" className="btn-primary">Ver Catálogo</Link>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th style={{ width: '30px' }}></th>
                            <th>Pedido</th>
                            <th>Data</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => {
                            const isExpanded = expandedOrderId === order.id;
                            return (
                              <>
                                <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => toggleOrderExpand(order.id)}>
                                  <td>
                                    <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : '' }}>▶</span>
                                  </td>
                                  <td><strong>#{order.id.slice(0, 8)}</strong></td>
                                  <td>{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                                  <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total))}</td>
                                  <td>
                                    <span className={`status-badge ${orderStatusClass[order.status] || 'pending'}`}>
                                      {orderStatusLabel[order.status] || order.status}
                                    </span>
                                  </td>
                                </tr>
                                {isExpanded && orderItems[order.id] && (
                                  <tr key={`${order.id}-items`}>
                                    <td colSpan={5} style={{ padding: 0 }}>
                                      <table className="admin-table" style={{ minWidth: 'auto', margin: 0 }}>
                                        <thead>
                                          <tr>
                                            <th>Produto</th>
                                            <th>SKU</th>
                                            <th>Qtd</th>
                                            <th>Preço Un.</th>
                                            <th>Subtotal</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {orderItems[order.id].map(item => (
                                            <tr key={item.id}>
                                              <td>{item.product_name}</td>
                                              <td>{item.product_sku || '—'}</td>
                                              <td>{item.quantity}</td>
                                              <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.unit_price))}</td>
                                              <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.unit_price) * item.quantity)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'data' && (
                <>
                  <div className="account-welcome"><h2>Dados do Cadastro</h2></div>
                  <div className="account-card">
                    <h3>Informações da Empresa</h3>
                    <div className="account-data-grid">
                      <div className="data-item"><span className="data-label">Nome Completo</span><span className="data-value">{profile.full_name || '—'}</span></div>
                      <div className="data-item"><span className="data-label">E-mail</span><span className="data-value">{profile.email || '—'}</span></div>
                      <div className="data-item"><span className="data-label">Empresa</span><span className="data-value">{profile.company_name || '—'}</span></div>
                      <div className="data-item"><span className="data-label">CNPJ</span><span className="data-value">{profile.cnpj || '—'}</span></div>
                      <div className="data-item"><span className="data-label">Telefone</span><span className="data-value">{profile.phone || '—'}</span></div>
                      <div className="data-item"><span className="data-label">Tipo de Cliente</span><span className="data-value">{profile.customer_type || '—'}</span></div>
                      <div className="data-item"><span className="data-label">Cidade</span><span className="data-value">{profile.city || '—'}</span></div>
                      <div className="data-item"><span className="data-label">Estado</span><span className="data-value">{profile.state || '—'}</span></div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'password' && (
                <>
                  <div className="account-welcome"><h2>Alterar Senha</h2></div>
                  <div className="account-card">
                    <form onSubmit={handleChangePassword} style={{ maxWidth: '420px' }}>
                      <div className="form-group-compact" style={{ marginBottom: '1rem' }}>
                        <label>Senha Atual</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Digite sua senha atual" />
                      </div>
                      <div className="form-group-compact" style={{ marginBottom: '1.5rem' }}>
                        <label>Nova Senha</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
                      </div>
                      <button type="submit" className="btn-primary" disabled={changingPassword} style={{ width: '100%' }}>
                        {changingPassword ? 'Alterando...' : 'Alterar Senha'}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
