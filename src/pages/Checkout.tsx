import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function Checkout() {
  const { profile, isLoggedIn, isB2BApproved } = useAuth();
  const { items, total, itemCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!isLoggedIn || !isB2BApproved) {
    navigate('/cart', { replace: true });
    return null;
  }

  if (items.length === 0 && !done) {
    navigate('/cart', { replace: true });
    return null;
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    const orderItems = items.map(item => ({
      product_id: item.product.id,
      product_name: `${item.product.name}${item.variation ? ` (${item.variation.name})` : ''}`,
      product_sku: item.variation?.sku || item.product.sku,
      quantity: item.quantity,
      unit_price: item.product.price + (item.variation?.price_modifier ?? 0),
    }));

    try {
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({ items: orderItems, notes }),
      });
      clearCart();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="app-wrapper">
        <Navbar />
        <main className="checkout-page">
          <div className="section-container" style={{ textAlign: 'center', padding: '6rem 0' }}>
            <div style={{ fontSize: '4rem', color: '#28a745', marginBottom: '1.5rem' }}>✓</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Pedido Confirmado!</h2>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
              Seu pedido foi registrado e está aguardando confirmação.
              Você receberá uma notificação em breve.
            </p>
            <Link to="/" className="btn-primary">Voltar para Loja</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <SEO title="Finalizar Pedido" description="Confirme seu pedido B2B com endereço de entrega e observações." />
      <Navbar />
      <main className="checkout-page">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/cart">Carrinho</Link>
            <span>/</span>
            <span>Finalizar Pedido</span>
          </div>

          <h1 className="checkout-title">Finalizar Pedido</h1>

          <div className="checkout-layout">
            <div className="checkout-main">
              <div className="checkout-section">
                <h3>Endereço de Entrega</h3>
                <div className="checkout-address-card">
                  <div className="address-line"><strong>{profile?.company_name || 'Empresa'}</strong></div>
                  <div className="address-line">{profile?.full_name}</div>
                  <div className="address-line">
                    {profile?.city || '—'}
                    {profile?.city && profile?.state ? ', ' : ''}
                    {profile?.state || ''}
                  </div>
                  <div className="address-line">{profile?.phone || ''}</div>
                  <small style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', display: 'block' }}>
                    Endereço vinculado ao cadastro da empresa.
                  </small>
                </div>
              </div>

              <div className="checkout-section">
                <h3>Formas de Pagamento</h3>
                <div className="payment-methods-list">
                  <div className="payment-method-item">
                    <div>
                      <strong>Pix</strong>
                      <span className="payment-discount">5% de desconto</span>
                    </div>
                    <span className="payment-desc">Pagamento instantâneo</span>
                  </div>
                  <div className="payment-method-item">
                    <div>
                      <strong>Cartão de Crédito</strong>
                      <span className="payment-discount">Parcele em até 12x</span>
                    </div>
                    <span className="payment-desc">Com ou sem juros</span>
                  </div>
                  <div className="payment-method-item">
                    <div>
                      <strong>Boleto Bancário</strong>
                    </div>
                    <span className="payment-desc">Vencimento em 3 dias úteis</span>
                  </div>
                </div>
              </div>

              <div className="checkout-section">
                <h3>Formas de Entrega</h3>
                <div className="shipping-methods-list">
                  <div className="shipping-method-item">
                    <strong>Retirada na Empresa</strong>
                    <span className="shipping-price">Grátis</span>
                    <span className="shipping-desc">São Paulo, SP</span>
                  </div>
                  <div className="shipping-method-item">
                    <strong>Frete Fixo - Capital SP</strong>
                    <span className="shipping-price">R$ 19,90</span>
                    <span className="shipping-desc">1 a 3 dias úteis</span>
                  </div>
                  <div className="shipping-method-item">
                    <strong>Frete Fixo - Grande SP</strong>
                    <span className="shipping-price">R$ 29,90</span>
                    <span className="shipping-desc">2 a 5 dias úteis</span>
                  </div>
                  <div className="shipping-method-item">
                    <strong>Frete Fixo - Sudeste</strong>
                    <span className="shipping-price">R$ 39,90</span>
                    <span className="shipping-desc">3 a 7 dias úteis</span>
                  </div>
                  <div className="shipping-method-item">
                    <strong>Frete Fixo - Demais Regiões</strong>
                    <span className="shipping-price">R$ 59,90</span>
                    <span className="shipping-desc">5 a 15 dias úteis</span>
                  </div>
                </div>
              </div>

              <div className="checkout-section">
                <h3>Observações</h3>
                <textarea
                  className="checkout-notes"
                  placeholder="Alguma observação sobre o pedido? (opcional)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="checkout-sidebar">
              <div className="checkout-summary-card">
                <h3>Resumo do Pedido</h3>
                <div className="checkout-items">
                  {items.map(item => {
                    const unitPrice = item.product.price + (item.variation?.price_modifier ?? 0);
                    return (
                      <div key={`${item.product.id}-${item.variation?.id ?? 'base'}`} className="checkout-item">
                        <span className="checkout-item-name">
                          {item.product.name}
                          {item.variation && <small style={{ display: 'block', color: 'var(--color-accent)', fontSize: '0.8rem' }}>{item.variation.name}</small>}
                        </span>
                        <span className="checkout-item-qty">x{item.quantity}</span>
                        <span className="checkout-item-price">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unitPrice * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="checkout-total">
                  <span>Total ({itemCount} itens)</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(total)}
                  </span>
                </div>

                {error && (
                  <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '4px' }}>
                    {error}
                  </div>
                )}

                <button
                  className="btn-primary checkout-submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Confirmando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
