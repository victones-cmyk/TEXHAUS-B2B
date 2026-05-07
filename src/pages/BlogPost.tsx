import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Loading } from '../components/Loading';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  created_at: string;
}

export function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) setPost(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="app-wrapper">
        <Navbar />
        <main className="page-content" style={{ marginTop: '80px' }}>
          <Loading type="page" lines={6} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="app-wrapper">
        <Navbar />
        <main className="page-content" style={{ textAlign: 'center', padding: '6rem 0' }}>
          <h2>Post não encontrado</h2>
          <Link to="/blog" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Voltar ao Blog</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="page-content">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/blog">Blog</Link>
            <span>/</span>
            <span>{post.title}</span>
          </div>

          <SEO title={post.title} description={post.content.slice(0, 200)} image={post.image_url} />
          <article className="blog-post-article">
            {post.image_url && (
              <div className="blog-post-image">
                <img src={post.image_url} alt={post.title} loading="lazy" />
                <span className="blog-post-category">{post.category}</span>
              </div>
            )}
            <time className="blog-post-date">{new Date(post.created_at).toLocaleDateString('pt-BR')}</time>
            <h1>{post.title}</h1>
            <div className="blog-post-content">
              {post.content.split('\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Link to="/blog" className="btn-secondary">← Voltar para o Blog</Link>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
