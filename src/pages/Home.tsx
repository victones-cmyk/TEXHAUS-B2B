import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Loading } from '../components/Loading';
import type { Product } from '../types';

export function Home() {
  const { isLoggedIn, isB2BApproved } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Product[]>('/products/published')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const canSeePrice = isLoggedIn && isB2BApproved;

  return (
    <div className="app-wrapper">
      <SEO title="Home" description="Distribuidora de tecidos e acessórios para cortinas e persianas. Cadastre-se como parceiro B2B." />
      <Navbar />

      <header className="hero-section" id="home">
        <div className="section-container">
          <div className="hero-content">
            <h1>Elegância em <strong>Tecidos</strong></h1>
            <p className="hero-subtitle">
              A mais refinada curadoria de tecidos, persianas e acessórios para profissionais exigentes.
              Cadastre-se como parceiro e tenha acesso a condições comerciais exclusivas.
            </p>
            <div className="hero-actions">
              <a href="#produtos" className="btn-secondary" style={{ borderColor: 'white', color: 'white' }}>Explorar Coleção</a>
            </div>
          </div>
        </div>
      </header>

      <main className="section-container products-section" id="produtos">
        <div className="section-header">
          <h2>Coleção Exclusiva</h2>
          <p>Descubra nossa linha de produtos desenvolvida para o mercado de alto padrão.</p>
        </div>

        {loading ? (
          <Loading type="skeleton" lines={4} />
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-light)' }}>
            Nenhum produto disponível no momento.
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/produto/${product.id}`} className="product-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : null}
                  {!isLoggedIn && (
                    <div className="b2b-overlay">
                      <span>Área Restrita</span>
                      <button className="btn-primary" onClick={e => { e.preventDefault(); }}>Acesso B2B</button>
                    </div>
                  )}
                </Link>
                <div className="product-info">
                  <span className="category">{product.category}</span>
                  <h3>{product.name}</h3>
                  {canSeePrice ? (
                    <div className="price-info">
                      <span className="price">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </span>
                      <button className="btn-primary" style={{ width: '100%' }} onClick={() => addToCart(product)}>
                        Comprar
                      </button>
                    </div>
                  ) : (
                    <p className="login-prompt">
                      Faça login para ver preços
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <section className="features-section" id="sobre">
        <div className="section-container feature-grid">
          <div className="feature-item">
            <div className="icon">◈</div>
            <h4>Qualidade Impecável</h4>
            <p>Rigoroso controle de qualidade em cada metro de tecido.</p>
          </div>
          <div className="feature-item">
            <div className="icon">◈</div>
            <h4>Design Contemporâneo</h4>
            <p>Acompanhamos as principais tendências mundiais de decoração.</p>
          </div>
          <div className="feature-item">
            <div className="icon">◈</div>
            <h4>Atendimento Exclusivo</h4>
            <p>Consultores especializados para atender a sua empresa.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
