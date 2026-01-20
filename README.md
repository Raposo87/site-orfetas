# VoucherHub — Documentação Completa do Projeto

**Última atualização:** 20 de janeiro de 2026

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura Geral](#arquitetura-geral)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Detalhes de Cada Arquivo](#detalhes-de-cada-arquivo)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Dados e Configuração](#dados-e-configuração)
8. [Funcionalidades Principais](#funcionalidades-principais)
9. [Sistema de Admin](#sistema-de-admin)
10. [Internacionalização (i18n)](#internacionalização-i18n)
11. [SEO](#seo)
12. [Backend](#backend)
13. [Como Adicionar Parceiro](#como-adicionar-parceiro)
14. [Deploy e Produção](#deploy-e-produção)
15. [Troubleshooting](#troubleshooting)

---

## 📱 Visão Geral

## 📱 Visão Geral

**VoucherHub** é uma aplicação web moderna que conecta usuários a experiências exclusivas em Portugal (aulas de surf, tours, yoga, terapias, moda, cicloturismo, etc.) com **códigos promocionais exclusivos** e **vouchers digitais**.

### Objetivo Principal

- Listar experiências e serviços em diferentes categorias
- Fornecer códigos promocionais para uso nos sites dos parceiros
- Gerenciar vouchers digitais pós-compra
- Sistema de administração para gestão de stock e relatórios

### Público-alvo

- **Usuários finais:** Pessoas em Portugal procurando experiências com desconto
- **Parceiros:** Prestadores de serviço que querem alcançar mais clientes
- **Admin:** Gerentes do VoucherHub que controlam stock, relatórios e dados

---

## 🏗️ Arquitetura Geral

A aplicação segue uma arquitetura **cliente-servidor separada**:

```
┌─────────────────────────────────────────────────────────────┐
│                        USUÁRIO FINAL                        │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌────────────────────────┐
│   FRONTEND       │    │   BACKEND (Railway)    │
│  (HTML/CSS/JS)   │◄──►│ (Node.js + Express)    │
│                  │    │ (SQLite Database)      │
│ - Home Page      │    │                        │
│ - Categories     │    │ - Payment Processing   │
│ - Partner Pages  │    │ - Voucher Management   │
│ - Admin Panel    │    │ - Email Service        │
│ - Validation     │    │ - Analytics            │
└──────────────────┘    └────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Camada                  | Tecnologias                           |
| ----------------------- | ------------------------------------- |
| **Frontend**            | HTML5, CSS3, JavaScript (Vanilla)     |
| **Internacionalização** | i18n.js + translations.json (PT/EN)   |
| **Imagens**             | Cloudinary (URLs em JSON)             |
| **Backend**             | Node.js + Express                     |
| **Database**            | SQLite (schema.sql)                   |
| **Pagamentos**          | Stripe (integrado via buy.js)         |
| **Email**               | Nodemailer/serviço configurável       |
| **Deploy**              | Railway (CNAME: site-orfetas)         |
| **Versionamento**       | Git + GitHub                          |
| **SEO**                 | Meta tags dinâmicas, JSON-LD, Sitemap |

---

## 📁 Estrutura de Pastas

```
site-orfetas/
├── 📄 index.html                 # Página inicial (home)
├── 📄 experience.html            # Página de categoria/experiência
├── 📄 partner.html               # Página detalhes do parceiro
├── 📄 validate.html              # Página validação de vouchers
├── 📄 success.html               # Confirmação após compra
├── 📄 connect-success.html       # (Redireciona após OAuth)
├── 📄 admin.html                 # Dashboard admin (stock, relatórios)
├── 📄 admin-painel.html          # Painel parceiro/onboarding
│
├── 📄 style.css                  # Estilos globais (principal)
├── 📄 i18n-styles.css           # Estilos específicos i18n
│
├── 🔧 script.js                  # Lógica global (UI, utilitários)
├── 🔧 i18n.js                    # Gerenciador de idiomas
├── 🔧 experience.js              # Renderização de categorias
├── 🔧 partner.js                 # Renderização página parceiro
├── 🔧 buy.js                     # Fluxo de compra/pagamento
│
├── 📊 experiences.json           # Catálogo (categorias + parceiros)
├── 📊 translations.json          # Traduções (PT/EN)
│
├── 📍 sitemap.xml                # Mapa do site (SEO)
├── 📍 robots.txt                 # Instruções para crawlers
├── 🔐 CNAME                      # Domain pointing (Railway)
├── 🎨 favcon.png / logo.png      # Ícones
│
├── 📦 package.json               # Dependências NPM
├── 📋 README.md                  # Este arquivo
│
└── partner/
    └── 📄 onboarding-refresh.html # Onboarding de parceiros
```

---

## 📄 Detalhes de Cada Arquivo

### HTML (Páginas)

#### **index.html** - Página Inicial

- **Função:** Apresentar VoucherHub, mostrar categorias destacadas
- **Componentes:**
  - Hero section com call-to-action
  - Grid de categorias (cards com link para `experience.html`)
  - Cards de parceiros em destaque (featured)
  - FAQ section
  - Footer com links e contato
  - Navbar responsiva
- **Scripts carregados:** `script.js`, `i18n.js`
- **Dados:** Puxa de `experiences.json` dinamicamente via `script.js`

#### **experience.html** - Página de Categoria

- **Função:** Listar todos os parceiros de uma categoria específica
- **URL Pattern:** `experience.html?slug=surf` (ex: surf, yoga, moda, etc.)
- **Componentes:**
  - Breadcrumb com categoria atual
  - Grid de cards de parceiros
  - Cada card contém: imagem (carrossel), nome, local, desconto, botão "Ver Detalhes"
  - Meta tags dinâmicas (SEO)
  - JSON-LD structured data
- **Script responsável:** `experience.js`
- **Dados:** Carregados de `experiences.json`

#### **partner.html** - Página do Parceiro

- **Função:** Mostrar detalhes completos de um parceiro
- **URL Pattern:** `partner.html?slug=partner-unique-slug`
- **Componentes:**
  - Galeria de imagens com carrossel
  - Nome, local, contato (email, phone, Instagram)
  - Descrição curta e completa
  - Lista de ofertas com preços (original vs desconto)
  - Botão "Comprar" por oferta (abre modal)
  - Mapa de localização (se implementado)
- **Script responsável:** `partner.js`
- **Modal de Compra:** Criado dinamicamente em `partner.js`, processado em `buy.js`

#### **validate.html** - Validação de Vouchers

- **Função:** Parceiros validam vouchers entrados por clientes
- **Componentes:**
  - Campo de entrada de código
  - Botão "Validar Voucher"
  - Exibição de status (✅ Válido, ⚠️ Expirado, ❌ Usado)
  - Informações do voucher (partner, valor, data expiração)
- **Script responsável:** Integrado no arquivo (fetch para `/api/vouchers/validate`)
- **Backend:** Conecta a `/api/vouchers/validate` (POST)

#### **success.html** - Confirmação de Compra

- **Função:** Página de confirmação após pagamento bem-sucedido
- **Componentes:**
  - Mensagem de sucesso
  - Informações do voucher
  - Instruções de uso
  - Link para download/print voucher
  - Link de volta à home

#### **admin.html** - Painel Administrativo

- **Função:** Gerenciar stock de vouchers e auditar transferências
- **Componentes:**
  1. **Seção "Gestão de Stock":**
     - Campo para adicionar novo limite (slug, oferta, quantidade)
     - Tabela de stock existente (editar quantidades inline)
     - Botão "Atualizar" por linha
  2. **Seção "Auditoria de Repasses":**
     - Botão "Verificar Falhas de Pagamento"
     - Exibe lista de vouchers com erro de transferência
- **Endpoints conectados:**
  - `GET /api/admin/stock-list` (carrega stocks)
  - `POST /api/admin/update-stock` (atualiza quantidade)
  - `GET /api/admin/audit-transfers` (falhas de pagamento)

#### **admin-painel.html** - Painel de Parceiro

- **Função:** Onboarding e gerenciamento de dados de parceiro
- **Componentes:**
  - Formulário de setup de parceiro
  - Campos: nome, slug, imagens, ofertas, contato
  - Validação e integração com backend (`/api/admin/setup-partner`)

### CSS (Estilos)

#### **style.css** - Folha de Estilos Principal

- **Tamanho:** ~2000 linhas
- **Estrutura:**
  1. **Variáveis CSS:** Cores, sombras, bordas, espaçamentos
     - `--primary-blue`, `--secondary-orange`, `--success`, `--error`, etc.
     - `--shadow-lg`, `--radius-lg`, etc.
  2. **Reset e Tipografia:** Body, headings, links
  3. **Layout:** Navbar, containers, grids
  4. **Componentes:** Buttons, cards, modals, forms
  5. **Responsividade:** Media queries para mobile/tablet/desktop
  6. **Animações:** Transições, keyframes (fade, slide, pulse)
  7. **Specific Pages:** Estilos para experience.html, partner.html, etc.

#### **i18n-styles.css** - Estilos de Internacionalização

- Ajustes de layout para RTL (se suportado)
- Estilos específicos de traduções

### JavaScript (Lógica)

#### **script.js** - Arquivo Principal (~630 linhas)

- **Funções Globais:**
  - `Utils.debounce()` - Debounce para eventos
  - `Utils.observeElements()` - Lazy loading com Intersection Observer

- **Classes:**
  1. **CarouselManager** - Controla carrosséis de imagens
     - `initCarousel(card, images)` - Inicia carrossel
     - `goToSlide(carousel, index)` - Va para slide específico
     - `nextSlide()` / `prevSlide()` - Navegação

  2. **PromoCodeManager** - Gerencia códigos promocionais
     - `showCode(button, code)` - Revela código ao clicar
     - `copyCode(code)` - Copia código para clipboard
     - `showToast(message, type)` - Notificações
     - `trackEvent(eventName, properties)` - Analytics (Google Tag Manager)
     - `saveToStorage()` / `loadFromStorage()` - LocalStorage persistência

  3. **NavigationManager** - Controla navbar e scroll
     - `handleScroll()` - Esconde/mostra navbar ao rolar
     - `setupSmoothScroll()` - Scroll suave para âncoras

  4. **PerformanceManager** - Otimizações e preload
     - Preload de fonts
     - Lazy loading de imagens

  5. **SearchManager** - Barra de busca global
     - Busca em tempo real entre parceiros
     - Envia analytics para `/api/analytics/search`
     - Suporta search avançado (bike, passeio, terapias, etc.)

- **Inicialização Global:**
  - Ao DOMContentLoaded, instancia todas as classes
  - Configura observers, event listeners, modal handlers

#### **i18n.js** - Sistema de Internacionalização

- **Funcionalidade:**
  - Detecta idioma do navegador (fallback: português)
  - Permite forçar idioma via `?lang=en` ou localStorage
  - Substitui textos em elementos HTML com `data-i18n="chave"`
  - Suporta chaves aninhadas: `data-i18n="footer.disclaimer"`

- **Métodos principais:**
  - `switchLanguage(lang)` - Muda idioma
  - `getNestedTranslation(obj, key)` - Acessa traduções aninhadas
  - Carrega `translations.json` automaticamente

#### **experience.js** - Renderização de Categorias

- **Fluxo:**
  1. Pega slug da URL (`?slug=surf`)
  2. Aguarda i18n estar pronto
  3. Carrega `experiences.json`
  4. Encontra mode correspondente ao slug
  5. Renderiza todos os parceiros em um grid

- **Principais funções:**
  - `updatePageContent()` - Atualiza título, descrição, breadcrumb
  - `renderCards()` - Cria cards para cada parceiro
  - `getStockInfo()` - Busca stock do backend (nova)
  - Carrossel de imagens automático
  - Escuta mudanças de idioma e re-renderiza

- **Nova funcionalidade (Stock):**
  - Busca em `/api/admin/stock-list` após renderizar
  - Exibe barra de progresso se `stock_remaining <= stock_limit`
  - Mostra "🔥 Apenas X disponíveis!" se <= 20%

#### **partner.js** - Página do Parceiro (~400 linhas)

- **Fluxo:**
  1. Extrai `slug` da URL
  2. Carrega `experiences.json`
  3. Encontra parceiro pelo slug
  4. Renderiza galeria, dados, ofertas

- **Principais funções:**
  - `openBuyModal(offerData)` - Cria modal de compra dinamicamente
  - Modal contém: email, sponsor code, preço dinâmico
  - Handlers para fechar modal, validações

- **Integração com buy.js:**
  - Modal prepara dados (`data-slug`, `data-price`, `data-offerName`)
  - Clique em "Comprar" dispara `buy.js`

#### **buy.js** - Fluxo de Pagamento (~97 linhas)

- **Fluxo Completo:**
  1. Usuário clica "Comprar" no modal
  2. Script pede email (prompt)
  3. Script pede código de patrocinador opcional (prompt)
  4. Faz POST para `/api/payments/create-checkout-session`
  5. Backend retorna URL de checkout Stripe
  6. Redireciona para Stripe Checkout
  7. Após pagamento, redireciona para `success.html`

- **Principais funções:**
  - Validação de email
  - Cálculo de preço (com desconto)
  - POST para backend com dados do voucher
  - Tratamento de erros com alertas

### JSON (Dados)

#### **experiences.json** - Catálogo Completo (~740 linhas)

- **Estrutura raiz:** `{ modes: [...] }`

- **Cada `mode` (categoria):**

  ```json
  {
    "slug": "surf",
    "title": "Aulas de Surf",
    "badge": "Esportes Aquáticos",
    "description": "Escolha uma escola de surf...",
    "partners": [...]
  }
  ```

- **Cada `partner` (prestador):**

  ```json
  {
    "slug": "surf-wave-lisbon",
    "name": "Surf Wave Lisbon",
    "location": "Costa da Caparica",
    "price_original": "€30",
    "price_discount": "€25,50",
    "savings": "Economize €4,50",
    "discount_label": "15% OFF",
    "discount_percent": 15,
    "code": "RAPOSO15",
    "official_url": "https://...",
    "email": "contact@...",
    "phone": "+351 ...",
    "instagram": "https://instagram.com/...",
    "images": ["https://...", ...],
    "icon": "fas fa-water",
    "offers": [
      {
        "title": "Aula de Surf",
        "text": "Descrição...",
        "price": 30.00
      }
    ],
    "story_short": "Resumo...",
    "story_full": "História completa..."
  }
  ```

- **Categorias atuais:** Surf, Yoga, Tours, Terapias, Moda, Bike, Kitesurf, Quad, Tours Aquáticos

#### **translations.json** - Traduções (~200+ linhas)

- **Estrutura:**

  ```json
  {
    "pt": { ... },
    "en": { ... }
  }
  ```

- **Seções principais:**
  - `home.*` - Textos da home
  - `experiencePage.*` - Textos de categorias
  - `partnerPage.*` - Textos de parceiros
  - `footer.*` - Footer e disclaimer
  - `toast.*` - Notificações
  - Mais...

- **Uso:** `data-i18n="home.heroTitle"` substitui pelo valor em `translations.json`

### Outros Arquivos

#### **sitemap.xml** - Mapa do Site (SEO)

- Lista todas as URLs da aplicação
- Inclui: home, cada categoria (experience.html?slug=X), cada parceiro (partner.html?slug=X)
- Formato XML padrão para crawlers

#### **robots.txt** - Instruções para Crawlers

- Permite indexação de páginas públicas
- Pode desabilitar acesso a admin pages

#### **CNAME** - Domain Pointing

- Contém: `site-orfetas` (pointing para Railway)
- Usado para custom domain

#### **package.json** - Dependências

```json
{
  "name": "voucherhub-frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "npx serve ."
  },
  "dependencies": {
    "serve": "^14.2.0"
  }
}
```

- Comando: `npm start` inicia servidor na porta 5000

---

## 🔄 Fluxo de Dados

### Fluxo 1: Navegação e Visualização

```
Usuário acessa home (index.html)
    │
    ├─► script.js carrega experiences.json
    │
    ├─► Renderiza cards de categorias
    │
    └─► Usuário clica em categoria "Surf"
        │
        └─► Redireciona para experience.html?slug=surf
            │
            ├─► experience.js carrega experiences.json
            │
            ├─► Encontra mode com slug="surf"
            │
            ├─► Busca stock info do backend (/api/admin/stock-list)
            │
            ├─► Renderiza todos os parceiros (cards)
            │   - Mostra barra de stock se disponível
            │
            └─► Usuário clica "Ver Detalhes"
                │
                └─► Redireciona para partner.html?slug=surf-wave-lisbon
                    │
                    ├─► partner.js carrega experiences.json
                    │
                    ├─► Encontra parceiro pelo slug
                    │
                    ├─► Renderiza: galeria, info, ofertas
                    │
                    └─► Usuário clica "Comprar"
                        │
                        └─► partner.js abre modal de compra
                            - Preenche dados de oferta
                            - Aguarda email + sponsor code
                            └─► Clique final de "Comprar"
                                │
                                └─► buy.js executa
```

### Fluxo 2: Pagamento e Criação de Voucher

```
buy.js executa
    │
    ├─► Valida email
    │
    ├─► Recupera dados da oferta (slug, nome, preço)
    │
    ├─► POST para /api/payments/create-checkout-session
    │   Body: {
    │     partner_slug, offer_name, price, email, sponsorCode
    │   }
    │
    └─► Backend processa:
        │
        ├─► Valida dados
        │
        ├─► Cria session Stripe
        │
        ├─► Cria registro em DB: vouchers table
        │   - status: "pending"
        │   - email, partner, oferta, código gerado
        │
        ├─► Envia email para usuário com código voucher
        │
        ├─► Retorna URL de checkout Stripe
        │
        └─► Frontend redireciona para Stripe
            │
            └─► Usuário completa pagamento
                │
                └─► Stripe webhook chama /api/webhooks/stripe
                    │
                    ├─► Backend atualiza status para "completed"
                    │
                    ├─► Registra pagamento em payments table
                    │
                    └─► Redireciona para success.html
```

### Fluxo 3: Validação (Parceiro)

```
Parceiro acessa validate.html
    │
    ├─► Insere código voucher
    │
    ├─► Clica "Validar Voucher"
    │
    └─► POST para /api/vouchers/validate
        Body: { code: "ABC123XYZ" }
        │
        └─► Backend:
            │
            ├─► Procura voucher no DB por código
            │
            ├─► Verifica status (pending, completed, expired, used)
            │
            ├─► Se completo: marca como "used", registra hora
            │
            └─► Retorna resposta JSON:
                {
                  status: "valid" | "expired" | "used" | "invalid",
                  partner: "...",
                  offer: "...",
                  amount: "...",
                  expirationDate: "..."
                }
                │
                └─► Frontend renderiza status visual
```

---

## 📊 Dados e Configuração

### Estrutura de modes (Categorias)

Atualmente existem 8 categorias em `experiences.json`:

| Slug          | Título            | Badge              | Descrição            |
| ------------- | ----------------- | ------------------ | -------------------- |
| surf          | Aulas de Surf     | Esportes Aquáticos | Escolas de surf      |
| yoga          | Aulas de Yoga     | Bem-estar          | Estúdios de yoga     |
| tour          | Tours Guiados     | Turismo Cultural   | Tours pela cidade    |
| wellness      | Saúde & Bem-estar | Terapias           | Terapias e massagens |
| moda          | Moda e Vestuário  | Estilo de Vida     | Lojas de roupa       |
| bike          | Cicloturismo      | Desporto           | Tours de bicicleta   |
| kitesurf      | Kitesurf          | Esportes Aquáticos | Aulas de kitesurf    |
| quad          | Passeios de Quad  | Aventura           | Quads e veículos     |
| tour-aquatico | Tours Aquáticos   | Náutica            | Barcos e vela        |

### Variáveis de Configuração Globais

No `buy.js`:

```javascript
// Backend API
const BACKEND_URL = "https://voucherhub-backend-production.up.railway.app";
const CREATE_CHECKOUT_URL = `${BACKEND_URL}/api/payments/create-checkout-session`;
```

No `validate.html`:

```javascript
const API_BASE =
  "https://voucherhub-backend-production.up.railway.app/api/vouchers";
```

No `admin.html`:

```javascript
const API_BASE =
  "https://voucherhub-backend-production.up.railway.app/api/admin";
```

---

## ⚙️ Funcionalidades Principais

### 1. **Catálogo de Experiências**

- ✅ 8 categorias + 50+ parceiros
- ✅ Cada parceiro: imagens, ofertas, preços, contato
- ✅ Carrossel de imagens por parceiro
- ✅ Descrições curtas e completas

### 2. **Códigos Promocionais**

- ✅ Código único por oferta (campo `code`)
- ✅ Botão para revelar código com efeito visual
- ✅ Cópia automática para clipboard
- ✅ Analytics: rastreia revelações e cópias

### 3. **Sistema de Vouchers**

- ✅ Geração automática após compra
- ✅ Validação por código
- ✅ Status: pending, completed, expired, used
- ✅ Expiração automática (8 meses / 240 dias)

### 4. **Pagamento Integrado**

- ✅ Stripe Checkout integration
- ✅ Modal de compra com email e sponsor code
- ✅ Confirmação de pagamento
- ✅ Email automático com voucher

### 5. **Sistema de Stock** (novo)

- ✅ Gestão de quantidade limitada por oferta
- ✅ Exibição visual (barra de progresso)
- ✅ Alerta urgente quando stock baixo (<=20%)
- ✅ Atualização em tempo real do frontend

### 6. **Multi-idioma**

- ✅ Suporte PT e EN
- ✅ Detecção automática de idioma
- ✅ Botão para trocar idioma
- ✅ Persistência em localStorage

### 7. **SEO Otimizado**

- ✅ Meta tags dinâmicas por página
- ✅ Open Graph (para compartilhamento social)
- ✅ JSON-LD structured data (Schema.org)
- ✅ Sitemap e robots.txt
- ✅ Canonical URLs

### 8. **Responsividade**

- ✅ Mobile-first design
- ✅ Breakpoints: 480px, 768px, 1024px, 1440px
- ✅ Navbar colapsível
- ✅ Cards adaptáveis

### 9. **Performance**

- ✅ Lazy loading de imagens
- ✅ Intersection Observer para animações
- ✅ Debounce em event listeners
- ✅ Preload de fonts

### 10. **Analytics**

- ✅ Google Tag Manager integration
- ✅ Rastreamento de: revelação de código, cópia, cliques
- ✅ Busca com analytics (termo + localização + device)

---

## 🛡️ Sistema de Admin

### admin.html - Dashboard Admin

**Funcionalidade 1: Gestão de Stock**

- **Campo de entrada:** slug do parceiro, título da oferta, quantidade
- **Ação "Definir":** POST para `/api/admin/update-stock` cria novo stock
- **Tabela dinâmica:** Lista todos os stocks existentes
- **Edição inline:** Pode modificar quantidade diretamente na tabela
- **Atualizar:** Salva mudanças para backend

**Funcionalidade 2: Auditoria de Repasses**

- **Botão "Verificar Falhas":** GET `/api/admin/audit-transfers`
- **Exibição:** Lista vouchers com erro de transferência bancária
- **Informação:** Código do voucher, mensagem de erro, status

**Endpoints Admin:**

- `GET /api/admin/stock-list` → Lista todos os stocks
- `POST /api/admin/update-stock` → Atualiza quantidade
- `GET /api/admin/audit-transfers` → Falhas de pagamento

### admin-painel.html - Onboarding Parceiro

**Funcionalidade: Setup de Parceiro**

- **Formulário:** Dados completos do parceiro
- **Campos:** nome, slug, imagens, ofertas, contato, etc.
- **Integração:** POST para `/api/admin/setup-partner`
- **Validação:** Verificação de campos obrigatórios

---

## 🌐 Internacionalização (i18n)

### Como Funciona

1. **Carregamento automático:**
   - `i18n.js` detecta idioma do navegador (fallback: PT)
   - Permite forçar via `?lang=en` na URL ou localStorage

2. **Substituição de textos:**
   - HTML: `<span data-i18n="home.heroTitle">Padrão</span>`
   - JS: Ao carregar, substitui pelo valor em `translations.json`

3. **Chaves aninhadas:**

   ```
   translations.json:
   {
     "pt": {
       "home": {
         "heroTitle": "Bem-vindo ao VoucherHub"
       }
     }
   }

   HTML: <span data-i18n="home.heroTitle">
   ```

### Estrutura de translations.json

```json
{
  "pt": {
    "home": {
      "navBrand": "VoucherHub",
      "heroTitle": "Descubra Experiências Incríveis",
      "searchPlaceholder": "Procure uma experiência..."
    },
    "experiencePage": {
      "notFound": "Categoria não encontrada",
      "offers": "oferta",
      "offersPlural": "ofertas"
    },
    "footer": {
      "disclaimer": "VoucherHub não é responsável...",
      "contact": "Contacto",
      "terms": "Termos de Utilização"
    }
  },
  "en": {
    "home": {
      "navBrand": "VoucherHub",
      "heroTitle": "Discover Amazing Experiences"
    }
    // ... mais chaves
  }
}
```

### Adicionar Nova Chave de Tradução

1. Abrir `translations.json`
2. Adicionar chave em `pt` e `en`:
   ```json
   "myNewKey": "Meu novo texto"
   ```
3. No HTML/JS, usar:
   ```html
   <span data-i18n="section.myNewKey">Fallback</span>
   ```

---

## 📈 SEO

### Meta Tags Dinâmicas

**Em `experience.js`:**

```javascript
ensureMeta(
  "description",
  `${mode.title} in Portugal with exclusive discount codes...`,
);
ensureMeta("keywords", `${mode.title}, Portugal coupon codes...`);
```

**Em `partner.js`:**

```javascript
document.title = `${partner.name} – ${mode.title} – VoucherHub`;
ensureMeta("og:title", partner.name);
ensureMeta("og:image", partner.images[0]);
```

### Open Graph (Social Sharing)

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:url" content="..." />
<meta property="og:type" content="website" />
```

### JSON-LD Structured Data

Em `experience.js`:

```javascript
const offers = mode.partners.map((p) => ({
  "@context": "https://schema.org",
  "@type": "Offer",
  name: `${p.name} – ${mode.title}`,
  priceCurrency: "EUR",
  price: "25.50",
  url: p.official_url,
  seller: { "@type": "LocalBusiness", name: p.name },
}));
```

### Sitemap e Robots

**sitemap.xml:**

- Inclui home
- Inclui cada categoria (experience.html?slug=...)
- Inclui cada parceiro (partner.html?slug=...)
- Lastmod e changefreq inclusos

**robots.txt:**

```
User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /admin-painel.html
```

---

## 🚀 Backend

Localizado em pasta separada: `voucherhub-backend/`

### Tabelas Principais (schema.sql)

**vouchers**

```sql
id, code, partner_slug, offer_name, email, status,
validity_days, created_at, expires_at, used_at
```

**payments**

```sql
id, voucher_id, amount, currency, stripe_session_id,
status, created_at, transferred_at, transfer_error_msg
```

### Endpoints Principais

| Método | Rota                                    | Descrição                 |
| ------ | --------------------------------------- | ------------------------- |
| POST   | `/api/payments/create-checkout-session` | Cria session Stripe       |
| POST   | `/api/vouchers/validate`                | Valida voucher por código |
| GET    | `/api/admin/stock-list`                 | Lista stocks              |
| POST   | `/api/admin/update-stock`               | Atualiza quantidade       |
| GET    | `/api/admin/audit-transfers`            | Falhas de pagamento       |
| POST   | `/api/analytics/search`                 | Registra buscas           |

### Email Service

Em `src/utils/sendEmail.js`:

- Integração com Nodemailer
- Template HTML para voucher
- Destinatário: usuário final (email fornecido)
- Cópia: admin@voucherhub.pt (opcional)

---

## ➕ Como Adicionar Parceiro

### Passo 1: Preparar Dados

Obter do parceiro:

- Nome da empresa
- Slug único (ex: "meu-parceiro-xyz")
- Localização (ex: "Lisboa, Portugal")
- Logo/Imagens (URLs públicas ou via Cloudinary)
- Preço original e desconto
- % de desconto
- Código promocional (se houver)
- URL oficial do site
- Email, telefone, Instagram
- Descrição curta e completa
- Ofertas (título, descrição, preço)

### Passo 2: Editar experiences.json

1. Encontrar a categoria (`modes[]`) apropriada
2. Se não existir, criar nova mode:

   ```json
   {
     "slug": "nova-categoria",
     "title": "Nova Categoria",
     "badge": "Badge",
     "description": "Descrição",
     "partners": []
   }
   ```

3. Adicionar partner no array `partners`:
   ```json
   {
     "slug": "meu-parceiro",
     "name": "Meu Parceiro Ltda",
     "location": "Lisboa",
     "price_original": "€50",
     "price_discount": "€40",
     "savings": "Economize €10",
     "discount_label": "20% OFF",
     "discount_percent": 20,
     "code": "MEU20",
     "official_url": "https://meu-parceiro.com",
     "email": "contact@meu-parceiro.com",
     "phone": "+351 21 1234567",
     "instagram": "https://instagram.com/meu-parceiro",
     "images": [
       "https://cloudinary.com/image1.jpg",
       "https://cloudinary.com/image2.jpg"
     ],
     "icon": "fas fa-star",
     "offers": [
       {
         "title": "Oferta 1",
         "text": "Descrição detalhada",
         "price": 50.0
       },
       {
         "title": "Oferta 2",
         "text": "Outra descrição",
         "price": 75.0
       }
     ],
     "story_short": "Resumo (1-2 linhas)",
     "story_full": "História completa do parceiro (3-5 parágrafos)"
   }
   ```

### Passo 3: Adicionar Traduções (se necessário)

Se criou nova categoria, adicionar em `translations.json`:

```json
"pt": {
  "modoNomePt": "Nova Categoria em PT"
},
"en": {
  "modoNomeEn": "New Category in EN"
}
```

### Passo 4: Validar JSON

```powershell
# Windows PowerShell
$content = Get-Content experiences.json -Raw
$json = $content | ConvertFrom-Json
if ($json) { Write-Host "JSON válido!" }
```

### Passo 5: Configurar Stock (Backend)

1. Acessar `admin.html`
2. Adicionar novo stock:
   - **Slug:** `meu-parceiro`
   - **Título da Oferta:** `Oferta 1`
   - **Qtd:** 50
3. Clicar "Definir"

### Passo 6: Testar Localmente

```powershell
cd site-orfetas
npm start
```

Acessar:

- http://localhost:5000/
- http://localhost:5000/experience.html?slug=nova-categoria
- http://localhost:5000/partner.html?slug=meu-parceiro

Verificar:

- ✅ Card renderizado corretamente
- ✅ Imagens carregam
- ✅ Modal de compra abre
- ✅ Código aparece
- ✅ Barra de stock exibe (se backend rodando)

### Passo 7: Commit e Deploy

```powershell
git add experiences.json translations.json
git commit -m "Add partner: Meu Parceiro (novo-slug)"
git push origin main
```

Railway fará deploy automaticamente via webhook Git.

### Passo 8: Verificar em Produção

Acessar:

- https://site-orfetas.com/experience.html?slug=nova-categoria
- https://site-orfetas.com/partner.html?slug=meu-parceiro

---

## 🌐 Deploy e Produção

### Ambiente de Deploy: Railway

**URL de Produção:**

- Frontend: https://site-orfetas.com (custom domain)
- Backend: https://voucherhub-backend-production.up.railway.app

### Configuração Railway

1. **Frontend:** Conectado ao repositório Git
   - Branch: `main`
   - Build: `npm start` (inicia servidor)
   - Port: 5000 (default)

2. **Backend:** Repositório separado
   - Banco SQLite no Railway
   - Variáveis de ambiente: STRIPE_KEY, EMAIL_USER, EMAIL_PASS, etc.

### Workflow de Deploy

1. Fazer mudanças localmente
2. Testar em localhost
3. Commit e push para `main`
4. Railway detect mudanças automaticamente
5. Rebuild e deploy (2-3 minutos)
6. Acessar produção e verificar

### Variáveis de Ambiente (Backend)

No `.env` do backend:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
DATABASE_URL=sqlite:///voucherhub.db
EMAIL_USER=noreply@voucherhub.pt
EMAIL_PASS=****
JWT_SECRET=random-secret-key
PORT=3000
NODE_ENV=production
```

### Certificados SSL

Railway fornece SSL grátis automaticamente para custom domains.

---

## 🔧 Troubleshooting

### Problema: "Categoria não aparece"

**Causa:** Erro de sintaxe JSON (vírgula faltando, aspas erradas)
**Solução:**

1. Validar JSON com PowerShell:
   ```powershell
   $json = Get-Content experiences.json | ConvertFrom-Json
   ```
2. Procurar erros no console do browser (F12)
3. Usar JSON validator online (jsonlint.com)

### Problema: "Imagem não carrega"

**Causas possíveis:**

- URL incorreta
- Domínio bloqueado por CORS
- Imagem deleted no Cloudinary

**Solução:**

1. Verificar URL no navegador diretamente
2. Usar HTTPS
3. Verificar permissões de acesso público da imagem

### Problema: "Código promo não copia"

**Causa:** Erro JavaScript em PromoCodeManager
**Solução:**

1. Abrir console (F12 → Console)
2. Ver mensagem de erro
3. Testar em navegador diferente

### Problema: "Email não enviado"

**Causa:** Credenciais de email inválidas no backend
**Solução:**

1. Verificar `.env` no backend (EMAIL_USER, EMAIL_PASS)
2. Testar SMTP manualmente
3. Usar sendGrid/SES em vez de Nodemailer

### Problema: "Modal de compra não abre"

**Causa:** Erro em partner.js ou event listener não registrado
**Solução:**

1. Inspecionar elemento (F12 → Inspector)
2. Verificar classe `.btn-buy-offer`
3. Rodar no console: `document.querySelector('.btn-buy-offer').click()`

### Problema: "Pagamento redireciona para erro"

**Causa:** Backend não consegue criar session Stripe
**Solução:**

1. Verificar STRIPE_SECRET_KEY no backend
2. Verificar resposta em F12 → Network
3. Testar em modo test do Stripe

### Problema: "Stock mostra 'undefined'"

**Causa:** Backend não retorna campo correto (stock_remaining vs stock_limit)
**Solução:**

1. Abrir console do navegador
2. Ver resposta de `/api/admin/stock-list`
3. Verificar nome dos campos no backend
4. Atualizar campo em `experience.js`

---

## 📋 Checklist de Manutenção Regular

- [ ] **Semanal:** Verificar relatórios de erro em log
- [ ] **Semanal:** Auditar pagamentos (admin.html)
- [ ] **Mensal:** Revisar analytics de busca
- [ ] **Mensal:** Atualizar imagens de parceiros
- [ ] **Trimestral:** Revisitar validez de partnerships
- [ ] **Anual:** Atualizar dependencies (npm update)
- [ ] **Conforme necessário:** Adicionar/atualizar parceiros

---

## 📞 Suporte e Contato

**Email:** info@voucherhub.pt
**Instagram:** @voucherhub_pt

---

## 📝 Histórico de Versões

| Versão | Data     | Mudanças                      |
| ------ | -------- | ----------------------------- |
| 1.5.0  | Jan 2026 | Sistema de stock implementado |
| 1.4.0  | Dec 2025 | Suporte a código patrocinador |
| 1.3.0  | Nov 2025 | Multi-idioma aprimorado       |
| 1.0.0  | Sep 2025 | Launch inicial                |

---

**Última atualização:** 20 de janeiro de 2026
**Mantido por:** Equipe VoucherHub

## Como adicionar uma nova categoria e um novo parceiro — passo a passo

1. Abrir `experiences.json`.

2. Adicionar nova categoria (mode) em `modes[]`:
   - `slug`: identificador (minusculo, híphen).
   - `title`, `badge`, `description`.
   - `partners`: array (pode começar vazio ou com parceiros).

3. Adicionar um partner dentro de `partners[]` do mode:
   - Campos mínimos recomendados:
     - `slug`, `name`, `location`
     - `price_original`, `price_discount`, `savings`
     - `discount_label`, `discount_percent`, `code`
     - `official_url`, `email`, `phone`, `instagram`
     - `images` (URLs públicas)
     - `icon` (classe Font Awesome)
     - `offers` (array com objetos contendo `title`, `description`, `price_original_cents`, `price_discount_cents`)
     - `story_short`, `story_full`

4. Adicionar traduções em `translations.json` (pt e en) para quaisquer chaves novas (ex.: categoria title/description).

5. Validar JSON (vírgulas, formatos).

6. Testar localmente:
   - No Windows PowerShell:
     - cd para a pasta do projeto
     - `npm start` (conforme `package.json`)
   - Acessar:
     - `/` (home)
     - `/experience.html?slug=<nova-categoria>`
     - `/partner.html?slug=<novo-parceiro>`

7. Verificar:
   - Cards renderizados (imagem, nome, badge)
   - `discount_label` aparece (pode vir do campo em JSON)
   - Modal de compra abre e preenche dados
   - Fluxo de pagamento comunica com backend (se backend rodando)

8. Backend:
   - Se houver validação de partner_slug no backend, adicionar o novo `partner_slug` na lista de parceiros válidos ou ajustar validação para aceitar qualquer slug baseado em dados recebidos.
   - Reiniciar servidor backend se necessário.

9. SEO:
   - Atualizar `sitemap.xml` para incluir as novas URLs.
   - Garantir `og:image` e meta tags dinâmicas se necessário.

10. Commit & deploy:
    - `git add experiences.json translations.json sitemap.xml`
    - `git commit -m "Add category X and partner Y"`
    - `git push origin main` (Railway/GitHub Actions farão deploy conforme configuração)

## Checklist rápido para adicionar parceiro

- [ ] Nova categoria adicionada em experiences.json (se aplicável)
- [ ] Partner com todos os campos básicos adicionados
- [ ] Imagens públicas válidas
- [ ] translations.json atualizado
- [ ] sitemap.xml atualizado
- [ ] Backend aceita partner_slug (ou foi atualizado)
- [ ] Teste local feito e OK
- [ ] Commit e deploy

## Comandos úteis para busca e debug (Windows)

- Procurar string no projeto (PowerShell):
  Select-String -Path .\* -Pattern "15% OFF" -SimpleMatch -Recurse
- Iniciar servidor (caso package.json configure start):
  npm start
- Ver console do browser: F12 → Console / Network

## Troubleshooting (problemas comuns)

- Categoria não aparece: erro de sintaxe JSON (vírgula faltando).
- Imagem não carrega: URL incorreta ou domínio bloqueado.
- Código promo não copia: erro JS; verificar console do browser.
- E-mail não enviado: configurar credenciais em `sendEmail.js` (nodemailer/serviço).
- Modal de compra não abre: checar event listeners em `partner.js`.

## Observações de segurança e operacionais

- Não armazene chaves de e-mail ou API em arquivos comprometidos; use variáveis de ambiente no backend.
- Valide entradas no backend (email, partner_slug, valores monetários).
- Use HTTPS em produção e configure CORS corretamente se separar frontend/backend.

## Contato / Próximos passos sugeridos

- Revisar e padronizar campos em `experiences.json`.
- Implementar testes unitários básicos para renderers (Node/JS DOM/TDD).
- Automatizar validação de JSON via CI antes do deploy.
- Integrar serviço de envio de e-mails confiável (SendGrid/SES) com métricas.

---

Se desejar, eu posso:

- gerar automaticamente o arquivo README.md e inseri-lo no caminho do projeto;
- ou criar um commit com a nova README e preparar o push.
