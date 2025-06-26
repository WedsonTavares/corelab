import mongoose from 'mongoose'

/**
 * Serviço de Banco de Dados - Singleton para gerenciar conexões MongoDB
 * Responsável por conectar, desconectar e monitorar o status da conexão
 */
class ServicoBaseDados {
  private static instancia: ServicoBaseDados
  private estaConectado: boolean = false

  private constructor() {}

  /**
   * Obtém a instância singleton do serviço
   * @returns Instância única do ServicoBaseDados
   */
  public static obterInstancia(): ServicoBaseDados {
    if (!ServicoBaseDados.instancia) {
      ServicoBaseDados.instancia = new ServicoBaseDados()
    }
    return ServicoBaseDados.instancia
  }

  /**
   * Conecta ao banco de dados MongoDB
   * @throws Error em caso de falha na conexão
   */
  public async conectar(): Promise<void> {
    if (this.estaConectado) {
      return
    }

    try {
      const uriMongo = process.env.MONGODB_URI || 'mongodb://localhost:27017/corelab_tarefas'
      
      await mongoose.connect(uriMongo, {
        // Opções removidas - não são mais necessárias nas versões recentes do Mongoose
      })

      this.estaConectado = true
      console.log('✅ MongoDB conectado com sucesso')

      // Gerenciar eventos de conexão
      mongoose.connection.on('error', (erro) => {
        console.error('❌ Erro na conexão MongoDB:', erro)
      })

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB desconectado')
        this.estaConectado = false
      })

    } catch (erro) {
      console.error('❌ Falha ao conectar ao MongoDB:', erro)
      throw erro
    }
  }

  /**
   * Desconecta do banco de dados MongoDB
   * @throws Error em caso de falha na desconexão
   */
  public async desconectar(): Promise<void> {
    if (!this.estaConectado) {
      return
    }

    try {
      await mongoose.disconnect()
      this.estaConectado = false
      console.log('✅ MongoDB desconectado com sucesso')
    } catch (erro) {
      console.error('❌ Erro ao desconectar do MongoDB:', erro)
      throw erro
    }
  }

  /**
   * Verifica se a conexão está ativa
   * @returns true se conectado, false caso contrário
   */
  public estaConexaoAtiva(): boolean {
    return this.estaConectado && mongoose.connection.readyState === 1
  }
}

export default ServicoBaseDados
