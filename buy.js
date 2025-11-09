// === buy.js ===
document.addEventListener("DOMContentLoaded", () => {
  const buyButton = document.getElementById("partner-link");
  if (!buyButton) return;

  buyButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const params = new URLSearchParams(location.search);
    const slug = params.get("slug");
    if (!slug) {
      alert("Erro: parceiro inválido.");
      return;
    }

    const email = prompt("✉️ Por favor, insira seu e-mail para receber o voucher:");
    if (!email || !email.includes("@")) {
      alert("⚠️ É necessário um e-mail válido para continuar.");
      return;
    }

    try {
      buyButton.disabled = true;
      buyButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Criando pagamento...`;

      // Busca informações do parceiro
      const res = await fetch("experiences.json");
      const data = await res.json();
      let partner = null;
      for (const m of data.modes) {
        const found = m.partners.find(p => p.slug === slug);
        if (found) {
          partner = found;
          break;
        }
      }
      if (!partner) throw new Error("Parceiro não encontrado.");

      const payload = {
        email,
        partnerSlug: slug,
        productName: partner.name,
        amountCents: Math.round(
          parseFloat(partner.price_discount.replace(/[^\d.,]/g, "").replace(",", ".")) * 100
        ),
        currency: "eur"
      };

      const response = await fetch(`${window.VOUCHERHUB_API}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const dataResp = await response.json();
      if (!response.ok || !dataResp.url) {
        throw new Error(dataResp.error || "Erro ao criar sessão de pagamento");
      }

      // Redirecionar para Stripe
      window.location.href = dataResp.url;

    } catch (err) {
      console.error(err);
      alert("❌ Ocorreu um erro ao criar a sessão de pagamento. Tente novamente.");
      buyButton.innerHTML = `<i class="fas fa-shopping-cart"></i> Adquirir Voucher Agora`;
    } finally {
      buyButton.disabled = false;
    }
  });
});
