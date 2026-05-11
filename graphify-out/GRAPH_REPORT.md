# Graph Report - TEXHAUS-B2B  (2026-05-11)

## Corpus Check
- 67 files · ~68,420 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 337 nodes · 669 edges · 25 communities (18 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `de7faec6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `useToast()` - 25 edges
2. `useAuth()` - 23 edges
3. `api()` - 22 edges
4. `Navbar()` - 17 edges
5. `SEO()` - 15 edges
6. `Footer()` - 15 edges
7. `useCart()` - 13 edges
8. `PROJETO TEXHAUS B2B — Documentação Técnica` - 12 edges
9. `API REST — Rotas Completas` - 11 edges
10. `query()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Hero Banner Image` --conceptually_related_to--> `PROJETO.md Complete Project Specification`  [INFERRED]
  src/assets/hero.png → PROJETO.md
- `PROJETO.md Complete Project Specification` --rationale_for--> `AuthContext.tsx - Client Auth Context`  [INFERRED]
  PROJETO.md → src/contexts/AuthContext.tsx
- `PROJETO.md Complete Project Specification` --rationale_for--> `auth.ts - Server JWT Middleware`  [INFERRED]
  PROJETO.md → server/src/middleware/auth.ts
- `AdminClients.tsx - Admin Client Management` --implements--> `B2B Registration & Approval Workflow`  [INFERRED]
  src/components/Admin/AdminClients.tsx → PROJETO.md
- `UserRole Type (Frontend)` --semantically_similar_to--> `Role Type (Server)`  [INFERRED] [semantically similar]
  src/contexts/AuthContext.tsx → server/src/middleware/auth.ts

## Hyperedges (group relationships)
- **B2B Authentication Stack (Client-Middleware-Roles)** — authcontext_file, auth_middleware_file, userrole_type, role_type, b2b_roles_concept [INFERRED 0.80]
- **B2B Approval System (Spec-Implementation-Roles)** — b2b_approval_workflow, adminclients_file, b2b_roles_concept, projetomd_docs [INFERRED 0.80]

## Communities (25 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (52): AdminApprovals(), AdminCategories(), Category, AdminClients(), FilterType, roleBadge, roleLabel, AdminOrders() (+44 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (24): Footer(), Navbar(), ProductResult, SearchBar(), SEO(), SEOProps, useAuth(), useCart() (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (43): API REST — Rotas Completas, Autenticação — `/api/auth`, B2B Price Gating, Banco de Dados (PostgreSQL), Blog — `/api/posts`, Busca de Produtos, Categorias — `/api/categories`, Categorias Hierárquicas (+35 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (18): About, Account, Admin, Blog, BlogPost, Cart, Catalog, Checkout (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (15): AuthRequest, data, normalizedSlug, params, router, data, params, router (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (13): baseProductSchema, blogPostSchema, ContactSubmissionInput, CreateOrderInput, CreateProductInput, LoginInput, mediaUrlSchema, orderItemSchema (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (12): AuthUser, generateToken(), requireAdmin(), requireAuth(), Role, VALID_ROLES, data, router (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (14): AdminClients.tsx - Admin Client Management, auth.ts - Server JWT Middleware, AuthContext.tsx - Client Auth Context, AuthUser Interface, B2B Registration & Approval Workflow, B2B Role System (b2b_pending/b2b_approved/b2b_rejected), Texhaus Favicon SVG, Hero Banner Image (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (10): data, itemParams, itemValues, params, payload, router, shippingAddr, total (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (6): AuthProvider(), CartContext, CartContextType, CartProvider(), ToastProvider(), CartItem

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (8): allowedExtensions, allowedMimes, app, __dirname, __filename, storage, upload, uploadsDir

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (7): data, params, q, router, values, variations, upsertVariationsSchema

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (6): data, decoded, params, router, token, shippingMethodSchema

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (6): data, router, getClient(), pool, query(), contactSubmissionSchema

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (7): apiLimiter, app, corsOptions, envOrigins, PORT, rateLimitMax, rateLimitWindow

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (6): data, decoded, params, router, token, paymentMethodSchema

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (5): code:block1 (├── PROJETO.md                              # Documentação c), Como Usar, Estrutura do Projeto, Funcionalidades Principais, Texhaus B2B - Loja Virtual WordPress + WooCommerce

## Knowledge Gaps
- **174 isolated node(s):** `allowedImageExtensions`, `allowedImageMimes`, `__filename`, `__dirname`, `app` (+169 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `useToast()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `allowedImageExtensions`, `allowedImageMimes`, `__filename` to the rest of the system?**
  _174 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._