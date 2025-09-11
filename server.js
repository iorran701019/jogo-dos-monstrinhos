const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Banco de dados em memória (simples e compatível)
let mathScores = [
  // Dados de exemplo para teste
  { id: 1, player_name: 'João', player_age: '10 anos', player_school: 'Escola Municipal', score: 150, level: 5, date: new Date().toISOString() },
  { id: 2, player_name: 'Maria', player_age: '9 anos', player_school: 'Colégio Estadual', score: 120, level: 4, date: new Date().toISOString() },
  { id: 3, player_name: 'Pedro', player_age: '8 anos', player_school: 'Escola Particular', score: 100, level: 4, date: new Date().toISOString() },
  { id: 4, player_name: 'Ana', player_age: '10 anos', player_school: 'Escola Municipal', score: 90, level: 3, date: new Date().toISOString() },
  { id: 5, player_name: 'Lucas', player_age: '9 anos', player_school: 'Colégio Estadual', score: 80, level: 3, date: new Date().toISOString() },
  { id: 6, player_name: 'Carla', player_age: '8 anos', player_school: 'Escola Particular', score: 70, level: 2, date: new Date().toISOString() },
  { id: 7, player_name: 'Paulo', player_age: '7 anos', player_school: 'Escola Municipal', score: 60, level: 2, date: new Date().toISOString() },
  { id: 8, player_name: 'Julia', player_age: '8 anos', player_school: 'Colégio Estadual', score: 50, level: 2, date: new Date().toISOString() },
  { id: 9, player_name: 'Marcos', player_age: '10 anos', player_school: 'Escola Particular', score: 40, level: 1, date: new Date().toISOString() },
  { id: 10, player_name: 'Fernanda', player_age: '9 anos', player_school: 'Escola Municipal', score: 30, level: 1, date: new Date().toISOString() }
];

// Rotas da API
app.get('/api/scores-math', (req, res) => {
  try {
    // Ordenar por score (maior primeiro) e pegar os top 10
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

    // Adicionar novo score
    const newScore = {
      id: mathScores.length + 1,
      player_name: playerName,
      player_age: playerAge,
      player_school: playerSchool,
      score: score,
      level: level,
      date: new Date().toISOString()
    };
    
    mathScores.push(newScore);
    
    // Manter apenas os 100 melhores scores para não consumir muita memória
    mathScores.sort((a, b) => b.score - a.score);
    mathScores = mathScores.slice(0, 100);
    
    res.json({ 
      success: true, 
      message: 'Score salvo com sucesso!',
      id: newScore.id
    });
  } catch (error) {
    console.error('Erro ao salvar score:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar score' });
  }
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando', 
    scores_count: mathScores.length,
    timestamp: new Date().toISOString() 
  });
});

// Rota para qualquer outra requisição
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor Monstrinhos da Matemática rodando na porta ${PORT}`);
  console.log(`🌐 Jogo disponível em: http://localhost:${PORT}`);
  console.log(`📊 API de scores em: http://localhost:${PORT}/api/scores-math`);
  console.log(`💡 Dados em memória: ${mathScores.length} scores carregados`);
});