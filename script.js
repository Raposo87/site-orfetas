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
                    
                    // ... (Mantenha toda a sua lógica de filtrar allPartners igual) ...
                    let allPartners = [];
                    data.modes.forEach(mode => {
                        if (mode.partners) {
                            mode.partners.forEach(p => {
                                allPartners.push({ ...p, categoryTitle: mode.title });
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

                      return searchTerms.some(t => 
                          partnerName.includes(t) || 
                          partnerLoc.includes(t) || 
                          categoryName.includes(t) || // <-- AGORA ELE PROCURA EM "Aulas de Surf"
                          experiencesTitles.some(title => title.includes(t))
                      );
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
        
        // ATENÇÃO: Aqui usamos "item" pois é o nome definido no forEach acima
        card.innerHTML = `
            <div class="card-image">
        <div class="like-badge" id="like-btn-${item.slug}" onclick="toggleLike(event, '${item.slug}')">
            <i class="fas fa-heart"></i>
            <span class="like-count" id="like-count-${item.slug}">0</span>
        </div>
        <img src="${item.image || 'favcon.png'}" alt="${item.name || item.title}">
    </div>
    <div class="card-content">
        <h3>${item.name || item.title}</h3>
        <p>${item.description || ''}</p>
        <span class="badge">${item.categoryTitle || item.badge || ''}</span>
    </div>
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
});