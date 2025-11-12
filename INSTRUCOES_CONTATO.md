# 📧 Instruções: Como Preencher Email e Telefone nas Experiências

## 📋 Onde Preencher

Os campos de **email** e **telefone** devem ser preenchidos no arquivo `experiences.json`, dentro de cada objeto de parceiro.

## 🔍 Localização no Arquivo

Cada experiência (parceiro) está dentro de um objeto que tem esta estrutura:

```json
{
  "slug": "nome-do-parceiro",
  "name": "Nome do Parceiro",
  "location": "Endereço",
  "price_original": "€XX",
  "price_discount": "€XX",
  "savings": "Economize €XX",
  "discount_label": "XX% OFF",
  "code": "CODIGO",
  "official_url": "https://...",
  "email": "",        ← PREENCHER AQUI
  "phone": "",        ← PREENCHER AQUI
  "images": [...],
  ...
}
```

## ✍️ Como Preencher

### Campo `email`

- **Formato**: Endereço de email completo
- **Exemplo**: `"email": "contato@empresa.com"`
- **Se não tiver email**: Deixe como `"email": ""` (string vazia)
- **Importante**: Sempre entre aspas duplas

### Campo `phone`

- **Formato**: Número de telefone como texto
- **Exemplo**: `"phone": "+351 912 345 678"` ou `"phone": "912 345 678"`
- **Formato recomendado**: Pode incluir espaços e caracteres para melhor legibilidade
- **Se não tiver telefone**: Deixe como `"phone": ""` (string vazia)
- **Importante**: Sempre entre aspas duplas

## 📝 Exemplos Práticos

### Exemplo 1: Com email e telefone

```json
{
  "slug": "espaco-libela",
  "name": "Espaço libélula",
  "email": "Nicoleraposof7@gmail.com",
  "phone": "+351 912 345 678",
  ...
}
```

### Exemplo 2: Apenas com email

```json
{
  "slug": "surf-wave-lisbon",
  "name": "Surf Wave Lisbon",
  "email": "info@surfwavelisbon.com",
  "phone": "",
  ...
}
```

### Exemplo 3: Apenas com telefone

```json
{
  "slug": "yoga-kula",
  "name": "Yoga Kula",
  "email": "",
  "phone": "912 345 678",
  ...
}
```

### Exemplo 4: Sem email nem telefone

```json
{
  "slug": "exemplo",
  "name": "Exemplo",
  "email": "",
  "phone": "",
  ...
}
```

## 🎯 Onde os Dados Aparecem

Os campos de email e telefone aparecem na **página do parceiro** (`partner.html`), na seção de **Contato**, logo após a seção de Localização e Desconto.

### Comportamento:

- ✅ Se houver email: aparece como link clicável (abre o cliente de email)
- ✅ Se houver telefone: aparece como link clicável (funciona em dispositivos móveis)
- ✅ Se não houver nenhum dos dois: a seção de Contato fica oculta automaticamente
- ✅ Se houver apenas um dos dois: apenas o que foi preenchido aparece

## ⚠️ Importante

1. **Sempre use aspas duplas** (`"`) para strings em JSON
2. **Não deixe vírgulas extras** no final do último campo antes de fechar o objeto
3. **Mantenha o formato JSON válido** - use uma ferramenta de validação se necessário
4. **Email e telefone são opcionais** - se não tiver, deixe como string vazia `""`

## 🔄 Lista de Parceiros para Atualizar

Atualmente, os seguintes parceiros precisam ter seus dados de contato preenchidos:

1. **Surf Wave Lisbon** - `slug: "surf-wave-lisbon"`
2. **Twolines** - `slug: "twolines"`
3. **Caparica Kite Center** - `slug: "caparica-kite-center"`
4. **Sintra Quad Adventures** - `slug: "sintra-quad-adventures"`
5. **Nanan Adventures** - `slug: "nanan-adventures"`
6. **Yoga Kula** - `slug: "yoga-kula"`
7. **Espaço libélula** - `slug: "espaco-libela"` ✅ (já tem email)

## 🚀 Após Preencher

Após preencher os campos:

1. Salve o arquivo `experiences.json`
2. Atualize a página do parceiro no navegador
3. Verifique se os dados aparecem corretamente na seção de Contato

---

**Dúvidas?** Verifique a estrutura JSON e certifique-se de que está válida antes de salvar.
