const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3334;

// Middleware
app.use(cors());
app.use(express.json());

// Schema do MongoDB
const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Título é obrigatório'],
    trim: true 
  },
  description: { 
    type: String, 
    default: '',
    trim: true 
  },
  isFavorite: { 
    type: Boolean, 
    default: false 
  },
  color: { 
    type: String, 
    default: '#BAE2FF',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Cor deve estar no formato hexadecimal (#RRGGBB)'
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  collection: 'tasks'
});

const Task = mongoose.model('Task', taskSchema);

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI não está definida no arquivo .env');
    }
    
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📋 Collection: tasks`);
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  }
};

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API

// GET /tasks - Listar tarefas com filtros
app.get('/tasks', async (req, res) => {
  try {
    console.log('📋 GET /tasks - Query params:', req.query);
    const { search, favorite, color } = req.query;
    
    let query = {};
    
    // Filtro de pesquisa
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    // Filtro de favoritos
    if (favorite === 'true') {
      query.isFavorite = true;
    }
    
    // Filtro de cor
    if (color && color.trim()) {
      query.color = color.trim();
    }
    
    console.log('🔍 MongoDB Query:', JSON.stringify(query, null, 2));
    
    const tasks = await Task.find(query)
      .sort({ isFavorite: -1, createdAt: -1 })
      .lean();
    
    console.log(`✅ Encontradas ${tasks.length} tarefas`);
    
    // Converter _id para id para compatibilidade com frontend
    const formattedTasks = tasks.map(task => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      color: task.color,
      isFavorite: task.isFavorite,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));
    
    res.json(formattedTasks);
  } catch (error) {
    console.error('❌ Erro ao buscar tarefas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// POST /tasks - Criar nova tarefa
app.post('/tasks', async (req, res) => {
  try {
    console.log('📝 POST /tasks - Body:', req.body);
    const { title, description, color, isFavorite } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }
    
    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      color: color || '#BAE2FF',
      isFavorite: Boolean(isFavorite)
    };
    
    console.log('💾 Salvando tarefa:', taskData);
    
    const newTask = new Task(taskData);
    const savedTask = await newTask.save();
    
    console.log('✅ Tarefa salva com ID:', savedTask._id);
    
    // Formato de resposta compatível com frontend
    const responseTask = {
      id: savedTask._id.toString(),
      title: savedTask.title,
      description: savedTask.description,
      color: savedTask.color,
      isFavorite: savedTask.isFavorite,
      createdAt: savedTask.createdAt,
      updatedAt: savedTask.updatedAt
    };
    
    res.status(201).json(responseTask);
  } catch (error) {
    console.error('❌ Erro ao criar tarefa:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// PUT /tasks/:id - Atualizar tarefa
app.put('/tasks/:id', async (req, res) => {
  try {
    console.log('📝 PUT /tasks/:id - ID:', req.params.id, 'Body:', req.body);
    const { id } = req.params;
    const { title, description, color, isFavorite } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de tarefa inválido' });
    }
    
    const updateData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      color: color || '#BAE2FF',
      isFavorite: Boolean(isFavorite),
      updatedAt: new Date()
    };
    
    console.log('💾 Atualizando tarefa:', updateData);
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    console.log('✅ Tarefa atualizada:', updatedTask._id);
    
    // Formato de resposta compatível com frontend
    const responseTask = {
      id: updatedTask._id.toString(),
      title: updatedTask.title,
      description: updatedTask.description,
      color: updatedTask.color,
      isFavorite: updatedTask.isFavorite,
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt
    };
    
    res.json(responseTask);
  } catch (error) {
    console.error('❌ Erro ao atualizar tarefa:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// DELETE /tasks/:id - Deletar tarefa
app.delete('/tasks/:id', async (req, res) => {
  try {
    console.log('🗑️ DELETE /tasks/:id - ID:', req.params.id);
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de tarefa inválido' });
    }
    
    const deletedTask = await Task.findByIdAndDelete(id);
    
    if (!deletedTask) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    console.log('✅ Tarefa deletada:', deletedTask._id);
    res.status(204).send();
  } catch (error) {
    console.error('❌ Erro ao deletar tarefa:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const taskCount = await Task.countDocuments();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: statusMap[dbStatus],
        name: mongoose.connection.db?.databaseName || 'unknown',
        totalTasks: taskCount
      },
      server: {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// Rota não encontrada
app.use('*', (req, res) => {
  console.log('❓ Rota não encontrada:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado com sucesso!');
      console.log(`📍 API rodando em: http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      console.log(`📋 Tarefas: http://localhost:${PORT}/tasks`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('');
      console.log('📝 Endpoints disponíveis:');
      console.log('  GET    /health        - Status do servidor');
      console.log('  GET    /tasks         - Listar tarefas');
      console.log('  POST   /tasks         - Criar tarefa');
      console.log('  PUT    /tasks/:id     - Atualizar tarefa');
      console.log('  DELETE /tasks/:id     - Deletar tarefa');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Handlers para encerramento gracioso
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await mongoose.connection.close();
  console.log('✅ Conexão com MongoDB fechada');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await mongoose.connection.close();
  console.log('✅ Conexão com MongoDB fechada');
  process.exit(0);
});

startServer();
