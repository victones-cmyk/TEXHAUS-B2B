import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function About() {
  return (
    <div className="app-wrapper">
      <SEO title="Sobre Nós" description="Conheça a história, missão e valores da Texhaus, distribuidora de tecidos e acessórios para decoração." />
      <Navbar />
      <main className="page-content">
        <div className="section-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Sobre Nós</span>
          </div>

          <div className="about-hero">
            <h1>Sobre a Texhaus</h1>
            <p className="about-subtitle">
              Referência em distribuição de tecidos e acessórios para cortinas e persianas.
            </p>
          </div>

          <div className="about-section">
            <h2>Nossa História</h2>
            <p>
              A Texhaus nasceu da paixão por decoração e da visão de oferecer ao mercado
              brasileiro uma curadoria exclusiva de tecidos, persianas e acessórios para
              profissionais do setor. Desde o início, nosso compromisso é com a qualidade
              impecável e o design que transforma ambientes.
            </p>
            <p>
              Ao longo dos anos, construímos parcerias sólidas com os melhores fornecedores
              nacionais e internacionais, garantindo um portfólio diversificado que atende
              desde pequenos lojistas até grandes redes do varejo.
            </p>
          </div>

          <div className="about-section">
            <h2>Missão</h2>
            <p>
              Oferecer soluções em tecidos e acessórios para decoração com excelência,
              agregando valor ao negócio dos nossos parceiros através de produtos de alta
              qualidade, curadoria diferenciada e atendimento especializado.
            </p>
          </div>

          <div className="about-section">
            <h2>Visão</h2>
            <p>
              Ser a distribuidora referência no mercado de decoração B2B no Brasil,
              reconhecida pela qualidade dos produtos, inovação e relacionamento com
              parceiros.
            </p>
          </div>

          <div className="about-section">
            <h2>Valores</h2>
            <div className="values-grid">
              <div className="value-item">
                <strong>Qualidade</strong>
                <p>Rigoroso controle em cada produto comercializado.</p>
              </div>
              <div className="value-item">
                <strong>Parceria</strong>
                <p>Relações transparentes e de longo prazo com clientes e fornecedores.</p>
              </div>
              <div className="value-item">
                <strong>Inovação</strong>
                <p>Acompanhamento das tendências mundiais de decoração.</p>
              </div>
              <div className="value-item">
                <strong>Compromisso</strong>
                <p>Responsabilidade com prazos, qualidade e satisfação do cliente.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
