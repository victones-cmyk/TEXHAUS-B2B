import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="footer">
      <div className="section-container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              TEXHAUS<span>.</span>
            </div>
            <p className="footer-desc">
              Distribuidora de tecidos e acessórios para cortinas e persianas.
              Atendimento B2B para profissionais do setor.
            </p>
          </div>
          <div className="footer-col">
            <h4>Páginas</h4>
            <Link to="/">Home</Link>
            <Link to="/sobre-nos">Sobre Nós</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contato">Contato</Link>
          </div>
          <div className="footer-col">
            <h4>Políticas</h4>
            <Link to="/politica-de-privacidade">Privacidade</Link>
            <Link to="/trocas-e-devolucoes">Trocas e Devoluções</Link>
            <Link to="/politica-de-envios">Política de Envios</Link>
            <Link to="/termos-e-condicoes">Termos e Condições</Link>
          </div>
          <div className="footer-col">
            <h4>Contato</h4>
            <p>contato@texhaus.com.br</p>
            <p>(11) 99999-0000</p>
            <p>São Paulo, SP</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Texhaus Decor. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
