// server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// Configura Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Rota para gerar resposta da IA (Hugging Face)
app.post('/ai', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Chama a API da Hugging Face
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.HF_TOKEN}` },
        body: JSON.stringify({ inputs: text })
      }
    );
    
    const data = await response.json();
    const aiResponse = data.generated_text || 'Desculpe, não entendi.';

    // Salva a resposta da IA no Supabase
    await supabase
      .from('messages')
      .insert([{ content: aiResponse, user_id: 'IA' }]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro na IA' });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));