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

    // Texto dinâmico de desconto nas ofertas
    const discountMessageEl = document.getElementById("discount-text-message");
    if (discountMessageEl) {
      discountMessageEl.innerHTML = `Selecione a opção abaixo. O valor já inclui <b>${discountPct}% de desconto</b>.`;
    }

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
               window.openBuyModal({
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

    // === AVALIAÇÕES ===
    let reviews = [];
    let visibleReviews = 5;

    // Carregar reviews do backend
    async function loadReviews() {
      try {
        const response = await fetch(`${window.VOUCHERHUB_API}/api/partners/${slug}/reviews`);
        if (response.ok) {
          reviews = await response.json();
        } else {
          reviews = [];
        }
      } catch (error) {
        console.error('Erro ao carregar reviews:', error);
        reviews = [];
      }
      renderReviews();
    }

    function renderReviews() {
      const container = document.getElementById('reviews-container');
      container.innerHTML = '';

      if (reviews.length === 0) {
        container.innerHTML = '<p>Ainda não há avaliações para este parceiro.</p>';
        return;
      }

      const reviewsToShow = reviews.slice(0, visibleReviews);

      reviewsToShow.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';

        const stars = Array.from({length: 5}, (_, i) =>
          i < review.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>'
        ).join('');

        const reviewUser = review.user || review.name || review.username || review.author || 'Usuário Anônimo';

        // Formatar data com fallback seguro
        let formattedDate = '';
        const dateValue = review.createdAt || review.date || review.createddate;
        if (dateValue) {
          try {
            const dateObj = new Date(dateValue);
            if (!isNaN(dateObj)) {
              formattedDate = dateObj.toLocaleDateString('pt-PT');
            }
          } catch (e) {
            formattedDate = '';
          }
        }

        reviewCard.innerHTML = `
          <div class="review-header">
            <span class="review-user">${reviewUser}</span>
            <div class="review-rating">${stars}</div>
          </div>
          <p class="review-comment">${review.comment}</p>
          <small class="review-date">${formattedDate || 'Data não disponível'}</small>
        `;

        container.appendChild(reviewCard);
      });

      const loadMoreBtn = document.getElementById('load-more-reviews');
      if (reviews.length > visibleReviews) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    function openReviewModal() {
      document.getElementById('review-modal').style.display = 'flex';
      document.getElementById('review-name').value = '';
      document.getElementById('review-comment').value = '';
      document.getElementById('review-email').value = '';
      document.getElementById('char-count').textContent = '0/300';
      resetStars();
    }

    function closeReviewModal() {
      document.getElementById('review-modal').style.display = 'none';
    }

    function resetStars() {
      const stars = document.querySelectorAll('#rating-stars i');
      stars.forEach(star => {
        star.className = 'far fa-star';
      });
    }

    function handleStarClick(event) {
      const rating = parseInt(event.target.dataset.rating);
      const stars = document.querySelectorAll('#rating-stars i');

      stars.forEach((star, index) => {
        if (index < rating) {
          star.className = 'fas fa-star';
        } else {
          star.className = 'far fa-star';
        }
      });
    }

    function updateCharCount() {
      const textarea = document.getElementById('review-comment');
      const count = document.getElementById('char-count');
      count.textContent = `${textarea.value.length}/300`;
    }

    async function submitReview(event) {
      event.preventDefault();

      const rating = document.querySelectorAll('#rating-stars .fas.fa-star').length;
      const name = document.getElementById('review-name').value.trim();
      const comment = document.getElementById('review-comment').value.trim();
      const email = document.getElementById('review-email').value.trim();

      if (rating === 0) {
        alert('Por favor, selecione uma avaliação em estrelas.');
        return;
      }

      if (!name || name.length < 2) {
        alert('Por favor, insira seu nome (mínimo 2 caracteres).');
        return;
      }

      if (!email || !email.includes('@') || !email.includes('.')) {
        alert('Por favor, insira um email válido.');
        return;
      }

      if (comment.length === 0) {
        alert('Por favor, escreva um comentário.');
        return;
      }

      if (comment.length > 300) {
        alert('Comentário deve ter no máximo 300 caracteres.');
        return;
      }

      try {
        const response = await fetch(`${window.VOUCHERHUB_API}/api/partners/${slug}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rating: rating,
            comment: comment,
            email: email,
            user: name // Agora usa o nome fornecido pelo usuário
          })
        });

        if (response.ok) {
          const newReview = await response.json();
          reviews.unshift(newReview); // Adiciona no início
          renderReviews();
          closeReviewModal();
          alert('Avaliação enviada com sucesso!');
        } else {
          const error = await response.json();
          alert(`Erro: ${error.message || 'Erro ao enviar avaliação'}`);
        }
      } catch (error) {
        console.error('Erro ao enviar review:', error);
        alert('Erro ao enviar avaliação. Tente novamente.');
      }
    }

    // Event listeners
    document.getElementById('leave-review-btn').addEventListener('click', openReviewModal);
    document.getElementById('cancel-review').addEventListener('click', closeReviewModal);
    document.getElementById('review-modal').addEventListener('click', (e) => {
      if (e.target.id === 'review-modal') closeReviewModal();
    });
    document.getElementById('rating-stars').addEventListener('click', handleStarClick);
    document.getElementById('review-comment').addEventListener('input', updateCharCount);
    document.getElementById('review-form').addEventListener('submit', submitReview);
    document.getElementById('load-more-btn').addEventListener('click', () => {
      visibleReviews += 5;
      renderReviews();
    });

    // Carregar reviews iniciais
    loadReviews();

  } catch (err) {
    console.error("Erro JS:", err);
  }
})();