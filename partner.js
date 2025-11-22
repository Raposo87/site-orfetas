(async function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  
  if (!slug) {
    document.body.innerHTML = "<h1 style='text-align:center; margin-top:50px;'>Parceiro não especificado.</h1>";
    return;
  }

  try {
    const res = await fetch('experiences.json');
    const data = await res.json();

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
      document.body.innerHTML = "<h1 style='text-align:center; margin-top:50px;'>Parceiro não encontrado.</h1>";
      return;
    }

    // === 1. DEFINIR A PORCENTAGEM DE DESCONTO ===
    // Se no JSON tiver "discount_percent": 30, usa 30. Se não tiver, usa 15 como padrão.
    const discountPct = partner.discount_percent || 15; 

    // === PREENCHIMENTO BÁSICO ===
    document.title = `${partner.name} – VoucherHub`;
    if(document.getElementById("partner-title")) document.getElementById("partner-title").textContent = partner.name;
    document.getElementById("partner-name").textContent = partner.name;
    document.getElementById("partner-category").textContent = mode.title || "Experiência";
    if(document.getElementById("partner-icon")) document.getElementById("partner-icon").className = partner.icon || "fas fa-tag";
    if(document.getElementById("partner-link")) document.getElementById("partner-link").href = partner.official_url;

    // Localização
    const locationLink = document.getElementById("partner-location-link");
    if (partner.location) {
      locationLink.textContent = partner.location;
      locationLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.location)}`;
    } else {
      locationLink.textContent = "Ver no mapa";
      locationLink.removeAttribute("href");
    }

    // Label de Desconto (Usa a variável dinâmica)
    document.getElementById("partner-discount-label").textContent = partner.discount_label || `${discountPct}% OFF`;

    // Contatos
    const emailEl = document.getElementById("partner-email");
    const emailLinkEl = document.getElementById("partner-email-link");
    if (partner.email && emailEl) {
      emailEl.style.display = "block";
      emailLinkEl.textContent = partner.email;
      emailLinkEl.href = `mailto:${partner.email}`;
    }

    const phoneEl = document.getElementById("partner-phone");
    const phoneLinkEl = document.getElementById("partner-phone-link");
    if (partner.phone && phoneEl) {
      phoneEl.style.display = "block";
      phoneLinkEl.textContent = partner.phone;
      phoneLinkEl.href = `tel:${partner.phone.replace(/\s/g, '')}`;
    }

    const instaEl = document.getElementById("partner-instagram");
    const instaLink = document.getElementById("partner-instagram-link");
    if (partner.instagram && instaEl) {
      instaEl.style.display = "block";
      instaLink.href = partner.instagram;
    }

    // História
    document.getElementById("partner-story-short").textContent = partner.story_short || "";
    const storyFullEl = document.getElementById("partner-story-full");
    if (partner.story_full) {
      storyFullEl.innerHTML = `<p>${partner.story_full.replace(/\n/g, '<br>')}</p>`;
    }

    const toggleHistBtn = document.getElementById("toggle-history");
    if (toggleHistBtn) {
      toggleHistBtn.addEventListener("click", function() {
        const visible = storyFullEl.style.display === "block";
        storyFullEl.style.display = visible ? "none" : "block";
        this.innerHTML = visible 
          ? '<i class="fas fa-chevron-down"></i> Mostrar mais' 
          : '<i class="fas fa-chevron-up"></i> Mostrar menos';
      });
    }

    // === GALERIA ===
    const gallery = document.getElementById("partner-gallery");
    const heroBg = document.querySelector(".partner-hero-background");

    if (partner.images && partner.images.length > 0) {
      if(heroBg) heroBg.innerHTML = `<img src="${partner.images[0]}" alt="${partner.name}" style="width:100%; height:100%; object-fit:cover;">`;

      partner.images.forEach(img => {
        const el = document.createElement("img");
        el.src = img;
        el.alt = partner.name;
        gallery.appendChild(el);
      });
    }

    const toggleGalleryBtn = document.getElementById("toggle-gallery-btn");
    if (toggleGalleryBtn) {
      toggleGalleryBtn.addEventListener("click", function() {
        gallery.classList.toggle("show");
        const isShown = gallery.classList.contains("show");
        this.innerHTML = isShown 
          ? '<i class="fas fa-times"></i> Ocultar Fotos' 
          : '<i class="fas fa-camera"></i> Ver Fotos da Experiência';
      });
    }

    // === OFERTAS COM CÁLCULO DE DESCONTO DINÂMICO ===
    const offersContainer = document.getElementById("partner-offers-grid");
    if (offersContainer) {
      offersContainer.innerHTML = "";

      // Atualiza título da seção de ofertas para mostrar a % correta
      const offersTitleP = offersContainer.parentElement.querySelector("p");
      if(offersTitleP) {
         offersTitleP.innerHTML = `Selecione a opção abaixo. O valor já inclui <b>${discountPct}% de desconto</b>.`;
      }

      if (partner.offers && partner.offers.length > 0) {
        partner.offers.forEach((o, index) => {
          const card = document.createElement("div");
          card.className = "offer-card";

          let title = typeof o === "string" ? o : o.title;
          let text = typeof o === "string" ? "" : (o.text || o.description || "");

          let originalPrice = 0;
          let finalPrice = 0;
          let priceHtml = "";

          // Tenta pegar preço do JSON ou do Regex
          const priceMatch = text.match(/€?\s?(\d+[.,]?\d*)\s?€?/);

          if (o.price) {
            originalPrice = parseFloat(o.price);
          } else if (priceMatch) {
            originalPrice = parseFloat(priceMatch[1].replace(",", "."));
          }

          if (originalPrice > 0) {
            // === CÁLCULO DINÂMICO ===
            // Se discountPct for 30, multiplica por 0.7 (1 - 0.30)
            // Se discountPct for 15, multiplica por 0.85 (1 - 0.15)
            const multiplier = 1 - (discountPct / 100);
            finalPrice = originalPrice * multiplier;
            
            const fmtOriginal = originalPrice % 1 === 0 ? originalPrice : originalPrice.toFixed(2);
            const fmtFinal = finalPrice.toFixed(2);

            priceHtml = `
              <div class="offer-price-wrapper">
                <span class="offer-price-old">€${fmtOriginal}</span>
                <div style="display:flex; align-items:center;">
                  <span class="offer-price-final">€${fmtFinal}</span>
                  <span class="discount-badge-small">-${discountPct}%</span>
                </div>
              </div>
            `;
          } else {
            priceHtml = `<span class="offer-price-final" style="font-size:1.2rem">Sob Consulta</span>`;
            finalPrice = 0;
          }

          card.innerHTML = `
            <div>
              <h3 class="offer-title">${title}</h3>
              <p class="offer-desc">${text}</p>
            </div>
            <div class="offer-footer">
              ${priceHtml}
              <button class="btn-buy-offer" 
    data-slug="${slug}" 
    data-offer-name="${title}" 
    data-price="${finalPrice.toFixed(2)}"
    data-original-price="${originalPrice}"
>
    <i class="fas fa-ticket-alt"></i> Comprar
</button>
            </div>
          `;
          offersContainer.appendChild(card);
        });
      } else {
        offersContainer.innerHTML = "<p>Não há ofertas disponíveis.</p>";
      }
    }

  } catch (err) {
    console.error("Erro JS:", err);
  }
})();