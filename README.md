# VoucherHub — Frontend

Site estático em HTML/CSS/JavaScript vanilla para `voucherhub.pt`.
Mostra catálogo de experiências, checkout Stripe, blog, validação de vouchers e painéis de gestão.

---

## Índice

1. [Stack](#stack)
2. [Arrancar Localmente](#arrancar-localmente)
3. [Estrutura de Ficheiros](#estrutura-de-ficheiros)
4. [API e Variáveis](#api-e-variáveis)
5. [Páginas](#páginas)
6. [Admin / Gestão](#admin--gestão)
7. [Funcionalidades Principais](#funcionalidades-principais)
8. [Deploy](#deploy)

---

## Stack

- HTML5 + CSS3 + JavaScript Vanilla
- Font Awesome 6.4 para ícones
- Google Fonts (Inter)
- Cloudinary para alojamento de imagens
- `serve` para servidor local estático
- Backend: `https://voucherhub-backend-production.up.railway.app`

---

## Arrancar Localmente

```bash
npm install
npm start
```

O comando `npm start` executa `npx serve .` e serve o site na porta `3000`.

> Nota: Algumas funcionalidades dependem do backend e de CORS, por isso o host local é recomendado.

---

## Estrutura de Ficheiros

```
site-orfetas/
├── index.html
├── experience.html
├── partner.html
├── blog.html
├── post.html
├── validate.html
├── success.html
├── connect-success.html
├── admin.html
├── admin-painel.html
├── admin-afiliados.html
├── admin-usuarios.html
├── partner/
│   └── onboarding-refresh.html
├── script.js
├── experience.js
├── partner.js
├── blog.js
├── i18n.js
├── style.css
├── experiences.json
├── translations.json
├── sitemap.xml
├── robots.txt
├── CNAME
├── serve.json
└── package.json
```

---

## API e Variáveis

O frontend não usa `.env`. O URL da API é definido diretamente em várias páginas ou via `window.VOUCHERHUB_API`.

- API de produção: `https://voucherhub-backend-production.up.railway.app`
- O site estático espera que a API backend esteja disponível nesse domínio.

---

## Páginas

### `index.html`

Página inicial com as categorias de experiências, carrossel de destaques, toast de compras recentes, suporte PT/EN e rastreamento de afiliados.

### `experience.html`

Listagem de parceiros por categoria. Recebe o slug da categoria via `?slug=surf`.

- Carrega catálogo público de `/api/catalog`
- Fallback local em `experiences.json` se a API falhar
- Filtros por vibes e tags
- Navegação para `partner.html?slug=...`

### `partner.html`

Detalhes do parceiro e compra.

- Galeria de imagens
- Ofertas e preços com desconto
- Verificação de stock via `/api/payments/check-stock`
- Checkout Stripe com `/api/payments/create-checkout-session`
- Avaliações e reviews (`/api/partners/:slug/reviews`)
- Partilha social e cópia de link

### `blog.html` / `post.html`

Blog público com posts carregados da API.

- `blog.html` lista artigos
- `post.html` mostra post individual via `/api/blog/:slug`

### `validate.html`

Página de validação de vouchers usada pelos parceiros.

- Pesquisa de voucher por código
- Confirmação com PIN do parceiro
- Validação presencial e uso do voucher

### `success.html`

Confirmação exibida após pagamento bem-sucedido.

### `connect-success.html`

Página de sucesso do onboarding Stripe.

---

## Admin / Gestão

### `admin-painel.html`

Formulário de registo de parceiros e criação de contas Stripe Express.

### `admin.html`

Painel de auditoria e gestão de vouchers, stock e repasses.

### `admin-afiliados.html`

Gestão de afiliados, com criação de links de referência e envio de email.

### `admin-usuarios.html`

Gestão de utilizadores admin e login.

### `partner/onboarding-refresh.html`

Página utilizada para refresh do onboarding Stripe.

---

## Funcionalidades Principais

- `i18n.js` + `translations.json` para suportar PT/EN
- Idioma guardado em `localStorage`
- Rastreamento de afiliados via query string `?ref=slug` e persistência local por 8 horas
- Cookie banner com consentimento local
- Integração com PostHog para analytics no browser
- Merge do catálogo API com `experiences.json` como fallback local se a API falhar
- Suporte a stock limitado com `offer_inventory`
- Reviews de parceiros via API
- Autenticação admin com token Bearer e suporte legado `x-admin-key`

---

## Deploy

O site é servido estaticamente. O ficheiro `serve.json` aplica rewrites:

- `/validate/**` → `validate.html`
- `/**` → `index.html`

O domínio `voucherhub.pt` é configurado no ficheiro `CNAME`.
