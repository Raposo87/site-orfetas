# VoucherHub Frontend

Frontend estático do VoucherHub, uma plataforma de vitrine de experiências com desconto em Portugal. O projeto oferece uma interface web responsiva para explorar e adquirir vouchers de desconto para atividades como aulas de surf, yoga, tours e muito mais em Lisboa e arredores. Utiliza HTML, CSS e JavaScript vanilla, com dados de catálogo alimentados por `experiences.json` e integrações com um backend hospedado no Railway para funcionalidades como pagamentos, controle de estoque, likes, reviews, blog e analytics.

## Descrição do Projeto

O VoucherHub é uma plataforma digital que conecta usuários a experiências locais com descontos exclusivos. O frontend é responsável pelas páginas públicas e administrativas, permitindo:

- Navegação por categorias de experiências (surf, yoga, kitesurf, etc.)
- Visualização detalhada de parceiros e ofertas
- Processo de compra de vouchers
- Sistema de reviews e likes
- Blog integrado
- Painel administrativo para gestão de parceiros e estoque
- Suporte a internacionalização (Português e Inglês)

O projeto visa promover o turismo sustentável e experiências autênticas em Lisboa, facilitando o acesso a atividades de qualidade com preços acessíveis.

## Tecnologias Utilizadas

- **HTML5**: Estrutura das páginas
- **CSS3**: Estilização responsiva com design moderno
- **JavaScript Vanilla**: Lógica do frontend, manipulação do DOM, AJAX para integrações
- **JSON**: Armazenamento de dados estáticos (catálogo, traduções)
- **Serve**: Servidor local para desenvolvimento
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia (Inter e Playfair Display)
- **Backend Externo**: Railway para APIs de pagamentos, estoque, etc.

## Estrutura do Projeto

```
site-orfetas/
├── index.html                 # Página inicial (homepage)
├── experience.html            # Listagem de experiências por categoria
├── partner.html               # Detalhes do parceiro e ofertas
├── blog.html                  # Listagem de posts do blog
├── post.html                  # Página de post individual do blog
├── admin.html                 # Painel administrativo para gestão de estoque
├── admin-painel.html          # Onboarding e configuração de parceiros
├── admin-afiliados.html       # Gestão de afiliados (possivelmente)
├── validate.html              # Validação de vouchers
├── success.html               # Página de sucesso pós-compra
├── connect-success.html       # Página auxiliar de conexão
├── style.css                  # Folhas de estilo principais
├── script.js                  # Scripts globais (navegação, modais, etc.)
├── experience.js              # Lógica para página de experiências
├── partner.js                 # Lógica para página de parceiro
├── blog.js                    # Lógica para blog
├── buy.js                     # Lógica de compra e checkout
├── i18n.js                    # Sistema de internacionalização
├── experiences.json           # Dados do catálogo de experiências
├── translations.json          # Traduções para PT/EN
├── package.json               # Dependências e scripts
├── serve.json                 # Configuração do servidor serve
├── sitemap.xml                # Sitemap para SEO
├── robots.txt                 # Instruções para crawlers
├── CNAME                      # Configuração para GitHub Pages
├── partner/
│   └── onboarding-refresh.html # Página de refresh para onboarding
└── README.md                  # Este arquivo
```

## Instalação e Execução

### Pré-requisitos

- Node.js (versão 14 ou superior) instalado no sistema
- Navegador web moderno

### Passos para Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/site-orfetas.git
   cd site-orfetas
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Execute o servidor local:

   ```bash
   npm start
   ```

4. Abra o navegador e acesse a URL exibida (geralmente `http://localhost:3000` ou `http://localhost:5000`).

## Uso

### Para Usuários Finais

- **Homepage**: Explore categorias e ofertas em destaque
- **Experiências**: Navegue por categorias específicas (ex: `experience.html?slug=surf`)
- **Parceiro**: Veja detalhes, reviews e compre vouchers
- **Blog**: Leia artigos sobre experiências em Lisboa
- **Compra**: Processo seguro via backend integrado

### Para Administradores

- **admin.html**: Gerencie estoque e veja auditoria
- **admin-painel.html**: Configure novos parceiros
- **admin-afiliados.html**: Gerencie afiliados

## Fluxo de Dados

### Catálogo de Experiências

- Dados armazenados em `experiences.json`
- Estrutura: Categorias (`modes[]`) contêm parceiros com detalhes como preços, descontos, imagens, ofertas, histórias, etc.
- Exemplo de estrutura:
  ```json
  {
    "modes": [
      {
        "slug": "surf",
        "title": "Aulas de Surf",
        "partners": [
          {
            "slug": "surf-wave-lisbon",
            "name": "Surf Wave Lisbon",
            "offers": [...],
            "images": [...],
            ...
          }
        ]
      }
    ]
  }
  ```

### Internacionalização

- Implementada via `i18n.js` e `translations.json`
- Suporte para Português (PT) e Inglês (EN)
- Elementos marcados com `data-i18n` são traduzidos dinamicamente
- Idioma persistido no navegador

### Integrações com Backend

O frontend se conecta a um backend externo hospedado no Railway (`https://voucherhub-backend-production.up.railway.app`) para:

- Processamento de pagamentos e checkout
- Verificação e atualização de estoque
- Sistema de reviews e likes
- Analytics de busca e navegação
- Conteúdo do blog
- Validação de vouchers

## Desenvolvimento

### Scripts Disponíveis

- `npm start`: Inicia o servidor local com `serve`

### Estrutura de Código

- **HTML**: Páginas estruturadas semanticamente
- **CSS**: Estilos modulares, responsivos
- **JavaScript**: Funções organizadas por arquivo (ex: `partner.js` para lógica de parceiro)
- **JSON**: Dados estáticos para catálogo e traduções

### Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Testes

- Teste manual em navegadores: Chrome, Firefox, Safari
- Verifique responsividade em dispositivos móveis
- Valide integrações com backend

## SEO e Performance

- Meta tags otimizadas para motores de busca
- Sitemap.xml para indexação
- Robots.txt para controle de crawlers
- Imagens otimizadas
- Carregamento assíncrono de scripts

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## Autor

- **VoucherHub Team**
- Email: contato@voucherhub.pt
- Website: https://voucherhub.pt

## Agradecimentos

- Parceiros locais por fornecerem experiências incríveis
- Comunidade de desenvolvedores por ferramentas open-source
- Usuários por apoiarem o turismo sustentável em Lisboa
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

## Sistema de Busca e Filtros

O sistema de busca global na homepage permite filtrar experiências por:

- **Texto**: Nome do parceiro, localização, categoria ou títulos de ofertas.
- **Vibes/Ocasiões**: Checkboxes para filtrar por "Aventura Radical", "Ideal para Casais", "Para Grupos de Amigos", "Família", "Relaxamento".

### Como adicionar vibes a uma categoria

1. Abra `experiences.json`.
2. Em cada `mode`, adicione um campo `"vibes"` com array de strings.
3. Exemplo:
   ```json
   {
     "slug": "surf",
     "title": "Aulas de Surf",
     "vibes": ["Aventura Radical", "Para Grupos de Amigos", "Família"]
   }
   ```
4. Os filtros são aplicados automaticamente na busca.

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
- o README antigo mencionava arquivos e comportamentos que já não refletem o estado atual
- sistema de busca e filtros aprimorado com vibes/ocasiões (ex: "Aventura Radical", "Ideal para Casais")

## Manutenção recomendada

- centralizar a URL da API em um único lugar
- padronizar os campos de `offers` entre `text` e `description`
- revisar SEO canônico de páginas dinâmicas
- adicionar uma validação automatizada de `experiences.json` no processo de deploy
- expandir vibes para mais categorias conforme feedback dos usuários

---

Última atualização: 5 de abril de 2026
