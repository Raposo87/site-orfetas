// i18n.js - Sistema de internacionalização
class I18nManager {
  constructor() {
    this.translations = {};
    this.currentLang = this.getInitialLanguage();
    this.supportedLangs = ['en', 'pt'];
    this.init();
  }

  async init() {
    await this.loadTranslations();
    this.createLanguageSwitcher();
    this.translatePage();
  }

  getInitialLanguage() {
    // 1. Verificar se há idioma salvo no localStorage
    const saved = localStorage.getItem('voucherhub_lang');
    if (saved && ['en', 'pt'].includes(saved)) return saved;

    // 2. Detectar idioma do navegador
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt';
    
    // 3. Padrão: portugues
    return 'pt';
  }

  async loadTranslations() {
    try {
      const response = await fetch('translations.json');
      this.translations = await response.json();
    } catch (error) {
      console.error('Erro ao carregar traduções:', error);
      // Traduções básicas de fallback
      this.translations = {
        en: { nav: { badge: "Limited-Time Deals" } },
        pt: { nav: { badge: "Ofertas por Tempo Limitado" } }
      };
    }
  }

  createLanguageSwitcher() {
    const navbar = document.querySelector('.nav-container');
    if (!navbar) return;

    const switcherHTML = `
      <div class="language-switcher">
        <button class="lang-btn ${this.currentLang === 'pt' ? 'active' : ''}" data-lang="pt" aria-label="Português">
          <span class="flag-icon">🇵🇹</span>
          <span class="lang-text">PT</span>
        </button>
        <button class="lang-btn ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en" aria-label="English">
          <span class="flag-icon">🇺🇸</span>
          <span class="lang-text">EN</span>
        </button>
      </div>
    `;

    navbar.insertAdjacentHTML('beforeend', switcherHTML);

    // Adicionar event listeners
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.currentTarget.dataset.lang;
        this.switchLanguage(lang);
      });
    });
  }

  switchLanguage(lang) {
    if (!this.supportedLangs.includes(lang)) return;
    
    this.currentLang = lang;
    localStorage.setItem('voucherhub_lang', lang);
    
    // Atualizar botões ativos
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Traduzir página
    this.translatePage();

    // Atualizar HTML lang attribute
    document.documentElement.lang = lang;

    // Mostrar feedback
    if (window.voucherhubApp && window.voucherhubApp.promoManager) {
      const message = lang === 'pt' ? 'Idioma alterado para Português' : 'Language changed to English';
      window.voucherhubApp.promoManager.showToast(message, 'success');
    }
  }

  translatePage() {
    const t = this.translations[this.currentLang];
    if (!t) return;

    // Traduzir elementos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const translation = this.getNestedTranslation(t, key);
      if (translation) {
        el.innerHTML = translation;
      }
    });

    // Traduzir placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const translation = this.getNestedTranslation(t, key);
      if (translation) {
        el.placeholder = translation;
      }
    });

    // Traduzir títulos
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      const translation = this.getNestedTranslation(t, key);
      if (translation) {
        el.title = translation;
      }
    });
  }

  getNestedTranslation(obj, path) {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
  }

  t(key) {
    return this.getNestedTranslation(this.translations[this.currentLang], key) || key;
  }

  getCurrentLang() {
    return this.currentLang;
  }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18nManager();
  });
} else {
  window.i18n = new I18nManager();
}