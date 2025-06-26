import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import ServicoBaseDados from 'App/Services/DatabaseService'

/**
 * Provedor da Aplicação - Gerencia o ciclo de vida da aplicação
 * Responsável por inicializar serviços e conectar ao banco de dados
 */
export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Registrar bindings personalizados
  }

  public async boot() {
    // Container IoC está pronto
  }

  public async ready() {
    // Aplicação está pronta - conectar ao banco de dados
    try {
      const servicoBaseDados = ServicoBaseDados.obterInstancia()
      await servicoBaseDados.conectar()
      console.log('✅ Aplicação Corelab Task Manager iniciada com sucesso!')
    } catch (erro) {
      console.error('❌ Erro ao inicializar aplicação:', erro)
      process.exit(1)
    }
  }

  public async shutdown() {
    // Limpeza - aplicação está sendo encerrada
    try {
      const servicoBaseDados = ServicoBaseDados.obterInstancia()
      await servicoBaseDados.desconectar()
      console.log('✅ Aplicação encerrada graciosamente')
    } catch (erro) {
      console.error('❌ Erro ao encerrar aplicação:', erro)
    }
  }
}
