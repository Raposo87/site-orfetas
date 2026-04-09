# VoucherHub Frontend

Frontend estático do VoucherHub, uma vitrine de experiências com desconto em Portugal. O projeto usa HTML, CSS e JavaScript vanilla, com catálogo alimentado por `experiences.json` e integrações com um backend hospedado no Railway para pagamentos, stock, likes, reviews, blog e analytics.

## Visão geral

O repositório entrega as páginas públicas da plataforma:

- `index.html`: homepage com categorias, busca, likes, FAQ e cookies.
- `experience.html`: lista de parceiros por categoria via `?slug=...`.
- `partner.html`: detalhe do parceiro, ofertas, reviews e fluxo de compra.
- `blog.html` e `post.html`: listagem e detalhe de artigos do blog.
- `admin.html`: gestão de stock e auditoria administrativa.
- `admin-painel.html`: onboarding/configuração de parceiros.
- `validate.html`: validação de vouchers.
- `success.html` e `connect-success.html`: páginas auxiliares do fluxo.

## Stack

- HTML5
- CSS3
- JavaScript vanilla
- `serve` para rodar localmente
- `translations.json` + `i18n.js` para PT/EN
- backend externo em Railway

## Estrutura principal

```text
site-orfetas/
├── index.html
├── experience.html
├── partner.html
├── blog.html
├── post.html
├── admin.html
├── admin-painel.html
├── validate.html
├── success.html
├── connect-success.html
├── style.css
├── script.js
├── experience.js
├── partner.js
├── blog.js
├── buy.js
├── i18n.js
├── experiences.json
├── translations.json
├── sitemap.xml
├── robots.txt
└── partner/
```

## Como rodar localmente

Pré-requisitos:

- Node.js instalado

Comandos:

```bash
npm install
npm start
```

Depois abra a URL exibida pelo `serve`, normalmente `http://localhost:3000` ou `http://localhost:5000`.

## Fluxo de dados

### Catálogo

- `experiences.json` concentra categorias em `modes[]`.
- Cada categoria contém `slug`, `title`, `badge`, `description` e `partners[]`.
- Cada parceiro pode incluir dados como `slug`, `name`, `location`, `images`, `offers`, `discount_percent`, `discount_label`, `story_short` e `story_full`.

### Internacionalização

- `i18n.js` carrega `translations.json`.
- O idioma é aplicado em elementos com `data-i18n`.
- Há suporte para PT e EN, com persistência via navegador.

### Backend

O frontend consome um backend externo, atualmente referenciado em vários pontos como:

```text
https://voucherhub-backend-production.up.railway.app
```

Integrações já existentes no código:

- pagamentos e checkout
- verificação de stock
- reviews de parceiros
- likes
- analytics de busca
- blog
- validação de vouchers
- rotas administrativas

Algumas partes usam `window.VOUCHERHUB_API` como override; outras ainda apontam diretamente para a URL de produção.

## Scripts principais

### `script.js`

Responsável pela base global da interface:

- animações com `IntersectionObserver`
- carrosséis de imagens nos cards
- toast e utilitários de promo code
- navegação e smooth scroll
- banner de cookies
- busca global
- likes por categoria e parceiro

### `experience.js`

- lê o `slug` da categoria pela URL
- busca `experiences.json`
- renderiza os parceiros da categoria
- atualiza breadcrumb, título e descrição
- gera metadados SEO básicos

### `partner.js`

- encontra o parceiro pelo `slug`
- renderiza galeria, contactos, história e ofertas
- abre modal de compra
- consulta stock por oferta
- carrega e envia reviews

### `blog.js`

- lista posts do backend em `blog.html`
- carrega post individual em `post.html`
- monta share buttons
- injeta SEO dinâmico para o artigo
- relaciona artigos com parceiros de `experiences.json`

### `buy.js`

- contém lógica complementar do fluxo de compra
- hoje parte importante da compra também está implementada diretamente em `partner.js`

## Como adicionar ou editar parceiros

1. Abra `experiences.json`.
2. Localize a categoria em `modes[]` ou crie uma nova.
3. Adicione ou ajuste o parceiro dentro de `partners[]`.
4. Garanta pelo menos:
   - `slug`
   - `name`
   - `location`
   - `images`
   - `discount_percent`
   - `discount_label`
   - `official_url`
   - `offers`
5. Se houver novos textos traduzíveis, atualize `translations.json`.
6. Se criou novas URLs públicas relevantes, atualize `sitemap.xml`.
7. Teste:
   - home
   - categoria em `experience.html?slug=...`
   - parceiro em `partner.html?slug=...`

### Exemplo mínimo de categoria

```json
{
  "slug": "surf",
  "title": "Aulas de Surf",
  "badge": "Esportes Aquáticos",
  "description": "Aprenda com instrutores certificados.",
  "partners": []
}
```

### Exemplo mínimo de parceiro

```json
{
  "slug": "meu-parceiro",
  "name": "Meu Parceiro",
  "location": "Lisboa",
  "discount_label": "15% OFF",
  "discount_percent": 15,
  "official_url": "https://exemplo.com",
  "images": ["https://exemplo.com/imagem.jpg"],
  "offers": [
    {
      "title": "Oferta principal",
      "text": "Descrição da oferta",
      "price": 30
    }
  ],
  "story_short": "Resumo curto",
  "story_full": "Descrição completa"
}
```

## Cuidados ao editar

- Mantenha `slug`s estáveis, porque eles são usados nas URLs e integrações.
- Prefira imagens públicas com HTTPS.
- Valide o JSON antes de publicar mudanças.
- Se a oferta depender de stock, confirme também a configuração no backend/admin.
- Se mudar endpoints, alinhe `partner.js`, `blog.js`, `script.js`, `admin.html` e `validate.html`.

## Validação rápida do JSON

PowerShell:

```powershell
Get-Content experiences.json -Raw | ConvertFrom-Json | Out-Null
Write-Host "experiences.json válido"
```

## Deploy

O projeto é pensado para hospedagem estática. O domínio e a publicação em produção dependem da infraestrutura do VoucherHub e do backend separado no Railway.

Arquivos relevantes para produção:

- `CNAME`
- `robots.txt`
- `sitemap.xml`
- meta tags nas páginas HTML

## Pendências técnicas percebidas no código

- há endpoints do backend hardcoded em mais de um arquivo
- parte do fluxo de compra está duplicada entre `buy.js` e `partner.js`
- o README antigo mencionava arquivos e comportamentos que já não refletem o estado atual

## Manutenção recomendada

- centralizar a URL da API em um único lugar
- padronizar os campos de `offers` entre `text` e `description`
- revisar SEO canônico de páginas dinâmicas
- adicionar uma validação automatizada de `experiences.json` no processo de deploy

---

Última atualização: 5 de abril de 2026

