const BACKEND_URL =
  window.VOUCHERHUB_API || "https://voucherhub-backend-production.up.railway.app";

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
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";
  listEl.innerHTML = posts
    .map((post) => {
      const title = pickLocalized(post, "title");
      const excerpt = pickLocalized(post, "excerpt");
      const createdAt = new Date(post.created_at).toLocaleDateString(
        getLang() === "en" ? "en-US" : "pt-PT"
      );
      return `
        <article class="blog-card">
          <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="blog-card-link">
            <img src="${post.image_url || "logo.png"}" alt="${title}" class="blog-card-image" />
            <div class="blog-card-body">
              <p class="blog-card-meta">${createdAt} • ${post.author || "VoucherHub"}</p>
              <h2>${title}</h2>
              <p>${excerpt || ""}</p>
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
          <a class="btn btn-official btn-sm" href="partner.html?slug=${encodeURIComponent(partner.slug)}">
            ${getLang() === "en" ? "See Experience" : "Ver Experiência"}
          </a>
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

  document.title = `${title} | VoucherHub Blog`;
  ensureMeta("description", excerpt);
  ensureMeta("og:title", title);
  ensureMeta("og:description", excerpt);
  ensureMeta("og:image", post.image_url || "https://voucherhub.pt/logo.png");
  ensureMeta("og:url", window.location.href);

  article.innerHTML = `
    <header class="post-header">
      <p class="post-meta">${createdAt} • ${post.author || "VoucherHub"}</p>
      <h1>${title}</h1>
      ${post.image_url ? `<img src="${post.image_url}" alt="${title}" class="post-cover" />` : ""}
      <p class="post-excerpt">${excerpt || ""}</p>
    </header>
    <section class="post-content">${normalizeText(content)}</section>
  `;
}

async function initBlogListPage() {
  const res = await fetch(`${BACKEND_URL}/api/blog`);
  const posts = await res.json();
  renderList(Array.isArray(posts) ? posts : []);
}

async function initPostPage() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    window.location.href = "blog.html";
    return;
  }

  const post = await loadPost(slug);
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
