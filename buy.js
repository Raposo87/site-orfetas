// === buy.js ===
document.addEventListener("DOMContentLoaded", () => {
  const buyButton = document.getElementById("partner-link");
  if (!buyButton) return;

  buyButton.addEventListener("click", async (event) => {
    event.preventDefault(); // evita abrir o link direto

    try {
      const params = new URLSearchParams(location.search);
      const slug = params.get("slug");
      if (!slug) throw new Error("Parceiro inválido");

      // Cria o pedido no backend (chama sua API do Railway)
      const response = await fetch(`${window.VOUCHERHUB_API}/api/vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });

      if (!response.ok) throw new Error("Erro ao criar voucher");

      const data = await response.json();

      // Caso o backend retorne uma URL de checkout (Stripe)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } 
      // Caso seja um voucher simples (enviado por email)
      else if (data.message) {
        alert(data.message);
      } 
      else {
        alert("Compra criada com sucesso!");
      }

    } catch (err) {
      console.error("Erro ao processar compra:", err);
      alert("Erro ao processar o pedido. Tente novamente.");
    }
  });
});
