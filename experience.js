// experience.js
(async function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');

  if (!slug) {
    location.href = 'index.html';
    return;
  }

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
    document.getElementById('mode-title').textContent = 'Não encontrado';
    document.getElementById('mode-description').textContent = 'Modalidade inexistente.';
    document.getElementById('results-count').textContent = '0 ofertas';
    return;
  }

  // Cabeçalho
  document.getElementById('page-title').textContent = `VoucherHub — ${mode.title}`;
  document.getElementById('mode-title').textContent = mode.title;
  document.getElementById('mode-description').textContent = mode.description || 'Veja as escolas com desconto.';
  document.getElementById('crumb-current').textContent = mode.title;
  const badgeSpan = document.getElementById('mode-badge').querySelector('span');
  badgeSpan.textContent = mode.badge || 'Category';

// === Dynamic SEO meta for each mode (EN) ===
const ensureMeta = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', name); document.head.appendChild(tag); }
  tag.setAttribute('content', content);
};
ensureMeta('description', `${mode.title} in Portugal with exclusive discount codes. ${mode.description}`);
ensureMeta('keywords', `${mode.title}, Portugal coupon codes, ${mode.badge} deals, Lisbon discounts, promo codes Portugal`);

// Canonical (optional, replace with pretty URL if available)
let linkCanonical = document.querySelector('link[rel="canonical"]');
if (!linkCanonical) { linkCanonical = document.createElement('link'); linkCanonical.rel = 'canonical'; document.head.appendChild(linkCanonical); }
linkCanonical.href = `https://yourdomain.com/experience/${mode.slug}`;

// JSON-LD Offers for partners
const offers = mode.partners.map(p => ({
  "@context":"https://schema.org",
  "@type":"Offer",
  "name": `${p.name} — ${mode.title}`,
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


  // Render cards
  const grid = document.getElementById('partners-grid');
  grid.innerHTML = '';

  mode.partners.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'experience-card';
    card.dataset.discount = p.discount_label;
    
    // Usar images se existir, senão usar image como fallback
    const images = p.images || (p.image ? [p.image] : []);
    
    card.innerHTML = `
      <div class="card-image">
        ${images.length > 0 ? '<img src="' + images[0] + '" alt="' + p.name + '">' : ''}
        <div class="card-badge">
          <i class="fas fa-percentage"></i>
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
          <button class="btn btn-code" data-code="${p.code || ''}">
            <i class="fas fa-code"></i>
            <span>Reveal Code</span>
          </button>
          <div class="promo-code">
            ${p.qrcode_url 
              ? `<img src="${p.qrcode_url}" alt="QR Code" class="qr-code">`
              : `<span class="code-text">${p.code || ''}</span>${p.code ? '<button class="copy-btn"><i class="fas fa-copy"></i></button>' : ''}`}
          </div>
          <a href="${p.official_url}" target="_blank" class="btn btn-official">
            <i class="fas fa-external-link-alt"></i>
            <span>Go to Official Site</span>
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

  document.getElementById('results-count').textContent =
    `${mode.partners.length} oferta${mode.partners.length === 1 ? '' : 's'}`;
})();