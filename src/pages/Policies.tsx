import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function Privacy() {
  return (
    <div className="app-wrapper">
      <SEO title="Política de Privacidade" description="Política de privacidade da Texhaus em conformidade com a LGPD." />
      <Navbar />
      <main className="page-content">
        <div className="section-container policy-page">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Política de Privacidade</span>
          </div>
          <h1>Política de Privacidade</h1>
          <div className="policy-content">
            <p>A Texhaus Decor valoriza a privacidade dos seus parceiros e visitantes. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.</p>
            <h2>Dados Coletados</h2>
            <p>Coletamos nome, empresa, CNPJ, e-mail, telefone e endereço quando você realiza seu cadastro B2B ou entra em contato conosco.</p>
            <h2>Uso dos Dados</h2>
            <p>Seus dados são utilizados exclusivamente para processar cadastros, gerenciar pedidos e manter contato comercial. Não compartilhamos informações com terceiros sem seu consentimento.</p>
            <h2>LGPD</h2>
            <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você pode solicitar a exclusão ou correção dos seus dados a qualquer momento entrando em contato conosco.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Exchanges() {
  return (
    <div className="app-wrapper">
      <SEO title="Trocas e Devoluções" description="Política de trocas e devoluções da Texhaus. Prazos e condições." />
      <Navbar />
      <main className="page-content">
        <div className="section-container policy-page">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Trocas e Devoluções</span>
          </div>
          <h1>Trocas e Devoluções</h1>
          <div className="policy-content">
            <h2>Prazo de Desistência</h2>
            <p>O cliente tem até 7 dias corridos após o recebimento para desistir da compra, conforme CDC.</p>
            <h2>Produtos com Defeito</h2>
            <p>Para produtos com defeito de fabricação, o prazo para troca é de até 30 dias após o recebimento.</p>
            <h2>Condições para Troca</h2>
            <p>O produto deve estar em sua embalagem original, sem sinais de uso. Tecidos não podem ter sido cortados ou manipulados.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Shipping() {
  return (
    <div className="app-wrapper">
      <SEO title="Política de Envios" description="Prazos e condições de entrega da Texhaus para todo o Brasil." />
      <Navbar />
      <main className="page-content">
        <div className="section-container policy-page">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Política de Envios</span>
          </div>
          <h1>Política de Envios</h1>
          <div className="policy-content">
            <h2>Retirada na Empresa</h2>
            <p>Grátis — disponível em nosso endereço em São Paulo, SP, mediante agendamento.</p>
            <h2>Frete Fixo</h2>
            <p>Entregamos para todo o Brasil com valor de frete calculado por região no momento do pedido.</p>
            <h2>Prazo de Entrega</h2>
            <p>O prazo varia conforme a região, entre 3 a 15 dias úteis após a confirmação do pedido.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Terms() {
  return (
    <div className="app-wrapper">
      <SEO title="Termos e Condições" description="Termos e condições de uso do site Texhaus B2B." />
      <Navbar />
      <main className="page-content">
        <div className="section-container policy-page">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Termos e Condições</span>
          </div>
          <h1>Termos e Condições</h1>
          <div className="policy-content">
            <h2>Condições Comerciais</h2>
            <p>Os preços e condições exibidos no site são exclusivos para clientes B2B com cadastro aprovado.</p>
            <h2>Pagamento</h2>
            <p>Formas de pagamento: Pix (5% desconto), cartão de crédito (até 12x) e boleto bancário.</p>
            <h2>Pedidos</h2>
            <p>Pedidos estão sujeitos a disponibilidade de estoque. A Texhaus se reserva o direito de cancelar pedidos em caso de indisponibilidade.</p>
            <h2>Cadastro B2B</h2>
            <p>A Texhaus pode recusar ou cancelar cadastros B2B a seu critério, sem necessidade de justificativa.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
