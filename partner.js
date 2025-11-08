(async function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  if (!slug) {
    document.body.innerHTML = "<h1>Parceiro não encontrado.</h1>";
    return;
  }

  const res = await fetch('experiences.json');
  const data = await res.json();

  // Encontrar o parceiro pelo slug
  let partner = null;
  let mode = null;
  for (const m of data.modes) {
    const found = m.partners.find(p => p.slug === slug);
    if (found) {
      partner = found;
      mode = m;
      break;
    }
  }

  if (!partner) {
    document.body.innerHTML = "<h1>Parceiro não encontrado.</h1>";
    return;
  }

  // Preencher conteúdo
  document.title = `${partner.name} – VoucherHub`;
  document.getElementById("partner-title").textContent = partner.name;
  document.getElementById("partner-name").textContent = partner.name;
  document.getElementById("partner-location").textContent = partner.location;
  document.getElementById("partner-discount-label").textContent = partner.discount_label;
  document.getElementById("partner-category").textContent = mode.title;
  document.getElementById("partner-icon").className = partner.icon || "fas fa-tag";
  document.getElementById("partner-link").href = partner.official_url;
  document.getElementById("partner-story-short").textContent = partner.story_short || "";
  document.getElementById("partner-story-full").textContent = partner.story_full || "";

  // Galeria
  const gallery = document.getElementById("partner-gallery");
  partner.images?.forEach(img => {
    const el = document.createElement("img");
    el.src = img;
    el.alt = partner.name;
    gallery.appendChild(el);
  });

  // Ofertas
  const offers = document.getElementById("partner-offers");
  partner.offers?.forEach(o => {
    const li = document.createElement("li");
    li.textContent = o;
    offers.appendChild(li);
  });

  // Botão mostrar/ocultar história
  document.getElementById("toggle-history").addEventListener("click", function() {
    const full = document.getElementById("partner-story-full");
    const visible = full.style.display === "block";
    full.style.display = visible ? "none" : "block";
    this.innerHTML = visible 
      ? '<i class="fas fa-book-open"></i> Mostrar mais' 
      : '<i class="fas fa-book"></i> Mostrar menos';
  });
})();
