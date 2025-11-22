document.addEventListener("DOMContentLoaded", () => {
  
  document.body.addEventListener("click", async (event) => {
    
    const btn = event.target.closest(".btn-buy-offer");
    if (!btn) return;

    event.preventDefault();

    // Recupera os dados JÁ CALCULADOS no partner.js
    const slug = btn.dataset.slug;
    const offerName = btn.dataset.offerName;
    // Este é o valor COM 15% de desconto que colocamos no partner.js
    const priceVal = parseFloat(btn.dataset.price); 
    const originalPrice = parseFloat(btn.dataset.originalPrice);


    if (!slug) {
      alert("Erro técnico: Slug do parceiro não encontrado.");
      return;
    }

    if (!priceVal || priceVal <= 0) {
      alert("Para adquirir esta experiência, por favor entre em contato direto com o parceiro via Instagram ou WhatsApp, pois o preço é sob consulta.");
      return;
    }

    // Confirmação visual para o usuário
    const email = prompt(`🛒 Comprando: ${offerName}\n💰 Valor com Desconto: €${priceVal}\n\nDigite seu e-mail para receber o voucher:`);
    
    if (!email || !email.includes("@")) {
      alert("⚠️ É necessário um e-mail válido para processar o pagamento.");
      return;
    }

    const originalHtml = btn.innerHTML;
    
    try {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ...`;

      const payload = {
        email: email,
        partnerSlug: slug,
        productName: offerName, 
        // O backend espera centavos (ex: 25.50 vira 2550)
        amountCents: Math.round(priceVal * 100), 
        originalPriceCents: Math.round(originalPrice * 100),
        currency: "eur"
      };

      // Envio para o Stripe (Backend)
      const response = await fetch(`${window.VOUCHERHUB_API}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const dataResp = await response.json();

      if (!response.ok || !dataResp.url) {
        throw new Error(dataResp.error || "Erro na criação do checkout");
      }

      // Redirecionamento seguro
      window.location.href = dataResp.url;

    } catch (err) {
      console.error("Erro Stripe:", err);
      alert("❌ Não foi possível iniciar o pagamento. Tente novamente.");
      btn.innerHTML = originalHtml;
    } finally {
      btn.disabled = false;
      if (!window.location.href.includes("checkout")) {
         btn.innerHTML = originalHtml;
      }
    }
  });
});