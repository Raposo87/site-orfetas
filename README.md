# VoucherHub — Frontend

Site estático em HTML/CSS/JavaScript vanilla hospedado em `voucherhub.pt`.  
Plataforma de vitrine de experiências com desconto em Portugal.

---

## Índice

1. [Stack](#stack)
2. [Arrancar Localmente](#arrancar-localmente)
3. [Estrutura de Ficheiros](#estrutura-de-ficheiros)
4. [Páginas](#páginas)
5. [Páginas de Admin](#páginas-de-admin)
6. [Fluxo do Catálogo](#fluxo-do-catálogo)
7. [Sistema de i18n](#sistema-de-i18n)
8. [Deploy](#deploy)

---

## Stack

- HTML5 + CSS3 + JavaScript Vanilla (sem framework)
- Font Awesome 6.4 (ícones)
- Google Fonts (Inter)
- Cloudinary (alojamento de imagens)
- Backend: `https://voucherhub-backend-production.up.railway.app`

---

## Arrancar Localmente

```bash
npm install
npm start   # npx serve .  — servidor local na porta 3000
```

Ou abrir directamente o `index.html` num browser (algumas funcionalidades requerem servidor por causa de CORS).

---

## Estrutura de Ficheiros

```
site-orfetas/
├── index.html              # Página inicial — listagem de categorias
├── experience.html         # Listagem de parceiros por categoria
├── partner.html            # Página de detalhe de um parceiro
├── blog.html               # Listagem de posts do blog
├── post.html               # Post individual do blog
├── validate.html           # Validação de voucher (uso pelo parceiro)
├── success.html            # Página de sucesso após pagamento
├── connect-success.html    # Página de sucesso do onboarding Stripe
├── admin.html              # Dashboard admin (vouchers, stock, transferências)
├── admin-painel.html       # Painel de registo de novos parceiros
├── admin-afiliados.html    # Gestão de afiliados
├── partner/
│   └── onboarding-refresh.html  # Página de refresh do onboarding Stripe
├── script.js               # Lógica principal — carrossel, promos, analytics
├── experience.js           # Renderização da página de categoria
├── partner.js              # Renderização da página de parceiro + compra
├── blog.js                 # Blog — listagem, detalhe, partilha
├── i18n.js                 # Sistema de internacionalização PT/EN
├── style.css               # Estilos globais de todo o site
├── experiences.json        # Catálogo legado (fallback se API falhar)
├── translations.json       # Traduções PT/EN para i18n
├── sitemap.xml             # Sitemap para SEO
├── robots.txt              # Directivas para crawlers
├── CNAME                   # Domínio: voucherhub.pt
├── serve.json              # Configuração do servidor estático (rewrites)
└── package.json            # Dependência: serve
```

---

## Páginas

### `index.html` + `script.js`
Página inicial. Mostra as categorias de experiências disponíveis, carrossel de destaques, toast de compras recentes e suporte a idioma PT/EN.

**Funcionalidades:**
- Carrossel automático de imagens
- Toast de "X pessoas compraram recentemente" (via `/api/analytics/recent-purchases`)
- Código promocional de afiliado na URL (`?ref=slug`)
- Animações de scroll com IntersectionObserver

### `experience.html` + `experience.js`
Lista os parceiros de uma categoria. Recebe o slug da categoria via `?slug=surf`.

**Funcionalidades:**
- Carrega catálogo de `/api/catalog`
- Merge com `experiences.json` como fallback
- Filtro por vibes (tags de estilo de vida)
- Cards de parceiro com desconto, preço original/final
- Botão "Ver Oferta" → `partner.html?slug=...`

### `partner.html` + `partner.js`
Página de detalhe de um parceiro. Recebe o slug via `?slug=azonda-surf-club`.

**Funcionalidades:**
- Galeria de imagens
- História do parceiro (curta + expandível)
- Ofertas com preços e botão Comprar
- Controlo de stock (botão "Esgotado" se sem stock)
- Avaliações de clientes (reviews)
- Campo de código promocional (afiliado / voucher especial)
- Checkout Stripe via `/api/payments/create-checkout-session`
- Partilha nativa / WhatsApp / Facebook / Instagram / cópia de link

### `validate.html`
Página usada pelo parceiro para validar vouchers no momento do serviço.

**Fluxo:**
1. Parceiro introduz o código do voucher
2. Se voucher válido, mostra detalhes
3. Parceiro introduz o PIN (4 dígitos) para confirmar o uso
4. Sistema transfere os fundos para a conta Stripe do parceiro

### `blog.html` + `post.html` + `blog.js`
Blog público com posts em PT e EN. Suporte a partilha em redes sociais.

### `success.html`
Página de confirmação após pagamento bem-sucedido. Mostra os detalhes do voucher e envia email automaticamente (via webhook no backend).

---

## Páginas de Admin

Todas as páginas admin estão protegidas por autenticação Bearer (token guardado em `localStorage`).

### `admin-painel.html` — Registo de Parceiros
Formulário para criar novos parceiros. Requer role `owner` ou `admin`.

**Campos:**
- **Dados Operacionais:** nome, slug, email, telefone, localização, preço original
- **Catálogo Público:** categoria (dropdown carregado da API), desconto %, código voucher, Instagram, site oficial, história curta, história completa, imagens (URLs, uma por linha)
- **Ofertas:** linhas dinâmicas com título, descrição, preço

**Ao submeter:**
1. Cria conta Stripe Express para o parceiro
2. Guarda todos os dados na BD
3. Gera PIN de 4 dígitos automaticamente
4. Devolve link de onboarding Stripe

**Nota:** Se a API de modos falhar, o dropdown usa uma lista local de 11 categorias como fallback.

### `admin.html` — Dashboard Geral
Gestão de vouchers, stock de ofertas e auditoria de transferências Stripe falhadas.

### `admin-afiliados.html` — Gestão de Afiliados
Criar e gerir afiliados com taxa de comissão configurável.

---

## Fluxo do Catálogo

```
1. experience.js / partner.js carregam /api/catalog
2. Merge com experiences.json (fallback para parceiros não migrados)
3. Se API falhar completamente → usa só experiences.json
```

**Para um parceiro aparecer:**
- `mode_slug` preenchido com slug válido (ex: `surf`)
- `is_catalog_active = true` na BD
- Criado via `admin-painel.html` → aparece imediatamente sem redeploy

---

## Sistema de i18n

`i18n.js` + `translations.json`

- Idiomas suportados: PT (padrão) e EN
- O idioma é guardado em `localStorage` (`voucherhub_lang`)
- Sem detecção automática do browser — começa sempre em PT
- Todos os textos estáticos têm atributo `data-i18n="chave.subchave"`
- Selector de idioma (bandeiras PT/EN) é injectado dinamicamente no navbar

---

## Deploy

O site é servido estaticamente. O ficheiro `serve.json` configura rewrites:
- `/validate/**` → `validate.html`
- `/**` → `index.html`

O domínio `voucherhub.pt` está configurado via ficheiro `CNAME`.

**API de produção:** `https://voucherhub-backend-production.up.railway.app`  
A constante `window.VOUCHERHUB_API` é definida inline em cada página HTML antes dos scripts.
