const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware ESSENCIAIS para Render
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname, { 
  index: 'index.html',
  extensions: ['html', 'htm']
}));

// Banco de dados em memória
let mathScores = [
  { id: 1, player_name: 'João', player_age: '10 anos', player_school: 'Escola Municipal', score: 150, level: 5, date: new Date().toISOString() },
  { id: 2, player_name: 'Maria', player_age: '9 anos', player_school: 'Colégio Estadual', score: 120, level: 4, date: new Date().toISOString() }
];

// ✅ ROTA PRINCIPAL - Serve o jogo
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ API DE SCORES (que já funciona!)
app.get('/api/scores-math', (req, res) => {
  try {
    const topScores = [...mathScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    res.json(topScores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar scores' });
  }
});

app.post('/api/scores-math', (req, res) => {
  try {
    const { playerName, playerAge, playerSchool, score, level } = req.body;
    
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
    mathScores.sort((a, b) => b.score - a.score);
    mathScores = mathScores.slice(0, 100);
    
    res.json({ success: true, id: newScore.id });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar score' });
  }
});

// ✅ ROTAS DE EXPORTAÇÃO DO RANKING
app.get('/api/ranking.json', (req, res) => {
  try {
    const topScores = [...mathScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=ranking.json');
    res.json({
      generated_at: new Date().toISOString(),
      total_scores: mathScores.length,
      scores: topScores
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao exportar ranking' });
  }
});

app.get('/api/ranking.csv', (req, res) => {
  try {
    let csv = 'Posição,Nome,Idade,Escola,Pontuação,Nível,Data\n';
    
    const sortedScores = [...mathScores].sort((a, b) => b.score - a.score);
    
    sortedScores.forEach((score, index) => {
      csv += `${index + 1},"${score.player_name}","${score.player_age}","${score.player_school}",${score.score},${score.level},"${new Date(score.date).toLocaleDateString('pt-BR')}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=ranking.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao exportar CSV' });
  }
});

// ✅ HEALTH CHECK (Importante para Render)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    scores_count: mathScores.length
  });
});

// ✅ Rota catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ INICIALIZAÇÃO OTIMIZADA
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor Monstrinhos da Matemática rodando na porta ${PORT}`);
  console.log(`🌐 Jogo disponível em: http://localhost:${PORT}`);
  console.log(`📊 API de scores em: http://localhost:${PORT}/api/scores-math`);
  console.log(`📁 Exportar ranking: http://localhost:${PORT}/api/ranking.json`);
}).on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err.message);
  process.exit(1);
});

// ✅ Graceful shutdown para Render
process.on('SIGTERM', () => {
  console.log('🔄 Reiniciando servidor...');
  server.close(() => {
    console.log('✅ Servidor finalizado gracefully');
    process.exit(0);
  });
});
