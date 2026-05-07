import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Loading } from '../components/Loading';
import type { Product, ProductVariation } from '../types';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, isB2BApproved } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);

  const allImages = product ? [product.image_url, ...(product.images || [])].filter(Boolean) : [];

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('products').select('*').eq('id', id).eq('status', 'published').maybeSingle(),
      supabase.from('product_variations').select('*').eq('product_id', id).order('sort_order'),
    ]).then(([productRes, variationsRes]) => {
      if (!productRes.error && productRes.data) {
        setProduct(productRes.data);
        setVariations(variationsRes.data || []);
      }
      setLoading(false);
    });
  }, [id]);

  const canBuy = isLoggedIn && isB2BApproved;
  const selectedStock = selectedVariation ? selectedVariation.stock_quantity : product?.stock_quantity ?? 0;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariation ?? undefined);
    toast(`${product.name}${selectedVariation ? ` (${selectedVariation.name})` : ''} adicionado ao carrinho`, 'success');
  };

  if (loading) {
    return (
      <div className="app-wrapper">
        <Navbar />
        <main className="product-detail-page" style={{ marginTop: '100px' }}>
          <Loading type="page" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="app-wrapper">
        <Navbar />
        <main className="product-detail-page" style={{ marginTop: '120px', textAlign: 'center', padding: '4rem 0' }}>
          <h2>Produto não encontrado</h2>
          <Link to="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Voltar</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <SEO title={product.name} description={product.description || `Produto ${product.name} da Texhaus. Consulte preços B2B.`} image={product.image_url} />
      <Navbar />
      <main className="product-detail-page">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/loja">Loja</Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>

          <div className="product-detail-grid">
            <div className="product-gallery">
              <div className="gallery-main">
                <img src={allImages[mainImage] || product.image_url} alt={product.name} loading="lazy" />
              </div>
              {allImages.length > 1 && (
                <div className="product-gallery-thumbs">
                  {allImages.map((url, i) => (
                    <button key={i} className={`gallery-thumb-btn ${i === mainImage ? 'active' : ''}`} onClick={() => setMainImage(i)}>
                      <img src={url} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="product-info-section">
              <span className="product-category-tag">{product.category}</span>
              <h1 className="product-title">{product.name}</h1>
              {product.sku && <p className="product-sku">SKU: {product.sku}</p>}

              {product.description && (
                <div className="product-description">
                  {product.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}

              {variations.length > 0 && (
                <div className="variations-selector">
                  <h4>Opções</h4>
                  <div className="variation-options">
                    {variations.map(v => (
                      <button
                        key={v.id}
                        className={`variation-btn ${selectedVariation?.id === v.id ? 'active' : ''}`}
                        onClick={() => { setSelectedVariation(v); setQuantity(1); }}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {canBuy ? (
                <div className="product-purchase">
                  <div className="product-price">
                    <span className="price-label">Preço B2B</span>
                    <span className="price-value">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        product.price + (selectedVariation?.price_modifier ?? 0)
                      )}
                    </span>
                    {selectedStock > 0 ? (
                      <span className="stock-info">{variations.length > 0 && selectedVariation ? `${selectedVariation.name}: ` : ''}Em estoque: {selectedStock} un</span>
                    ) : (
                      <span className="stock-info out">Fora de estoque</span>
                    )}
                  </div>

                  {selectedStock > 0 && (
                    <div className="purchase-actions">
                      <div className="quantity-selector">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(q => Math.min(selectedStock, q + 1))} disabled={quantity >= selectedStock}>+</button>
                      </div>
                      <button className="btn-primary" onClick={handleAddToCart} disabled={variations.length > 0 && !selectedVariation}>
                        {variations.length > 0 && !selectedVariation ? 'Selecione uma opção' : 'Adicionar ao Carrinho'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="b2b-prompt">
                  <p>{isLoggedIn ? 'Seu cadastro ainda não foi aprovado.' : 'Faça seu cadastro B2B para ver preços e comprar.'}</p>
                  <Link to="/" className="btn-secondary">{isLoggedIn ? 'Aguardar Aprovação' : 'Solicitar Cadastro B2B'}</Link>
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
