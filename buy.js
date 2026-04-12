document.addEventListener("DOMContentLoaded", () => {
  
  document.body.addEventListener("click", async (event) => {
    
    const btn = event.target.closest(".btn-buy-offer");
    if (!btn) return;

    event.preventDefault();

    // Recupera os dados JÁ CALCULADOS no partner.js
    const slug = btn.dataset.slug;
    const offerName = btn.dataset.offerName;
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

    // ===============================
    // 1) PEDIR EMAIL (já existente)
    // ===============================
    const email = prompt(
      `🛒 Comprando: ${offerName}\n💰 Valor com Desconto: €${priceVal}\n\nDigite seu e-mail para receber o voucher:`
    );
    
    if (!email || !email.includes("@")) {
      alert("⚠️ É necessário um e-mail válido para processar o pagamento.");
      return;
    }

    // ==============================================
    // 2) NOVO: CAMPO OPCIONAL PARA CÓDIGO PATROCINADOR
    // ==============================================
    const sponsorCode = prompt(
      "Você possui um código especial de parceiro/banco?\n\nSe tiver, digite aqui:\nSe não tiver, deixe vazio."
    ) || "";

    // Normalizar (sem espaços)
    const sponsorCodeClean = sponsorCode.trim().toUpperCase();

    // ===============================
    // 3) PROSSEGUIR COM A COMPRA
    // ===============================
    const originalHtml = btn.innerHTML;
    
    try {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ...`;

      const payload = {
        email: email,
        partnerSlug: slug,
        productName: offerName,
        amountCents: Math.round(priceVal * 100),
        originalPriceCents: Math.round(originalPrice * 100),
        currency: "eur",

        // NOVO (envia o código especial para o backend)
        sponsorCode: sponsorCodeClean,

        // NOVO (envia o código de afiliado se existir)
        affiliateSlug: localStorage.getItem('vh_affiliate') || ""
      };

      console.log("PAYLOAD ENVIADO:", payload); // debug opcional

      const response = await fetch(`${window.VOUCHERHUB_API}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const dataResp = await response.json();

      if (!response.ok || !dataResp.url) {
        throw new Error(dataResp.error || "Erro na criação do checkout");
      }

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
