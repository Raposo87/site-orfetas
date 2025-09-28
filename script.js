// ===== UTILITÁRIOS GLOBAIS =====
const Utils = {
  // Debounce function para otimizar performance
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
  
  // Função para animar elementos quando entram na viewport
  observeElements() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    // Observar cards de experiência
    document.querySelectorAll('.experience-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });

    // Observar steps
    document.querySelectorAll('.step').forEach(step => {
      step.style.opacity = '0';
      step.style.transform = 'translateY(30px)';
      step.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(step);
    });
  }
};

// ===== GERENCIAMENTO DE CÓDIGOS PROMOCIONAIS =====
class PromoCodeManager {
  constructor() {
    this.codes = new Map();
    this.analytics = {
      revealed: 0,
      copied: 0,
      clicked: 0
    };
  }

  // Mostrar código promocional
  showCode(button, code) {
    const card = button.closest('.experience-card');
    const promoDiv = card.querySelector('.promo-code');
    const codeText = promoDiv.querySelector('.code-text');
    
    // Animação do botão
    button.style.transform = 'scale(0.95)';
    setTimeout(() => { button.style.transform = 'scale(1)'; }, 150);

    // Revelar (preenche texto se existir; para QR apenas mostra)
    if (codeText) {
      codeText.textContent = code || codeText.textContent || '';
    }
    promoDiv.classList.add('show');

    // Atualizar botão
    const buttonText = button.querySelector('span');
    const originalText = buttonText.textContent;
    buttonText.textContent = 'Código Revelado!';
    const buttonIcon = button.querySelector('i');
    buttonIcon.className = 'fas fa-check-circle';

    setTimeout(() => {
      buttonText.textContent = originalText;
      buttonIcon.className = 'fas fa-code';
    }, 3000);

    // Analytics + persistência
    this.analytics.revealed++;
    this.trackEvent('code_revealed', { code: code || 'QR_ONLY', card_title: card.querySelector('h3').textContent });
    const key = code || `QR_ONLY__${card.querySelector('h3').textContent}`;
    this.codes.set(key, { revealed: true, timestamp: Date.now(), cardTitle: card.querySelector('h3').textContent });
    this.saveToStorage();
  }

    // Mostrar código com animação (removido)
    /*
    codeText.textContent = code;
    promoDiv.classList.add('show');
    
    // Atualizar texto do botão
    const buttonText = button.querySelector('span');
    const originalText = buttonText.textContent;
    buttonText.textContent = 'Código Revelado!';
    
    // Adicionar ícone de check
    const buttonIcon = button.querySelector('i');
    buttonIcon.className = 'fas fa-check-circle';
    
    // Resetar após 3 segundos
    setTimeout(() => {
      buttonText.textContent = originalText;
      buttonIcon.className = 'fas fa-code';
    }, 3000);

    // Analytics
    this.analytics.revealed++;
    this.trackEvent('code_revealed', { code, card_title: card.querySelector('h3').textContent });
    
    // Salvar no localStorage para persistência
    this.codes.set(code, {
      revealed: true,
      timestamp: Date.now(),
      cardTitle: card.querySelector('h3').textContent
    });
    this.saveToStorage();
  }
  */

  // Copiar código para clipboard
  async copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      this.showToast('Código copiado com sucesso!', 'success');
      
      // Analytics
      this.analytics.copied++;
      this.trackEvent('code_copied', { code });
      
      // Vibração no mobile (se disponível)
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      
    } catch (err) {
      // Fallback para navegadores mais antigos
      this.fallbackCopyText(code);
    }
  }

  // Fallback para cópia em navegadores antigos
  fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showToast('Código copiado com sucesso!', 'success');
    } catch (err) {
      this.showToast('Erro ao copiar código', 'error');
    }
    
    document.body.removeChild(textArea);
  }

  // Mostrar toast notification
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastText = toast.querySelector('span');
    const toastIcon = toast.querySelector('i');
    
    // Configurar conteúdo baseado no tipo
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
      case 'info':
        toast.style.background = '#3b82f6';
        toastIcon.className = 'fas fa-info-circle';
        break;
    }
    
    // Mostrar toast
    toast.classList.add('show');
    
    // Esconder após 3 segundos
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Rastrear eventos para analytics
  trackEvent(eventName, properties = {}) {
    // Implementação básica de tracking
    console.log(`Event: ${eventName}`, properties);
    
    // Aqui você pode integrar com Google Analytics, Mixpanel, etc.
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
  }

  // Salvar dados no localStorage
  saveToStorage() {
    localStorage.setItem('lisbondeals_codes', JSON.stringify({
      codes: Array.from(this.codes.entries()),
      analytics: this.analytics
    }));
  }

  // Carregar dados do localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('lisbondeals_codes');
      if (stored) {
        const data = JSON.parse(stored);
        this.codes = new Map(data.codes || []);
        this.analytics = { ...this.analytics, ...data.analytics };
        
        // Restaurar estado dos códigos revelados
        this.restoreRevealedCodes();
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do localStorage:', err);
    }
  }

  // Restaurar códigos previamente revelados
  restoreRevealedCodes() {
    this.codes.forEach((data, code) => {
      if (data.revealed) {
        const cards = document.querySelectorAll('.experience-card');
        cards.forEach(card => {
          const cardTitle = card.querySelector('h3').textContent;
          if (cardTitle === data.cardTitle) {
            const promoDiv = card.querySelector('.promo-code');
            const codeText = promoDiv.querySelector('.code-text');
            const button = card.querySelector('.btn-code');
            const buttonText = button.querySelector('span');
            const buttonIcon = button.querySelector('i');
            
            if (codeText) { codeText.textContent = code; }
            promoDiv.classList.add('show');
            buttonText.textContent = 'Código Revelado!';
            buttonIcon.className = 'fas fa-check-circle';
          }
        });
      }
    });
  }
}

// ===== GERENCIAMENTO DE NAVEGAÇÃO =====
class NavigationManager {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.lastScrollY = window.scrollY;
    this.init();
  }

  init() {
    // Scroll spy para navbar
    window.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Smooth scroll para links internos
    this.setupSmoothScroll();
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Adicionar/remover classe baseada no scroll
    if (currentScrollY > 50) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }

    this.lastScrollY = currentScrollY;
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
}

// ===== PERFORMANCE E OTIMIZAÇÕES =====
class PerformanceManager {
  constructor() {
    this.init();
  }

  init() {
    // Lazy loading para imagens
    this.setupLazyLoading();
    
    // Preload de recursos críticos
    this.preloadCriticalResources();
    
    // Otimização de scroll
    this.optimizeScrollHandlers();
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

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  preloadCriticalResources() {
    // Preload de fontes importantes
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

  optimizeScrollHandlers() {
    // Throttle scroll events para melhor performance
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Handlers de scroll otimizados aqui
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
class LisbonDealsApp {
  constructor() {
    this.promoManager = new PromoCodeManager();
    this.navigationManager = new NavigationManager();
    this.performanceManager = new PerformanceManager();
    
    this.init();
  }

  init() {
    // Aguardar DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Carregar dados salvos
    this.promoManager.loadFromStorage();
    
    // Configurar animações
    Utils.observeElements();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Configurar PWA (se disponível)
    this.setupPWA();
    
    // Analytics inicial
    this.promoManager.trackEvent('app_loaded', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  }

  setupEventListeners() {
    // Event delegation para botões de código
    document.addEventListener('click', (e) => {
      // Botões de revelar código
      if (e.target.closest('.btn-code')) {
        const button = e.target.closest('.btn-code');
        const code = this.extractCodeFromButton(button);
        if (code) {
          this.promoManager.showCode(button, code);
        }
      }
      
      // Botões de copiar
      if (e.target.closest('.copy-btn')) {
        const button = e.target.closest('.copy-btn');
        const code = this.extractCodeFromCopyButton(button);
        if (code) {
          this.promoManager.copyCode(code);
        }
      }
      
      // Links para sites oficiais
      if (e.target.closest('.btn-official')) {
        this.promoManager.analytics.clicked++;
        this.promoManager.trackEvent('official_site_click', {
          url: e.target.closest('.btn-official').href
        });
        this.promoManager.saveToStorage();
      }
    });

    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Fechar modals, toasts, etc.
        document.getElementById('toast').classList.remove('show');
      }
    });
  }

  extractCodeFromButton(button) {
    // Extrair código do onclick ou data attribute
    const onclick = button.getAttribute('onclick');
    if (onclick) {
      const match = onclick.match(/showCode\([^,]+,\s*['"]([^'"]+)['"]\)/);
      return match ? match[1] : null;
    }
    return button.dataset.code || null;
  }

  extractCodeFromCopyButton(button) {
    const promoCode = button.closest('.promo-code');
    const codeText = promoCode?.querySelector('.code-text');
    return codeText?.textContent || null;
  }

  setupPWA() {
    // Service Worker (se disponível)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('Service Worker não disponível:', err);
      });
    }

    // Add to Home Screen prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Aqui você pode mostrar um banner customizado
    });
  }
}

// ===== FUNÇÕES GLOBAIS (compatibilidade) =====
function showCode(button, code) {
  window.lisbonDealsApp.promoManager.showCode(button, code);
}

function copyCode(code) {
  window.lisbonDealsApp.promoManager.copyCode(code);
}

// ===== INICIALIZAR APLICAÇÃO =====
window.lisbonDealsApp = new LisbonDealsApp();