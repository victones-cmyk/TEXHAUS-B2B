import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Loading } from '../components/Loading';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image_url: string;
  created_at: string;
}

export function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Post[]>('/posts')
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-wrapper">
      <SEO title="Blog" description="Dicas, tutoriais e novidades sobre tecidos, cortinas, persianas e decoração." />
      <Navbar />
      <main className="page-content">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Blog</span>
          </div>

          <div className="blog-header">
            <h1>Blog</h1>
            <p>Dicas, tutoriais e novidades do mundo da decoração.</p>
          </div>

          {loading ? (
            <Loading type="skeleton" lines={3} />
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-light)' }}>
              <p>Nenhum post publicado ainda.</p>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map(post => (
                <article key={post.id} className="blog-card">
                  <Link to={`/blog/${post.id}`} className="blog-card-image">
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', background: 'var(--color-bg-light)' }}>Sem imagem</div>
                    )}
                    <span className="blog-card-category">{post.category}</span>
                  </Link>
                  <div className="blog-card-content">
                    <time className="blog-card-date">{new Date(post.created_at).toLocaleDateString('pt-BR')}</time>
                    <h2>{post.title}</h2>
                    <p>{post.excerpt || post.content.slice(0, 150) + '...'}</p>
                    <Link to={`/blog/${post.id}`} className="blog-read-more">Ler mais →</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
