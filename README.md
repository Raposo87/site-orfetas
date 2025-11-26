# site-orfetas
Site de ofertas
// ...existing code...

# VoucherHub — Documentação do Projeto

Última atualização: 26 de novembro de 2025

## Visão geral
VoucherHub é uma aplicação web que lista experiências em Portugal (aulas de surf, tours, estúdios de yoga, terapias, moda, etc.) e fornece códigos promocionais exclusivos para uso nos sites oficiais dos parceiros. Frontend em HTML/CSS/JS vanilla e backend Node.js + Express (SQLite).

## Tecnologias
- Frontend: HTML5, CSS3, JavaScript (vanilla)
- Internacionalização: i18n.js + translations.json
- Dados: experiences.json (catálogo local)
- Backend: Node.js + Express (pasta `voucherhub-backend/`)
- Banco: SQLite (schema.sql)
- Deploy: Railway (CNAME presente)
- Imagens: Cloudinary (URLs em experiences.json)

## Estrutura do repositório (resumo)
- index.html — página inicial
- experience.html — página de categoria (ex: ?slug=surf)
- partner.html — página do parceiro (?slug=partner-slug)
- style.css, i18n-styles.css — estilos
- script.js — lógica UI global (PromoCodeManager, CarouselManager, NavigationManager, PerformanceManager)
- i18n.js — gerenciador de traduções via `data-i18n`
- experience.js — renderiza cards por categoria e atualiza SEO
- partner.js — renderiza página do parceiro e modal de compra
- buy.js — fluxo de pagamento / integração com backend
- experiences.json — catálogo: modes[] → partners[]
- translations.json — textos por idioma (pt/en)
- voucherhub-backend/ — backend Express, src/, schema.sql

## Fluxo de navegação e dados
1. Home (index.html) lista categorias/links.
2. Clicar categoria → `experience.html?slug=<categoria>` → `experience.js` carrega experiences.json e renderiza cards.
3. Clicar partner → `partner.html?slug=<partner>` → `partner.js` carrega dados do parceiro, galeria, ofertas e botão "Comprar".
4. Ao pagar (modal) → `buy.js` faz POST para `/api/payments` (backend) que cria voucher, registra pagamento e envia e-mail.

## Arquitetura de dados (essencial)
exemplo em `experiences.json`:
- modes[].slug, title, badge, description
- partners[] com campos: slug, name, location, price_original, price_discount, savings, discount_label, discount_percent, code, official_url, email, phone, instagram, images[], icon, offers[], story_short, story_full

## i18n
- Elementos HTML usam `data-i18n="chave"`.
- `i18n.js` detecta/força idioma e substitui textos conforme `translations.json`.
- Chaves importantes: `footer.disclaimer`, `toast.codeCopied`, `footer.*`, etc.

## SEO
- `index.html` contém meta tags estáticas.
- `experience.js` e `partner.js` atualizam title, meta description e OG dinamicamente quando necessário.
- `sitemap.xml` deve incluir novas rotas adicionadas.

## Backend (voucherhub-backend)
- `schema.sql` descreve tabelas `vouchers` e `payments`.
- `src/server.js` expõe endpoints como:
  - POST `/api/payments` — cria pagamento + voucher; envia e-mail.
  - GET/POST `/api/vouchers` — listar/validar vouchers.
- `src/utils/sendEmail.js` envia e-mails (nodemailer/serviço escolhido).

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
- ou criar um commit com a nova README e preparar o push.// filepath: c:\Users\Utilizador\OneDrive\Desktop\Projetos\site-orfetas\README.md
// ...existing code...

# VoucherHub — Documentação do Projeto

Última atualização: 26 de novembro de 2025

## Visão geral
VoucherHub é uma aplicação web que lista experiências em Portugal (aulas de surf, tours, estúdios de yoga, terapias, moda, etc.) e fornece códigos promocionais exclusivos para uso nos sites oficiais dos parceiros. Frontend em HTML/CSS/JS vanilla e backend Node.js + Express (SQLite).

## Tecnologias
- Frontend: HTML5, CSS3, JavaScript (vanilla)
- Internacionalização: i18n.js + translations.json
- Dados: experiences.json (catálogo local)
- Backend: Node.js + Express (pasta `voucherhub-backend/`)
- Banco: SQLite (schema.sql)
- Deploy: Railway (CNAME presente)
- Imagens: Cloudinary (URLs em experiences.json)

## Estrutura do repositório (resumo)
- index.html — página inicial
- experience.html — página de categoria (ex: ?slug=surf)
- partner.html — página do parceiro (?slug=partner-slug)
- style.css, i18n-styles.css — estilos
- script.js — lógica UI global (PromoCodeManager, CarouselManager, NavigationManager, PerformanceManager)
- i18n.js — gerenciador de traduções via `data-i18n`
- experience.js — renderiza cards por categoria e atualiza SEO
- partner.js — renderiza página do parceiro e modal de compra
- buy.js — fluxo de pagamento / integração com backend
- experiences.json — catálogo: modes[] → partners[]
- translations.json — textos por idioma (pt/en)
- voucherhub-backend/ — backend Express, src/, schema.sql

## Fluxo de navegação e dados
1. Home (index.html) lista categorias/links.
2. Clicar categoria → `experience.html?slug=<categoria>` → `experience.js` carrega experiences.json e renderiza cards.
3. Clicar partner → `partner.html?slug=<partner>` → `partner.js` carrega dados do parceiro, galeria, ofertas e botão "Comprar".
4. Ao pagar (modal) → `buy.js` faz POST para `/api/payments` (backend) que cria voucher, registra pagamento e envia e-mail.

## Arquitetura de dados (essencial)
exemplo em `experiences.json`:
- modes[].slug, title, badge, description
- partners[] com campos: slug, name, location, price_original, price_discount, savings, discount_label, discount_percent, code, official_url, email, phone, instagram, images[], icon, offers[], story_short, story_full

## i18n
- Elementos HTML usam `data-i18n="chave"`.
- `i18n.js` detecta/força idioma e substitui textos conforme `translations.json`.
- Chaves importantes: `footer.disclaimer`, `toast.codeCopied`, `footer.*`, etc.

## SEO
- `index.html` contém meta tags estáticas.
- `experience.js` e `partner.js` atualizam title, meta description e OG dinamicamente quando necessário.
- `sitemap.xml` deve incluir novas rotas adicionadas.

## Backend (voucherhub-backend)
- `schema.sql` descreve tabelas `vouchers` e `payments`.
- `src/server.js` expõe endpoints como:
  - POST `/api/payments` — cria pagamento + voucher; envia e-mail.
  - GET/POST `/api/vouchers` — listar/validar vouchers.
- `src/utils/sendEmail.js` envia e-mails (nodemailer/serviço escolhido).

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