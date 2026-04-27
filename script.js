// ===== CAPTURA DO CÓDIGO DE AFILIADO =====
// Captura o afiliado da URL e guarda por 24 horas
const urlParams = new URLSearchParams(window.location.search);
const ref = urlParams.get('ref');
if (ref) {
    localStorage.setItem('vh_affiliate', ref);
    console.log('Afiliado rastreado:', ref);
}

// ===== UTILITÁRIOS GLOBAIS =====
const Utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  observeElements() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.experience-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });

    document.querySelectorAll('.step').forEach(step => {
      step.style.opacity = '0';
      step.style.transform = 'translateY(30px)';
      step.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(step);
    });
  }
};

// ===== GERENCIAMENTO DE CARROSSEL =====
class CarouselManager {
  constructor() {
    this.carousels = new Map();
    this.interval = 3000;
  }

  initCarousel(card, images) {
    const cardImage = card.querySelector('.card-image');
    if (!cardImage || !images || images.length === 0) return;

    // Preservar o like-badge antes de limpar o HTML
    const likeBadge = cardImage.querySelector('.like-badge');

    cardImage.innerHTML = `
      <div class="card-image-carousel">
        <div class="carousel-track">
          ${images.map(img => `
            <div class="carousel-slide">
              <img src="${img}" alt="Imagem do carrossel">
            </div>
          `).join('')}
        </div>
        <div class="carousel-indicators">
          ${images.map((_, i) => `
            <div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
          `).join('')}
        </div>
      </div>`;

    // Re-inserir o like-badge no final para ficar por cima
    if (likeBadge) {
      cardImage.appendChild(likeBadge);
    }

    const carousel = {
      currentIndex: 0,
      track: cardImage.querySelector('.carousel-track'),
      dots: cardImage.querySelectorAll('.carousel-dot'),
      images: images,
      timer: null
    };

    carousel.dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.goToSlide(carousel, index);
        this.resetTimer(carousel);
      });
    });

    card.addEventListener('mouseenter', () => this.pauseCarousel(carousel));
    card.addEventListener('mouseleave', () => this.startCarousel(carousel));

    this.startCarousel(carousel);
    this.carousels.set(card, carousel);
  }

  goToSlide(carousel, index) {
    carousel.currentIndex = index;
    carousel.track.style.transform = `translateX(-${index * 100}%)`;
    carousel.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  nextSlide(carousel) {
    const nextIndex = (carousel.currentIndex + 1) % carousel.images.length;
    this.goToSlide(carousel, nextIndex);
  }

  startCarousel(carousel) {
    if (carousel.timer) return;
    carousel.timer = setInterval(() => {
      this.nextSlide(carousel);
    }, this.interval);
  }

  pauseCarousel(carousel) {
    if (carousel.timer) {
      clearInterval(carousel.timer);
      carousel.timer = null;
    }
  }

  resetTimer(carousel) {
    this.pauseCarousel(carousel);
    this.startCarousel(carousel);
  }

  stopAll() {
    this.carousels.forEach(carousel => this.pauseCarousel(carousel));
  }
}

// ===== GERENCIAMENTO DE CÓDIGOS PROMOCIONAIS =====
class PromoCodeManager {
  constructor() {
    this.codes = new Map();
    this.analytics = { revealed: 0, copied: 0, clicked: 0 };
  }

  showCode(button, code) {
    const card = button.closest('.experience-card');
    const promoDiv = card.querySelector('.promo-code');
    const codeText = promoDiv.querySelector('.code-text');
    
    button.style.transform = 'scale(0.95)';
    setTimeout(() => { button.style.transform = 'scale(1)'; }, 150);

    if (codeText) {
      codeText.textContent = code || codeText.textContent || '';
    }
    promoDiv.classList.add('show');

    const buttonText = button.querySelector('span');
    const originalText = buttonText.textContent;
    buttonText.textContent = 'Code Revealed!';
    const buttonIcon = button.querySelector('i');
    buttonIcon.className = 'fas fa-check-circle';

    setTimeout(() => {
      buttonText.textContent = originalText;
      buttonIcon.className = 'fas fa-code';
    }, 3000);

    this.analytics.revealed++;
    this.trackEvent('code_revealed', { code: code || 'QR_ONLY', card_title: card.querySelector('h3').textContent });
    const key = code || `QR_ONLY__${card.querySelector('h3').textContent}`;
    this.codes.set(key, { revealed: true, timestamp: Date.now(), cardTitle: card.querySelector('h3').textContent });
    this.saveToStorage();
  }

  async copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      this.showToast('Code copied successfully!', 'success');
      this.analytics.copied++;
      this.trackEvent('code_copied', { code });
      if (navigator.vibrate) navigator.vibrate(100);
    } catch (err) {
      this.fallbackCopyText(code);
    }
  }

  fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.showToast('Code copied successfully!', 'success');
    } catch (err) {
      this.showToast('Error copying code', 'error');
    }
    document.body.removeChild(textArea);
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastText = toast.querySelector('span');
    const toastIcon = toast.querySelector('i');
    toastText.textContent = message;
    
    switch (type) {
      case 'success':
        toast.style.background = '#10b981';
        toastIcon.className = 'fas fa-check-circle';
        break;
      case 'error':
        toast.style.background = '#ef4444';
        toastIcon.className = 'fas fa-exclamation-circle';
        break;
    }
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  trackEvent(eventName, properties = {}) {
    console.log(`Event: ${eventName}`, properties);
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
  }

  saveToStorage() {
    localStorage.setItem('voucherhub_codes', JSON.stringify({
      codes: Array.from(this.codes.entries()),
      analytics: this.analytics
    }));
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('voucherhub_codes');
      if (stored) {
        const data = JSON.parse(stored);
        this.codes = new Map(data.codes || []);
        this.analytics = { ...this.analytics, ...data.analytics };
        this.restoreRevealedCodes();
      }
    } catch (err) {
      console.warn('Erro ao carregar dados:', err);
    }
  }

  restoreRevealedCodes() {
    this.codes.forEach((data, code) => {
      if (data.revealed) {
        document.querySelectorAll('.experience-card').forEach(card => {
          const cardTitle = card.querySelector('h3')?.textContent;
          if (cardTitle === data.cardTitle) {
            const promoDiv = card.querySelector('.promo-code');
            const codeText = promoDiv?.querySelector('.code-text');
            const button = card.querySelector('.btn-code');
            
            if (codeText) codeText.textContent = code;
            if (promoDiv) promoDiv.classList.add('show');
            if (button) {
              button.querySelector('span').textContent = 'Code Revealed!';
              button.querySelector('i').className = 'fas fa-check-circle';
            }
          }
        });
      }
    });
  }
}

// ===== DEMAIS CLASSES =====
class NavigationManager {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.lastScrollY = window.scrollY;
    this.init();
  }

  init() {
    window.addEventListener('scroll', this.handleScroll.bind(this));
    this.setupSmoothScroll();
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 50) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
    this.lastScrollY = currentScrollY;
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      const href = anchor.getAttribute('href');

      // 📌 Ignora links que NÃO são âncoras internas reais
      if (href === "#" || href.startsWith("#.") || href.length === 1) return;

      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
}

class PerformanceManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.preloadCriticalResources();
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
    }
  }

  preloadCriticalResources() {
    const fontLinks = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap'
    ];
    fontLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });
  }
}

// ===== APLICAÇÃO PRINCIPAL =====
class VoucherhubApp {
  constructor() {
    this.carouselManager = new CarouselManager();
    this.promoManager = new PromoCodeManager();
    this.navigationManager = new NavigationManager();
    this.performanceManager = new PerformanceManager();
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.promoManager.loadFromStorage();
    Utils.observeElements();
    this.setupEventListeners();
    this.promoManager.trackEvent('app_loaded', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      /*
      if (e.target.closest('.btn-code')) {
        const button = e.target.closest('.btn-code');
        const code = this.extractCodeFromButton(button);
        if (code) this.promoManager.showCode(button, code);
      }
        */
      
      if (e.target.closest('.copy-btn')) {
        const button = e.target.closest('.copy-btn');
        const code = this.extractCodeFromCopyButton(button);
        if (code) this.promoManager.copyCode(code);
      }
      
      if (e.target.closest('.btn-official')) {
        this.promoManager.analytics.clicked++;
        this.promoManager.saveToStorage();
      }
    });
  }

  extractCodeFromButton(button) {
    return button.dataset.code || null;
  }

  extractCodeFromCopyButton(button) {
    const promoCode = button.closest('.promo-code');
    const codeText = promoCode?.querySelector('.code-text');
    return codeText?.textContent || null;
  }
}

// ===== INICIALIZAÇÃO =====
window.voucherhubApp = new VoucherhubApp();

// Função para carregar scripts externos (como Google Analytics)
function loadScripts(category) {
    document.querySelectorAll(`script[data-cookie-category="${category}"]`).forEach(script => {
        // Cria um novo elemento script para forçar o carregamento
        const newScript = document.createElement('script');
        newScript.src = script.getAttribute('data-src'); // Usa 'data-src'
        // Copia outros atributos como 'async' ou 'defer' se necessário
        
        // Remove o script temporário e adiciona o script real
        script.parentNode.replaceChild(newScript, script);
    });
}

// --------------------COOKIE---------------------------------
// 1. Verificar Consentimento
// -----------------------------------------------------
function checkCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    const banner = document.getElementById('cookie-banner');

    // SEGURANÇA: Se o banner não existir na página atual, sai da função
    if (!banner) return;

    if (consent) {
        banner.style.display = 'none';
        if (consent === 'accepted') {
            loadScripts('statistics');
            loadScripts('marketing');
        }
    } else {
        banner.style.display = 'flex';
    }
}

// -----------------------------------------------------
// 2. Eventos do Banner - CORRIGIDO para evitar erro em páginas sem banner
// -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    checkCookieConsent();

    const acceptBtn = document.getElementById('accept-cookies');
    const customizeBtn = document.getElementById('customize-cookies');
    const banner = document.getElementById('cookie-banner');

    // Só adiciona os eventos se os botões realmente existirem na página
    if (acceptBtn && banner) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.style.display = 'none';
            loadScripts('statistics');
            loadScripts('marketing');
        });
    }

    if (customizeBtn) {
        customizeBtn.addEventListener('click', () => {
            alert("A personalização seria implementada aqui (modal com checkboxes). Por enquanto, aceitamos apenas os essenciais.");
        });
    }
});


// ===== BUSCA GLOBAL =====
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('global-search-input');
    const resultsOverlay = document.getElementById('global-search-results');
    const resultsGrid = document.getElementById('results-grid');
    const closeBtn = document.getElementById('close-search');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            resultsOverlay.style.display = 'none';
            if(searchInput) searchInput.value = '';
        });
    }

    if (searchInput) {
        let searchTimer;
        let lastSentTerm = ""; // Para evitar enviar a mesma palavra duas vezes seguidas

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            const term = e.target.value.toLowerCase().trim();

            if (term.length < 2) {
                resultsOverlay.style.display = 'none';
                return;
            }

            // A busca visual continua rápida (300ms) para o utilizador ver resultados
            searchTimer = setTimeout(async () => {
                try {
                    const response = await fetch('experiences.json');
                    const data = await response.json();
                    
                    // Captura vibes selecionados
                    const selectedVibes = Array.from(document.querySelectorAll('.vibe-checkbox:checked')).map(cb => cb.value);
                    
                    // ... (Mantenha toda a sua lógica de filtrar allPartners igual) ...
                    let allPartners = [];
                    data.modes.forEach(mode => {
                        if (mode.partners) {
                            mode.partners.forEach(p => {
                                allPartners.push({ ...p, categoryTitle: mode.title, categoryVibes: mode.vibes || [] });
                            });
                        }
                    });

                    const filtered = allPartners.filter(p => {
                      const partnerName = (p.name || "").toLowerCase();
                      const partnerLoc = (p.location || "").toLowerCase();
                      // Captura o título da categoria (Ex: "Aulas de Surf")
                      const categoryName = (p.categoryTitle || "").toLowerCase(); 
                      const experiencesTitles = (p.experiences || []).map(exp => (exp.title || "").toLowerCase());
                      
                      let searchTerms = [term];
                      if (term === "bike" || term === "bicicleta") searchTerms = ["bike", "bicicleta", "ciclismo"];
                      if (term === "passeio" || term === "passeios") searchTerms = ["passeio", "tour", "veleiro", "barco"];

                      // Filtro por texto
                      const matchesText = term.length < 2 || searchTerms.some(t => 
                          partnerName.includes(t) || 
                          partnerLoc.includes(t) || 
                          categoryName.includes(t) || // <-- AGORA ELE PROCURA EM "Aulas de Surf"
                          experiencesTitles.some(title => title.includes(t))
                      );

                      // Filtro por vibes
                      const matchesVibes = selectedVibes.length === 0 || selectedVibes.some(vibe => p.categoryVibes.includes(vibe));

                      return matchesText && matchesVibes;
                  });

                    renderSearchResults(filtered);

                    // --- LÓGICA DE BI MELHORADA ---
                    // Só envia para o banco de dados se o utilizador parar de digitar por 1.5 segundos
                    // e se o termo for novo (evita gravar "cachorro" duas vezes se ele clicar e apagar rápido)
                    clearTimeout(window.biTimer);
                    window.biTimer = setTimeout(() => {
                        if (term !== lastSentTerm && term.length > 2) {
                            enviarDadosParaAnalise(term, filtered.length);
                            lastSentTerm = term;
                        }
                    }, 1500); // Aguarda 1.5 segundos de silêncio para gravar

                } catch (err) {
                    console.error("Erro na busca:", err);
                }
            }, 300);
        });
    }

    // Listener para checkboxes de vibes
    document.querySelectorAll('.vibe-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
            if (term.length >= 2) {
                // Simula o input event para refazer a busca com filtros
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    });

    // FUNÇÃO NOVA PARA CAPTURA DE DADOS
    async function enviarDadosParaAnalise(termo, totalResultados) {
    try {
        const device = window.innerWidth < 768 ? "Telemóvel" : "Desktop";
        
        // 1. Tenta pegar a localização da memória do navegador (para não repetir pedidos à API)
        let localData = JSON.parse(sessionStorage.getItem('user_location'));

        // 2. Se não estiver na memória, busca na API (apenas 1 vez por sessão)
        if (!localData) {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const fullData = await res.json();
                localData = {
                    city: fullData.city || "Desconhecido",
                    country: fullData.country_name || "PT"
                };
                // Guarda na memória para as próximas pesquisas
                sessionStorage.setItem('user_location', JSON.stringify(localData));
            } catch (e) {
                localData = { city: "N/A", country: "PT" };
            }
        }

        const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? "http://localhost:3000/api/analytics/search" 
            : "https://voucherhub-backend-production.up.railway.app/api/analytics/search";

        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                term: termo,
                count: totalResultados,
                city: localData.city,
                country: localData.country,
                device: device
            })
        });
    } catch (e) {
        console.warn("Analytics: Erro ao enviar.");
    }
}

    function renderSearchResults(items) {
        if (!resultsGrid) return;
        resultsOverlay.style.display = 'block';
        resultsGrid.innerHTML = '';

        if (items.length === 0) {
            resultsGrid.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Nenhuma experiência encontrada...</p>';
            return;
        }

        items.forEach(item => {
        const thumb = (item.images && item.images.length > 0) ? item.images[0] : 'favcon.png';
        const card = document.createElement('div');
        card.className = 'search-result-card'; // opcional para estilo

        card.innerHTML = `
            <a href="partner.html?slug=${item.slug}" style="text-decoration:none;color:inherit;">
              <div class="card-image">
                <div class="like-badge" id="like-btn-${item.slug}" onclick="toggleLike(event, '${item.slug}')">
                  <i class="fas fa-heart"></i>
                  <span class="like-count" id="like-count-${item.slug}">0</span>
                </div>
                <img src="${thumb}" alt="${item.name || item.title}">
              </div>
              <div class="card-content">
                <h3>${item.name || item.title}</h3>
                <p>${item.description || ''}</p>
                <span class="badge">${item.categoryTitle || item.badge || ''}</span>
              </div>
            </a>
        `;
        resultsGrid.appendChild(card);

        // Carrega o número de curtidas para este item da busca
        fetchInitialLikes(item.slug);
        });
    }
});

// Função Global de Curtidas
async function toggleLike(event, slug) {
    event.preventDefault();
    event.stopPropagation(); // Impede de abrir o link ao clicar no coração

    // 1. Verificar se o usuário já curtiu (no navegador dele)
    const likedItems = JSON.parse(localStorage.getItem('my_likes') || '{}');
    if (likedItems[slug]) return; // Se já curtiu, não faz nada

    try {
        const API_BASE = (window.location.hostname === "localhost") 
            ? "http://localhost:3000" 
            : "https://voucherhub-backend-production.up.railway.app";

        const res = await fetch(`${API_BASE}/api/likes/${slug}`, { method: 'POST' });
        const data = await res.json();

        // Atualizar visualmente
        const container = document.getElementById(`like-btn-${slug}`);
        const countSpan = document.getElementById(`like-count-${slug}`);
        
        if (container && countSpan) {
            container.classList.add('is-liked');
            countSpan.innerText = data.count;
            
            // Salvar no navegador que este usuário já curtiu
            likedItems[slug] = true;
            localStorage.setItem('my_likes', JSON.stringify(likedItems));
        }
    } catch (e) {
        console.error("Erro ao curtir:", e);
    }
}

// Função para buscar o total inicial de curtidas
async function fetchInitialLikes(slug) {
    try {
        const API_BASE = (window.location.hostname === "localhost") 
            ? "http://localhost:3000" 
            : "https://voucherhub-backend-production.up.railway.app";

        const res = await fetch(`${API_BASE}/api/likes/${slug}`);
        const data = await res.json();
        const countSpan = document.getElementById(`like-count-${slug}`);
        if (countSpan) countSpan.innerText = data.count;

        // Se já estiver no localStorage, pinta de vermelho
        const likedItems = JSON.parse(localStorage.getItem('my_likes') || '{}');
        if (likedItems[slug]) {
            document.getElementById(`like-btn-${slug}`)?.classList.add('is-liked');
        }
    } catch (e) {}
}

// Carrega os contadores de curtidas das categorias quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    const categorySlugList = ['wellness', 'yoga', 'surf', 'tour', 'bike', 'kitesurf', 'quad', 'tour-aquatico', 'restaurants'];
    categorySlugList.forEach(slug => {
        fetchInitialLikes(slug);
    });

    // Centraliza o handler de todos os botões de compra do frontend
    document.body.addEventListener('click', (event) => {
        const btn = event.target.closest('.btn-buy-offer');
        if (!btn || btn.id === 'confirm-pay-btn') return;

        event.preventDefault();
        event.stopPropagation();

        const offerData = {
            partnerSlug: btn.dataset.slug,
            offerName: btn.dataset.offerName,
            price: parseFloat(btn.dataset.price),
            originalPrice: parseFloat(btn.dataset.originalPrice || btn.dataset.price)
        };

        if (!offerData.partnerSlug || Number.isNaN(offerData.price)) return;
        window.openBuyModal(offerData);
    });
});

// 1. Definição Global da API
window.VOUCHERHUB_API = "https://voucherhub-backend-production.up.railway.app";

function emitCheckoutUiEvent(eventName, detail) {
  const event = new CustomEvent(eventName, { detail });
  window.dispatchEvent(event);
  document.dispatchEvent(event);
}

// 2. Função Global de Checkout (O NOVO PADRÃO)
window.openBuyModal = function(offerData) {
    const { partnerSlug, offerName, price, originalPrice } = offerData;
  const normalizedPrice = Number.parseFloat(String(price).replace(',', '.'));
  const normalizedOriginalPrice = Number.parseFloat(
    String(originalPrice ?? price).replace(',', '.')
  );

  if (!Number.isFinite(normalizedPrice)) {
    console.error('Preco invalido para checkout:', price);
    return;
  }

    // Remove modal anterior se existir
    const existingModal = document.getElementById('buy-modal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
      <div id="buy-modal" class="modal-backdrop">
        <div class="modal-content">
          <span class="modal-close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
          <h3 class="buy-modal-title">Comprar: ${offerName}</h3>
          <p class="buy-modal-price">Preço: <strong>EUR ${normalizedPrice.toFixed(2)}</strong></p>

          <input type="email" id="buy-email" class="buy-modal-input" placeholder="Seu e-mail para receber o voucher">
          <input type="text" id="buy-sponsor" class="buy-modal-input" placeholder="Código Desconto (Opcional)">
          <div id="buy-error" class="buy-modal-error"></div>

          <button id="confirm-pay-btn" class="buy-modal-pay-btn">Pagar</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

  emitCheckoutUiEvent('voucherhub:buy-modal-open', {
    partnerSlug,
    offerName,
    price: normalizedPrice
  });

    document.getElementById('confirm-pay-btn').addEventListener('click', async () => {
        const btn = document.getElementById('confirm-pay-btn');
        const email = document.getElementById('buy-email').value.trim();
        const sponsor = document.getElementById('buy-sponsor').value.trim();
        const errorEl = document.getElementById('buy-error');

    emitCheckoutUiEvent('voucherhub:buy-pay-click', {
      partnerSlug,
      offerName,
      price: normalizedPrice,
      hasSponsorCode: sponsor.length > 0,
      hasEmail: email.length > 0
    });

        if (!email.includes('@')) {
            errorEl.textContent = "Por favor, insira um e-mail válido.";
            return;
        }

        try {
            btn.disabled = true;
          btn.innerText = "A processar...";
            
            const payload = {
                email: email,
                partnerSlug: partnerSlug,
                productName: offerName,
              amountCents: Math.round(normalizedPrice * 100),
              originalPriceCents: Math.round((Number.isFinite(normalizedOriginalPrice) ? normalizedOriginalPrice : normalizedPrice) * 100),
                currency: "eur",
                sponsorCode: sponsor.toUpperCase(),
                affiliateSlug: localStorage.getItem('vh_affiliate') || ""
            };

            const response = await fetch(`${window.VOUCHERHUB_API}/api/payments/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || "Erro no checkout");
            }
        } catch (err) {
            errorEl.textContent = err.message;
            btn.disabled = false;
          btn.innerText = "Pagar";
        }
    });
};

// ===== TOAST DE COMPRA RECENTE =====

let recentPurchases = [];
let currentPurchaseIndex = 0;
let toastTimeout;
let nextToastTimeout;

async function fetchRecentPurchases() {
    try {
        console.log('Buscando compras recentes...');
        const response = await fetch(`${window.VOUCHERHUB_API}/api/analytics/recent-purchases`);
        if (response.ok) {
            recentPurchases = await response.json();
            console.log('Compras recentes carregadas:', recentPurchases.length, 'itens');
            // Embaralhar para rotacionar
            recentPurchases.sort(() => Math.random() - 0.5);
        } else {
            console.error('Erro na resposta da API:', response.status);
        }
    } catch (error) {
        console.error('Erro ao buscar compras recentes:', error);
    }

    // Fallback: se não houver dados, usar dados mock de compras antigas
    if (recentPurchases.length === 0) {
        console.log('Usando dados fallback de compras antigas');
        recentPurchases = [
            { offer_title: 'Surf em Cascais', count: 2, last_purchase: '2024-01-15T10:30:00Z' },
            { offer_title: 'Yoga no Parque', count: 1, last_purchase: '2024-01-10T14:20:00Z' },
            { offer_title: 'Tour de Lisboa', count: 3, last_purchase: '2024-01-08T16:45:00Z' },
            { offer_title: 'Aulas de Guitarra', count: 1, last_purchase: '2024-01-05T11:15:00Z' },
            { offer_title: 'Massagem Relaxante', count: 2, last_purchase: '2024-01-03T09:00:00Z' }
        ];
        // Embaralhar
        recentPurchases.sort(() => Math.random() - 0.5);
    }
}

function formatMessage(item) {
    const fakeTime = generateFakeRecentTime();
    const count = item.count > 1 ? item.count : 1; // Garantir pelo menos 1
    return `Alguém em Lisboa comprou ${count} voucher${count > 1 ? 'es' : ''} de ${item.offer_title} ${fakeTime}`;
}

function generateFakeRecentTime() {
    const minutes = Math.floor(Math.random() * 59) + 2; // 2-60 min
    if (minutes < 60) {
        return `há ${minutes} min`;
    } else {
        return 'há 1 hora';
    }
}

function showToast(message) {
    console.log('Mostrando toast:', message);
    const toast = document.getElementById('purchase-toast');
    const messageEl = document.getElementById('toast-message');
    
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    if (nextToastTimeout) {
        clearTimeout(nextToastTimeout);
    }
    
    messageEl.textContent = message;
    toast.classList.add('show');

    const displayDuration = 6000; // 6 segundos visível
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        console.log('Toast ocultado');
        scheduleNextToast();
    }, displayDuration);
}

function scheduleNextToast() {
    if (nextToastTimeout) {
        clearTimeout(nextToastTimeout);
    }

    const delay = Math.floor(Math.random() * (180000 - 120000 + 1)) + 120000; // 2-3 min
    console.log('Próximo toast em', Math.round(delay / 1000), 'segundos');
    nextToastTimeout = setTimeout(() => {
        showNextPurchase();
    }, delay);
}

function showNextPurchase() {
    if (recentPurchases.length === 0) {
        console.log('Nenhuma compra recente para mostrar');
        return;
    }

    const item = recentPurchases[currentPurchaseIndex];
    const message = formatMessage(item);
    showToast(message);
    currentPurchaseIndex = (currentPurchaseIndex + 1) % recentPurchases.length;

    // Marcar que o toast foi mostrado nesta sessão
    localStorage.setItem('purchaseToastShown', 'true');
}


function initPurchaseToast() {
    console.log('Inicializando toast de compras recentes');

    // Verificar se o toast já foi mostrado nesta sessão
    const toastShown = localStorage.getItem('purchaseToastShown');
    if (toastShown === 'true') {
        console.log('Toast já foi mostrado nesta sessão, pulando');
        return;
    }

    fetchRecentPurchases().then(() => {
        if (recentPurchases.length > 0) {
            const initialDelay = 10000; // 10 segundos
            console.log('Primeiro toast em', initialDelay / 1000, 'segundos');
            nextToastTimeout = setTimeout(() => {
                showNextPurchase();
            }, initialDelay);
        }
    });
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    initPurchaseToast();
});

function initGoogleReviewsCarousel() {
  const carousel = document.querySelector('.google-reviews-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.google-reviews-track');
  const slides = Array.from(carousel.querySelectorAll('.google-review-slide'));
  const prevBtn = carousel.querySelector('.reviews-prev');
  const nextBtn = carousel.querySelector('.reviews-next');
  const dotsHost = document.querySelector('.google-reviews-dots');

  if (!track || slides.length === 0 || !dotsHost) return;

  let current = 0;
  let timer = null;
  let resizeTimer = null;
  const autoMs = 4800;
  let visibleCount = 3;
  let maxIndex = 0;
  let dots = [];

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  }

  function rebuildDots() {
    const totalPositions = maxIndex + 1;
    dotsHost.innerHTML = Array.from({ length: totalPositions }, (_, idx) => (
      `<button type="button" aria-label="Ir para avaliação ${idx + 1}" data-index="${idx}"></button>`
    )).join('');

    dots = Array.from(dotsHost.querySelectorAll('button'));
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.dataset.index || 0);
        go(idx);
        startAuto();
      });
    });
  }

  function refreshMetrics() {
    visibleCount = getVisibleCount();
    maxIndex = Math.max(0, slides.length - visibleCount);
    if (current > maxIndex) current = maxIndex;
    rebuildDots();
  }

  function paint() {
    const shiftPerCard = 100 / visibleCount;
    track.style.transform = `translateX(-${current * shiftPerCard}%)`;
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === current));

    const isSingle = maxIndex === 0;
    if (prevBtn) prevBtn.disabled = isSingle;
    if (nextBtn) nextBtn.disabled = isSingle;
  }

  function go(index) {
    if (maxIndex === 0) {
      current = 0;
      paint();
      return;
    }

    if (index < 0) current = maxIndex;
    else if (index > maxIndex) current = 0;
    else current = index;

    paint();
  }

  function next() {
    go(current + 1);
  }

  function stopAuto() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  function startAuto() {
    if (maxIndex === 0) return;
    stopAuto();
    timer = setInterval(next, autoMs);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      go(current - 1);
      startAuto();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      next();
      startAuto();
    });
  }

  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      refreshMetrics();
      paint();
      startAuto();
    }, 120);
  });

  refreshMetrics();
  paint();
  startAuto();
}

document.addEventListener('DOMContentLoaded', () => {
  initGoogleReviewsCarousel();
});