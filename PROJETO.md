# PROJETO TEXHAUS B2B - Loja Virtual em WordPress + WooCommerce

## 1. ESTRUTURA SUGERIDA DO SITE

### Páginas Principais
| Página | Slug | Descrição |
|--------|------|-----------|
| Home | `/` | Página inicial com destaques, categorias, novidades, blog |
| Loja | `/loja/` | Lista de todos os produtos |
| Categorias | `/categorias/` | Grid das categorias de produtos |
| Produto | `/produto/{slug}/` | Página individual de produto |
| Cadastro B2B | `/cadastro-b2b/` | Formulário de cadastro para distribuidores |
| Minha Conta | `/minha-conta/` | Área do cliente (WooCommerce) |
| Carrinho | `/carrinho/` | Carrinho de compras (WooCommerce) |
| Checkout | `/checkout/` | Finalização de pedido (WooCommerce) |
| Sobre Nós | `/sobre-nos/` | História e informações da empresa |
| Blog | `/blog/` | Dicas úteis, tutoriais e novidades |
| Contato | `/contato/` | Formulário de contato e informações |
| Política de Privacidade | `/politica-de-privacidade/` | LGPD |
| Trocas e Devoluções | `/trocas-e-devolucoes/` | Política de trocas |
| Política de Envios | `/politica-de-envios/` | Informações de frete |
| Termos e Condições | `/termos-e-condicoes/` | Termos legais |

### Estrutura de Conteúdo
- **Categorias de Produto** (hierárquicas):
  - Tecidos
    - Para Cortinas
    - Para Persianas
  - Acessórios
    - Para Cortinas
    - Para Persianas
  - Cortinas
    - Para Quarto e Sala
  - Persianas
    - Double Vision
    - Rolô
    - Romana

- **Categorias de Blog**:
  - Cortinas
  - Persianas
  - Tutoriais
  - Dicas

---

## 2. LISTA DE PLUGINS RECOMENDADOS

### Obrigatórios
| Plugin | Função | Versão | Preço |
|--------|--------|--------|-------|
| **WooCommerce** | Plataforma de e-commerce | Última | Grátis |
| **Brazilian Market on WooCommerce** | Correios, cálculo de frete, nota fiscal, NF-e | 5.0+ | Grátis |
| **WooCommerce Extra Checkout Fields for Brazil** | CPF/CNPJ, RG, IE, endereço completo no checkout | Última | Grátis |
| **WooCommerce Mercado Pago** | Pagamento com Pix, cartão, boleto | Oficial | Grátis |
| **Advanced Custom Fields (ACF)** | Campos customizados para produtos e páginas | 6.0+ | Grátis |
| **Yoast SEO** | SEO completo, sitemap, meta tags | Última | Grátis |
| **Wordfence Security** | Firewall, proteção contra ataques | Última | Grátis |
| **WP Rocket** | Cache, minificação, performance | Última | Pago (~R$200) |
| **Loco Translate** | Tradução de temas e plugins | Última | Grátis |
| **WooCommerce Product Importer/Exporter** | Gestão de estoque via CSV | Nativo | Grátis |

### B2B e Controle de Acesso
| Plugin | Função | Preço |
|--------|--------|-------|
| **WooCommerce Wholesale Suite** | Controle B2B completo (Plugin principal recomendado) | $99/ano |
| **YITH WooCommerce B2B** | Alternativa nacional com bom suporte | ~R$199 |
| **Groups / Woocommerce Groups** | Controle de grupos de usuários e preços | Grátis |
| **WooCommerce Role Based Pricing** | Preços por papel de usuário | Grátis |

### Plug-in Customizado (Desenvolvimento Próprio)
Criar plugin **texhaus-b2b-utils** (já incluso neste tema) contendo:
- Sistema de aprovação manual de usuários
- Campo CNPJ, empresa, telefone, tipo de cliente no cadastro
- Notificação por e-mail ao admin no novo cadastro
- Ocultação de preços e botão compra para não aprovados
- Role personalizado "B2B Pending" e "B2B Approved"

---

## 3. LAYOUT DAS PÁGINAS PRINCIPAIS

### HOME (front-page.php)
```
┌─────────────────────────────────────────────────┐
│ HEADER: Logo | Menu Principal | Ícones (conta/carrinho) │
├─────────────────────────────────────────────────┤
│              HERO / BANNER PRINCIPAL              │
│   "Distribuidora de tecidos e acessórios         │
│    para cortinas e persianas"                    │
│   [CTA: CONHECER]                                │
├─────────────────────────────────────────────────┤
│ DIFERENCIAIS (3 colunas):                        │
│  Pagamento Facilitado │ Meios de Entrega │ WhatsApp │
├─────────────────────────────────────────────────┤
│           CATEGORIAS (grid 4 colunas)            │
│  Tecidos │ Acessórios │ Cortinas │ Persianas     │
├─────────────────────────────────────────────────┤
│              NOVIDADES (carrossel)                │
│  Últimos produtos adicionados                    │
├─────────────────────────────────────────────────┤
│           NEWSLETTER (formulário)                │
├─────────────────────────────────────────────────┤
│        DICAS ÚTEIS / BLOG (grid posts)           │
├─────────────────────────────────────────────────┤
│              TRENDING NOW (grid 4)               │
├─────────────────────────────────────────────────┤
│ FOOTER: Logo | Contato | Links | Newsletter | Redes │
└─────────────────────────────────────────────────┘
```

### LOJA / CATEGORIA (archive-product.php)
```
┌─────────────────────────────────────────────────┐
│ HEADER                                          │
├─────────────────────────────────────────────────┤
│ Breadcrumb > Categoria                          │
├──────────────┬──────────────────────────────────┤
│ FILTROS      │ GRID DE PRODUTOS                 │
│ - Categoria  │ [IMG] [IMG] [IMG] [IMG]          │
│ - Preço      │ [IMG] [IMG] [IMG] [IMG]          │
│ (se logado)  │                                  │
│ - Material   │ Paginação                         │
│ - Cor        │                                  │
└──────────────┴──────────────────────────────────┘
│ FOOTER                                          │
└─────────────────────────────────────────────────┘
```

### PRODUTO INDIVIDUAL (single-product.php)
```
┌─────────────────────────────────────────────────┐
│ HEADER                                          │
├─────────────────────────────────────────────────┤
│ Breadcrumb > Categoria > Produto                │
├─────────────────────┬───────────────────────────┤
│  GALERIA DE IMAGENS  │ DADOS DO PRODUTO          │
│  [IMG] [IMG] [IMG]   │ Nome                      │
│                      │ SKU: TEX-001              │
│                      │ Categoria                 │
│                      │ Preço (se aprovado)        │
│                      │ [QTY] + [COMPRAR]          │
│                      │ (se aprovado)             │
│                      │                           │
│                      │ OU                        │
│                      │ "Faça cadastro B2B"       │
│                      │ (se não aprovado)         │
├─────────────────────┴───────────────────────────┤
│ DESCRIÇÃO COMPLETA                               │
├─────────────────────────────────────────────────┤
│ INFORMAÇÕES ADICIONAIS / TABELA                  │
├─────────────────────────────────────────────────┤
│ PRODUTOS RELACIONADOS                            │
│  [IMG] [IMG] [IMG] [IMG]                        │
├─────────────────────────────────────────────────┤
│ FOOTER                                          │
└─────────────────────────────────────────────────┘
```

### CADASTRO B2B (page-cadastro-b2b.php)
```
┌─────────────────────────────────────────────────┐
│ HEADER                                          │
├─────────────────────────────────────────────────┤
│ TÍTULO: Cadastro B2B - Distribuidor Texhaus      │
│                                                 │
│ "Faça parte da rede Texhaus e tenha acesso       │
│  a preços e condições especiais para             │
│  profissionais do setor."                        │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Nome Completo*  [_________________________] │ │
│ │ Empresa*        [_________________________] │ │
│ │ CNPJ*           [_________________________] │ │
│ │ E-mail*         [_________________________] │ │
│ │ Telefone/Whats* [_________________________] │ │
│ │ Cidade          [_________________________] │ │
│ │ Estado          [UF ▼]                      │ │
│ │ Tipo de Cliente:                             │ │
│ │ ( ) Lojista  ( ) Arquiteto                   │ │
│ │ ( ) Decorador ( ) Instalador                 │ │
│ │ ( ) Distribuidor ( ) Outro                   │ │
│ │                                              │ │
│ │ [✓] Aceito os Termos e Condições             │ │
│ │                                              │ │
│ │ [CADASTRAR]                                  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ "Após o cadastro, você receberá um e-mail        │
│  de confirmação. Seu acesso será liberado        │
│  após aprovação da nossa equipe."               │
├─────────────────────────────────────────────────┤
│ FOOTER                                          │
└─────────────────────────────────────────────────┘
```

### MINHA CONTA
```
┌─────────────────────────────────────────────────┐
│ HEADER                                          │
├─────────────────────────────────────────────────┤
│ MINHA CONTA                                     │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Dashboard  │ Seja bem-vindo!                 │ │
│ │ Pedidos    │ Seu cadastro está:              │ │
│ │ Endereços  │ [APROVADO] / [AGUARDANDO]       │ │
│ │ Detalhes   │                                 │ │
│ │ Senha      │ Último pedido: #0001            │ │
│ └────────────┴────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ FOOTER                                          │
└─────────────────────────────────────────────────┘
```

---

## 4. FLUXO DE CADASTRO E APROVAÇÃO B2B

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Visitante│────>│ Cadastro │────>│ Aguardando│────>│ Aprovado │
│  (anon)  │     │  B2B     │     │ Aprovação │     │  B2B     │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                          │
                     ┌──────────┐                         │
                     │  Admin   │<─────── E-mail de       │
                     │  aprova  │        notificação      │
                     │  ou nega │                         │
                     └────┬─────┘                         │
                          │                               │
                          v                               v
                   ┌──────────┐                    ┌──────────┐
                   │  Negado  │                    │  Pode:   │
                   │          │                    │ Ver preços│
                   │  Motivo: │                    │ Comprar  │
                   │  "CNPJ   │                    │ Carrinho │
                   │  inválido"│                   │ Checkout │
                   └──────────┘                    └──────────┘
```

### Detalhamento do fluxo:

1. **Visitante** anônimo navega, vê produtos mas sem preços nem botão comprar
2. Clica em "Solicitar Cadastro B2B" ou "Registrar-se"
3. Preenche formulário estendido (nome, empresa, CNPJ, e-mail, tel, cidade, estado, tipo)
4. Após submit:
   - Usuário criado com role `b2b_pending`
   - E-mail de confirmação enviado ao usuário
   - E-mail de notificação enviado ao admin
   - Redirecionado para página "Cadastro Recebido - Aguarde Aprovação"
5. Admin recebe e-mail e acessa painel > Usuários
6. Admin vê coluna "Status B2B" e pode:
   - **Aprovar**: muda role para `b2b_approved`, e-mail automático para usuário liberando acesso
   - **Reprovar**: muda role para `b2b_rejected`, opção de enviar motivo
7. Usuário aprovado faz login e vê preços, pode comprar

### Roles personalizadas:
- `b2b_pending` - Cadastrado, aguardando aprovação
- `b2b_approved` - Aprovado, acesso total aos preços
- `b2b_rejected` - Reprovado, não pode comprar

---

## 5. CONFIGURAÇÃO IDEAL DO WOOCOMMERCE

### Configurações Gerais
```
WooCommerce > Configurações:

Geral:
- Base do país: Brasil
- Moeda: Real (R$)
- Posição do símbolo: R$250,00
- Separador decimal: ,
- Separador de milhar: .

Produtos:
- Página da loja: /loja/
- Página do carrinho: /carrinho/
- Página de finalização: /finalizar-compra/
- Página minha conta: /minha-conta/
- Adicionar ao carrinho: Redirect to cart
- Avaliações: Desabilitar (B2B)
- Preços: exibir com taxas (incluir impostos)

Inventário:
- Gerenciar estoque: Sim
- Notificações de estoque baixo: Sim
- Estoque para baixo: 5
- Sem estoque: Não visível

Entrega:
- Calcular frete: Sim (após endereço)
- Local de entrega: Padrão
- Classes de frete: Ativar

Contas e Privacidade:
- Permitir cadastro: Sim
- Gerar senha automaticamente: Sim
- Após cadastro: Redirecionar para "Minha Conta"
- Política de privacidade: Selecionar página
- Termos: Selecionar página
- LGPD: Ativar consentimento
```

### Campos de Checkout (Checkout Fields for Brazil)
```
- Tipo de Pessoa: Jurídica (padrão) / Física
- CNPJ/CPF: Obrigatório
- IE: Opcional
- RG: Opcional
- Nome completo
- Endereço: Rua, Número, Complemento, Bairro
- CEP: Com busca automática (ViaCEP)
- Cidade/Estado
- Telefone/WhatsApp
```

### Métodos de Pagamento
| Método | Gateway | Configuração |
|--------|---------|-------------|
| **Pix** | Mercado Pago | Desconto de 5% no Pix |
| **Cartão de Crédito** | Mercado Pago | Parcelamento em até 12x |
| **Boleto Bancário** | Mercado Pago | Vencimento em 3 dias úteis |
| **Pix Parcelado** | Mercado Pago | Opcional |

### Métodos de Entrega
| Método | Configuração |
|--------|-------------|
| **Retirada na Empresa** | Grátis - endereço da Texhaus |
| **Frete Fixo** | Por região (SP, Sudeste, Demais) |
| **Correios (futuro)** | Através do plugin Brazilian Market |
| **Melhor Envio (futuro)** | Integração futura |
| **Transportadora (futuro)** | Cotação manual |

---

## 6. MEIOS DE PAGAMENTO BRASILEIROS

### Gateway Principal: Mercado Pago (Recomendado)
- **Maior adoção no Brasil**
- **Pix**: Pagamento instantâneo, liquidação imediata
- **Cartão de Crédito**: Parcelamento c/ ou s/ juros
- **Boleto**: Vencimento flexível
- **Checkout Transparente**: Sem redirecionamento
- **Antifraude**: Incluso
- **Comissão**: ~4% por transação
- Plugin oficial WooCommerce: `woocommerce-mercadopago`

### Configuração de Parcelamento Sugerida
```
Parcelamento sem juros:
- 1x: Preço normal
- 2x: Preço normal
- 3x: Preço normal
- 4x a 6x: Preço normal
- 7x a 12x: Preço normal

Parcelamento com juros (opcional):
- Acima de 6x: 1,99% a.m.
```

### Desconto no Pix
```
Pix à vista: 5% de desconto
Configurar em: WooCommerce > Mercado Pago > Pix
```

### Alternativas de Gateway
| Gateway | Pix | Cartão | Boleto | Recorrência | Comissão |
|---------|-----|--------|--------|-------------|----------|
| **PagSeguro/PagBank** | Sim | Sim | Sim | Sim | ~3,5% |
| **Pagar.me** | Sim | Sim | Sim | Sim | ~3,8% |
| **Asaas** | Sim | Sim | Sim | Sim | ~3,5% |
| **Yapay** | Sim | Sim | Sim | Sim | ~3,2% |

---

## 7. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Infraestrutura
- [ ] Contratar hospedagem WordPress (recomendado: HostGator, GoDaddy, ou hospedagem dedicada)
- [ ] Configurar domínio (texhaus.com.br ou subdomínio b2b.texhaus.com.br)
- [ ] Instalar certificado SSL (Let's Encrypt ou pago)
- [ ] Instalar WordPress (última versão)
- [ ] Configurar PHP 8.0+ e MySQL 8.0+
- [ ] Configurar CDN (Cloudflare) para performance
- [ ] Backup automático configurado

### Fase 2: Instalação de Plugins
- [ ] Instalar WooCommerce
- [ ] Instalar Brazilian Market on WooCommerce
- [ ] Instalar WooCommerce Extra Checkout Fields for Brazil
- [ ] Instalar Mercado Pago WooCommerce
- [ ] Instalar Yoast SEO
- [ ] Instalar Wordfence Security
- [ ] Instalar WP Rocket (cache)
- [ ] Instalar ACF (Advanced Custom Fields)
- [ ] Instalar Loco Translate
- [ ] Instalar plugin de WhatsApp (recomendado: Buttonizer ou similar)
- [ ] Instalar plugin de LGPD (recomendado: CookieYes ou GDPR Cookie Consent)

### Fase 3: Tema e Personalização
- [ ] Instalar e ativar tema Texhaus B2B
- [ ] Configurar identidade visual (cores, tipografia, logo)
- [ ] Criar estrutura de menus
- [ ] Configurar header com logo, menu, ícones
- [ ] Configurar footer completo
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Configurar widgets (sidebar, blog)

### Fase 4: Produtos e Categorias
- [ ] Criar hierarquia de categorias
- [ ] Importar/cadastrar produtos via CSV
- [ ] Adicionar imagens dos produtos (alta qualidade)
- [ ] Configurar variações (cor, tamanho, material)
- [ ] Configurar SKU para cada produto
- [ ] Configurar estoque
- [ ] Configurar atributos (cor, largura, material, etc.)
- [ ] Configurar preços (visíveis apenas para B2B aprovado)

### Fase 5: Sistema B2B
- [ ] Ativar plugin texhaus-b2b-utils
- [ ] Testar cadastro com formulário estendido
- [ ] Testar role b2b_pending
- [ ] Testar notificação por e-mail ao admin
- [ ] Testar aprovação manual no painel
- [ ] Testar role b2b_approved com acesso a preços
- [ ] Testar role b2b_rejected (bloqueio)
- [ ] Testar ocultação de preços para não logados
- [ ] Testar ocultação de botão comprar
- [ ] Testar exibição de mensagem "Faça cadastro B2B"

### Fase 6: Pagamentos
- [ ] Configurar conta Mercado Pago
- [ ] Configurar Pix com desconto
- [ ] Configurar parcelamento cartão de crédito
- [ ] Configurar boleto bancário
- [ ] Testar fluxo completo de pagamento
- [ ] Configurar e-mail de confirmação de pedido
- [ ] Testar estorno/reembolso

### Fase 7: Entregas
- [ ] Configurar retirada na empresa
- [ ] Configurar frete fixo por região
- [ ] Configurar cálculo de frete nos Correios (Brazilian Market)
- [ ] Configurar campos de endereço no checkout
- [ ] Testar cálculo de frete
- [ ] Testar etiqueta de envio (futuro)

### Fase 8: Conteúdo e SEO
- [ ] Criar páginas institucionais (Sobre, Contato, Políticas)
- [ ] Criar blog com posts iniciais
- [ ] Configurar Yoast SEO para todas as páginas
- [ ] Configurar Google Analytics
- [ ] Configurar Google Search Console
- [ ] Configurar sitemap.xml
- [ ] Criar meta tags e descrições
- [ ] Configurar Open Graph (redes sociais)

### Fase 9: LGPD e Legal
- [ ] Configurar banner de cookies (consentimento)
- [ ] Criar política de privacidade (LGPD)
- [ ] Criar termos e condições
- [ ] Criar política de trocas e devoluções
- [ ] Criar política de envios
- [ ] Configurar formulário de contato com LGPD

### Fase 10: Segurança
- [ ] Configurar Wordfence (firewall)
- [ ] Limitar tentativas de login
- [ ] Configurar autenticação de dois fatores (2FA)
- [ ] Backup automático semanal
- [ ] Atualização automática de plugins (cuidadosa)
- [ ] Desabilitar XML-RPC se não usado
- [ ] Alterar prefixo wp_ do banco de dados

### Fase 11: Performance
- [ ] Configurar WP Rocket (cache)
- [ ] Otimizar imagens (WebP, compressão)
- [ ] Minificar CSS e JS
- [ ] Configurar lazy loading
- [ ] Configurar CDN (Cloudflare)
- [ ] Testar PageSpeed (Google) - meta: 90+
- [ ] Otimizar banco de dados
- [ ] Configurar cache de página

### Fase 12: Testes Finais
- [ ] Testar fluxo completo: visitante > cadastro > aprovação > compra
- [ ] Testar em Chrome, Firefox, Safari, Edge
- [ ] Testar em mobile (iOS e Android)
- [ ] Testar checkout com cada forma de pagamento
- [ ] Testar e-mails transacionais
- [ ] Testar cálculo de frete
- [ ] Testar busca de produtos
- [ ] Testar formulário de contato
- [ ] Testar LGPD (cookie banner, consentimento)
- [ ] Testar velocidade de carregamento
- [ ] Testar 404 e redirecionamentos

### Fase 13: Lançamento
- [ ] Apontar DNS para nova hospedagem
- [ ] Verificar SSL
- [ ] Verificar e-mails transacionais
- [ ] Backup completo antes do go-live
- [ ] Monitorar primeiras 48 horas
- [ ] Configurar monitoramento uptime

---

## ARQUIVOS DO TEMA

```
wp-content/themes/texhaus-b2b/
├── style.css                  # Cabeçalho do tema
├── functions.php              # Funções do tema + WooCommerce + B2B
├── index.php                  # Template fallback
├── front-page.php             # Página inicial
├── header.php                 # Header (logo, menu, ícones)
├── footer.php                 # Footer (newsletter, contato, links)
├── page.php                   # Página padrão
├── single.php                 # Post individual (blog)
├── archive.php                # Arquivo de posts (blog)
├── single-product.php         # Produto individual
├── archive-product.php        # Lista de produtos
├── taxonomy-product-cat.php   # Categoria de produto
├── page-cadastro-b2b.php      # Página de cadastro B2B
├── page-contato.php           # Página de contato
├── 404.php                    # Página 404
├── search.php                 # Resultados de busca
├── sidebar.php                # Sidebar
├── inc/
│   ├── b2b-registration.php   # Lógica de cadastro B2B
│   ├── b2b-approval.php       # Lógica de aprovação
│   ├── b2b-price-control.php  # Controle de visibilidade de preços
│   └── woocommerce-overrides.php # Overrides do WooCommerce
├── template-parts/
│   ├── content-none.php
│   ├── content-page.php
│   ├── content-single.php
│   ├── product-loop.php
│   ├── categories-grid.php
│   ├── blog-preview.php
│   ├── newsletter-form.php
│   └── b2b-register-form.php
├── assets/
│   ├── css/
│   │   ├── texhaus-theme.css
│   │   └── texhaus-woocommerce.css
│   └── js/
│       ├── texhaus-theme.js
│       └── texhaus-woocommerce.js
└── languages/
    └── texhaus-b2b.pot

wp-content/plugins/texhaus-b2b-utils/
├── texhaus-b2b-utils.php       # Plugin principal
├── includes/
│   ├── class-b2b-user-roles.php
│   ├── class-b2b-registration.php
│   ├── class-b2b-approval.php
│   ├── class-b2b-price-control.php
│   └── class-b2b-admin.php
└── assets/
    └── css/
        └── admin.css
```
