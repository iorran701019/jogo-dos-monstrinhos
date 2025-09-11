const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Conectar ao banco de dados SQLite
const dbPath = path.join(__dirname, 'ranking.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    
    // Criar tabela se não existir (para garantir)
    db.run(`CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      player_age TEXT NOT NULL,
      player_school TEXT NOT NULL,
      score INTEGER NOT NULL,
      level INTEGER NOT NULL,
      date TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Erro ao criar tabela:', err);
      } else {
        console.log('Tabela "scores" verificada/criada com sucesso.');
      }
    });
  }
});

// Rotas da API
app.get('/api/scores-math', (req, res) => {
  try {
    db.all(
      'SELECT * FROM scores ORDER BY score DESC LIMIT 10',
      (err, rows) => {
        if (err) {
          console.error('Erro ao buscar scores:', err);
          return res.status(500).json({ success: false, message: 'Erro ao buscar scores' });
        }
        
        const topScores = rows.map((score, index) => ({
          id: index + 1,
          player_name: score.player_name,
          player_age: score.player_age,
          player_school: score.player_school,
          score: score.score,
          level: score.level,
          date: score.date
        }));
        
        res.json(topScores);
      }
    );
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

    // Inserir no banco de dados
    db.run(
      'INSERT INTO scores (player_name, player_age, player_school, score, level, date) VALUES (?, ?, ?, ?, ?, ?)',
      [playerName, playerAge, playerSchool, score, level, new Date().toISOString()],
      function(err) {
        if (err) {
          console.error('Erro ao salvar score:', err);
          return res.status(500).json({ success: false, message: 'Erro ao salvar score' });
        }
        
        res.json({ 
          success: true, 
          message: 'Score salvo com sucesso!',
          id: this.lastID
        });
      }
    );
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
  res.json({ status: 'OK', message: 'Servidor funcionando', timestamp: new Date().toISOString() });
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
});

// Fechar conexão com o banco ao encerrar o servidor
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar conexão com o banco:', err);
    } else {
      console.log('Conexão com o banco de dados fechada.');
    }
    process.exit(0);
  });
});