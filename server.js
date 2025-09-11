const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve arquivos estáticos da pasta atual

// Banco de dados em memória para MONSTRINHOS DA MATEMÁTICA
let mathScores = [];

// Rotas da API ESPECÍFICAS para o novo jogo
app.get('/api/scores-math', (req, res) => {
  try {
    const topScores = [...mathScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((score, index) => ({
        id: index + 1,
        player_name: score.player_name,
        player_age: score.player_age,
        player_school: score.player_school,
        score: score.score,
        level: score.level,
        date: score.date
      }));
    
    res.json(topScores);
  } catch (error) {
    console.error('Erro ao buscar scores:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar scores' });
  }
});

app.post('/api/scores-math', (req, res) => {
  try {
    const { playerName, playerAge, playerSchool, score, level } = req.body;
    
    if (!playerName || !playerAge || !playerSchool || score === undefined) {
      return res.status(400).json({ success: false, message: 'Dados incompletos' });
    }

    // Adiciona ao array mantendo apenas as 100 melhores pontuações para evitar consumo excessivo de memória
    mathScores.push({
      player_name: playerName,
      player_age: playerAge,
      player_school: playerSchool,
      score: score,
      level: level,
      date: new Date().toISOString()
    });
    
    // Mantém apenas as 100 melhores pontuações
    mathScores.sort((a, b) => b.score - a.score);
    mathScores = mathScores.slice(0, 100);
    
    res.json({ 
      success: true, 
      message: 'Score salvo com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao salvar score:', error);
    res.status(500). json({ success: false, message: 'Erro ao salvar score' });
  }
});

// Rota principal - Serve o arquivo HTML do jogo
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de health check para o Render
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando', timestamp: new Date().toISOString() });
});

// Rota para qualquer outra requisição - serve o index.html (útil para Single Page Applications)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor Monstrinhos da Matemática rodando na porta ${PORT}`);
  console.log(`🌐 Jogo disponível em: http://localhost:${PORT}`);
  console.log(`📊 API de scores em: http://localhost:${PORT}/api/scores-math`);
});