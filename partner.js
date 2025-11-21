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
  const locationLink = document.getElementById("partner-location-link");

  if (partner.location) {
    const googleMapsURL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.location)}`;
    locationLink.textContent = partner.location;
    locationLink.href = googleMapsURL;
  } else {
    locationLink.textContent = "Localização não informada";
    locationLink.removeAttribute("href");
  }
  document.getElementById("partner-discount-label").textContent = partner.discount_label;
  document.getElementById("partner-category").textContent = mode.title;
  document.getElementById("partner-icon").className = partner.icon || "fas fa-tag";
  document.getElementById("partner-link").href = partner.official_url;
  document.getElementById("partner-story-short").textContent = partner.story_short || "";
  
  // Exibir email e telefone se disponíveis
  const emailEl = document.getElementById("partner-email");
  const emailLinkEl = document.getElementById("partner-email-link");
  const phoneEl = document.getElementById("partner-phone");
  const phoneLinkEl = document.getElementById("partner-phone-link");
  const instagramEl = document.getElementById("partner-instagram");
  const instagramLinkEl = document.getElementById("partner-instagram-link");
  
  if (partner.email) {
    emailEl.style.display = "block";
    emailLinkEl.textContent = partner.email;
    emailLinkEl.href = `mailto:${partner.email}`;
  } else {
    emailEl.style.display = "none";
  }
  
  if (partner.phone) {
    phoneEl.style.display = "block";
    phoneLinkEl.textContent = partner.phone;
    phoneLinkEl.href = `tel:${partner.phone.replace(/\s/g, '')}`;
  } else {
    phoneEl.style.display = "none";
  }

  // Instagram
  if (partner.instagram) {
    instagramEl.style.display = "block";
    instagramLinkEl.href = partner.instagram;
  } else {
    instagramEl.style.display = "none";
  }
  
  // Ocultar seção de contato se não houver email nem telefone
  const contactSection = document.getElementById("partner-contact").parentElement;
  if (!partner.email && !partner.phone && !partner.instagram) {
    contactSection.style.display = "none";
  }

  const storyFullEl = document.getElementById("partner-story-full");
  if (partner.story_full) {
    // Converter quebras de linha em <br> e manter parágrafos
    const formattedText = partner.story_full
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    storyFullEl.innerHTML = `<p>${formattedText}</p>`;
  } else {
    storyFullEl.textContent = "";
  }

  // Galeria
  const gallery = document.getElementById("partner-gallery");
  partner.images?.forEach(img => {
    const el = document.createElement("img");
    el.src = img;
    el.alt = partner.name;
    gallery.appendChild(el);
  });


  // Ofertas com título + botão separado
const offersContainer = document.getElementById("partner-offers");

if (partner.offers && partner.offers.length) {
  partner.offers.forEach(o => {
    const item = document.createElement("div");
    item.className = "accordion-item";

    const title = typeof o === "string" ? o : o.title;
    const text = typeof o === "string" ? o : o.text;

    item.innerHTML = `
      <div class="accordion-header-row">
        <h3 class="accordion-title">${title}</h3>
        <button class="accordion-button">Saber mais</button>
      </div>
      <div class="accordion-content">
        ${text}
      </div>
    `;

    offersContainer.appendChild(item);
  });

  // Comportamento para abrir/fechar
  document.querySelectorAll(".accordion-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const content = btn.parentElement.nextElementSibling;
      const isOpen = content.style.display === "block";

      document.querySelectorAll(".accordion-content").forEach(c => {
        c.style.display = "none";
      });
      content.style.display = isOpen ? "none" : "block";
    });
  });

}


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