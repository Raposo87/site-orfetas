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
      </div>
      <div class="card-badge">
        <i class="fas fa-percentage"></i>
        <span>${card.dataset.discount || '20% OFF'}</span>
      </div>
    `;

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