import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import type { Product, ProductVariation } from '../../types';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface ProductModalProps {
  product?: Product;
  onClose: (saved: boolean) => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [categoryId, setCategoryId] = useState(product?.category ?? '');
  const [price, setPrice] = useState(product?.price.toString() ?? '');
  const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity.toString() ?? '0');
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [description, setDescription] = useState(product?.description ?? '');
  const [status, setStatus] = useState<'draft' | 'published'>(product?.status ?? 'published');
  const [categories, setCategories] = useState<Category[]>([]);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('categories').select('*')
      .then(({ data, error }) => {
        if (!error && data) setCategories(data);
      });

    if (product) {
      supabase.from('product_variations').select('*')
        .eq('product_id', product.id)
        .order('sort_order')
        .then(({ data, error }) => {
          if (!error && data) setVariations(data);
        });
    }
  }, [product]);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.url;
    } catch {
      toast('Erro ao fazer upload', 'error');
      return null;
    }
  };

  const handleMainImage = async (file: File) => {
    setUploadingImage(true);
    const url = await uploadFile(file);
    if (url) setImageUrl(url);
    setUploadingImage(false);
  };

  const handleGalleryImage = async (file: File) => {
    setUploadingImage(true);
    const url = await uploadFile(file);
    if (url) setImages(prev => [...prev, url]);
    setUploadingImage(false);
  };

  const removeGalleryImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addVariation = () => {
    setVariations(prev => [...prev, {
      id: `new-${Date.now()}`,
      product_id: product?.id ?? '',
      name: '',
      sku: '',
      price_modifier: 0,
      stock_quantity: 0,
      image_url: '',
      sort_order: prev.length,
    }]);
  };

  const updateVariation = (id: string, field: keyof ProductVariation, value: string | number) => {
    setVariations(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVariation = (id: string) => {
    setVariations(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      toast('Preço inválido.', 'error');
      setLoading(false);
      return;
    }

    const payload = {
      name, sku, category: categoryId,
      price: parsedPrice,
      stock_quantity: parseInt(stockQuantity) || 0,
      image_url: imageUrl,
      images,
      description,
      status,
    };

    try {
      if (product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
        await saveVariations(product.id);
      } else {
        const { data, error } = await supabase.from('products').insert([payload]).select().single();
        if (error) throw error;
        await saveVariations(data.id);
      }
      toast(product ? 'Produto atualizado!' : 'Produto criado!', 'success');
      onClose(true);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveVariations = async (productId: string) => {
    const existing = variations.filter(v => !v.id.startsWith('new-'));
    const newOnes = variations.filter(v => v.id.startsWith('new-'));

    if (existing.length > 0) {
      await supabase.from('product_variations').delete().eq('product_id', productId);
    }

    if (existing.length > 0 || newOnes.length > 0) {
      const all = [...existing, ...newOnes].map((v, i) => ({
        product_id: productId,
        name: v.name,
        sku: v.sku,
        price_modifier: v.price_modifier,
        stock_quantity: v.stock_quantity,
        image_url: v.image_url,
        sort_order: i,
      }));
      const { error } = await supabase.from('product_variations').insert(all);
      if (error) throw error;
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-panel" style={{ maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-panel-header">
          <h2>{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button className="modal-panel-close" onClick={() => onClose(false)}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-panel-body">
          <div className="product-form-grid">
            <div className="product-form-left">
              <div className="form-group-compact">
                <label>Imagem Principal</label>
                <div className="upload-box" onClick={() => fileInputRef.current?.click()} style={{ minHeight: '160px' }}>
                  {uploadingImage ? <span>Fazendo upload...</span>
                  : imageUrl ? <div className="upload-preview"><img src={imageUrl} alt="" loading="lazy" /><div className="upload-overlay">Alterar</div></div>
                  : <div className="upload-empty"><span className="upload-icon">+</span><span>Imagem principal</span></div>}
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => { if (e.target.files?.[0]) handleMainImage(e.target.files[0]); }} />
                </div>
              </div>

              <div className="form-group-compact">
                <label>Nome *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>

            <div className="product-form-right">
              <div className="form-group-compact">
                <label>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as 'draft' | 'published')}>
                  <option value="published">Ativo</option>
                  <option value="draft">Rascunho</option>
                </select>
              </div>
              <div className="form-row-compact">
                <div className="form-group-compact">
                  <label>Preço (R$) *</label>
                  <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="form-group-compact">
                  <label>Estoque</label>
                  <input type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} />
                </div>
              </div>
              <div className="form-group-compact">
                <label>SKU</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} />
              </div>
              <div className="form-group-compact">
                <label>Categoria</label>
                {categories.length > 0 ? (
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">Selecione...</option>
                    {(() => {
                      const opts: React.ReactNode[] = [];
                      categories.filter(c => !c.parent_id).forEach(root => {
                        opts.push(<option key={root.id} value={root.name}>{root.name}</option>);
                        categories.filter(c => c.parent_id === root.id).forEach(sub => {
                          opts.push(<option key={sub.id} value={sub.name}>&nbsp;&nbsp;&nbsp;{sub.name}</option>);
                        });
                      });
                      return opts;
                    })()}
                  </select>
                ) : (
                  <input type="text" value={categoryId} onChange={e => setCategoryId(e.target.value)} placeholder="Digite a categoria" />
                )}
              </div>
            </div>
          </div>

          <div className="form-group-compact" style={{ marginTop: '1.5rem' }}>
            <label>Descrição</label>
            <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição do produto..." style={{ resize: 'vertical', padding: '12px 14px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-primary)', fontSize: '0.9rem' }} />
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Galeria de Imagens</label>
              <button type="button" className="btn-approve" style={{ fontSize: '0.75rem', padding: '6px 14px' }} onClick={() => galleryInputRef.current?.click()}>
                + Adicionar Imagem
              </button>
              <input type="file" ref={galleryInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => { if (e.target.files?.[0]) handleGalleryImage(e.target.files[0]); }} />
            </div>
            {uploadingImage && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '0.75rem' }}>Fazendo upload...</p>}
            {images.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Nenhuma imagem adicional.</p>
            ) : (
              <div className="gallery-grid">
                {images.map((url, i) => (
                  <div key={i} className="gallery-thumb">
                    <img src={url} alt="" loading="lazy" />
                    <button type="button" className="gallery-remove" onClick={() => removeGalleryImage(i)}>&times;</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Variações (cor, tamanho, etc.)</label>
              <button type="button" className="btn-approve" style={{ fontSize: '0.75rem', padding: '6px 14px' }} onClick={addVariation}>
                + Adicionar Variação
              </button>
            </div>
            {variations.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Nenhuma variação. O produto será vendido sem opções.</p>
            ) : (
              <div className="variations-list">
                {variations.map(v => (
                  <div key={v.id} className="variation-row">
                    <div className="variation-fields">
                      <input type="text" placeholder="Ex: Cor Azul" value={v.name} onChange={e => updateVariation(v.id, 'name', e.target.value)} />
                      <input type="text" placeholder="SKU" value={v.sku} onChange={e => updateVariation(v.id, 'sku', e.target.value)} />
                      <input type="number" step="0.01" placeholder="Preço +" value={v.price_modifier} onChange={e => updateVariation(v.id, 'price_modifier', parseFloat(e.target.value) || 0)} />
                      <input type="number" placeholder="Estoque" value={v.stock_quantity} onChange={e => updateVariation(v.id, 'stock_quantity', parseInt(e.target.value) || 0)} />
                    </div>
                    <button type="button" className="variation-remove" onClick={() => removeVariation(v.id)}>&times;</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="modal-panel-footer">
          <button type="button" className="btn-cancel" onClick={() => onClose(false)}>Cancelar</button>
          <button type="submit" className="btn-save" disabled={loading || uploadingImage} onClick={handleSubmit}>
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </div>
    </div>
  );
}
