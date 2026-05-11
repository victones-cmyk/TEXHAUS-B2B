# PROJETO TEXHAUS B2B — Documentação Técnica

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19, TypeScript, Vite, React Router DOM v7, react-helmet-async |
| **Backend** | Node.js, Express 4, TypeScript |
| **Banco de Dados** | PostgreSQL (conexão via `pg` Pool) |
| **Autenticação** | JWT (jsonwebtoken), bcryptjs, tokens com 7 dias de validade |
| **Validação** | Zod (schemas tipados com inferência TypeScript) |
| **Estilização** | CSS puro com custom properties (fonte Montserrat), sem frameworks |
| **Build** | Vite (frontend), tsc (servidor) |

---

## Estrutura de Diretórios

```
/opt/TEXHAUS/TEXHAUS-B2B/
├── server/
│   └── src/
│       ├── index.ts              # Entry point Express (CORS, rate-limit, rotas)
│       ├── db.ts                 # Pool PostgreSQL + helper query()
│       ├── middleware/
│       │   └── auth.ts           # requireAuth, requireAdmin, generateToken
│       ├── routes/
│       │   ├── auth.ts           # /api/auth (register, login, me, password)
│       │   ├── products.ts       # /api/products (CRUD + search + variations)
│       │   ├── categories.ts     # /api/categories (CRUD hierárquico)
│       │   ├── orders.ts         # /api/orders (criação, listagem, status)
│       │   ├── profiles.ts       # /api/profiles (listagem + alteração de role)
│       │   ├── posts.ts          # /api/posts (blog CRUD)
│       │   ├── contact.ts        # /api/contact (formulário de contato)
│       │   ├── shipping.ts       # /api/shipping-methods (CRUD fretes)
│       │   └── payments.ts       # /api/payment-methods (CRUD pagamentos)
│       ├── utils/
│       │   └── validation.ts     # validatePayload() wrapper Zod
│       └── validators/
│           └── index.ts          # Schemas Zod + tipos TypeScript inferidos
├── src/
│   ├── main.tsx                  # Entry point React (providers)
│   ├── App.tsx                   # Roteamento lazy-loaded (18 rotas)
│   ├── App.css                   # Estilos globais (~3100 linhas)
│   ├── index.css                 # CSS variables + reset + botões base
│   ├── types.ts                  # Product, ProductVariation, CartItem
│   ├── vite-env.d.ts
│   ├── assets/                   # hero.png, logos, favicon
│   ├── lib/
│   │   └── api.ts                # HTTP client genérico (fetch wrapper)
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Autenticação + perfil + roles
│   │   ├── CartContext.tsx        # Carrinho client-side
│   │   └── ToastContext.tsx       # Notificações toast
│   ├── components/
│   │   ├── Navbar.tsx            # Barra de navegação (desktop + mobile)
│   │   ├── Footer.tsx            # Rodapé
│   │   ├── SEO.tsx               # Meta tags via react-helmet-async
│   │   ├── Loading.tsx           # Spinner / skeleton / page loaders
│   │   ├── SearchBar.tsx         # Busca de produtos com dropdown
│   │   └── Admin/
│   │       ├── AdminClients.tsx   # Gestão de clientes B2B (aprovar/rejeitar)
│   │       ├── AdminOrders.tsx    # Gestão de pedidos (trocar status)
│   │       ├── AdminCategories.tsx # CRUD de categorias
│   │       ├── AdminApprovals.tsx  # Dashboard de aprovações pendentes
│   │       ├── AdminProducts.tsx   # CRUD de produtos
│   │       ├── AdminPosts.tsx      # CRUD de posts do blog
│   │       └── ProductModal.tsx    # Modal criar/editar produto
│   └── pages/
│       ├── Home.tsx              # Hero + grid de produtos + diferencais
│       ├── Catalog.tsx           # Catálogo com filtros/busca/ordenação
│       ├── ProductDetail.tsx     # Detalhe do produto + variações + compra
│       ├── Cart.tsx              # Carrinho (B2B-gated)
│       ├── Checkout.tsx          # Finalização de pedido (B2B-gated)
│       ├── Account.tsx           # Minha Conta (perfil, senha, histórico)
│       ├── Login.tsx             # Página de login dedicada
│       ├── Register.tsx          # Formulário de cadastro B2B
│       ├── RegisterSuccess.tsx   # Confirmação de cadastro enviado
│       ├── Admin.tsx             # Painel admin (sub-rotas)
│       ├── About.tsx             # Sobre Nós
│       ├── Contact.tsx           # Formulário de contato
│       ├── Blog.tsx              # Listagem de posts
│       ├── BlogPost.tsx          # Post individual
│       └── Policies.tsx          # 4 páginas de políticas (Privacy, Exchanges, Shipping, Terms)
├── server.js                     # Script de inicialização do servidor
├── package.json
├── tsconfig.json                 # Referências para tsconfig.app.json + tsconfig.node.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── PROJETO.md                    # Este arquivo
```

---

## Banco de Dados (PostgreSQL)

### Tabelas e colunas principais

**`profiles`** — Usuários do sistema (clientes B2B + administradores)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| email | text | Único, usado no login |
| password_hash | text | bcrypt hash |
| full_name | text | Nome completo |
| company_name | text | Razão social / nome fantasia |
| cnpj | text | CNPJ (opcional) |
| phone | text | Telefone/WhatsApp |
| customer_type | text | Tipo de cliente (lojista, arquiteto, etc) |
| city | text | Cidade |
| state | text | UF |
| cep | text | CEP |
| address_street | text | Logradouro |
| address_number | text | Número |
| address_complement | text | Complemento |
| address_neighborhood | text | Bairro |
| role | text | `admin`, `b2b_pending`, `b2b_approved`, `b2b_rejected` |
| created_at | timestamptz | Data de criação |

**`products`** — Produtos do catálogo

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| name | text | Nome do produto |
| sku | text | Código SKU |
| category | text | Categoria (string) |
| price | numeric | Preço unitário |
| stock_quantity | int | Quantidade em estoque |
| image_url | text | Imagem principal |
| images | text | JSON array ou string de URLs adicionais |
| description | text | Descrição completa |
| status | text | `draft` ou `published` |
| created_at | timestamptz | Data de criação |

**`product_variations`** — Variações dos produtos (cores, tamanhos, etc)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| product_id | UUID | FK → products.id |
| name | text | Nome da variação (ex: "Vermelho", "2m") |
| sku | text | SKU específico da variação |
| price_modifier | numeric | Acréscimo/dedréscimo no preço base (default 0) |
| stock_quantity | int | Estoque da variação |
| image_url | text | Imagem específica da variação |
| sort_order | int | Ordem de exibição |

**`categories`** — Categorias hierárquicas

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| name | text | Nome da categoria |
| slug | text | URL slug normalizado |
| parent_id | UUID | FK → categories.id (nulo = raiz) |
| sort_order | int | Ordem de exibição |

**`orders`** — Pedidos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK → profiles.id |
| status | text | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| total | numeric | Valor total |
| customer_name | text | Nome do cliente (snapshot) |
| customer_email | text | Email (snapshot) |
| customer_company | text | Empresa (snapshot) |
| customer_phone | text | Telefone (snapshot) |
| shipping_address | text | Endereço completo montado |
| notes | text | Observações do pedido |
| created_at | timestamptz | Data do pedido |

**`order_items`** — Itens do pedido

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| order_id | UUID | FK → orders.id |
| product_id | text | ID do produto |
| product_name | text | Nome do produto (snapshot) |
| product_sku | text | SKU (snapshot) |
| quantity | int | Quantidade |
| unit_price | numeric | Preço unitário no momento do pedido |

**`posts`** — Blog

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| title | text | Título |
| content | text | Conteúdo completo |
| excerpt | text | Resumo |
| category | text | Categoria do post |
| image_url | text | Imagem de capa |
| created_at | timestamptz | Data de publicação |

**`contact_submissions`** — Formulário de contato

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| name | text | Nome |
| email | text | Email |
| phone | text | Telefone |
| subject | text | Assunto |
| message | text | Mensagem |
| created_at | timestamptz | Data de envio |

**`shipping_methods`** — Métodos de frete

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| name | text | Nome do frete |
| description | text | Descrição |
| price | numeric | Valor do frete |
| regions | text | JSON array de regiões atendidas |
| estimated_days | text | Prazo estimado |
| sort_order | int | Ordem de exibição |
| active | boolean | Ativo/inativo |

**`payment_methods`** — Métodos de pagamento

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| name | text | Nome (Pix, Cartão, Boleto) |
| description | text | Descrição |
| icon | text | Ícone (emoji ou classe) |
| discount_text | text | Texto de desconto (ex: "5% off no Pix") |
| sort_order | int | Ordem de exibição |
| active | boolean | Ativo/inativo |

---

## API REST — Rotas Completas

### Autenticação — `/api/auth`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /register | — | Cadastro B2B. Cria usuário com role `b2b_pending`. Retorna token + user. |
| POST | /login | — | Login com email/senha. Retorna token + user. |
| GET | /me | Bearer | Retorna perfil completo do usuário autenticado. |
| PUT | /password | Bearer | Altera senha (requer senha atual). |

### Produtos — `/api/products`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | / | — | Lista todos os produtos (inclui drafts). |
| GET | /published | — | Lista apenas produtos com status `published`. |
| GET | /search?q= | — | Busca textual (ILIKE em name + description). Apenas published. Limit 20. |
| GET | /:id | — | Detalhe de um produto por UUID. |
| POST | / | Admin | Criar produto. |
| PUT | /:id | Admin | Atualizar produto. |
| DELETE | /:id | Admin | Excluir produto (cascata: exclui variações primeiro). |
| GET | /:id/variations | — | Lista variações de um produto. |
| PUT | /:id/variations | Admin | Upsert de variações (delete-all + re-insert em transação bulk). |

### Categorias — `/api/categories`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | / | — | Lista todas as categorias ordenadas por sort_order. |
| POST | / | Admin | Criar categoria (slug normalizado automaticamente). |
| PUT | /:id | Admin | Atualizar categoria. |
| DELETE | /:id | Admin | Excluir categoria (bloqueado se tiver subcategorias). |

### Pedidos — `/api/orders`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | / | Admin | Lista todos os pedidos. |
| GET | /my | Bearer | Lista pedidos do usuário autenticado. |
| POST | / | Bearer | Criar pedido (transação: insere order + order_items, snapshots de endereço). |
| GET | /:id | Bearer | Detalhe do pedido (admin vê qualquer, user vê só os seus). |
| PUT | /:id/status | Admin | Atualizar status do pedido. |

### Perfis — `/api/profiles`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | / | Admin | Lista todos os perfis (exclui admins). |
| PUT | /:id/role | Admin | Alterar role de um perfil (aprovar/rejeitar B2B). |

### Blog — `/api/posts`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | / | — | Lista todos os posts. |
| GET | /:id | — | Detalhe de um post. |
| POST | / | Admin | Criar post. |
| PUT | /:id | Admin | Atualizar post. |
| DELETE | /:id | Admin | Excluir post. |

### Contato — `/api/contact`

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | / | Envia formulário de contato (salva na tabela `contact_submissions`). |

### Fretes — `/api/shipping-methods`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | / | — | Lista fretes ativos (admin com `?all=true` vê todos). |
| POST | / | Admin | Criar método de frete. |
| PUT | /:id | Admin | Atualizar método de frete. |
| DELETE | /:id | Admin | Excluir método de frete. |

### Pagamentos — `/api/payment-methods`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | / | — | Lista pagamentos ativos (admin com `?all=true` vê todos). |
| POST | / | Admin | Criar método de pagamento. |
| PUT | /:id | Admin | Atualizar método de pagamento. |
| DELETE | /:id | Admin | Excluir método de pagamento. |

### Health Check

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api | `{ status: "ok", message: "Texhaus B2B API" }` |
| GET | /api/health | `{ status: "ok", timestamp: "..." }` |

---

## Sistema de Roles e Autenticação

### Roles

| Role | Permissões |
|------|-----------|
| `admin` | Acesso total: painel admin, CRUD produtos/categorias/posts, aprovar clientes, gerenciar pedidos, ver preços |
| `b2b_pending` | Login permitido, **não vê preços**, não compra. Aguardando aprovação do admin. |
| `b2b_approved` | Login permitido, **vê preços**, pode comprar e fazer checkout. |
| `b2b_rejected` | Login permitido, **não vê preços**, não compra. Cadastro reprovado. |

### Fluxo de Cadastro B2B

```
Visitante → Preenche formulário em /cadastro
         → POST /api/auth/register → role = b2b_pending
         → Redirecionado para /cadastro/sucesso
         → Admin acessa /admin/aprovacoes ou /admin/clientes
         → Admin aprova (b2b_approved) ou rejeita (b2b_rejected)
         → Usuário aprovado faz login e vê preços/pode comprar
```

### Middleware de Autenticação

- **`requireAuth`**: Valida token JWT (`Authorization: Bearer <token>`), extrai `id`, `email`, `role`, valida que role está na lista `VALID_ROLES`. Injeta `req.user`.
- **`requireAdmin`**: Encadeia `requireAuth` e verifica `req.user.role === 'admin'`.
- **`generateToken`**: Gera JWT com payload `{ id, email, role }`, expira em 7 dias.

---

## Frontend — Páginas

### Rotas (React Router)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | Home | Hero banner + grid de produtos publicados + diferencais |
| `/loja` | Catalog | Catálogo com filtros (categoria, busca local, ordenação) |
| `/sobre-nos` | About | Página institucional |
| `/contato` | Contact | Formulário de contato (POST /api/contact) |
| `/blog` | Blog | Listagem de posts do blog |
| `/blog/:id` | BlogPost | Post individual |
| `/produto/:id` | ProductDetail | Detalhe do produto + galeria + variações + compra |
| `/cart` | Cart | Carrinho de compras (gated: só B2B aprovado) |
| `/checkout` | Checkout | Finalização de pedido (gated: só B2B aprovado) |
| `/account` | Account | Minha Conta: perfil, alterar senha, histórico de pedidos |
| `/admin/*` | Admin | Painel administrativo com sub-rotas internas |
| `/cadastro` | Register | Formulário de cadastro B2B completo |
| `/cadastro/sucesso` | RegisterSuccess | Confirmação de envio do cadastro |
| `/login` | Login | Página de login |
| `/politica-de-privacidade` | Privacy | Política de privacidade (LGPD) |
| `/trocas-e-devolucoes` | Exchanges | Política de trocas e devoluções |
| `/politica-de-envios` | Shipping | Política de envios |
| `/termos-e-condicoes` | Terms | Termos e condições |

Todas as páginas usam lazy loading com `<Suspense fallback={<Loading />}>`.

### Contextos (State Management)

| Contexto | Hook | Responsabilidade |
|----------|------|-----------------|
| `AuthContext` | `useAuth()` | Login/logout, perfil, roles, `isAdmin`, `isB2BApproved`, `isLoggedIn` |
| `CartContext` | `useCart()` | Carrinho client-side, agrupamento produto+variação, `total`, `itemCount` |
| `ToastContext` | `useToast()` | Notificações toast (success/error/info), auto-dismiss 3.5s |

### Componentes Compartilhados

| Componente | Descrição |
|-----------|-----------|
| `Navbar` | Barra fixa com logo, links, busca, carrinho, login modal, menu mobile |
| `Footer` | Rodapé com links, contato, copyright |
| `SEO` | Meta tags via react-helmet-async (title, description, og:image, twitter) |
| `Loading` | 3 modos: spinner (simples), skeleton (cards), page (blocos de texto) |
| `SearchBar` | Input de busca com debounce (300ms), dropdown de resultados, navegação ao clicar |

### Componentes Admin

| Componente | Descrição |
|-----------|-----------|
| `AdminClients` | Tabela de clientes B2B, filtro por role, botões aprovar/rejeitar |
| `AdminOrders` | Tabela de pedidos, troca de status, visualização de itens |
| `AdminCategories` | CRUD de categorias (nome, slug, parent_id) com hierarquia visual |
| `AdminApprovals` | Dashboard de aprovações pendentes com ações em lote |
| `AdminProducts` | CRUD de produtos com modal (ProductModal) |
| `AdminPosts` | CRUD de posts do blog |
| `ProductModal` | Modal reutilizável para criar/editar produto (formulário completo) |

---

## Configuração do Servidor

### Variáveis de Ambiente (`server/.env`)

| Variável | Descrição | Default |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `5100` |
| `DATABASE_URL` | String de conexão PostgreSQL | — (obrigatório) |
| `JWT_SECRET` | Segredo para assinatura JWT | — (obrigatório) |
| `ALLOWED_ORIGINS` | Origens CORS (separadas por vírgula) | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Janela do rate limiter (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Máximo de requisições por janela | `100` |

### Segurança

- **Rate Limiting**: 100 requisições por 15 minutos em todas as rotas `/api`. Mensagem em português. Método OPTIONS é ignorado.
- **CORS**: Origens configuráveis via env `ALLOWED_ORIGINS`. Credenciais habilitadas.
- **JWT**: Tokens assinados com `JWT_SECRET`, expiram em 7 dias. Payload validado com `VALID_ROLES` set.
- **Senhas**: Hash bcrypt com 10 rounds. Nunca retornadas nas queries (coluna `password_hash` é excluída dos SELECTs de perfil).
- **Body Parser**: `express.json({ limit: '10mb' })` para upload de imagens em base64.

---

## Scripts npm

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento Vite (frontend) |
| `npm run build` | `tsc -b && vite build` — compila TypeScript + build de produção |
| `npm start` | `node server.js` — inicia servidor Express em produção |
| `npm run lint` | `eslint .` — linting do código |
| `npm run preview` | `vite preview` — preview do build de produção |

O servidor Express é iniciado separadamente com `npm start` (roda em `/server.js` que carrega `server/src/index.ts` compilado).

---

## UI/UX — Convenções de Estilo

### Cores (CSS Custom Properties)

| Variável | Valor | Uso |
|----------|-------|-----|
| `--color-primary` | `#1a1a1a` | Textos principais, botões outline |
| `--color-primary-dark` | `#000000` | — |
| `--color-accent` | `#c8a86e` | Cor dourada de destaque (botões, links, badges) |
| `--color-accent-hover` | `#b8954d` | Hover do accent |
| `--color-text` | `#333333` | Texto corpo |
| `--color-text-light` | `#666666` | Texto secundário |
| `--color-bg` | `#ffffff` | Fundo principal |
| `--color-bg-light` | `#f8f8f8` | Fundo alternativo |
| `--color-bg-dark` | `#1a1a1a` | Fundo escuro |
| `--color-border` | `#e5e5e5` | Bordas |
| `--color-error` | `#f44336` | Erro (logout button) |

### Tipografia

- Fonte principal: Montserrat (Google Fonts) com fallback para system fonts
- Headings: `font-weight: 600`, `line-height: 1.2`, uppercase em títulos
- Botões: `0.85rem`, uppercase, `letter-spacing: 1px`, `font-weight: 600`

### Classes de Botão

| Classe | Aparência |
|--------|-----------|
| `.btn-primary` | Fundo accent, texto branco, hover inverte (outline) |
| `.btn-secondary` | Outline com cor primary, hover preenche |
| `.cadastro-link` | Outline com cor accent (exclusivo da navbar) |

---

## Funcionalidades Implementadas

### Busca de Produtos
- Endpoint `GET /api/products/search?q=termo` (ILIKE em name + description)
- Componente `SearchBar` com debounce 300ms, dropdown de resultados com imagem
- Teclado: Enter seleciona primeiro resultado, Escape fecha
- Clique fora fecha dropdown
- Presente no menu desktop e mobile

### B2B Price Gating
- Preços visíveis apenas para `b2b_approved` e `admin`
- Usuários não logados veem overlay "Área Restrita" nos produtos
- Usuários `b2b_pending` veem mensagem "Aguardando aprovação"
- Carrinho e checkout bloqueados para não-aprovados

### Produtos com Variações
- Cada produto pode ter múltiplas variações (cor, tamanho, etc.)
- Cada variação tem: nome, SKU, price_modifier, estoque próprio, imagem
- Seletor de variação na página de produto
- Carrinho agrupa por combinação produto+variação

### Sistema de Pedidos
- Criação com transação PostgreSQL (BEGIN/COMMIT/ROLLBACK)
- Snapshots de dados do cliente e endereço no momento do pedido
- Status workflow: pending → confirmed → shipped → delivered / cancelled
- Admin pode trocar status, usuário vê seus próprios pedidos

### Categorias Hierárquicas
- Suporte a parent_id para subcategorias
- Slug normalizado automaticamente (lowercase, espaços → hifens)
- Proteção contra exclusão de categorias com filhos
- Exibição hierárquica na página de catálogo

### Upload de Arquivos
- Suporte via multer no backend (`server/src/upload.ts`)
- Extensões permitidas: jpg, jpeg, png, gif, webp, svg, pdf
- Diretório `uploads/` servido estaticamente

---

## Observações para Desenvolvimento Futuro

1. **TypeScript estrito**: O projeto usa `tsc -b` com project references. O build falha em qualquer erro de tipo. Sempre rode `npm run build` antes de commitar.
2. **CSS em App.css**: Todos os estilos (exceto reset e botões base) estão em `src/App.css` (~3100 linhas). Não há CSS modules ou frameworks.
3. **Lazy loading**: Todas as páginas são lazy-loaded. Adicionar nova página requer atualizar `App.tsx`.
4. **Admin sub-rotas**: O componente `Admin` usa `Routes` interno com sub-rotas. Ver `src/pages/Admin.tsx` para a estrutura.
5. **API Client**: `src/lib/api.ts` é um wrapper genérico que auto-anexa token Bearer. Use `api<T>(path, options)` para todas as chamadas.
6. **Validação**: Servidor usa Zod com `validatePayload()`. Schemas em `server/src/validators/index.ts`. Tipos TypeScript inferidos dos schemas.
7. **Banco de Dados**: Conexão via `pg.Pool` em `server/src/db.ts`. Use `query()` para queries simples, `getClient()` para transações.
8. **Rate Limiting**: Configurável via env. Padrão: 100 req / 15 min. Aplica-se a todas as rotas `/api`.
9. **Graph do Projeto**: O diretório `graphify-out/` contém um knowledge graph do código (281 nós, 613 arestas, 22 comunidades). Leia `graphify-out/GRAPH_REPORT.md` para navegação rápida entre módulos.
