import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  price?: number;
  isB2BOnly: boolean;
  sku: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Linho Puro Rústico", category: "Tecidos para Cortinas", image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=800&auto=format&fit=crop", price: 129.90, isB2BOnly: true, sku: "TEX-LPR01" },
  { id: 2, name: "Veludo Mônaco", category: "Tecidos para Estofados", image: "https://images.unsplash.com/photo-1590404473840-0f2b2512fb9c?q=80&w=800&auto=format&fit=crop", price: 89.50, isB2BOnly: true, sku: "TEX-VM04" },
  { id: 3, name: "Persiana Romana Natural", category: "Persianas", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop", price: 345.00, isB2BOnly: true, sku: "PER-RN02" },
  { id: 4, name: "Trilho Motorizado Elite", category: "Acessórios", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop", price: 890.00, isB2BOnly: true, sku: "AC-TME01" }
];

export function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="app-wrapper">
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

        <div className="product-grid">
          {MOCK_PRODUCTS.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                {product.isB2BOnly && !isLoggedIn && (
                  <div className="b2b-overlay">
                    <span>Área Restrita</span>
                    <button className="btn-primary">Acesso B2B</button>
                  </div>
                )}
              </div>
              <div className="product-info">
                <span className="category">{product.category}</span>
                <h3>{product.name}</h3>
                {isLoggedIn ? (
                  <div className="price-info">
                    <span className="price">R$ {product.price?.toFixed(2).replace('.', ',')} / m</span>
                    <button className="btn-primary" style={{ width: '100%' }}>Comprar</button>
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
