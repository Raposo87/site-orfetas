// reviews.js - Exemplo de implementação dos endpoints para reviews
// Este arquivo deve ser integrado no seu backend Node.js/Express

const express = require('express');
const router = express.Router();

// Simulação de banco de dados (em produção, use um BD real)
let reviewsDB = {};

// GET /api/partners/:slug/reviews - Buscar reviews de um parceiro
router.get('/partners/:slug/reviews', (req, res) => {
  try {
    const { slug } = req.params;
    const reviews = reviewsDB[slug] || [];

    // Ordenar por data (mais recentes primeiro)
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(reviews);
  } catch (error) {
    console.error('Erro ao buscar reviews:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/partners/:slug/reviews - Criar nova review
router.post('/partners/:slug/reviews', (req, res) => {
  try {
    const { slug } = req.params;
    const { rating, comment, email, user } = req.body;

    // Validação
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5 estrelas' });
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Email válido é obrigatório' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comentário é obrigatório' });
    }

    if (comment.length > 300) {
      return res.status(400).json({ error: 'Comentário deve ter no máximo 300 caracteres' });
    }

    // Inicializar array se não existir
    if (!reviewsDB[slug]) {
      reviewsDB[slug] = [];
    }

    // Criar nova review
    const newReview = {
      id: Date.now().toString(), // ID único simples
      user: user || email.split('@')[0], // Usar parte antes do @ como nome
      email: email, // Guardar email para moderação
      rating: parseInt(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      verified: false // Em produção, verificar se usuário comprou
    };

    // Adicionar ao banco
    reviewsDB[slug].push(newReview);

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Erro ao criar review:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/partners/:slug/reviews/:id - Deletar review (opcional, para admin)
router.delete('/partners/:slug/reviews/:id', (req, res) => {
  try {
    const { slug, id } = req.params;

    if (!reviewsDB[slug]) {
      return res.status(404).json({ error: 'Parceiro não encontrado' });
    }

    const reviewIndex = reviewsDB[slug].findIndex(review => review.id === id);
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review não encontrada' });
    }

    reviewsDB[slug].splice(reviewIndex, 1);
    res.json({ message: 'Review deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar review:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;