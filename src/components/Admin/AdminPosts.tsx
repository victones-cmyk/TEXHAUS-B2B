import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';
import { PostModal } from './PostModal';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image_url: string;
  created_at: string;
}

export function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api<Post[]>('/posts');
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este post?')) return;

    try {
      await api(`/posts/${id}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== id));
      toast('Post excluído.', 'info');
    } catch (err) {
      toast('Erro ao excluir: ' + (err instanceof Error ? err.message : ''), 'error');
    }
  };

  const handleModalClose = (saved: boolean) => {
    setIsModalOpen(false);
    setEditingPost(undefined);
    if (saved) fetchPosts();
  };

  return (
    <>
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Blog</h2>
          <p>Gerencie os posts do blog.</p>
        </div>
        <button
          className="btn-approve"
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          onClick={() => { setEditingPost(undefined); setIsModalOpen(true); }}
        >
          + Novo Post
        </button>
      </header>

      <div className="admin-content">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Título</th>
                <th>Categoria</th>
                <th>Imagem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum post.</td></tr>
              ) : (
                posts.map(post => (
                  <tr key={post.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(post.created_at).toLocaleDateString('pt-BR')}</td>
                    <td><strong>{post.title}</strong></td>
                    <td><span className="category-tag">{post.category}</span></td>
                    <td>
                      {post.image_url ? (
                        <div style={{ width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#f0f0f0' }}>
                          <img src={post.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-approve" style={{ backgroundColor: '#007bff' }} onClick={() => { setEditingPost(post); setIsModalOpen(true); }}>Editar</button>
                        <button className="btn-reject" onClick={() => handleDelete(post.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <PostModal post={editingPost} onClose={handleModalClose} />
      )}
    </>
  );
}
