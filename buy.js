// === buy.js ===
document.addEventListener("DOMContentLoaded", () => {
  const buyButton = document.getElementById("partner-link");
  if (!buyButton) return;

  buyButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Impede o link padrão

    try {
      const params = new URLSearchParams(location.search);
      const slug = params.get("slug");
      if (!slug) throw new Error("Parceiro inválido");

      // 🌀 Mostra o estado de carregamento
      const originalText = buyButton.innerHTML;
      buyButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processando...`;
      buyButton.disabled = true;

      // 🔗 Faz a requisição ao backend
      const response = await fetch(`${window.VOUCHERHUB_API}/api/vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });

      if (!response.ok) throw new Error("Erro ao criar voucher");

      const data = await response.json();

      // ✅ Sucesso — redireciona ou mostra mensagem
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.message) {
        alert(data.message);
      } else {
        alert("Compra criada com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao processar compra:", err);
      alert("❌ Ocorreu um erro ao processar seu pedido. Tente novamente mais tarde.");
    } finally {
      // ♻️ Restaura o botão
      buyButton.disabled = false;
      buyButton.innerHTML = `<i class="fas fa-shopping-cart"></i> Adquirir Voucher Agora`;
    }
  });
});
