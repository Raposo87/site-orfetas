const BACKEND_URL =
  window.VOUCHERHUB_API || "https://voucherhub-backend-production.up.railway.app";

let cachedBlogPosts = [];
let currentPostPayload = null;

function getShareUrl() {
  const u = new URL(window.location.href);
  u.hash = "";
  return u.toString();
}

function getShareActionsMarkup() {
  return `
    <div class="share-container-actions">
      <button type="button" class="share-btn share-btn-native" data-share-native hidden>
        <i class="fas fa-share-from-square" aria-hidden="true"></i>
      </button>
      <a class="share-btn share-btn-whatsapp" data-share-whatsapp href="#" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-whatsapp" aria-hidden="true"></i>
      </a>
      <a class="share-btn share-btn-facebook" data-share-facebook href="#" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-facebook-f" aria-hidden="true"></i>
      </a>
      <button type="button" class="share-btn share-btn-copy" data-share-copy>
        <i class="fas fa-link" aria-hidden="true"></i>
      </button>
    </div>
  `;
}

function buildShareContainerHTML(i18nKey, fallbackLabel, extraClass = "") {
  const cls = ["share-container", extraClass].filter(Boolean).join(" ");
  return `
    <div class="${cls}" data-share-root role="group">
      <p class="share-container-label" data-i18n="${i18nKey}">${escapeHtml(fallbackLabel)}</p>
      ${getShareActionsMarkup()}
    </div>
  `;
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

function showShareToast(message, type = "success") {
  if (window.voucherhubApp?.promoManager?.showToast) {
    window.voucherhubApp.promoManager.showToast(message, type);
  } else {
    window.alert(message);
  }
}

function setupShareButtons(container, { title, url }) {
  if (!container) return;

  const shareTitle = (title || document.title || "VoucherHub").trim();
  const shareUrl = (url || getShareUrl()).trim();
  const textCombined = `${shareTitle} ${shareUrl}`.trim();

  const actionsOld = container.querySelector(".share-container-actions");
  if (!actionsOld) return;

  const wrap = document.createElement("div");
  wrap.innerHTML = getShareActionsMarkup().trim();
  const actions = wrap.firstElementChild;
  actionsOld.replaceWith(actions);

  const wa = actions.querySelector("[data-share-whatsapp]");
  const fb = actions.querySelector("[data-share-facebook]");
  const nativeBtn = actions.querySelector("[data-share-native]");
  const copyBtn = actions.querySelector("[data-share-copy]");

  wa.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(textCombined)}`;
  fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const tr = (key, fbv) => (window.i18n?.t(key) ? window.i18n.t(key) : fbv);
  nativeBtn.setAttribute("aria-label", tr("blog.shareNative", "Share"));
  nativeBtn.title = tr("blog.shareNative", "Share");
  wa.setAttribute("aria-label", tr("blog.shareWhatsApp", "WhatsApp"));
  wa.title = tr("blog.shareWhatsApp", "WhatsApp");
  fb.setAttribute("aria-label", tr("blog.shareFacebook", "Facebook"));
  fb.title = tr("blog.shareFacebook", "Facebook");
  copyBtn.setAttribute("aria-label", tr("blog.copyLink", "Copy link"));
  copyBtn.title = tr("blog.copyLink", "Copy link");

  if (typeof navigator.share === "function") {
    nativeBtn.hidden = false;
    nativeBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: shareUrl,
        });
      } catch (err) {
        if (err && err.name === "AbortError") return;
        console.error("Share failed:", err);
      }
    });
  } else {
    nativeBtn.hidden = true;
  }

  copyBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const ok = await copyTextToClipboard(shareUrl);
    const msg = tr("blog.linkCopied", "Link copied!");
    if (ok) showShareToast(msg, "success");
    else showShareToast(tr("toast.error", "Error"), "error");
  });
}

function initBlogShareUI() {
  const host = document.getElementById("blog-share-host");
  if (!host) return;
  host.innerHTML = buildShareContainerHTML("blog.shareHeadingBlog", "Partilhar o blog");
  window.i18n?.translatePage?.();
  const root = host.querySelector("[data-share-root]");
  const blogTitle = `${window.i18n?.t("blog.heroTitle") || "VoucherHub Blog"} | VoucherHub`;
  const blogUrl = new URL("blog.html", window.location.href).href;
  setupShareButtons(root, { title: blogTitle, url: blogUrl });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readMoreLabel() {
  return window.i18n?.t ? window.i18n.t("blog.readMore") : "Ler Artigo";
}

function waitForI18n() {
  return new Promise((resolve) => {
    const tick = () => {
      if (window.i18n) return resolve();
      setTimeout(tick, 60);
    };
    tick();
  });
}

function getLang() {
  if (window.i18n?.getCurrentLang) return window.i18n.getCurrentLang();
  return "pt";
}

function pickLocalized(post, baseField) {
  const lang = getLang() === "en" ? "en" : "pt";
  return post[`${baseField}_${lang}`] || post[`${baseField}_pt`] || "";
}

function ensureMeta(key, content) {
  const isProperty = key.startsWith("og:");
  const selector = isProperty ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    if (isProperty) tag.setAttribute("property", key);
    else tag.setAttribute("name", key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content || "");
}

function renderList(posts) {
  const listEl = document.getElementById("blog-list");
  const emptyEl = document.getElementById("blog-empty-state");
  if (!listEl) return;

  if (!posts.length) {
    if (emptyEl) emptyEl.style.display = "block";
    listEl.innerHTML = "";
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  const cta = escapeHtml(readMoreLabel());
  listEl.innerHTML = posts
    .map((post) => {
      const title = pickLocalized(post, "title");
      const excerpt = pickLocalized(post, "excerpt");
      const createdAt = new Date(post.created_at).toLocaleDateString(
        getLang() === "en" ? "en-US" : "pt-PT"
      );
      const href = `post.html?slug=${encodeURIComponent(post.slug)}`;
      const safeTitle = escapeHtml(title);
      const safeExcerpt = escapeHtml(excerpt || "");
      const safeAuthor = escapeHtml(post.author || "VoucherHub");
      return `
        <article class="blog-card">
          <a href="${href}" class="blog-card-link" aria-label="${safeTitle}">
            <img src="${post.image_url || "logo.png"}" alt="${safeTitle}" class="blog-card-image" loading="lazy" />
            <div class="blog-card-body">
              <p class="blog-card-meta">${createdAt} • ${safeAuthor}</p>
              <h2>${safeTitle}</h2>
              ${safeExcerpt ? `<p class="blog-card-excerpt">${safeExcerpt}</p>` : ""}
              <span class="blog-card-cta">
                <span class="blog-card-cta-text">${cta}</span>
                <span class="blog-card-cta-arrow" aria-hidden="true">→</span>
              </span>
            </div>
          </a>
        </article>
      `;
    })
    .join("");
}

function normalizeText(text) {
  return (text || "").replace(/\n/g, "<br>");
}

async function renderRecommendedExperience(post) {
  const wrapper = document.getElementById("recommended-experience");
  if (!wrapper || !post.related_partner_slug) return;

  try {
    const res = await fetch("experiences.json", { cache: "no-store" });
    const data = await res.json();
    const partner = (data.modes || [])
      .flatMap((mode) => mode.partners || [])
      .find((p) => p.slug === post.related_partner_slug);

    if (!partner) return;

    let offer = null;
    if (partner.offers && partner.offers.length > 0) {
      offer = partner.offers[0];
    }

    const offLabel = partner.discount_label || `${partner.discount_percent || ""}% OFF`;
    const callout =
      getLang() === "en"
        ? `Enjoy ${offLabel} on this activity`
        : `Aproveite ${offLabel} nesta atividade`;

    wrapper.style.display = "block";
    wrapper.innerHTML = `
      <h3>${getLang() === "en" ? "Recommended Experience" : "Experiência Recomendada"}</h3>
      <div class="recommended-card-inner">
        <img src="${(partner.images && partner.images[0]) || "logo.png"}" alt="${partner.name}" />
        <div>
          <h4>${partner.name}</h4>
          <p>${partner.location || ""}</p>
          <p class="recommended-discount">${callout}</p>
          <button class="btn-buy-offer" 
            data-slug="${partner.slug}" 
            data-price="${offer ? offer.price : ''}" 
            data-offer-name="${offer ? offer.title : ''}">
            Comprar
          </button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Erro ao renderizar experiência recomendada:", err);
  }
}

async function loadPost(slug) {
  const res = await fetch(`${BACKEND_URL}/api/blog/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error("Post not found");
  return res.json();
}

function renderPost(post) {
  const article = document.getElementById("post-article");
  if (!article) return;

  const title = pickLocalized(post, "title");
  const excerpt = pickLocalized(post, "excerpt");
  const content = pickLocalized(post, "content");
  const createdAt = new Date(post.created_at).toLocaleDateString(
    getLang() === "en" ? "en-US" : "pt-PT"
  );

  const safeTitle = escapeHtml(title);
  const safeExcerpt = escapeHtml(excerpt || "");
  const safeAuthor = escapeHtml(post.author || "VoucherHub");

  const shareUrl = getShareUrl();
  document.title = `${title} | VoucherHub Blog`;
  ensureMeta("description", excerpt);
  ensureMeta("og:title", title);
  ensureMeta("og:description", excerpt);
  ensureMeta("og:image", post.image_url || "https://voucherhub.pt/logo.png");
  ensureMeta("og:url", shareUrl);

  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement("link");
    linkCanonical.setAttribute("rel", "canonical");
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute("href", shareUrl);

  article.innerHTML = `
    <header class="post-header">
      <p class="post-meta">${createdAt} • ${safeAuthor}</p>
      <h1>${safeTitle}</h1>
      ${post.image_url ? `<img src="${escapeHtml(post.image_url)}" alt="${safeTitle}" class="post-cover" />` : ""}
      <p class="post-excerpt">${safeExcerpt}</p>
    </header>
    ${buildShareContainerHTML("blog.shareHeadingPost", "Partilhar este artigo", "share-container--article-top")}
    <section class="post-content">${normalizeText(content)}</section>
    ${buildShareContainerHTML("blog.shareHeadingPost", "Partilhar este artigo", "share-container--article-bottom")}
  `;

  window.i18n?.translatePage?.();
  article.querySelectorAll("[data-share-root]").forEach((root) => {
    setupShareButtons(root, { title, url: shareUrl });
  });
}

function wireBlogListLanguageSwitch() {
  if (!window.i18n || document.body.dataset.page !== "blog-list") return;
  if (window.__voucherhubBlogListI18nWired) return;
  window.__voucherhubBlogListI18nWired = true;
  const originalSwitchLanguage = window.i18n.switchLanguage.bind(window.i18n);
  window.i18n.switchLanguage = function (lang) {
    originalSwitchLanguage(lang);
    renderList(cachedBlogPosts);
    initBlogShareUI();
  };
}

async function initBlogListPage() {
  initBlogShareUI();
  const res = await fetch(`${BACKEND_URL}/api/blog`);
  const posts = await res.json();
  cachedBlogPosts = Array.isArray(posts) ? posts : [];
  renderList(cachedBlogPosts);
  wireBlogListLanguageSwitch();
}

function wirePostLanguageSwitch() {
  if (!window.i18n || document.body.dataset.page !== "blog-post") return;
  if (window.__voucherhubPostShareI18nWired) return;
  window.__voucherhubPostShareI18nWired = true;
  const originalSwitchLanguage = window.i18n.switchLanguage.bind(window.i18n);
  window.i18n.switchLanguage = function (lang) {
    originalSwitchLanguage(lang);
    if (currentPostPayload) {
      renderPost(currentPostPayload);
      renderRecommendedExperience(currentPostPayload).catch((e) => console.error(e));
    }
  };
}

async function initPostPage() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    window.location.href = "blog.html";
    return;
  }

  wirePostLanguageSwitch();
  const post = await loadPost(slug);
  currentPostPayload = post;
  renderPost(post);
  await renderRecommendedExperience(post);
}

document.addEventListener("DOMContentLoaded", async () => {
  await waitForI18n();
  const page = document.body.dataset.page;
  try {
    if (page === "blog-list") {
      await initBlogListPage();
    } else if (page === "blog-post") {
      await initPostPage();
    }
  } catch (err) {
    console.error("Erro no blog:", err);
  }
});
