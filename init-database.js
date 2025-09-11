const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'ranking.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Criar tabela se não existir teste
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

// Fechar conexão
db.close((err) => {
  if (err) {
    console.error('Erro ao fechar conexão:', err);
  } else {
    console.log('Conexão com o banco de dados fechada.');
  }
});