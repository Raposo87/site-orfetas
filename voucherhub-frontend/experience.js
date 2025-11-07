// === SEO Dinâmico por categoria ===
async function updateSEO() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) return;

  const response = await fetch("experiences.json");
  const data = await response.json();
  const mode = data.modes.find((m) => m.slug === slug);

  if (!mode) return;

  // Atualiza título e meta description
  const title = `${mode.title} – Exclusive Discounts | VoucherHub`;
  const description = `${mode.description} Save with exclusive promo codes for ${mode.title} in Portugal.`;

  document.title = title;

  // Meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", description);

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = `https://yourdomain.com/experience/${slug}`;
}

updateSEO();


// experience.js
(async function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');

  if (!slug) {
    location.href = 'index.html';
    return;
  }

  // Aguardar i18n estar pronto
  const waitForI18n = () => {
    return new Promise((resolve) => {
      if (window.i18n && window.i18n.translations) {
        resolve();
      } else {
        setTimeout(() => waitForI18n().then(resolve), 100);
      }
    });
  };

  await waitForI18n();

  let data;
  try {
    const res = await fetch('experiences.json', { cache: 'no-store' });
    data = await res.json();
  } catch (e) {
    console.error('Erro ao carregar experiences.json', e);
    data = { modes: [] };
  }

  const mode = data.modes.find(m => m.slug === slug);
  if (!mode) {
    const t = window.i18n.translations[window.i18n.currentLang];
    document.getElementById('mode-title').textContent = t.experiencePage.notFound;
    document.getElementById('mode-description').textContent = t.experiencePage.nonExistent;
    document.getElementById('results-count').textContent = '0 ' + t.experiencePage.offers;
    return;
  }

  // Função para atualizar a página com as informações do mode
  const updatePageContent = () => {
    // Cabeçalho
    document.getElementById('page-title').textContent = `VoucherHub – ${mode.title}`;
    
    // Atualizar título - REMOVER data-i18n quando temos conteúdo dinâmico
    const modeTitle = document.getElementById('mode-title');
    modeTitle.removeAttribute('data-i18n');
    modeTitle.textContent = mode.title;
    
    // Atualizar descrição
    document.getElementById('mode-description').textContent = mode.description || 'Veja as escolas com desconto.';
    
    // Atualizar breadcrumb
    const crumbCurrent = document.getElementById('crumb-current');
    crumbCurrent.removeAttribute('data-i18n');
    crumbCurrent.textContent = mode.title;
    
    // Atualizar badge (mantém "Category" traduzível, mas pode ser substituído pelo mode.badge)
    const badgeSpan = document.getElementById('mode-badge').querySelector('span');
    if (mode.badge) {
      badgeSpan.removeAttribute('data-i18n');
      badgeSpan.textContent = mode.badge;
    }

    // Atualizar contador de resultados
    const t = window.i18n.translations[window.i18n.currentLang];
    const offerText = mode.partners.length === 1 
      ? t.experiencePage.offers 
      : t.experiencePage.offersPlural;
    const resultsCount = document.getElementById('results-count');
    resultsCount.removeAttribute('data-i18n');
    resultsCount.textContent = `${mode.partners.length} ${offerText}`;
  };

  // Chamar função inicial
  updatePageContent();

  // === Dynamic SEO meta for each mode (EN) ===
  const ensureMeta = (name, content) => {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) { 
      tag = document.createElement('meta'); 
      tag.setAttribute('name', name); 
      document.head.appendChild(tag); 
    }
    tag.setAttribute('content', content);
  };
  ensureMeta('description', `${mode.title} in Portugal with exclusive discount codes. ${mode.description}`);
  ensureMeta('keywords', `${mode.title}, Portugal coupon codes, ${mode.badge} deals, Lisbon discounts, promo codes Portugal`);

  // Canonical
  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (!linkCanonical) { 
    linkCanonical = document.createElement('link'); 
    linkCanonical.rel = 'canonical'; 
    document.head.appendChild(linkCanonical); 
  }
  linkCanonical.href = `https://yourdomain.com/experience/${mode.slug}`;

  // JSON-LD Offers
  const offers = mode.partners.map(p => ({
    "@context":"https://schema.org",
    "@type":"Offer",
    "name": `${p.name} – ${mode.title}`,
    "priceCurrency": "EUR",
    "price": (p.price_discount || "").replace(/[^0-9.]/g,''),
    "url": p.official_url,
    "category": mode.title,
    "seller": {
      "@type": "LocalBusiness",
      "name": p.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": p.location,
        "addressCountry": "PT"
      }
    }
  }));
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify(offers);
  document.head.appendChild(ld);

  // Função para renderizar cards
  const renderCards = () => {
    const grid = document.getElementById('partners-grid');
    grid.innerHTML = '';

    // Obter traduções atuais
    const getTranslation = (key) => {
      const t = window.i18n.translations[window.i18n.currentLang];
      return window.i18n.getNestedTranslation(t, key) || key;
    };

    mode.partners.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'experience-card';
      card.dataset.discount = p.discount_label;
      
      const images = p.images || (p.image ? [p.image] : []);
      
      card.innerHTML = `
        <div class="card-image">
          ${images.length > 0 ? '<img src="' + images[0] + '" alt="' + p.name + '">' : ''}
          <div class="card-badge">
            
            <span>${p.discount_label}</span>
          </div>
        </div>
        <div class="card-content">
          <div class="card-category">
            <i class="${p.icon || 'fas fa-water'}"></i>
            <span>${mode.title}</span>
          </div>
          <h3>${p.name}</h3>
          <div class="location">
            <i class="fas fa-map-marker-alt"></i> 
            <span>${p.location}</span>
          </div>
          <div class="price-section">
            <div class="price-original">${p.price_original}</div>
            <div class="price-discount">${p.price_discount}</div>
            <div class="savings">${p.savings}</div>
          </div>
          <div class="card-actions">
            <a href="partner.html?slug=${p.slug}" class="btn btn-secondary btn-sm">
              <i class="fas fa-info-circle"></i>  <span>Ver detalhes</span>
            </a>
            
            <a href="${p.official_url}" target="_blank" class="btn btn-official btn-sm">
              <i class="fas fa-external-link-alt"></i>
              <span>Visitar Site Oficial</span>
            </a>
          </div>
        </div>
      `;
      grid.appendChild(card);
      
      // Inicializar carrossel se houver múltiplas imagens
      if (images.length > 1 && window.voucherhubApp && window.voucherhubApp.carouselManager) {
        window.voucherhubApp.carouselManager.initCarousel(card, images);
      }
    });
  };

  // Renderizar cards inicialmente
  renderCards();

  // Escutar mudanças de idioma e re-renderizar
  if (window.i18n) {
    const originalSwitchLanguage = window.i18n.switchLanguage.bind(window.i18n);
    window.i18n.switchLanguage = function(lang) {
      originalSwitchLanguage(lang);
      // Após trocar idioma, atualizar conteúdo dinâmico
      updatePageContent();
      renderCards();
    };
  }
})();