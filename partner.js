(async function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');

  if (!slug) {
    document.body.innerHTML = "<h1 style='text-align:center; margin-top:50px;'>Parceiro não especificado.</h1>";
    return;
  }

  // --- Função para abrir o modal de compra ---
  function openBuyModal(offerData) {
    const { partnerSlug, offerName, price, originalPrice } = offerData;

    // 1. Criar o HTML do modal com o novo campo
    const modalHtml = `
      <div id="buy-modal" class="modal-backdrop">
        <div class="modal-content">
          <span class="modal-close-btn">&times;</span>
          <h3>Comprar: ${offerName}</h3>
          <p>Preço Final: <b style="color:#00AA00">€${price}</b> (Original: €${originalPrice})</p>
          
          <div class="form-group">
            <label for="buy-email">Seu E-mail (Para receber o voucher):</label>
            <input type="email" id="buy-email" required placeholder="ex: seu.email@exemplo.com">
          </div>
          
          <div class="form-group sponsor-code-section">
            <label for="sponsor-code-input">Você possui um código especial de parceiro/banco?</label>
            <input type="text" id="sponsor-code-input" placeholder="Digite seu código aqui (opcional)">
          </div>

          <button id="modal-pay-btn" class="btn-primary" style="margin-top: 15px;">
            Pagar €${price}
          </button>

          <p id="modal-error" style="color:red; margin-top:10px;"></p>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('buy-modal');
    const closeBtn = modal.querySelector('.modal-close-btn');
    const payBtn = document.getElementById('modal-pay-btn');
    const errorEl = document.getElementById('modal-error');

    // Fechar modal
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'buy-modal') modal.remove();
    });

    // 2. Lógica de pagamento (Enviar payload para o backend)
    payBtn.addEventListener('click', async () => {
      const email = document.getElementById('buy-email').value.trim();
      // LER O NOVO CAMPO
      const sponsorCode = document.getElementById('sponsor-code-input').value.trim();
      
      if (!email || !email.includes('@')) {
        errorEl.textContent = 'Por favor, insira um e-mail válido.';
        return;
      }
      
      payBtn.disabled = true;
      payBtn.textContent = 'Aguarde...';
      errorEl.textContent = '';

      try {
        const response = await fetch('/api/payments/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            partnerSlug: partnerSlug,
            productName: offerName,
            amountCents: Math.round(price * 100), // Envia em centavos
            originalPriceCents: Math.round(originalPrice * 100),
            sponsorCode: sponsorCode // NOVO CAMPO
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Redireciona para o Stripe
          window.location.href = data.url;
        } else {
          // Erro do backend (ex: Código inválido ou usado)
          errorEl.textContent = data.error || 'Erro desconhecido ao iniciar o pagamento.';
        }
      } catch (err) {
        console.error('Erro de rede:', err);
        errorEl.textContent = 'Erro de conexão. Tente novamente.';
      } finally {
        payBtn.disabled = false;
        payBtn.textContent = `Pagar €${price}`;
      }
    });

    // Adiciona CSS básico para o modal (Assumindo que você tem um CSS mínimo)
    if(!document.getElementById('modal-style')) {
        const style = document.createElement('style');
        style.id = 'modal-style';
        style.innerHTML = `
            .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
            .modal-content { background: white; padding: 25px; border-radius: 8px; max-width: 400px; width: 90%; position: relative; color: #333; }
            .modal-close-btn { position: absolute; top: 10px; right: 10px; font-size: 20px; cursor: pointer; }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
            .form-group input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
            .btn-primary { padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
        `;
        document.head.appendChild(style);
    }
  }
  // --- Fim da função do modal ---

  try {
    const res = await fetch('experiences.json');
    const data = await res.json();

    let partner = null;
    let mode = null;
    
    // [... CÓDIGO DE BUSCA DO PARCEIRO AQUI...]
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
    
    // O resto do código de preenchimento de dados do parceiro (desconto, título, localização, galeria, etc.) permanece inalterado
    // ...
    // === 1. DEFINIR A PORCENTAGEM DE DESCONTO ===
    const discountPct = partner.discount_percent || 15; 
    
    // === PREENCHIMENTO BÁSICO ===
    document.title = `${partner.name} – VoucherHub`;
    if(document.getElementById("partner-title")) document.getElementById("partner-title").textContent = partner.name;
    document.getElementById("partner-name").textContent = partner.name;
    document.getElementById("partner-category").textContent = mode.title || "Experiência";
    // ... [código de localização, label de desconto, contatos, história, galeria continua] ...

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
                  data-original-price="${originalPrice.toFixed(2)}"
              >
                  <i class="fas fa-ticket-alt"></i> Comprar
              </button>
            </div>
          `;
          offersContainer.appendChild(card);
        });

        // 3. Adicionar Event Listener para abrir o modal de compra
        document.querySelectorAll('.btn-buy-offer').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove qualquer modal anterior
                document.getElementById('buy-modal')?.remove(); 
                
                const offerData = {
                    partnerSlug: this.getAttribute('data-slug'),
                    offerName: this.getAttribute('data-offer-name'),
                    price: this.getAttribute('data-price'),
                    originalPrice: this.getAttribute('data-original-price')
                };
                openBuyModal(offerData);
            });
        });

      } else {
        offersContainer.innerHTML = "<p>Não há ofertas disponíveis.</p>";
      }
    }

  } catch (err) {
    console.error("Erro JS:", err);
  }
})();