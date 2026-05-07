import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

function itemKey(item: { product: { id: string }; variation?: { id: string } }) {
  return `${item.product.id}-${item.variation?.id ?? 'base'}`;
}

function itemPrice(item: { product: { price: number }; variation?: { price_modifier: number } }): number {
  return item.product.price + (item.variation?.price_modifier ?? 0);
}

export function Cart() {
  const { items, removeFromCart, updateQuantity, total, itemCount, clearCart } = useCart();
  const { isLoggedIn, isB2BApproved } = useAuth();

  const canCheckout = isLoggedIn && isB2BApproved;

  return (
    <div className="app-wrapper">
      <SEO title="Carrinho" description="Revise seus itens e finalize seu pedido B2B." />
      <Navbar />
      <main className="cart-page">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Carrinho</span>
          </div>

          <h1 className="cart-title">Carrinho de Compras</h1>

          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Seu carrinho está vazio.</p>
              <Link to="/" className="btn-primary">Explorar Produtos</Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {items.map(item => {
                  const key = itemKey(item);
                  const price = itemPrice(item);
                  return (
                    <div key={key} className="cart-item">
                      <div className="cart-item-image">
                        {(item.variation?.image_url || item.product.image_url) ? (
                          <img src={item.variation?.image_url || item.product.image_url} alt={item.product.name} loading="lazy" />
                        ) : (
                          <div className="cart-item-placeholder" />
                        )}
                      </div>
                      <div className="cart-item-info">
                        <Link to={`/produto/${item.product.id}`} className="cart-item-name">
                          {item.product.name}
                        </Link>
                        {item.variation && (
                          <span className="cart-item-variation">{item.variation.name}</span>
                        )}
                        <span className="cart-item-category">{item.product.category}</span>
                        <div className="cart-item-price">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                        </div>
                      </div>
                      <div className="cart-item-quantity">
                        <button onClick={() => updateQuantity(key, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(key, item.quantity + 1)}>+</button>
                      </div>
                      <div className="cart-item-subtotal">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price * item.quantity)}
                      </div>
                      <button className="cart-item-remove" onClick={() => removeFromCart(key)}>×</button>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                <h3>Resumo do Pedido</h3>
                <div className="summary-row">
                  <span>Itens ({itemCount})</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                </div>

                {canCheckout ? (
                  <Link to="/checkout" className="btn-primary checkout-btn" style={{ textAlign: 'center' }}>Finalizar Pedido</Link>
                ) : (
                  <div className="checkout-b2b-block">
                    <p>{!isLoggedIn ? 'Faça login para finalizar a compra.' : 'Seu cadastro B2B precisa ser aprovado.'}</p>
                  </div>
                )}

                <button className="btn-secondary clear-cart-btn" onClick={clearCart}>Limpar Carrinho</button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
