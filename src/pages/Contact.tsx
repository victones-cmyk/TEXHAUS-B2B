import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert([{ ...formData, created_at: new Date().toISOString() }]);

    if (insertError) {
      setError('Erro ao enviar mensagem. Tente novamente.');
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="app-wrapper">
      <SEO title="Contato" description="Entre em contato com a Texhaus. Tire dúvidas, solicite parceria ou suporte." />
      <Navbar />
      <main className="page-content">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Contato</span>
          </div>

          <div className="contact-layout">
            <div className="contact-info">
              <h1>Fale Conosco</h1>
              <p className="contact-subtitle">
                Estamos prontos para atender você e sua empresa.
              </p>

              <div className="contact-details">
                <div className="contact-detail">
                  <span className="contact-icon">@</span>
                  <div>
                    <strong>E-mail</strong>
                    <p>contato@texhaus.com.br</p>
                  </div>
                </div>
                <div className="contact-detail">
                  <span className="contact-icon">@</span>
                  <div>
                    <strong>WhatsApp</strong>
                    <p>(11) 99999-0000</p>
                  </div>
                </div>
                <div className="contact-detail">
                  <span className="contact-icon">@</span>
                  <div>
                    <strong>Endereço</strong>
                    <p>São Paulo, SP</p>
                  </div>
                </div>
                <div className="contact-detail">
                  <span className="contact-icon">@</span>
                  <div>
                    <strong>Horário de Atendimento</strong>
                    <p>Seg a Sex, 8h às 18h</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-section">
              {submitted ? (
                <div className="contact-success">
                  <div className="success-icon">✓</div>
                  <h3>Mensagem Enviada!</h3>
                  <p>Recebemos sua mensagem e responderemos em breve.</p>
                  <button className="btn-primary" onClick={() => setSubmitted(false)}>
                    Enviar Nova Mensagem
                  </button>
                </div>
              ) : (
                <>
                  <h2>Envie sua mensagem</h2>
                  {error && <div className="form-error">{error}</div>}
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-row-compact">
                      <div className="form-group-compact">
                        <label>Nome *</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                      </div>
                      <div className="form-group-compact">
                        <label>E-mail *</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group-compact">
                      <label>Telefone</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group-compact">
                      <label>Assunto *</label>
                      <select name="subject" required value={formData.subject} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        <option value="vendas">Quero ser parceiro B2B</option>
                        <option value="suporte">Suporte ao cliente</option>
                        <option value="pedido">Meu pedido</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div className="form-group-compact">
                      <label>Mensagem *</label>
                      <textarea name="message" required value={formData.message} onChange={handleChange} rows={5} />
                    </div>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? 'Enviando...' : 'Enviar Mensagem'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
