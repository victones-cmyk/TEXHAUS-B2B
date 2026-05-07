import { useState, useRef } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image_url: string;
}

interface PostModalProps {
  post?: Post;
  onClose: (saved: boolean) => void;
}

export function PostModal({ post, onClose }: PostModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(post?.title ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [category, setCategory] = useState(post?.category ?? '');
  const [imageUrl, setImageUrl] = useState(post?.image_url ?? '');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.url);
    } catch {
      toast('Erro ao fazer upload da imagem', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { title, content, excerpt, category, image_url: imageUrl };

    try {
      if (post) {
        await api(`/posts/${post.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/posts', { method: 'POST', body: JSON.stringify(payload) });
      }
      toast(post ? 'Post atualizado!' : 'Post criado!', 'success');
      onClose(true);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-panel-header">
          <h2>{post ? 'Editar Post' : 'Novo Post'}</h2>
          <button className="modal-panel-close" onClick={() => onClose(false)}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-panel-body">
          <div className="form-group-compact">
            <label>Título *</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="form-row-compact" style={{ margin: '1rem 0' }}>
            <div className="form-group-compact">
              <label>Categoria *</label>
              <select required value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="Cortinas">Cortinas</option>
                <option value="Persianas">Persianas</option>
                <option value="Dicas">Dicas</option>
                <option value="Tutoriais">Tutoriais</option>
              </select>
            </div>
            <div className="form-group-compact">
              <label>Imagem</label>
              <div className="upload-box" style={{ minHeight: '100px', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                {uploadingImage ? (
                  <span>Fazendo upload...</span>
                ) : imageUrl ? (
                  <div className="upload-preview">
                    <img src={imageUrl} alt="" loading="lazy" style={{ objectFit: 'cover' }} />
                    <div className="upload-overlay">Alterar</div>
                  </div>
                ) : (
                  <div className="upload-empty">
                    <span className="upload-icon">+</span>
                    <span>Imagem</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*"
                  onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
              </div>
            </div>
          </div>

          <div className="form-group-compact">
            <label>Resumo (excerpt)</label>
            <textarea rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Breve descrição para a listagem..." />
          </div>

          <div className="form-group-compact" style={{ marginTop: '1rem' }}>
            <label>Conteúdo *</label>
            <textarea rows={10} required value={content} onChange={e => setContent(e.target.value)} placeholder="Escreva o conteúdo do post aqui..." style={{ resize: 'vertical' }} />
          </div>
        </form>

        <div className="modal-panel-footer">
          <button type="button" className="btn-cancel" onClick={() => onClose(false)}>Cancelar</button>
          <button type="submit" className="btn-save" disabled={loading || uploadingImage} onClick={handleSubmit}>
            {loading ? 'Salvando...' : 'Salvar Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
