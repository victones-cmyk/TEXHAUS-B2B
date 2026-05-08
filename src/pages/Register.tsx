import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    cnpj: '',
    phone: '',
    customerType: '',
    cep: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    city: '',
    state: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);

    const errorMsg = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      companyName: formData.companyName,
      cnpj: formData.cnpj,
      phone: formData.phone,
      customerType: formData.customerType,
      city: formData.city,
      state: formData.state,
      cep: formData.cep,
      addressStreet: formData.addressStreet,
      addressNumber: formData.addressNumber,
      addressComplement: formData.addressComplement,
      addressNeighborhood: formData.addressNeighborhood,
    });

    if (errorMsg) {
      setError(errorMsg);
      setIsSubmitting(false);
      return;
    }

    navigate('/cadastro/sucesso');
  };

  return (
    <>
      <SEO title="Cadastro B2B - TEXHAUS" description="Solicite acesso para parceiros TEXHAUS" />
      <div className="app-wrapper">
        <Navbar />
        <div className="auth-page">
          <div className="section-container">
            <div className="auth-card">
              <h1>Cadastro de Parceiro B2B</h1>
              <p className="auth-subtitle">
                Preencha os dados abaixo para solicitar acesso aos preços exclusivos e fazer pedidos.
                <br />
                <strong>Seu cadastro será analisado pela nossa equipe antes da aprovação.</strong>
              </p>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit} className="register-form">
                <h3>Dados Pessoais e da Empresa</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Nome Completo*</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="companyName">Empresa*</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      placeholder="Razão Social ou Fantasia"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cnpj">CNPJ*</label>
                    <input
                      type="text"
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleChange}
                      required
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">E-mail Corporativo*</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Senha*</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="Crie uma senha (mín. 8 caracteres)"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmar Senha*</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="Repita a senha"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Telefone/WhatsApp*</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="customerType">Tipo de Cliente*</label>
                    <select
                      id="customerType"
                      name="customerType"
                      value={formData.customerType}
                      onChange={handleChange}
                      required
                      className="auth-select"
                    >
                      <option value="">Selecione...</option>
                      <option value="lojista">Lojista</option>
                      <option value="arquiteto">Arquiteto(a)</option>
                      <option value="decorador">Decorador(a)</option>
                      <option value="instalador">Instalador(a)</option>
                      <option value="distribuidor">Distribuidor</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>

                <h3>Endereço</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cep">CEP*</label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      required
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">Cidade*</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="Sua cidade"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">Estado*</label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="auth-select"
                    >
                      <option value="">UF</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PR">Paraná</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="OUTRO">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="addressStreet">Logradouro*</label>
                  <input
                    type="text"
                    id="addressStreet"
                    name="addressStreet"
                    value={formData.addressStreet}
                    onChange={handleChange}
                    required
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="addressNumber">Número*</label>
                    <input
                      type="text"
                      id="addressNumber"
                      name="addressNumber"
                      value={formData.addressNumber}
                      onChange={handleChange}
                      required
                      placeholder="123"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="addressComplement">Complemento</label>
                    <input
                      type="text"
                      id="addressComplement"
                      name="addressComplement"
                      value={formData.addressComplement}
                      onChange={handleChange}
                      placeholder="Sala, Andar, etc. (opcional)"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="addressNeighborhood">Bairro*</label>
                    <input
                      type="text"
                      id="addressNeighborhood"
                      name="addressNeighborhood"
                      value={formData.addressNeighborhood}
                      onChange={handleChange}
                      required
                      placeholder="Seu bairro"
                    />
                  </div>
                </div>

                <div className="form-checkbox">
                  <input type="checkbox" id="termos" required />
                  <label htmlFor="termos">
                    Declaro que li e aceito os <Link to="/termos-e-condicoes">Termos e Condições</Link> de cadastro B2B.
                  </label>
                </div>

                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitação de Cadastro'}
                </button>

                <p className="auth-switch">
                  Já tem cadastro? <Link to="/login">Fazer Login</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
