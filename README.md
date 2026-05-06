# Texhaus B2B - Loja Virtual WordPress + WooCommerce

Site de loja virtual B2B para a Texhaus, distribuidora de tecidos e acessórios para cortinas e persianas.

## Estrutura do Projeto

```
├── PROJETO.md                              # Documentação completa do projeto
├── wp-content/
│   ├── themes/
│   │   └── texhaus-b2b/                    # Tema WordPress Texhaus B2B
│   │       ├── style.css                   # Cabeçalho do tema
│   │       ├── functions.php               # Funções principais
│   │       ├── header.php                  # Header com logo e menu
│   │       ├── footer.php                  # Footer com WhatsApp flutuante
│   │       ├── front-page.php              # Página inicial
│   │       ├── index.php                   # Template fallback
│   │       ├── page.php                    # Página padrão
│   │       ├── single.php                  # Post individual
│   │       ├── archive.php                 # Arquivo de posts
│   │       ├── page-cadastro-b2b.php       # Cadastro B2B
│   │       ├── page-contato.php            # Contato
│   │       ├── page-carrinho.php           # Carrinho
│   │       ├── page-checkout.php           # Checkout
│   │       ├── page-minha-conta.php        # Minha Conta
│   │       ├── single-product.php          # Produto individual
│   │       ├── archive-product.php         # Lista de produtos
│   │       ├── 404.php                     # Página 404
│   │       ├── search.php                  # Busca
│   │       ├── sidebar.php                 # Sidebar blog
│   │       ├── sidebar-shop.php            # Sidebar loja
│   │       ├── product-searchform.php      # Formulário de busca
│   │       ├── inc/                        # Includes do tema
│   │       │   ├── b2b-registration.php
│   │       │   ├── b2b-approval.php
│   │       │   ├── b2b-price-control.php
│   │       │   └── woocommerce-overrides.php
│   │       ├── template-parts/
│   │       ├── assets/css/
│   │       │   ├── texhaus-theme.css
│   │       │   └── texhaus-woocommerce.css
│   │       └── assets/js/
│   │           └── texhaus-theme.js
│   └── plugins/
│       └── texhaus-b2b-utils/              # Plugin de utilitários B2B
│           ├── texhaus-b2b-utils.php
│           └── includes/
│               ├── class-b2b-user-roles.php
│               ├── class-b2b-registration.php
│               ├── class-b2b-approval.php
│               ├── class-b2b-price-control.php
│               └── class-b2b-admin.php
└── PROJETO.md                              # Documentação completa
```

## Funcionalidades Principais

- **Cadastro B2B com aprovação manual**: formulário estendido (nome, empresa, CNPJ, e-mail, telefone, cidade, estado, tipo de cliente)
- **Roles personalizadas**: `b2b_pending`, `b2b_approved`, `b2b_rejected`
- **Notificações por e-mail**: admin é notificado de novos cadastros; usuário recebe e-mail quando aprovado
- **Ocultação de preços**: visitantes e usuários não aprovados não veem preços nem botão de compra
- **WhatsApp flutuante**: botão fixo no canto inferior direito
- **Newsletter**: formulário de inscrição com armazenamento no banco de dados
- **Responsivo**: layout adaptável para desktop, tablet e mobile

## Como Usar

1. Instale WordPress + WooCommerce
2. Copie `wp-content/themes/texhaus-b2b/` para `wp-content/themes/` do seu WordPress
3. Ative o tema em Aparência > Temas
4. Copie `wp-content/plugins/texhaus-b2b-utils/` para `wp-content/plugins/`
5. Ative o plugin em Plugins
6. Consulte o arquivo `PROJETO.md` para o checklist completo de implementação
