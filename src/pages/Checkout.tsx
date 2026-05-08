import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number | string;
  regions: string[];
  estimated_days: string;
  active: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  discount_text: string | null;
  active: boolean;
}

export function Checkout() {
  const { profile, isLoggedIn, isB2BApproved } = useAuth();
  const { items, total, itemCount, clearCart } = useCart();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  useEffect(() => {
    api<ShippingMethod[]>('/shipping-methods').then(data => {
      setShippingMethods(data);
      if (data.length > 0) setSelectedShippingId(data[0].id);
    }).catch(() => {});
    api<PaymentMethod[]>('/payment-methods').then(data => {
      setPaymentMethods(data);
      if (data.length > 0) setSelectedPaymentId(data[0].id);
    }).catch(() => {});
  }, []);

  if (!isLoggedIn || !isB2BApproved) {
    return <Navigate to="/cart" replace />;
  }

  if (items.length === 0 && !done) {
    return <Navigate to="/cart" replace />;
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    if (!selectedShippingId) {
      setError('Selecione uma forma de entrega.');
      setSubmitting(false);
      return;
    }
    if (!selectedPaymentId) {
      setError('Selecione uma forma de pagamento.');
      setSubmitting(false);
      return;
    }

    const orderItems = items.map(item => ({
      product_id: item.product.id,
      product_name: `${item.product.name}${item.variation ? ` (${item.variation.name})` : ''}`,
      product_sku: item.variation?.sku || item.product.sku,
      quantity: item.quantity,
      unit_price: Number(item.product.price) + Number(item.variation?.price_modifier ?? 0),
    }));

    const shippingNote = shippingMethods.find(s => s.id === selectedShippingId);
    const paymentNote = paymentMethods.find(p => p.id === selectedPaymentId);
    const combinedNotes = [
      notes,
      shippingNote ? `Frete: ${shippingNote.name}` : '',
      paymentNote ? `Pagamento: ${paymentNote.name}` : '',
    ].filter(Boolean).join(' | ');

    try {
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({ items: orderItems, notes: combinedNotes }),
      });
      clearCart();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedShipping = shippingMethods.find(s => s.id === selectedShippingId);
  const selectedPayment = paymentMethods.find(p => p.id === selectedPaymentId);

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
                  {paymentMethods.length === 0 ? (
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Nenhuma forma de pagamento disponível.</p>
                  ) : (
                    paymentMethods.map(pm => (
                      <div
                        key={pm.id}
                        className={`payment-method-item ${selectedPaymentId === pm.id ? 'selected' : ''}`}
                        onClick={() => setSelectedPaymentId(pm.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className={`checkout-radio ${selectedPaymentId === pm.id ? 'checked' : ''}`} />
                          <div>
                            <strong>{pm.name}</strong>
                            {pm.discount_text && <span className="payment-discount">{pm.discount_text}</span>}
                          </div>
                        </div>
                        <span className="payment-desc">{pm.description}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="checkout-section">
                <h3>Formas de Entrega</h3>
                <div className="shipping-methods-list">
                  {shippingMethods.length === 0 ? (
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Nenhuma opção de frete disponível.</p>
                  ) : (
                    shippingMethods.map(sm => (
                      <div
                        key={sm.id}
                        className={`shipping-method-item ${selectedShippingId === sm.id ? 'selected' : ''}`}
                        onClick={() => setSelectedShippingId(sm.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                          <span className={`checkout-radio ${selectedShippingId === sm.id ? 'checked' : ''}`} />
                          <strong>{sm.name}</strong>
                        </div>
                        <span className="shipping-price">
                          {Number(sm.price) === 0 ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(sm.price))}
                        </span>
                        <span className="shipping-desc">{sm.estimated_days || sm.description}</span>
                      </div>
                    ))
                  )}
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
                    const unitPrice = Number(item.product.price) + Number(item.variation?.price_modifier ?? 0);
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

                {selectedShipping && (
                  <div className="summary-row" style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                    <span>Frete</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                      {selectedShipping.name}
                      {Number(selectedShipping.price) > 0 && (
                        <> — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedShipping.price))}</>
                      )}
                    </span>
                  </div>
                )}
                {selectedPayment && (
                  <div className="summary-row" style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                    <span>Pagamento</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPayment.name}</span>
                  </div>
                )}

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
