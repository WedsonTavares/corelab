const http = require('http');
const url = require('url');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = 3333;

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
    default: '#BAE2FF'
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
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📋 Collection: tasks`);
    
    // Criar algumas tarefas de exemplo se não existir nenhuma
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
      console.log('📝 Criando tarefas de exemplo...');
      await Task.insertMany([
        {
          title: 'Primeira Tarefa',
          description: 'Esta é uma tarefa de demonstração',
          color: '#BAE2FF',
          isFavorite: false
        },
        {
          title: 'Tarefa Favorita',
          description: 'Esta é uma tarefa marcada como favorita',
          color: '#FFE4E6',
          isFavorite: true
        },
        {
          title: 'Tarefa Verde',
          description: 'Tarefa com cor verde',
          color: '#D4F6CC',
          isFavorite: false
        }
      ]);
      console.log('✅ Tarefas de exemplo criadas!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    console.log('⚠️ Continuando sem MongoDB - usando dados em memória');
    return false;
  }
  return true;
};

// Dados de fallback em memória
let memoryTasks = [
  {
    id: '1',
    title: 'Primeira Tarefa (Memória)',
    description: 'Esta é uma tarefa de demonstração em memória',
    color: '#BAE2FF',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let isMongoConnected = false;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  console.log(`${new Date().toISOString()} - ${req.method} ${path}`);
  
  try {
    if (path === '/health') {
      const dbStatus = mongoose.connection.readyState;
      const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      let taskCount = 0;
      if (isMongoConnected) {
        try {
          taskCount = await Task.countDocuments();
        } catch (error) {
          console.log('Erro ao contar tarefas:', error.message);
        }
      } else {
        taskCount = memoryTasks.length;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          status: statusMap[dbStatus],
          name: mongoose.connection.db?.databaseName || 'memory',
          totalTasks: taskCount,
          using: isMongoConnected ? 'MongoDB' : 'Memory'
        },
        server: {
          port: PORT,
          environment: process.env.NODE_ENV || 'development'
        }
      }));
      return;
    }
    
    if (path === '/tasks') {
      if (req.method === 'GET') {
        console.log('📋 GET /tasks - Query params:', query);
        
        if (isMongoConnected) {
          // Usar MongoDB
          let mongoQuery = {};
          
          if (query.search && query.search.trim()) {
            mongoQuery.$or = [
              { title: { $regex: query.search.trim(), $options: 'i' } },
              { description: { $regex: query.search.trim(), $options: 'i' } }
            ];
          }
          
          if (query.favorite === 'true') {
            mongoQuery.isFavorite = true;
          }
          
          if (query.color && query.color.trim()) {
            mongoQuery.color = query.color.trim();
          }
          
          console.log('🔍 MongoDB Query:', JSON.stringify(mongoQuery, null, 2));
          
          const tasks = await Task.find(mongoQuery)
            .sort({ isFavorite: -1, createdAt: -1 })
            .lean();
          
          const formattedTasks = tasks.map(task => ({
            id: task._id.toString(),
            title: task.title,
            description: task.description,
            color: task.color,
            isFavorite: task.isFavorite,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          }));
          
          console.log(`✅ MongoDB: Retornando ${formattedTasks.length} tarefas`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(formattedTasks));
        } else {
          // Usar dados em memória
          let filtered = [...memoryTasks];
          
          if (query.search) {
            const searchLower = query.search.toLowerCase();
            filtered = filtered.filter(task => 
              task.title.toLowerCase().includes(searchLower) ||
              task.description.toLowerCase().includes(searchLower)
            );
          }
          
          if (query.favorite === 'true') {
            filtered = filtered.filter(task => task.isFavorite);
          }
          
          if (query.color) {
            filtered = filtered.filter(task => task.color === query.color);
          }
          
          console.log(`✅ Memory: Retornando ${filtered.length} tarefas`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(filtered));
        }
        return;
      }
      
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            console.log('📝 POST /tasks - Body:', data);
            
            if (!data.title || data.title.trim() === '') {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Título é obrigatório' }));
              return;
            }
            
            if (isMongoConnected) {
              // Usar MongoDB
              const taskData = {
                title: data.title.trim(),
                description: data.description ? data.description.trim() : '',
                color: data.color || '#BAE2FF',
                isFavorite: Boolean(data.isFavorite)
              };
              
              console.log('💾 MongoDB: Salvando tarefa:', taskData);
              
              const newTask = new Task(taskData);
              const savedTask = await newTask.save();
              
              const responseTask = {
                id: savedTask._id.toString(),
                title: savedTask.title,
                description: savedTask.description,
                color: savedTask.color,
                isFavorite: savedTask.isFavorite,
                createdAt: savedTask.createdAt,
                updatedAt: savedTask.updatedAt
              };
              
              console.log('✅ MongoDB: Tarefa salva com ID:', savedTask._id);
              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(responseTask));
            } else {
              // Usar dados em memória
              const newTask = {
                id: Date.now().toString(),
                title: data.title.trim(),
                description: data.description ? data.description.trim() : '',
                color: data.color || '#BAE2FF',
                isFavorite: Boolean(data.isFavorite),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              memoryTasks.unshift(newTask);
              console.log('✅ Memory: Tarefa criada:', newTask.id);
              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(newTask));
            }
          } catch (error) {
            console.error('❌ Erro ao criar tarefa:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'Erro interno do servidor',
              message: error.message 
            }));
          }
        });
        return;
      }
    }
    
    // Lidar com /tasks/:id
    const taskIdMatch = path.match(/^\/tasks\/(.+)$/);
    if (taskIdMatch) {
      const taskId = taskIdMatch[1];
      
      if (req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            console.log('📝 PUT /tasks/:id - ID:', taskId, 'Body:', data);
            
            if (!data.title || data.title.trim() === '') {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Título é obrigatório' }));
              return;
            }
            
            if (isMongoConnected && mongoose.Types.ObjectId.isValid(taskId)) {
              // Usar MongoDB
              const updateData = {
                title: data.title.trim(),
                description: data.description ? data.description.trim() : '',
                color: data.color || '#BAE2FF',
                isFavorite: Boolean(data.isFavorite),
                updatedAt: new Date()
              };
              
              const updatedTask = await Task.findByIdAndUpdate(
                taskId,
                updateData,
                { new: true, runValidators: true }
              );
              
              if (!updatedTask) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Tarefa não encontrada' }));
                return;
              }
              
              const responseTask = {
                id: updatedTask._id.toString(),
                title: updatedTask.title,
                description: updatedTask.description,
                color: updatedTask.color,
                isFavorite: updatedTask.isFavorite,
                createdAt: updatedTask.createdAt,
                updatedAt: updatedTask.updatedAt
              };
              
              console.log('✅ MongoDB: Tarefa atualizada:', updatedTask._id);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(responseTask));
            } else {
              // Usar dados em memória
              const taskIndex = memoryTasks.findIndex(task => task.id === taskId);
              
              if (taskIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Tarefa não encontrada' }));
                return;
              }
              
              memoryTasks[taskIndex] = {
                ...memoryTasks[taskIndex],
                title: data.title.trim(),
                description: data.description ? data.description.trim() : '',
                color: data.color || '#BAE2FF',
                isFavorite: Boolean(data.isFavorite),
                updatedAt: new Date().toISOString()
              };
              
              console.log('✅ Memory: Tarefa atualizada:', taskId);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(memoryTasks[taskIndex]));
            }
          } catch (error) {
            console.error('❌ Erro ao atualizar tarefa:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'Erro interno do servidor',
              message: error.message 
            }));
          }
        });
        return;
      }
      
      if (req.method === 'DELETE') {
        console.log('🗑️ DELETE /tasks/:id - ID:', taskId);
        
        try {
          if (isMongoConnected && mongoose.Types.ObjectId.isValid(taskId)) {
            // Usar MongoDB
            const deletedTask = await Task.findByIdAndDelete(taskId);
            
            if (!deletedTask) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Tarefa não encontrada' }));
              return;
            }
            
            console.log('✅ MongoDB: Tarefa deletada:', deletedTask._id);
          } else {
            // Usar dados em memória
            const taskIndex = memoryTasks.findIndex(task => task.id === taskId);
            
            if (taskIndex === -1) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Tarefa não encontrada' }));
              return;
            }
            
            memoryTasks.splice(taskIndex, 1);
            console.log('✅ Memory: Tarefa deletada:', taskId);
          }
          
          res.writeHead(204);
          res.end();
        } catch (error) {
          console.error('❌ Erro ao deletar tarefa:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'Erro interno do servidor',
            message: error.message 
          }));
        }
        return;
      }
    }
    
    // Rota não encontrada
    console.log('❓ Rota não encontrada:', req.method, path);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Erro interno do servidor',
      message: error.message 
    }));
  }
});

// Iniciar servidor
const startServer = async () => {
  console.log('🚀 Iniciando Corelab Task Manager API...');
  
  isMongoConnected = await connectDB();
  
  server.listen(PORT, () => {
    console.log('');
    console.log('🎉 Servidor iniciado com sucesso!');
    console.log(`📍 API rodando em: http://localhost:${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 Tarefas: http://localhost:${PORT}/tasks`);
    console.log(`💾 Usando: ${isMongoConnected ? 'MongoDB Atlas' : 'Dados em Memória'}`);
    console.log('');
    console.log('📝 Endpoints disponíveis:');
    console.log('  GET    /health        - Status do servidor');
    console.log('  GET    /tasks         - Listar tarefas');
    console.log('  POST   /tasks         - Criar tarefa');
    console.log('  PUT    /tasks/:id     - Atualizar tarefa');
    console.log('  DELETE /tasks/:id     - Deletar tarefa');
    console.log('');
    console.log('✅ API pronta para receber requisições!');
  });
};

// Handlers para encerramento gracioso
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  if (isMongoConnected) {
    await mongoose.connection.close();
    console.log('✅ Conexão com MongoDB fechada');
  }
  process.exit(0);
});

startServer();
