export function Footer() {
  return (
    <footer className="footer">
      <div className="section-container footer-content">
        <div className="footer-logo">
          TEXHAUS<span>.</span>
        </div>
        <p className="footer-text">
          © {new Date().getFullYear()} Texhaus Decor. Todos os direitos reservados.<br/>
          Comércio atacadista de tecidos e artigos de armarinho.
        </p>
      </div>
    </footer>
  );
}
