(async function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  
  if (!slug) {
    document.body.innerHTML = "<h1 style='text-align:center; margin-top:50px;'>Parceiro não especificado.</h1>";
    return;
  }

  // ==================================================================
  // 🆕 FUNÇÃO DO MODAL DE COMPRA (Adicionada sem quebrar o layout)
  // ==================================================================
  function openBuyModal(offerData) {
    const { partnerSlug, offerName, price, originalPrice } = offerData;

    // Remove modal anterior se existir (evita duplicação)
    const existingModal = document.getElementById('buy-modal');
    if (existingModal) existingModal.remove();

    // HTML do Modal
    const modalHtml = `
      <div id="buy-modal" class="modal-backdrop">
        <div class="modal-content">
          <span class="modal-close-btn">&times;</span>
          <h3 style="margin-top:0">Comprar: ${offerName}</h3>
          <p>Preço Final: <b style="color:#00AA00">€${price}</b> <span style="font-size:0.9em; color:#777">(Original: €${originalPrice})</span></p>
          
          <div class="form-group">
            <label for="buy-email" style="display:block; margin-bottom:5px; font-weight:bold;">Seu E-mail:</label>
            <input type="email" id="buy-email" required placeholder="ex: seu.email@exemplo.com" style="width:100%; padding:8px; margin-bottom:15px;">
          </div>
          
          <div class="form-group sponsor-code-section" style="background:#f9f9f9; padding:10px; border-radius:5px; border:1px dashed #ccc;">
            <label for="sponsor-code-input" style="display:block; margin-bottom:5px; font-weight:bold; color:#d35400;">Código Especial (Opcional):</label>
            <input type="text" id="sponsor-code-input" placeholder="Ex: BANCO-123" style="width:100%; padding:8px;">
            <small style="color:#666; font-size:0.8em;">Parceiros/Patrocinadores têm +5% de desconto extra.</small>
          </div>

          <button id="modal-pay-btn" class="btn-buy-offer" style="margin-top: 20px; width:100%; padding:12px; background:#28a745; color:white; border:none; font-size:16px; cursor:pointer;">
            Pagar €${price}
          </button>

          <p id="modal-error" style="color:red; margin-top:10px; font-size:0.9em; text-align:center;"></p>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Estilos CSS dinâmicos para o modal (caso não existam no CSS principal)
    if(!document.getElementById('modal-dynamic-style')) {
        const style = document.createElement('style');
        style.id = 'modal-dynamic-style';
        style.innerHTML = `
            .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; }
            .modal-content { background: white; padding: 25px; border-radius: 10px; max-width: 400px; width: 90%; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
            .modal-close-btn { position: absolute; top: 10px; right: 15px; font-size: 24px; cursor: pointer; color: #aaa; }
            .modal-close-btn:hover { color: #000; }
        `;
        document.head.appendChild(style);
    }

    // Elementos
    const modal = document.getElementById('buy-modal');
    const closeBtn = modal.querySelector('.modal-close-btn');
    const payBtn = document.getElementById('modal-pay-btn');
    const errorEl = document.getElementById('modal-error');
    
    // Inputs
    const emailInput = document.getElementById('buy-email');
    const sponsorInput = document.getElementById('sponsor-code-input');

    // Fechar Modal
    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // ✅ CORREÇÃO DO ENTER: Impedir que o Enter dispare formulários antigos
    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Para tudo o que o navegador ia fazer
            e.stopPropagation(); // Impede o erro "Slug não encontrado" de subir
            payBtn.click(); // Clica no botão Pagar do nosso modal
        }
    };

    emailInput.addEventListener('keydown', handleEnterKey);
    sponsorInput.addEventListener('keydown', handleEnterKey);

    // AÇÃO DE PAGAR
    payBtn.addEventListener('click', async () => {
      const email = document.getElementById('buy-email').value.trim();
      const sponsorCode = document.getElementById('sponsor-code-input').value.trim();
      
      if (!email || !email.includes('@')) {
        errorEl.textContent = 'Por favor, insira um e-mail válido.';
        return;
      }
      
      payBtn.disabled = true;
      payBtn.innerText = 'Processando...';
      errorEl.textContent = '';

      try {
        // 👇 1. DEFINIÇÃO MANUAL DA URL (Para garantir que vai para a Railway)
        const backendUrl = 'https://voucherhub-backend-production.up.railway.app/api/payments/create-checkout-session';
        
        console.log("🚀 Iniciando pagamento para:", backendUrl);
        console.log("📦 Payload:", {
            email,
            partnerSlug,
            productName: offerName,
            amountCents: Math.round(price * 100),
            originalPriceCents: Math.round(originalPrice * 100),
            sponsorCode: sponsorCode 
        });

        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            partnerSlug: partnerSlug,
            productName: offerName,
            amountCents: Math.round(price * 100),
            originalPriceCents: Math.round(originalPrice * 100),
            sponsorCode: sponsorCode 
          })
        });

        // 👇 2. TRATAMENTO DE ERRO MELHORADO
        // Se o servidor retornar erro (400, 500), lemos o texto antes de tentar JSON
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erro do Servidor:", errorText);
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || 'Erro no servidor');
            } catch (e) {
                throw new Error(`Erro técnico: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url; 
        } else {
          throw new Error('URL de pagamento não recebida.');
        }

      } catch (err) {
        console.error("❌ ERRO FETCH:", err);
        errorEl.textContent = `Erro: ${err.message}`;
        payBtn.disabled = false;
        payBtn.innerText = `Pagar €${price}`;
      }
    });
  }
  // ==================================================================


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
    const discountPct = partner.discount_percent || 15; 

    // === PREENCHIMENTO BÁSICO (SEU CÓDIGO ORIGINAL MANTIDO) ===
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

    // Label de Desconto
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
    

    // === GALERIA (SEU CÓDIGO ORIGINAL MANTIDO) ===
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

    // ============================
    // Renderiza "O que está incluído"
    // ============================
    const includesSection = document.getElementById("includes-section");
    const includesList = document.getElementById("includes-list");

    if (partner.includes && Array.isArray(partner.includes) && partner.includes.length > 0) {
      includesSection.style.display = "block";
      includesList.innerHTML = partner.includes
        .map(item => `<li>${item}</li>`)
        .join("");
    }


    // === OFERTAS (MODIFICADO PARA VERIFICAR STOCK) ===
    const offersContainer = document.getElementById("partner-offers-grid");
    if (offersContainer) {
      offersContainer.innerHTML = "";

      if (partner.offers && partner.offers.length > 0) {
        // Usamos um for...of para poder usar await dentro do loop
        for (const o of partner.offers) {
          const card = document.createElement("div");
          card.className = "offer-card";

          let title = typeof o === "string" ? o : o.title;
          let text = typeof o === "string" ? "" : (o.text || o.description || "");
          let originalPrice = o.price ? parseFloat(o.price) : 0;
          let finalPrice = originalPrice * (1 - (discountPct / 100));

          // --- 🛡️ VERIFICAÇÃO DE STOCK (BANCO + JSON) ---
          let isAvailable = true;
          try {
            // 1. Verifica no Banco de Dados
            const stockCheck = await fetch(`https://voucherhub-backend-production.up.railway.app/api/payments/check-stock?partnerSlug=${slug}&productName=${encodeURIComponent(title)}`);
            const stockData = await stockCheck.json();
            isAvailable = stockData.available;

            // 2. Plano B: Se no JSON o limite for 0, bloqueia mesmo que o banco não saiba
            if (o.stock_limit === 0) {
              isAvailable = false;
            }
          } catch (e) {
            console.error("Erro ao checar stock", e);
            // Se o servidor cair, o JSON manda:
            if (o.stock_limit === 0) isAvailable = false;
          }
          // --- FIM DA VERIFICAÇÃO ---

          const priceHtml = originalPrice > 0 
            ? `<div class="offer-price-wrapper">
                <span class="offer-price-old">€${originalPrice.toFixed(2)}</span>
                <span class="offer-price-final">€${finalPrice.toFixed(2)}</span>
               </div>`
            : `<span class="offer-price-final">Sob Consulta</span>`;

          // Se não houver stock, mudamos o botão
          const buttonHtml = isAvailable 
            ? `<button class="btn-buy-offer"><i class="fas fa-ticket-alt"></i> Comprar</button>`
            : `<button class="btn-buy-offer" disabled style="background:#ccc; cursor:not-allowed;">Esgotado</button>`;

          card.innerHTML = `
            <div>
              <h3 class="offer-title">${title}</h3>
              <p class="offer-desc">${text}</p>
            </div>
            <div class="offer-footer">
              ${priceHtml}
              ${buttonHtml}
            </div>
          `;
          
          if (isAvailable) {
            const btn = card.querySelector('.btn-buy-offer');
            btn.addEventListener('click', (e) => {
               e.preventDefault();
               e.stopPropagation();
               openBuyModal({
                   partnerSlug: slug,
                   offerName: title,
                   price: finalPrice.toFixed(2),
                   originalPrice: originalPrice
               });
            });
          }

          offersContainer.appendChild(card);
        }
      } else {
        offersContainer.innerHTML = "<p>Não há ofertas disponíveis.</p>";
      }
    }

  } catch (err) {
    console.error("Erro JS:", err);
  }
})();